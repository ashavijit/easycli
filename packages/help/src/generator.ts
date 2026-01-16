import { colors } from "easycli-ui";

/**
 * Strip ANSI escape codes to get visible string length.
 */
function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

/**
 * Get visible length of a string (excluding ANSI codes).
 */
function visibleLength(str: string): number {
  return stripAnsi(str).length;
}

/**
 * Pad a string with ANSI codes to a target visible width.
 */
function padEnd(str: string, targetLen: number): string {
  const visible = visibleLength(str);
  const padding = Math.max(0, targetLen - visible);
  return str + " ".repeat(padding);
}

interface FlagDef {
  type: string;
  default?: unknown;
  alias?: string;
  description?: string;
  required?: boolean;
}

interface ArgDef {
  type: "string" | "number";
  optional?: boolean;
  description?: string;
}

interface CommandDef {
  args?: Record<string, string[] | "string" | "number" | ArgDef>;
  flags?: Record<string, FlagDef | string>;
  description?: string;
  alias?: string | string[];
  commands?: Record<string, CommandDef>;
  run?: unknown;
}

interface CLIConfig {
  name: string;
  version?: string;
  description?: string;
  commands: Record<string, CommandDef>;
}

/**
 * Generates the main help text for the CLI.
 *
 * @param config - The CLI configuration.
 * @returns The formatted help string.
 */
export function generateHelp(config: CLIConfig): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(
    colors.bold(colors.cyan(config.name)) +
    (config.version ? colors.dim(` v${config.version}`) : "")
  );

  if (config.description) {
    lines.push(colors.dim(config.description));
  }

  lines.push("");
  lines.push(colors.yellow("USAGE"));
  lines.push(`  ${colors.cyan(config.name)} ${colors.dim("<command>")} ${colors.dim("[options]")}`);

  lines.push("");
  lines.push(colors.yellow("COMMANDS"));

  const commandEntries = Object.entries(config.commands);
  const maxLen = Math.max(...commandEntries.map(([n]) => n.length), 0);

  for (const [name, cmd] of commandEntries) {
    const desc = cmd.description ?? "";
    const hasSubcommands = cmd.commands && Object.keys(cmd.commands).length > 0;
    const cmdName = hasSubcommands ? colors.cyan(name) : colors.green(name);
    const suffix = hasSubcommands ? colors.dim(" ...") : "";
    lines.push(`  ${cmdName.padEnd(maxLen + 12)}${suffix}${colors.dim(desc)}`);
  }

  lines.push("");
  lines.push(colors.yellow("OPTIONS"));
  lines.push(`  ${colors.green("-h")}, ${colors.green("--help")}     ${colors.dim("Show help")}`);
  lines.push(`  ${colors.green("-v")}, ${colors.green("--version")}  ${colors.dim("Show version")}`);
  lines.push("");

  return lines.join("\n");
}

/**
 * Generates help text for a specific command.
 *
 * @param cliName - The name of the CLI.
 * @param matchedPath - The path to the command.
 * @param command - The command definition.
 * @returns The formatted command help string.
 */
