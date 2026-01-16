import { colors } from "./colors.js";

/**
 * Task runner for multi-step workflows.
 * Provides step-by-step progress tracking with spinner integration.
 *
 * @example
 * ```ts
 * const t = task("Deploying");
 * await t.step("Build", build);
 * await t.step("Upload", upload);
 * await t.step("Verify", verify);
 * t.success("All done!");
 * ```
 */
export interface Task {
  /**
   * Executes a step with a spinner showing progress.
   *
   * @param name - The name of the step to display.
   * @param fn - The async function to execute.
   * @returns The result of the function.
   */
  step<T>(name: string, fn: () => T | Promise<T>): Promise<T>;

  /**
   * Completes the task with a success message.
   *
   * @param message - The success message to display.
   */
  success(message: string): void;

  /**
   * Completes the task with a failure message.
   *
   * @param message - The failure message to display.
   */
  fail(message: string): void;
}

const frames = ["|", "/", "-", "\\"];

/**
 * Creates a task runner for multi-step workflows.
 *
 * @param name - The name of the task.
 * @returns A Task object with step, success, and fail methods.
 *
 * @example
 * ```ts
 * const t = task("Deploying");
 *
 * await t.step("Build", async () => {
 *   await build();
 * });
 *
 * await t.step("Upload", async () => {
 *   await upload();
 * });
 *
 * t.success("Deployment complete!");
 * ```
 */
export function task(name: string): Task {
  let stepCount = 0;

  const clearLine = (): void => {
    process.stdout.write("\r\x1b[K");
  };

  const printHeader = (): void => {
    if (stepCount === 0) {
      console.log(colors.bold(name));
    }
  };

  return {
    async step<T>(stepName: string, fn: () => T | Promise<T>): Promise<T> {
      printHeader();
      stepCount++;

      let frameIndex = 0;
      let intervalId: ReturnType<typeof setInterval> | null = null;

      const render = (): void => {
        clearLine();
        const frame = colors.cyan(frames[frameIndex]!);
        process.stdout.write(`  ${frame} ${stepName}`);
        frameIndex = (frameIndex + 1) % frames.length;
      };

      intervalId = setInterval(render, 80);
      render();

      try {
        const result = await fn();

        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        clearLine();

        const icon = colors.green(">");
        console.log(`  ${icon} ${stepName}`);

        return result;
      } catch (error) {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        clearLine();

        const icon = colors.red("X");
        console.log(`  ${icon} ${stepName}`);

        throw error;
      }
    },

    success(message: string): void {
      const icon = colors.green(">");
      console.log(`${icon} ${colors.green(message)}`);
    },

    fail(message: string): void {
      const icon = colors.red("X");
      console.log(`${icon} ${colors.red(message)}`);
    }
  };
}
