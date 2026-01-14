import { colors } from "./colors.js";

/**
 * Spinner for async operations.
 *
 * @example
 * ```ts
 * const s = spinner("Deploying...");
 * s.start();
 * await deploy();
 * s.success("Done");
 * ```
 */
export interface Spinner {
  /** Starts the spinner animation. */
  start(): void;
  /** Stops the spinner and shows a success message. */
  success(message?: string): void;
  /** Stops the spinner and shows a failure message. */
  fail(message?: string): void;
  /** Stops the spinner without a message. */
  stop(): void;
}

const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

/**
 * Creates a terminal spinner.
 *
 * @param message - The message to display next to the spinner.
 * @returns A Spinner object with start, success, fail, and stop methods.
 */
export function spinner(message: string): Spinner {
  let frameIndex = 0;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let currentMessage = message;

  const clearLine = () => {
    process.stdout.write("\r\x1b[K");
  };

  const render = () => {
    clearLine();
    const frame = colors.cyan(frames[frameIndex]!);
    process.stdout.write(`${frame} ${currentMessage}`);
    frameIndex = (frameIndex + 1) % frames.length;
  };

  return {
    start() {
      if (intervalId) return;
      intervalId = setInterval(render, 80);
      render();
    },

    success(msg?: string) {
      this.stop();
      const icon = colors.green("✔");
      const text = colors.green(msg ?? currentMessage);
      process.stdout.write(`\r\x1b[K${icon} ${text}\n`);
    },

    fail(msg?: string) {
      this.stop();
      const icon = colors.red("✖");
      const text = colors.red(msg ?? currentMessage);
      process.stdout.write(`\r\x1b[K${icon} ${text}\n`);
    },

    stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        clearLine();
      }
    }
  };
}