export function generateCommandHelp(
  cliName: string,
  matchedPath: string[],
  command: CommandDef
): string {
  const lines: string[] = [];
  const fullCommand = [cliName, ...matchedPath].join(" ");

  lines.push("");
  lines.push(colors.bold(colors.cyan(fullCommand)));

  if (command.description) {
    lines.push(colors.dim(command.description));
  }

  lines.push("");
  lines.push(colors.yellow("USAGE"));
  lines.push(`  ${buildUsageLine(fullCommand, command)}`);

  if (command.args && Object.keys(command.args).length > 0) {
    lines.push("");
    lines.push(colors.yellow("ARGUMENTS"));
    const argEntries = Object.entries(command.args);
    const maxArgLen = Math.max(...argEntries.map(([n]) => n.length), 0);

    for (const [name, def] of argEntries) {
      const desc = formatArgDescription(def);
      const argName = colors.cyan(`<${name}>`);
      lines.push(`  ${padEnd(argName, maxArgLen + 6)}${desc}`);
    }
  }

  if (command.flags && Object.keys(command.flags).length > 0) {
    lines.push("");
    lines.push(colors.yellow("OPTIONS"));
    for (const [name, def] of Object.entries(command.flags)) {
      const flagLine = formatFlagLine(name, def);
      lines.push(`  ${flagLine}`);
    }
  }

  if (command.commands && Object.keys(command.commands).length > 0) {
    lines.push("");
    lines.push(colors.yellow("SUBCOMMANDS"));
    const subEntries = Object.entries(command.commands);
    const maxLen = Math.max(...subEntries.map(([n]) => n.length), 0);

    for (const [name, sub] of subEntries) {
      const desc = sub.description ?? "";
      lines.push(`  ${colors.green(name).padEnd(maxLen + 12)}${colors.dim(desc)}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

function buildUsageLine(command: string, def: CommandDef): string {
  const parts = [colors.cyan(command)];

  if (def.args) {
    for (const [name, argDef] of Object.entries(def.args)) {
      const isOptional = typeof argDef === "object" && !Array.isArray(argDef) && argDef.optional;
      if (isOptional) {
        parts.push(colors.dim(`[${name}]`));
      } else {
        parts.push(colors.yellow(`<${name}>`));
      }
    }
  }

  if (def.flags && Object.keys(def.flags).length > 0) {
    parts.push(colors.dim("[options]"));
  }

  if (def.commands && Object.keys(def.commands).length > 0) {
    parts.push(colors.dim("[command]"));
  }

  return parts.join(" ");
}

function formatArgDescription(def: string[] | "string" | "number" | ArgDef): string {
  if (Array.isArray(def)) {
    return `one of: ${def.map(v => colors.cyan(v)).join(colors.dim(", "))}`;
  }
  if (typeof def === "object" && def !== null) {
    const parts: string[] = [];
    if (def.optional) parts.push(colors.dim("[optional]"));
    if (def.description) parts.push(def.description);
    return parts.join(" ") || `(${def.type})`;
  }
  return `(${def})`;
}

function formatFlagLine(name: string, def: FlagDef | string): string {
  if (typeof def === "string") {
    return `${colors.green(`--${name}`)}  ${colors.dim(`(${def})`)}`;
  }

  const parts: string[] = [];

  if (def.alias) {
    parts.push(colors.green(`-${def.alias}`) + colors.dim(","));
  }

  parts.push(colors.green(`--${name}`));

  if (def.type !== "boolean") {
    parts.push(colors.dim(` <${def.type}>`));
  }

  if (def.default !== undefined) {
    parts.push(colors.dim(` [default: ${String(def.default)}]`));
  }

  const flagPart = parts.join("");
  const descPart = def.description ? colors.dim(def.description) : "";

  return `${padEnd(flagPart, 28)}${descPart}`;
}

/**
 * Generates usage line for a command.
 */
export function generateUsage(cliName: string, command: CommandDef): string {
  return buildUsageLine(cliName, command);
}

/**
 * Auto-generates example commands from schema.
 *
 * @param cliName - The CLI executable name.
 * @param commandPath - Path to the command.
 * @param command - The command definition.
 * @returns Array of example command strings.
 */
export function generateExamples(
  cliName: string,
  commandPath: string[],
  command: CommandDef
): string[] {
  const examples: string[] = [];
  const base = [cliName, ...commandPath].join(" ");

  if (command.args) {
    const argValues = Object.entries(command.args).map(([, def]) => {
      if (Array.isArray(def) && def.length > 0) {
        return def[0];
      }
      return "<value>";
    });
    examples.push(`${base} ${argValues.join(" ")}`);
  } else {
    examples.push(base);
  }

  if (command.flags) {
    const flagEntries = Object.entries(command.flags);
    if (flagEntries.length > 0) {
      const [flagName, flagDef] = flagEntries[0]!;
      const flagValue = typeof flagDef === "string"
        ? ""
        : (flagDef.type === "boolean" ? "" : " <value>");
      examples.push(`${examples[0]} --${flagName}${flagValue}`);
    }
  }

  return examples;
}

/**
 * Generates help output in JSON format.
 */
export function generateHelpJson(config: CLIConfig): string {
  return JSON.stringify({
    name: config.name,
    version: config.version,
    description: config.description,
    commands: Object.entries(config.commands).map(([name, cmd]) => ({
      name,
      description: cmd.description,
      args: cmd.args,
      flags: cmd.flags
    }))
  }, null, 2);
}

/**
 * Generates help output in Markdown format.
 */
export function generateHelpMarkdown(config: CLIConfig): string {
  const lines: string[] = [];
  lines.push(`# ${config.name}`);
  if (config.version) lines.push(`**Version:** ${config.version}`);
  if (config.description) lines.push(`\n${config.description}`);
  lines.push("\n## Commands\n");

  for (const [name, cmd] of Object.entries(config.commands)) {
    lines.push(`### \`${name}\``);
    if (cmd.description) lines.push(cmd.description);
    lines.push("");
  }

  return lines.join("\n");
}
