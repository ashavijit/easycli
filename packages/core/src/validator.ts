import type {
  CommandDef,
  FlagDef,
  ValidationResult,
  ValidationErrorInfo,
  FlagValue
} from "./types.js";
import { normalizeFlagsSchema, normalizeArgsSchema } from "./schema.js";

/**
 * Validates command arguments and flags against their definitions.
 */
export function validateCommand(
  command: CommandDef,
  args: string[],
  flags: Map<string, FlagValue>
): ValidationResult {
  const errors: ValidationErrorInfo[] = [];
  const normalizedFlags = normalizeFlagsSchema(command.flags);
  const normalizedArgs = normalizeArgsSchema(command.args);
  const argNames = Object.keys(normalizedArgs);

  for (const [name, def] of Object.entries(normalizedFlags)) {
    const value = flags.get(name);
    const flagErrors = validateFlag(name, value, def);
    errors.push(...flagErrors);
  }

  for (let i = 0; i < argNames.length; i++) {
    const name = argNames[i];
    const value = args[i];
    if (name) {
      const def = normalizedArgs[name];
      if (def) {
        const argErrors = validateArg(name, value, def);
        errors.push(...argErrors);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateFlag(
  name: string,
  value: FlagValue,
  def: FlagDef
): ValidationErrorInfo[] {
  const errors: ValidationErrorInfo[] = [];

  if (def.required && value === undefined) {
    errors.push({
      field: name,
      message: `Flag --${name} is required`,
      value
    });
  }

  if (value !== undefined && !Array.isArray(value)) {
    const expectedType = def.type;
    const actualType = typeof value;

    if (expectedType === "number" && actualType !== "number") {
      errors.push({
        field: name,
        message: `Flag --${name} must be a number`,
        value
      });
    }

    if (expectedType === "boolean" && actualType !== "boolean") {
      errors.push({
        field: name,
        message: `Flag --${name} must be a boolean`,
        value
      });
    }

    if (expectedType === "string" && actualType !== "string") {
      errors.push({
        field: name,
        message: `Flag --${name} must be a string`,
        value
      });
    }
  }

  if (def.array && value !== undefined && !Array.isArray(value)) {
    errors.push({
      field: name,
      message: `Flag --${name} expects multiple values`,
      value
    });
  }

  return errors;
}

function validateArg(
  name: string,
  value: string | undefined,
  def: { type: "string" | "number" | "enum"; values?: string[]; optional?: boolean }
): ValidationErrorInfo[] {
  const errors: ValidationErrorInfo[] = [];

  if (value === undefined) {
    if (!def.optional) {
      errors.push({
        field: name,
        message: `Argument <${name}> is required`
      });
    }
    return errors;
  }

  if (def.type === "enum" && def.values) {
    if (!def.values.includes(value)) {
      errors.push({
        field: name,
        message: `Argument <${name}> must be one of: ${def.values.join(", ")}`,
        value
      });
    }
  }

  if (def.type === "number") {
    const num = Number(value);
    if (Number.isNaN(num)) {
      errors.push({
        field: name,
        message: `Argument <${name}> must be a number`,
        value
      });
    }
  }

  return errors;
}

/**
 * Applies default values to flags that weren't provided.
 */
export function applyDefaults(
  flags: Map<string, FlagValue>,
  defs: Record<string, FlagDef>
): Map<string, FlagValue> {
  const result = new Map(flags);
  for (const [name, def] of Object.entries(defs)) {
    if (!result.has(name) && def.default !== undefined) {
      result.set(name, def.default);
    }
  }
  return result;
}


