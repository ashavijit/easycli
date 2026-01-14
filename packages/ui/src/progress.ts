import { colors } from "./colors.js";

/**
 * Progress bar for long-running tasks.
 *
 * @example
 * ```ts
 * const bar = progress(100);
 * bar.update(20);
 * bar.update(50);
 * bar.complete();
 * ```
 */
export interface ProgressBar {
  /** Updates the progress bar to the given value. */
  update(value: number): void;
  /** Marks the progress as complete. */
  complete(): void;
}

/**
 * Creates a terminal progress bar.
 *
 * @param total - The total value (100%).
 * @param width - The width of the progress bar in characters (default: 30).
 * @returns A ProgressBar object with update and complete methods.
 */
export function progress(total: number, width = 30): ProgressBar {
  let current = 0;

  const render = () => {
    const percent = Math.min(100, Math.round((current / total) * 100));
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    const filledBar = colors.green("█".repeat(filled));
    const emptyBar = colors.gray("░".repeat(empty));
    const percentText = colors.cyan(`${percent}%`);
    process.stdout.write(`\r${filledBar}${emptyBar} ${percentText}`);
  };

  return {
    update(value: number) {
      current = value;
      render();
    },

    complete() {
      current = total;
      render();
      process.stdout.write("\n");
    }
  };
}
