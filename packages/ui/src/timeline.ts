import { colors } from "./colors.js";

/**
 * Step status for timeline visualization.
 */
export type StepStatus = "pending" | "running" | "success" | "failed" | "skipped";

/**
 * Timeline step definition.
 */
export interface TimelineStep {
  /** Step name */
  name: string;
  /** Step status */
  status: StepStatus;
  /** Duration in seconds (optional) */
  duration?: number;
  /** Additional message (optional) */
  message?: string;
}

/**
 * Timeline options.
 */
export interface TimelineOptions {
  /** Show duration for completed steps */
  showDuration?: boolean;
  /** Compact mode (no connecting lines) */
  compact?: boolean;
}

/**
 * Status icons and colors for each step status.
 */
const STATUS_CONFIG: Record<StepStatus, { icon: string; color: (s: string) => string }> = {
  pending: { icon: "o", color: colors.dim },
  running: { icon: "*", color: colors.cyan },
  success: { icon: ">", color: colors.green },
  failed: { icon: "X", color: colors.red },
  skipped: { icon: "-", color: colors.dim }
};

/**
 * Creates a timeline/stepper visualization.
 *
 * @param steps - Array of timeline steps.
 * @param options - Timeline options.
 * @returns Formatted timeline string.
 *
 * @example
 * ```ts
 * console.log(timeline([
 *   { name: "Build", status: "success", duration: 12 },
 *   { name: "Test", status: "success", duration: 8 },
 *   { name: "Deploy", status: "running" },
 *   { name: "Verify", status: "pending" }
 * ]));
 * ```
 */
export function timeline(steps: TimelineStep[], options: TimelineOptions = {}): string {
  const { showDuration = true, compact = false } = options;
  const lines: string[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    const config = STATUS_CONFIG[step.status];
    const icon = config.color(config.icon);

    let line = `${icon} ${step.name}`;

    if (showDuration && step.duration !== undefined) {
      line += colors.dim(` (${step.duration}s)`);
    }

    if (step.message) {
      line += colors.dim(` - ${step.message}`);
    }

    lines.push(line);

    if (!compact && i < steps.length - 1) {
      lines.push(colors.dim("|"));
    }
  }

  return lines.join("\n");
}

/**
 * Interactive timeline that can be updated.
 */
export interface TimelineRunner {
  /** Add a step to the timeline */
  addStep(name: string): void;
  /** Update current step status */
  updateStep(status: StepStatus, duration?: number): void;
  /** Complete the timeline with success */
  complete(): void;
  /** Complete the timeline with failure */
  fail(message?: string): void;
  /** Render the current state */
  render(): void;
}

/**
 * Creates an interactive timeline runner.
 *
 * @param title - Title for the timeline.
 * @returns TimelineRunner object.
 */
export function createTimeline(title: string): TimelineRunner {
  const steps: TimelineStep[] = [];
  let currentIndex = -1;
  let startTime = 0;

  const render = (): void => {
    process.stdout.write("\x1b[2J\x1b[H");
    console.log(colors.bold(title));
    console.log("");
    console.log(timeline(steps));
  };

  return {
    addStep(name: string): void {
      if (currentIndex >= 0 && steps[currentIndex]?.status === "running") {
        const duration = Math.round((Date.now() - startTime) / 1000);
        steps[currentIndex]!.status = "success";
        steps[currentIndex]!.duration = duration;
      }

      steps.push({ name, status: "running" });
      currentIndex = steps.length - 1;
      startTime = Date.now();
      render();
    },

    updateStep(status: StepStatus, duration?: number): void {
      if (currentIndex >= 0) {
        steps[currentIndex]!.status = status;
        if (duration !== undefined) {
          steps[currentIndex]!.duration = duration;
        }
        render();
      }
    },

    complete(): void {
      if (currentIndex >= 0 && steps[currentIndex]?.status === "running") {
        const duration = Math.round((Date.now() - startTime) / 1000);
        steps[currentIndex]!.status = "success";
        steps[currentIndex]!.duration = duration;
      }
      render();
    },

    fail(message?: string): void {
      if (currentIndex >= 0) {
        steps[currentIndex]!.status = "failed";
        if (message) {
          steps[currentIndex]!.message = message;
        }
      }
      render();
    },

    render
  };
}
