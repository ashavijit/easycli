import type {
  CommandDef,
  CLIContext,
  FlagValue,
  HookContext
} from "./types.js";
import { validateCommand, applyDefaults } from "./validator.js";
import { normalizeFlagsSchema, normalizeArgsSchema } from "./schema.js";
import { formatValidationErrors, CLIError } from "./errors.js";
import type { createHookRunner } from "./hooks.js";

export interface ExecuteOptions {
  command: CommandDef;
  args: string[];
  flags: Map<string, FlagValue>;
  ctx: CLIContext;
  commandPath: string[];
  hookRunner: ReturnType<typeof createHookRunner>;
}

export async function executeCommand(options: ExecuteOptions): Promise<void> {
  const { command, args, flags, ctx, commandPath, hookRunner } = options;

  const normalizedFlags = normalizeFlagsSchema(command.flags);
  const finalFlags = applyDefaults(flags, normalizedFlags);

  const validation = validateCommand(command, args, finalFlags);
  if (!validation.valid) {
    const message = formatValidationErrors(validation.errors);
    throw new CLIError(message, "VALIDATION_ERROR", 1);
  }

  const normalizedArgs = normalizeArgsSchema(command.args);
  const argNames = Object.keys(normalizedArgs);
  const argsObject: Record<string, unknown> = {};

  for (let i = 0; i < argNames.length; i++) {
    const name = argNames[i];
    const value = args[i];
    if (name && value !== undefined) {
      const def = normalizedArgs[name];
      if (def?.type === "number") {
        argsObject[name] = Number(value);
      } else {
        argsObject[name] = value;
      }
    }
  }

  const flagsObject: Record<string, FlagValue> = {};
  for (const [key, value] of finalFlags) {
    flagsObject[key] = value;
  }

  const hookContext: HookContext = {
    command: commandPath.join(" "),
    args: argsObject,
    flags: flagsObject
  };

  await hookRunner.runOnBeforeCommand(hookContext);

  if (command.run) {
    await command.run({ ...argsObject, ...flagsObject }, ctx);
  }

  await hookRunner.runOnAfterCommand(hookContext);
}
