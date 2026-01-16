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
 * Includes the CLI description, usage, and list of available commands.
 *
 * @param config - The CLI configuration.
 * @returns The formatted help string.
 */
export function generateHelp(config: CLIConfig): string {
  const lines: string[] = [];

  lines.push(`${config.name}${config.version ? ` v${config.version}` : ""}`);
  if (config.description) {
    lines.push(config.description);
  }
  lines.push("");
  lines.push("USAGE:");
  lines.push(`  ${config.name} <command> [options]`);
  lines.push("");
  lines.push("COMMANDS:");

  const commandNames = Object.keys(config.commands);
  const maxLen = Math.max(...commandNames.map((n) => n.length), 0);

  for (const [name, cmd] of Object.entries(config.commands)) {
    const desc = cmd.description ?? "";
    lines.push(`  ${name.padEnd(maxLen + 2)}${desc}`);
  }

  lines.push("");
  lines.push("OPTIONS:");
  lines.push("  -h, --help     Show help");
  lines.push("  -v, --version  Show version");

  return lines.join("\n");
}

/**
 * Generates help text for a specific command.
 *
 * Includes command usage, arguments, and options.
 *
 * @param cliName - The name of the CLI.
 * @param matchedPath - The path to the command (e.g. ["db", "migrate"]).
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

  lines.push(fullCommand);
  if (command.description) {
    lines.push(command.description);
  }
  lines.push("");

  const usage = buildUsageLine(fullCommand, command);
  lines.push("USAGE:");
  lines.push(`  ${usage}`);

  if (command.args && Object.keys(command.args).length > 0) {
    lines.push("");
    lines.push("ARGUMENTS:");
    for (const [name, def] of Object.entries(command.args)) {
      const desc = formatArgDescription(def);
      lines.push(`  <${name}>  ${desc}`);
    }
  }

  if (command.flags && Object.keys(command.flags).length > 0) {
    lines.push("");
    lines.push("OPTIONS:");
    for (const [name, def] of Object.entries(command.flags)) {
      const flagLine = formatFlagLine(name, def);
      lines.push(`  ${flagLine}`);
    }
  }

  if (command.commands && Object.keys(command.commands).length > 0) {
    lines.push("");
    lines.push("SUBCOMMANDS:");
    const subNames = Object.keys(command.commands);
    const maxLen = Math.max(...subNames.map((n) => n.length), 0);
    for (const [name, sub] of Object.entries(command.commands)) {
      const desc = sub.description ?? "";
      lines.push(`  ${name.padEnd(maxLen + 2)}${desc}`);
    }
  }

  return lines.join("\n");
}

function buildUsageLine(command: string, def: CommandDef): string {
  const parts = [command];

  if (def.args) {
    for (const name of Object.keys(def.args)) {
      parts.push(`<${name}>`);
    }
  }

  if (def.flags && Object.keys(def.flags).length > 0) {
    parts.push("[options]");
  }

  if (def.commands && Object.keys(def.commands).length > 0) {
    parts.push("[command]");
  }

  return parts.join(" ");
}

function formatArgDescription(def: string[] | "string" | "number" | ArgDef): string {
  if (Array.isArray(def)) {
    return `one of: ${def.join(", ")}`;
  }
  if (typeof def === "object" && def !== null) {
    const parts: string[] = [`(${def.type})`];
    if (def.optional) parts.push("[optional]");
    if (def.description) parts.push(def.description);
    return parts.join(" ");
  }
  return `(${def})`;
}

function formatFlagLine(name: string, def: FlagDef | string): string {
  if (typeof def === "string") {
    return `--${name}  (${def})`;
  }

  const parts: string[] = [];
  if (def.alias) {
    parts.push(`-${def.alias},`);
  }
  parts.push(`--${name}`);
  parts.push(` (${def.type})`);

  if (def.default !== undefined) {
    parts.push(` [default: ${String(def.default)}]`);
  }

  if (def.description) {
    parts.push(`  ${def.description}`);
  }

  return parts.join("");
}

export function generateUsage(cliName: string, command: CommandDef): string {
  return buildUsageLine(cliName, command);
}

/**
 * Auto-generates example commands from schema.
 *
 * @param cliName - The CLI executable name.
 * @param commandPath - Path to the command (e.g., ["deploy"]).
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

  // Basic example with required args
  if (command.args) {
    const argValues = Object.entries(command.args).map(([, def]) => {
      if (Array.isArray(def) && def.length > 0) {
        return def[0]; // First valid value
      }
      return "<value>";
    });
    examples.push(`${base} ${argValues.join(" ")}`);
  } else {
    examples.push(base);
  }

  // Example with a flag
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
 *
 * @param config - CLI configuration.
 * @returns JSON string of CLI metadata.
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
 *
 * @param config - CLI configuration.
 * @returns Markdown string.
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

