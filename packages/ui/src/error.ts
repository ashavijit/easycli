import { colors } from "./colors.js";

/**
 * Options for rich error creation.
 */
export interface RichErrorOptions {
  /** Helpful hint for the user on how to resolve the error. */
  hint?: string;
  /** Documentation URL for more information. */
  docs?: string;
  /** Exit code for the process (default: 1). */
  exitCode?: number;
}

/**
 * Rich error with hint and documentation support.
 * Provides better developer experience for CLI failures.
 *
 * @example
 * ```ts
 * throw new RichError("Invalid token", {
 *   hint: "Run: easycli auth login",
 *   docs: "https://docs.easycli.dev/auth"
 * });
 * ```
 */
export class RichError extends Error {
  /** Helpful hint for the user. */
  public readonly hint?: string;

  /** Documentation URL. */
  public readonly docs?: string;

  /** Exit code for the process. */
  public readonly exitCode: number;

  /**
   * Creates a new RichError.
   *
   * @param message - The error message.
   * @param options - Optional hint, docs, and exitCode.
   */
  constructor(message: string, options?: RichErrorOptions) {
    super(message);
    this.name = "RichError";
    this.hint = options?.hint;
    this.docs = options?.docs;
    this.exitCode = options?.exitCode ?? 1;
  }
}

/**
 * Creates a rich error with hint and documentation support.
 * This is the factory function intended for use with ctx.error().
 *
 * @param message - The error message.
 * @param options - Optional hint, docs, and exitCode.
 * @returns A RichError instance.
 *
 * @example
 * ```ts
 * throw createError("Invalid token", {
 *   hint: "Run: easycli auth login",
 *   docs: "https://docs.easycli.dev/auth"
 * });
 * ```
 */
export function createError(message: string, options?: RichErrorOptions): RichError {
  return new RichError(message, options);
}

/**
 * Formats a RichError for terminal output with colors.
 *
 * @param error - The RichError to format.
 * @returns Formatted string for terminal output.
 *
 * @example
 * Output:
 * ```
 * X Invalid token
 * Hint: Run: easycli auth login
 * Docs: https://docs.easycli.dev/auth
 * ```
 */
export function formatRichError(error: RichError): string {
  const lines: string[] = [];

  const icon = colors.red("X");
  lines.push(`${icon} ${colors.red(error.message)}`);

  if (error.hint) {
    lines.push(`${colors.dim("Hint:")} ${error.hint}`);
  }

  if (error.docs) {
    lines.push(`${colors.dim("Docs:")} ${colors.cyan(error.docs)}`);
  }

  return lines.join("\n");
}
