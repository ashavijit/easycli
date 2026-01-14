export class CLIError extends Error {
  constructor(
    message: string,
    public code: string,
    public exitCode: number = 1
  ) {
    super(message);
    this.name = "CLIError";
  }
}

export class ParseError extends CLIError {
  constructor(message: string) {
    super(message, "PARSE_ERROR", 1);
    this.name = "ParseError";
  }
}

export class ValidationError extends CLIError {
  constructor(
    message: string,
    public field: string
  ) {
    super(message, "VALIDATION_ERROR", 1);
    this.name = "ValidationError";
  }
}

export class CommandNotFoundError extends CLIError {
  constructor(command: string) {
    super(`Command not found: ${command}`, "COMMAND_NOT_FOUND", 1);
    this.name = "CommandNotFoundError";
  }
}

export class ConfigError extends CLIError {
  constructor(message: string) {
    super(message, "CONFIG_ERROR", 1);
    this.name = "ConfigError";
  }
}

export class MissingArgumentError extends CLIError {
  constructor(
    public argName: string,
    public validValues?: string[]
  ) {
    let message = `Missing required argument: ${argName}`;
    if (validValues && validValues.length > 0) {
      message += `\nValid values: ${validValues.join(", ")}`;
    }
    super(message, "MISSING_ARGUMENT", 1);
    this.name = "MissingArgumentError";
  }
}

export class UnknownFlagError extends CLIError {
  constructor(
    public flag: string,
    public suggestion?: string
  ) {
    let message = `Unknown flag --${flag}`;
    if (suggestion) {
      message += `\nDid you mean --${suggestion}?`;
    }
    super(message, "UNKNOWN_FLAG", 1);
    this.name = "UnknownFlagError";
  }
}

export function formatError(error: Error): string {
  if (error instanceof CLIError) {
    return `Error: ${error.message}`;
  }
  return `Error: ${error.message}`;
}

export function formatValidationErrors(
  errors: Array<{ field: string; message: string }>
): string {
  const lines = errors.map((e) => `  - ${e.message}`);
  return `Validation failed:\n${lines.join("\n")}`;
}
