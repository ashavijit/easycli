import { colors } from "./colors.js";

/**
 * Sparkline bar characters from lowest to highest.
 */
const BARS = ["\u2581", "\u2582", "\u2583", "\u2584", "\u2585", "\u2586", "\u2587", "\u2588"];

/**
 * Sparkline options.
 */
export interface SparklineOptions {
  /** Minimum value (auto-calculated if not provided) */
  min?: number;
  /** Maximum value (auto-calculated if not provided) */
  max?: number;
  /** Color for the sparkline */
  color?: "green" | "red" | "yellow" | "cyan" | "blue" | "magenta";
}

/**
 * Creates an inline sparkline chart.
 *
 * @param data - Array of numeric values.
 * @param options - Sparkline options.
 * @returns Sparkline string.
 *
 * @example
 * ```ts
 * console.log("Requests: " + sparkline([1, 2, 4, 8, 4, 2, 1]));
 * // Requests: ▁▂▄█▄▂▁
 * ```
 */
export function sparkline(data: number[], options: SparklineOptions = {}): string {
  if (data.length === 0) return "";

  const min = options.min ?? Math.min(...data);
  const max = options.max ?? Math.max(...data);
  const range = max - min || 1;

  const result = data.map((value) => {
    const normalized = (value - min) / range;
    const index = Math.min(BARS.length - 1, Math.floor(normalized * BARS.length));
    return BARS[index];
  }).join("");

  if (options.color) {
    return colors[options.color](result);
  }

  return result;
}

/**
 * Creates a labeled sparkline with value.
 *
 * @param label - Label text.
 * @param data - Array of numeric values.
 * @param options - Sparkline options.
 * @returns Formatted labeled sparkline.
 */
export function labeledSparkline(
  label: string,
  data: number[],
  options: SparklineOptions & { showLast?: boolean; labelWidth?: number } = {}
): string {
  const { showLast = true, labelWidth = 12, ...sparkOptions } = options;
  const paddedLabel = colors.dim(label.padEnd(labelWidth));
  const chart = sparkline(data, sparkOptions);

  if (showLast && data.length > 0) {
    const lastValue = data[data.length - 1]!;
    return `${paddedLabel}${chart} ${colors.cyan(String(lastValue))}`;
  }

  return `${paddedLabel}${chart}`;
}

/**
 * Creates a horizontal bar chart.
 *
 * @param data - Array of label-value pairs.
 * @param options - Chart options.
 * @returns Formatted bar chart.
 */
export function barChart(
  data: Array<{ label: string; value: number }>,
  options: { maxWidth?: number; labelWidth?: number } = {}
): string {
  const { maxWidth = 30, labelWidth = 15 } = options;
  const maxValue = Math.max(...data.map((d) => d.value));

  const lines = data.map(({ label, value }) => {
    const barLen = Math.round((value / maxValue) * maxWidth);
    const bar = colors.cyan("\u2588".repeat(barLen));
    const paddedLabel = label.padEnd(labelWidth);
    return `${colors.dim(paddedLabel)}${bar} ${colors.dim(String(value))}`;
  });

  return lines.join("\n");
}

/**
 * Creates a trend indicator.
 *
 * @param current - Current value.
 * @param previous - Previous value.
 * @returns Trend indicator string.
 */
export function trend(current: number, previous: number): string {
  const diff = current - previous;
  const percent = previous !== 0 ? Math.round((diff / previous) * 100) : 0;

  if (diff > 0) {
    return colors.green(`^ +${percent}%`);
  } else if (diff < 0) {
    return colors.red(`v ${percent}%`);
  } else {
    return colors.dim("- 0%");
  }
}
