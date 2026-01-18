/**
 * Input sanitization utilities for CLI prompts.
 * Prevents injection attacks and normalizes user input.
 */

const DANGEROUS_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const ANSI_ESCAPE = /\x1b\[[0-9;]*[a-zA-Z]/g;

/**
 * Sanitizes user input by removing control characters and ANSI escape sequences.
 * @param input - Raw user input string.
 * @returns Sanitized string safe for processing.
 */
export function sanitize(input: string): string {
  if (typeof input !== "string") {
    return "";
  }
  return input
    .replace(ANSI_ESCAPE, "")
    .replace(DANGEROUS_CHARS, "")
    .trim();
}

/**
 * Sanitizes input and enforces a maximum length.
 * @param input - Raw user input string.
 * @param maxLength - Maximum allowed length (default: 1000).
 * @returns Sanitized and truncated string.
 */
export function sanitizeWithLimit(input: string, maxLength = 1000): string {
  const clean = sanitize(input);
  return clean.length > maxLength ? clean.slice(0, maxLength) : clean;
}

/**
 * Validates that input matches expected pattern.
 * @param input - Input to validate.
 * @param pattern - RegExp pattern to match.
 * @returns True if input matches pattern.
 */
export function validatePattern(input: string, pattern: RegExp): boolean {
  return pattern.test(sanitize(input));
}

/**
 * Validates input as a safe file path (no traversal attacks).
 * @param input - Path string to validate.
 * @returns True if path is safe.
 */
export function isValidPath(input: string): boolean {
  const clean = sanitize(input);
  if (clean.includes("..") || clean.startsWith("/") || clean.includes("\0")) {
    return false;
  }
  return true;
}
