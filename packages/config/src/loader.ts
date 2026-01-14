import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { pathToFileURL } from "node:url";

/**
 * Options for the configuration loader.
 */
export interface ConfigLoaderOptions {
  /**
   * The current working directory to search for configuration files.
   * Defaults to `process.cwd()`.
   */
  cwd?: string;
  /**
   * Optional name to use for configuration files (defaults to "easycli").
   * Not currently used in logic but reserved for future customization.
   */
  name?: string;
}

const CONFIG_FILES = [
  ".easyclirc.json",
  ".easyclirc",
  "easycli.config.json",
  "easycli.config.js",
  "easycli.config.ts"
];

/**
 * Loads configuration from multiple sources, merging them in the following order:
 * 1. User home directory config (`~/.easyclirc.json`)
 * 2. Project config files (in order of precedence):
 *    - `.easyclirc.json`
 *    - `.easyclirc`
 *    - `easycli.config.json`
 *    - `easycli.config.js`
 *    - `easycli.config.ts`
 * 3. Environment variables (prefixed with `EASYCLI_`)
 *
 * @template T - The expected shape of the configuration object.
 * @param options - Configuration options.
 * @returns A promise that resolves to the merged configuration object.
 *
 * @example
 * ```ts
 * interface MyConfig {
 *   port: number;
 *   debug: boolean;
 * }
 *
 * const config = await loadConfig<MyConfig>();
 * console.log(config.port);
 * ```
 */
export async function loadConfig<T = Record<string, unknown>>(
  options: ConfigLoaderOptions = {}
): Promise<T> {
  const cwd = options.cwd ?? process.cwd();
  const configs: Record<string, unknown>[] = [];

  const homeConfig = await loadJsonConfig(join(homedir(), ".easyclirc.json"));
  if (homeConfig) {
    configs.push(homeConfig);
  }

  for (const filename of CONFIG_FILES) {
    const filepath = join(cwd, filename);
    if (filename.endsWith(".json") || filename === ".easyclirc") {
      const config = await loadJsonConfig(filepath);
      if (config) {
        configs.push(config);
      }
    } else if (filename.endsWith(".js") || filename.endsWith(".ts")) {
      const config = await loadModuleConfig(filepath);
      if (config) {
        configs.push(config);
      }
    }
  }

  const envConfig = loadEnvConfig();
  if (Object.keys(envConfig).length > 0) {
    configs.push(envConfig);
  }

  return mergeConfigs(configs) as T;
}

async function loadJsonConfig(
  filepath: string
): Promise<Record<string, unknown> | null> {
  try {
    const content = await readFile(filepath, "utf-8");
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function loadModuleConfig(
  filepath: string
): Promise<Record<string, unknown> | null> {
  try {
    const url = pathToFileURL(filepath).href;
    const mod = (await import(url)) as { default?: Record<string, unknown> };
    return mod.default ?? null;
  } catch {
    return null;
  }
}

function loadEnvConfig(): Record<string, unknown> {
  const config: Record<string, unknown> = {};
  const prefix = "EASYCLI_";

  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith(prefix) && value !== undefined) {
      const configKey = key
        .slice(prefix.length)
        .toLowerCase()
        .replace(/_/g, ".");
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

function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const keys = path.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (key) {
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }
  }

  const lastKey = keys[keys.length - 1];
  if (lastKey) {
    current[lastKey] = value;
  }
}

function mergeConfigs(configs: Record<string, unknown>[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const config of configs) {
    deepMerge(result, config);
  }

  return result;
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): void {
  for (const [key, value] of Object.entries(source)) {
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof target[key] === "object" &&
      target[key] !== null &&
      !Array.isArray(target[key])
    ) {
      deepMerge(
        target[key] as Record<string, unknown>,
        value as Record<string, unknown>
      );
    } else {
      target[key] = value;
    }
  }
}
