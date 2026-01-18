import type { CLIConfig, CLIContext, FlagDef, RichErrorOptions } from "./types.js";
import { parseArgv } from "./parser/index.js";
import { buildRouter, findCommand } from "./router.js";
import { executeCommand } from "./executor.js";
import { createHookRunner } from "./hooks.js";
import { CommandNotFoundError, formatError } from "./errors.js";
import { normalizeFlagsSchema } from "./schema.js";
import { installSignalHandlers, resetTerminal, onCleanup } from "./signals.js";
import { createAsk, flow } from "easycli-prompts";
import { generateHelp, generateCommandHelp } from "easycli-help";
import { createError, task, formatRichError, RichError } from "easycli-ui";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

/**
 * Defines a new CLI application.
 *
 * This is the main entry point for creating an EasyCLI app. It configures the CLI's
 * name, version, description, commands, and global hooks.
 *
 * @param config - The CLI configuration object.
 * @returns An object containing the `run` method to start the CLI.
 *
 * @example
 * ```ts
 * const cli = defineCLI({
 *   name: "my-app",
 *   version: "1.0.0",
 *   commands: {
 *     start: defineCommand({ ... })
 *   }
 * });
 *
 * cli.run();
 * ```
 */
export function defineCLI(config: CLIConfig) {
  const router = buildRouter(config.commands);
  const hookRunner = createHookRunner(config.hooks, config.plugins);

  async function run(argv?: string[]): Promise<void> {
    const args = argv ?? process.argv.slice(2);

    installSignalHandlers();
    onCleanup(resetTerminal);

    await hookRunner.runOnInit();

    const userConfig = await loadConfig();

    if (args.includes("--help") || args.includes("-h")) {
      const helpIndex = args.findIndex((a) => a === "--help" || a === "-h");
      const commandParts = args.slice(0, helpIndex);
      if (commandParts.length > 0) {
        const { command, matchedPath } = findCommand(router, commandParts);
        if (command) {
          const help = generateCommandHelp(config.name, matchedPath, command);
          process.stdout.write(help + "\n");
          return;
        }
      }
      const help = generateHelp(config);
      process.stdout.write(help + "\n");
      return;
    }

    if (args.includes("--version") || args.includes("-v")) {
      process.stdout.write((config.version ?? "0.0.0") + "\n");
      return;
    }

    const globalFlags = collectGlobalFlags();
    const shortToLong = buildShortToLongMap(globalFlags);

    const parsed = parseArgv(args, { flagDefs: globalFlags, shortToLong });
    const { command, matchedPath, remaining } = findCommand(
      router,
      parsed.commands
    );

    if (!command) {
      if (parsed.commands.length === 0) {
        const help = generateHelp(config);
        process.stdout.write(help + "\n");
        return;
      }
      throw new CommandNotFoundError(parsed.commands.join(" "));
    }

    const commandFlags = normalizeFlagsSchema(command.flags);
    const allFlags = { ...globalFlags, ...commandFlags };
    const commandShortToLong = buildShortToLongMap(allFlags);

    const commandArgs = args.slice(matchedPath.length);
    const commandParsed = parseArgv(commandArgs, {
      flagDefs: allFlags,
      shortToLong: commandShortToLong
    });

    const ctx: CLIContext = {
      config: userConfig,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ask: createAsk(commandParsed.flags as any, userConfig),
      flow: flow,
      cwd: process.cwd(),
      argv: args,
      error: (message: string, options?: RichErrorOptions) => createError(message, options),
      task: (name: string) => task(name)
    };

    try {
      await executeCommand({
        command,
        args: [...remaining, ...commandParsed.args],
        flags: commandParsed.flags,
        ctx,
        commandPath: matchedPath,
        hookRunner
      });
      await hookRunner.runOnExit(0);
    } catch (error) {
      if (error instanceof Error) {
        await hookRunner.runOnError(error, {
          command: matchedPath.join(" "),
          args: {},
          flags: {}
        });
        if (error instanceof RichError) {
          process.stderr.write(formatRichError(error) + "\n");
          await hookRunner.runOnExit(error.exitCode);
          process.exit(error.exitCode);
        } else {
          process.stderr.write(formatError(error) + "\n");
          await hookRunner.runOnExit(1);
          process.exit(1);
        }
      } else {
        await hookRunner.runOnExit(1);
        process.exit(1);
      }
    }
  }

  return { run, config, router };
}

function collectGlobalFlags(): Record<string, FlagDef> {
  return {
    help: { type: "boolean", alias: "h", description: "Show help" },
    version: { type: "boolean", alias: "v", description: "Show version" }
  };
}

function buildShortToLongMap(flags: Record<string, FlagDef>): Map<string, string> {
  const map = new Map<string, string>();
  for (const [name, def] of Object.entries(flags)) {
    if (def.alias) {
      map.set(def.alias, name);
    }
  }
  return map;
}

async function loadConfig<T = Record<string, unknown>>(): Promise<T> {
  const cwd = process.cwd();
  const configs: Record<string, unknown>[] = [];
  const homeConfig = await loadJsonConfig(join(homedir(), ".easyclirc.json"));
  if (homeConfig) configs.push(homeConfig);
  const configFiles = [".easyclirc.json", ".easyclirc", "easycli.config.json"];
  for (const filename of configFiles) {
    const config = await loadJsonConfig(join(cwd, filename));
    if (config) configs.push(config);
  }
  const envConfig = loadEnvConfig();
  if (Object.keys(envConfig).length > 0) configs.push(envConfig);
  return mergeConfigs(configs) as T;
}

async function loadJsonConfig(filepath: string): Promise<Record<string, unknown> | null> {
  try {
    const content = await readFile(filepath, "utf-8");
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function loadEnvConfig(): Record<string, unknown> {
  const config: Record<string, unknown> = {};
  const prefix = "EASYCLI_";
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith(prefix) && value !== undefined) {
      const configKey = key.slice(prefix.length).toLowerCase().replace(/_/g, ".");
      setNestedValue(config, configKey, parseEnvValue(value));
    }
  }
  return config;
}

function parseEnvValue(value: string): unknown {
  if (value === "true") return true;
  if (value === "false") return false;
  const num = Number(value);
  if (!Number.isNaN(num)) return num;
  return value;
}

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (key) {
      if (!(key in current)) current[key] = {};
      current = current[key] as Record<string, unknown>;
    }
  }
  const lastKey = keys[keys.length - 1];
  if (lastKey) current[lastKey] = value;
}

function mergeConfigs(configs: Record<string, unknown>[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const config of configs) {
    deepMerge(result, config);
  }
  return result;
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(source)) {
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof target[key] === "object" &&
      target[key] !== null &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key] as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      target[key] = value;
    }
  }
}


