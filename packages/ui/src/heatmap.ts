import { colors } from "./colors.js";

/**
 * Heatmap cell value definition.
 */
export interface HeatmapCell {
  /** Cell value (0-1 normalized, or raw) */
  value: number;
  /** Optional label */
  label?: string;
}

/**
 * Heatmap options.
 */
export interface HeatmapOptions {
  /** Minimum value (for normalization) */
  min?: number;
  /** Maximum value (for normalization) */
  max?: number;
  /** Color scheme */
  colorScheme?: "green" | "blue" | "red" | "gray";
  /** Show values */
  showValues?: boolean;
}

/**
 * Intensity blocks for heatmap.
 */
const BLOCKS = [" ", "\u2591", "\u2592", "\u2593", "\u2588"];

/**
 * Creates a heatmap/grid visualization.
 *
 * @param data - 2D array of values.
 * @param options - Heatmap options.
 * @returns Formatted heatmap string.
 *
 * @example
 * ```ts
 * console.log(heatmap([
 *   [5, 3, 0, 4, 5],
 *   [2, 4, 1, 3, 4],
 *   [1, 2, 3, 4, 5]
 * ], { colorScheme: "green" }));
 * ```
 */
export function heatmap(data: number[][], options: HeatmapOptions = {}): string {
  const { colorScheme = "green", showValues = false } = options;

  const allValues = data.flat();
  const min = options.min ?? Math.min(...allValues);
  const max = options.max ?? Math.max(...allValues);
  const range = max - min || 1;

  const colorFn = colors[colorScheme] ?? colors.green;

  const lines: string[] = [];

  for (const row of data) {
    let line = "";
    for (const value of row) {
      const normalized = (value - min) / range;
      const blockIndex = Math.min(BLOCKS.length - 1, Math.floor(normalized * BLOCKS.length));
      const block = BLOCKS[blockIndex]!;

      if (showValues) {
        line += colorFn(block) + colors.dim(String(value).padStart(3));
      } else {
        line += colorFn(block + block);
      }
    }
    lines.push(line);
  }

  return lines.join("\n");
}

/**
 * Creates a labeled heatmap with row/column headers.
 *
 * @param data - 2D array of values.
 * @param rowLabels - Row labels.
 * @param colLabels - Column labels.
 * @param options - Heatmap options.
 * @returns Formatted labeled heatmap.
 */
export function labeledHeatmap(
  data: number[][],
  rowLabels: string[],
  colLabels: string[],
  options: HeatmapOptions = {}
): string {
  const { colorScheme = "green" } = options;

  const allValues = data.flat();
  const min = options.min ?? Math.min(...allValues);
  const max = options.max ?? Math.max(...allValues);
  const range = max - min || 1;

  const colorFn = colors[colorScheme] ?? colors.green;
  const labelWidth = Math.max(...rowLabels.map((l) => l.length)) + 1;

  const lines: string[] = [];

  const headerLine = " ".repeat(labelWidth) + colLabels.map((l) => l.padStart(4)).join("");
  lines.push(colors.dim(headerLine));

  for (let i = 0; i < data.length; i++) {
    const row = data[i]!;
    const label = rowLabels[i] ?? "";

    let line = colors.dim(label.padEnd(labelWidth));

    for (const value of row) {
      const normalized = (value - min) / range;
      const blockIndex = Math.min(BLOCKS.length - 1, Math.floor(normalized * BLOCKS.length));
      const block = BLOCKS[blockIndex]!;
      line += colorFn((block + block + block).padStart(4));
    }

    lines.push(line);
  }

  return lines.join("\n");
}

/**
 * Creates a GitHub-style activity grid.
 *
 * @param data - Array of daily values (52 weeks x 7 days = 364).
 * @param options - Heatmap options.
 * @returns Formatted activity grid.
 */
export function activityGrid(
  weeks: number[][],
  dayLabels: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  options: HeatmapOptions = {}
): string {
  const { colorScheme = "green" } = options;

  const allValues = weeks.flat();
  const min = options.min ?? 0;
  const max = options.max ?? Math.max(...allValues);
  const range = max - min || 1;

  const colorFn = colors[colorScheme] ?? colors.green;
  const labelWidth = Math.max(...dayLabels.map((l) => l.length)) + 1;

  const lines: string[] = [];

  for (let day = 0; day < 7; day++) {
    const label = dayLabels[day] ?? "";
    let line = colors.dim(label.padEnd(labelWidth));

    for (const week of weeks) {
      const value = week[day] ?? 0;
      const normalized = (value - min) / range;
      const blockIndex = Math.min(BLOCKS.length - 1, Math.floor(normalized * BLOCKS.length));
      line += colorFn(BLOCKS[blockIndex]! + " ");
    }

    lines.push(line);
  }

  return lines.join("\n");
}
