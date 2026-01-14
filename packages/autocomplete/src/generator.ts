interface CommandDef {
  description?: string;
  commands?: Record<string, CommandDef>;
  flags?: Record<string, { alias?: string; description?: string }>;
}

interface CLIConfig {
  name: string;
  commands: Record<string, CommandDef>;
}

/**
 * Generates Bash completion script.
 *
 * @param config - The CLI configuration including commands.
 * @returns The Bash completion script.
 */
export function generateBashCompletion(config: CLIConfig): string {
  const lines: string[] = [];
  const name = config.name;

  lines.push(`_${name}_completions() {`);
  lines.push('  local cur="${COMP_WORDS[COMP_CWORD]}"');
  lines.push('  local prev="${COMP_WORDS[COMP_CWORD-1]}"');
  lines.push("");
  lines.push("  case $prev ;;");
  lines.push(`    ${name})`);
  lines.push(
    `      COMPREPLY=($(compgen -W "${Object.keys(config.commands).join(" ")}" -- "$cur"))`
  );
  lines.push("      return 0");
  lines.push("      ;;");

  for (const [cmdName, cmd] of Object.entries(config.commands)) {
    if (cmd.commands) {
      lines.push(`    ${cmdName})`);
      lines.push(
        `      COMPREPLY=($(compgen -W "${Object.keys(cmd.commands).join(" ")}" -- "$cur"))`
      );
      lines.push("      return 0");
      lines.push("      ;;");
    }
  }

  lines.push("  esac");
  lines.push("");
  lines.push('  COMPREPLY=($(compgen -W "--help --version" -- "$cur"))');
  lines.push("}");
  lines.push("");
  lines.push(`complete -F _${name}_completions ${name}`);

  return lines.join("\n");
}

/**
 * Generates Zsh completion script.
 *
 * @param config - The CLI configuration including commands.
 * @returns The Zsh completion script.
 */
export function generateZshCompletion(config: CLIConfig): string {
  const lines: string[] = [];
  const name = config.name;

  lines.push(`#compdef ${name}`);
  lines.push("");
  lines.push(`_${name}() {`);
  lines.push("  local -a commands");
  lines.push("  commands=(");

  for (const [cmdName, cmd] of Object.entries(config.commands)) {
    const desc = cmd.description ?? cmdName;
    lines.push(`    '${cmdName}:${desc}'`);
  }

  lines.push("  )");
  lines.push("");
  lines.push("  _arguments -C \\");
  lines.push("    '--help[Show help]' \\");
  lines.push("    '--version[Show version]' \\");
  lines.push("    '1:command:->commands' \\");
  lines.push("    '*::arg:->args'");
  lines.push("");
  lines.push("  case $state in");
  lines.push("    commands)");
  lines.push("      _describe 'command' commands");
  lines.push("      ;;");
  lines.push("  esac");
  lines.push("}");
  lines.push("");
  lines.push(`compdef _${name} ${name}`);

  return lines.join("\n");
}

/**
 * Generates Fish completion script.
 *
 * @param config - The CLI configuration including commands.
 * @returns The Fish completion script.
 */
export function generateFishCompletion(config: CLIConfig): string {
  const lines: string[] = [];
  const name = config.name;

  lines.push(
    `complete -c ${name} -f -n "__fish_use_subcommand" -a "--help" -d "Show help"`
  );
  lines.push(
    `complete -c ${name} -f -n "__fish_use_subcommand" -a "--version" -d "Show version"`
  );

  for (const [cmdName, cmd] of Object.entries(config.commands)) {
    const desc = cmd.description ?? cmdName;
    lines.push(
      `complete -c ${name} -f -n "__fish_use_subcommand" -a "${cmdName}" -d "${desc}"`
    );

    if (cmd.commands) {
      for (const [subName, subCmd] of Object.entries(cmd.commands)) {
        const subDesc = subCmd.description ?? subName;
        lines.push(
          `complete -c ${name} -f -n "__fish_seen_subcommand_from ${cmdName}" -a "${subName}" -d "${subDesc}"`
        );
      }
    }
  }

  return lines.join("\n");
}

/**
 * Supported shell types for autocomplete generation.
 */
export type ShellType = "bash" | "zsh" | "fish";

/**
 * Generates an autocomplete script for the specified shell.
 *
 * @param shell - The target shell ("bash", "zsh", or "fish").
 * @param config - The CLI configuration including commands.
 * @returns The generated shell script as a string.
 */
export function generateCompletion(
  shell: ShellType,
  config: CLIConfig
): string {
  switch (shell) {
    case "bash":
      return generateBashCompletion(config);
    case "zsh":
      return generateZshCompletion(config);
    case "fish":
      return generateFishCompletion(config);
  }
}
