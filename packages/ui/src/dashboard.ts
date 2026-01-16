import { colors } from "./colors.js";

/**
 * Metric configuration for dashboard.
 */
export interface Metric {
  /** Metric label */
  label: string;
  /** Current value (0-100 for percentage) */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Display unit */
  unit?: string;
  /** Color threshold overrides */
  thresholds?: {
    warning?: number;
    danger?: number;
  };
}

/**
 * Dashboard options.
 */
export interface DashboardOptions {
  /** Bar width in characters */
  barWidth?: number;
  /** Label width for alignment */
  labelWidth?: number;
  /** Show percentage values */
  showValues?: boolean;
}

/**
 * Creates a percentage bar.
 *
 * @param value - Current value.
 * @param max - Maximum value.
 * @param width - Bar width in characters.
 * @param thresholds - Color thresholds.
 * @returns Formatted bar string.
 */
export function percentBar(
  value: number,
  max: number = 100,
  width: number = 20,
  thresholds?: { warning?: number; danger?: number }
): string {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;

  const warningThreshold = thresholds?.warning ?? 70;
  const dangerThreshold = thresholds?.danger ?? 90;

  let colorFn: (s: string) => string;
  if (percent >= dangerThreshold) {
    colorFn = colors.red;
  } else if (percent >= warningThreshold) {
    colorFn = colors.yellow;
  } else {
    colorFn = colors.green;
  }

  const filledBar = colorFn("\u2588".repeat(filled));
  const emptyBar = colors.dim("\u2591".repeat(empty));

  return filledBar + emptyBar;
}

/**
 * Creates a dashboard/HUD display.
 *
 * @param metrics - Array of metrics to display.
 * @param options - Dashboard options.
 * @returns Formatted dashboard string.
 *
 * @example
 * ```ts
 * console.log(dashboard([
 *   { label: "CPU", value: 68, unit: "%" },
 *   { label: "Memory", value: 54, unit: "%" },
 *   { label: "Disk", value: 32, unit: "%" }
 * ]));
 * ```
 */
export function dashboard(metrics: Metric[], options: DashboardOptions = {}): string {
  const {
    barWidth = 20,
    labelWidth = 10,
    showValues = true
  } = options;

  const lines: string[] = [];

  for (const metric of metrics) {
    const max = metric.max ?? 100;
    const bar = percentBar(metric.value, max, barWidth, metric.thresholds);
    const label = colors.cyan(metric.label.padEnd(labelWidth));

    let valuePart = "";
    if (showValues) {
      const percent = Math.round((metric.value / max) * 100);
      const unit = metric.unit ?? "%";
      valuePart = colors.dim(` ${percent}${unit}`);
    }

    lines.push(`${label}${bar}${valuePart}`);
  }

  return lines.join("\n");
}

/**
 * Key-value display for dashboard stats.
 *
 * @param stats - Key-value pairs.
 * @param labelWidth - Label width for alignment.
 * @returns Formatted stats string.
 */
export function stats(
  statList: Array<{ label: string; value: string | number; color?: "green" | "red" | "yellow" | "cyan" }>,
  labelWidth: number = 12
): string {
  const lines: string[] = [];

  for (const stat of statList) {
    const label = colors.dim(stat.label.padEnd(labelWidth));
    let value = String(stat.value);

    if (stat.color) {
      value = colors[stat.color](value);
    }

    lines.push(`${label}${value}`);
  }

  return lines.join("\n");
}

/**
 * Live dashboard that can be updated.
 */
export interface LiveDashboard {
  /** Update a metric value */
  update(label: string, value: number): void;
  /** Add a new metric */
  addMetric(metric: Metric): void;
  /** Render the dashboard */
  render(): void;
  /** Stop the dashboard */
  stop(): void;
}

/**
 * Creates a live dashboard that auto-refreshes.
 *
 * @param initialMetrics - Initial metrics.
 * @param refreshMs - Refresh interval in ms.
 * @returns LiveDashboard object.
 */
export function createDashboard(
  initialMetrics: Metric[],
  refreshMs: number = 1000
): LiveDashboard {
  const metrics = new Map<string, Metric>();
  let intervalId: ReturnType<typeof setInterval> | null = null;

  for (const m of initialMetrics) {
    metrics.set(m.label, m);
  }

  const render = (): void => {
    process.stdout.write("\x1b[2J\x1b[H");
    console.log(dashboard(Array.from(metrics.values())));
  };

  intervalId = setInterval(render, refreshMs);
  render();

  return {
    update(label: string, value: number): void {
      const metric = metrics.get(label);
      if (metric) {
        metric.value = value;
      }
    },

    addMetric(metric: Metric): void {
      metrics.set(metric.label, metric);
    },

    render,

    stop(): void {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  };
}
