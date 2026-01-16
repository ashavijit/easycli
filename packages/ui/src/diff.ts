import { colors } from "./colors.js";

/**
 * Diff line type.
 */
export type DiffLineType = "added" | "removed" | "changed" | "unchanged";

/**
 * Diff line definition.
 */
export interface DiffLine {
  type: DiffLineType;
  oldValue?: string;
  newValue?: string;
  key?: string;
}

/**
 * Diff viewer options.
 */
export interface DiffOptions {
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Header for old content */
  oldHeader?: string;
  /** Header for new content */
  newHeader?: string;
  /** Width for each column */
  columnWidth?: number;
}

/**
 * Creates a side-by-side diff view.
 *
 * @param oldLines - Array of old lines.
 * @param newLines - Array of new lines.
 * @param options - Diff options.
 * @returns Formatted diff string.
 *
 * @example
 * ```ts
 * console.log(diff(
 *   ["port: 3000", "debug: false"],
 *   ["port: 4000", "debug: true"]
 * ));
 * ```
 */
export function diff(
  oldLines: string[],
  newLines: string[],
  options: DiffOptions = {}
): string {
  const {
    showLineNumbers = false,
    oldHeader = "OLD",
    newHeader = "NEW",
    columnWidth = 30
  } = options;

  const lines: string[] = [];
  const separator = "  |  ";
  const headerLine = "-".repeat(columnWidth);

  lines.push(
    colors.dim(oldHeader.padEnd(columnWidth)) +
    separator +
    colors.dim(newHeader)
  );

  lines.push(
    colors.dim(headerLine) +
    separator +
    colors.dim(headerLine)
  );

  const maxLen = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i] ?? "";
    const newLine = newLines[i] ?? "";
    const lineNum = showLineNumbers ? colors.dim(`${i + 1} `.padStart(4)) : "";

    let oldContent: string;
    let newContent: string;

    if (oldLine === newLine) {
      oldContent = colors.dim(oldLine.padEnd(columnWidth).slice(0, columnWidth));
      newContent = colors.dim(newLine);
    } else if (oldLine && !newLine) {
      oldContent = colors.red(oldLine.padEnd(columnWidth).slice(0, columnWidth));
      newContent = "";
    } else if (!oldLine && newLine) {
      oldContent = " ".repeat(columnWidth);
      newContent = colors.green(newLine);
    } else {
      oldContent = colors.yellow(oldLine.padEnd(columnWidth).slice(0, columnWidth));
      newContent = colors.yellow(newLine);
    }

    lines.push(`${lineNum}${oldContent}${separator}${newContent}`);
  }

  return lines.join("\n");
}

/**
 * Creates a unified diff view.
 *
 * @param oldLines - Array of old lines.
 * @param newLines - Array of new lines.
 * @returns Formatted unified diff string.
 */
export function unifiedDiff(oldLines: string[], newLines: string[]): string {
  const lines: string[] = [];

  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);

  for (const line of oldLines) {
    if (!newSet.has(line)) {
      lines.push(colors.red(`- ${line}`));
    }
  }

  for (const line of newLines) {
    if (!oldSet.has(line)) {
      lines.push(colors.green(`+ ${line}`));
    } else {
      lines.push(colors.dim(`  ${line}`));
    }
  }

  return lines.join("\n");
}

/**
 * Creates a key-value diff for objects.
 *
 * @param oldObj - Old object.
 * @param newObj - New object.
 * @returns Formatted diff string.
 */
export function objectDiff(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>
): string {
  const lines: string[] = [];
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    const oldVal = oldObj[key];
    const newVal = newObj[key];

    if (oldVal === newVal) {
      lines.push(colors.dim(`  ${key}: ${String(oldVal)}`));
    } else if (oldVal !== undefined && newVal === undefined) {
      lines.push(colors.red(`- ${key}: ${String(oldVal)}`));
    } else if (oldVal === undefined && newVal !== undefined) {
      lines.push(colors.green(`+ ${key}: ${String(newVal)}`));
    } else {
      lines.push(colors.red(`- ${key}: ${String(oldVal)}`));
      lines.push(colors.green(`+ ${key}: ${String(newVal)}`));
    }
  }

  return lines.join("\n");
}
