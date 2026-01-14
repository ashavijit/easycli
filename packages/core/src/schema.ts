import type { CommandDef, FlagsSchema, ArgsSchema, FlagDef, FlagType } from "./types.js";

export function normalizeFlag(flag: string | FlagDef): FlagDef {
  if (typeof flag === "string") {
    return { type: flag as FlagType };
  }
  return flag;
}

export function normalizeFlagsSchema(
  flags?: FlagsSchema
): Record<string, FlagDef> {
  if (!flags) return {};
  const normalized: Record<string, FlagDef> = {};
  for (const [key, value] of Object.entries(flags)) {
    normalized[key] = normalizeFlag(value);
  }
  return normalized;
}

export function normalizeArgsSchema(
  args?: ArgsSchema
): Record<string, { type: "string" | "number" | "enum"; values?: string[] }> {
  if (!args) return {};
  const normalized: Record<
    string,
    { type: "string" | "number" | "enum"; values?: string[] }
  > = {};
  for (const [key, value] of Object.entries(args)) {
    if (Array.isArray(value)) {
      normalized[key] = { type: "enum", values: value };
    } else {
      normalized[key] = { type: value };
    }
  }
  return normalized;
}

/**
 * Defines a command for the CLI.
 *
 * Type-safe helper to define a command's metadata, arguments, flags, and execution logic.
 *
 * @template TArgs - The schema for positional arguments.
 * @template TFlags - The schema for flags/options.
 * @param def - The command definition.
 * @returns The command definition (identity function for type inference).
 *
 * @example
 * ```ts
 * export default defineCommand({
 *   description: "Start the server",
 *   flags: {
 *     port: { type: "number", default: 3000 }
 *   },
 *   run({ flags }) {
 *     console.log(`Starting on port ${flags.port}`);
 *   }
 * });
 * ```
 */
export function defineCommand<
  TArgs extends ArgsSchema = ArgsSchema,
  TFlags extends FlagsSchema = FlagsSchema
>(def: CommandDef<TArgs, TFlags>): CommandDef<TArgs, TFlags> {
  return def;
}
