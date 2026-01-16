import { colors } from "./colors.js";

/**
 * Toast notification type.
 */
export type ToastType = "success" | "error" | "warning" | "info";

/**
 * Toast options.
 */
export interface ToastOptions {
  /** Toast duration in ms (0 = no auto-dismiss) */
  duration?: number;
  /** Border style */
  borderStyle?: "single" | "double" | "rounded";
}

/**
 * Toast configuration for each type.
 */
const TOAST_CONFIG: Record<ToastType, { icon: string; color: (s: string) => string }> = {
  success: { icon: ">", color: colors.green },
  error: { icon: "X", color: colors.red },
  warning: { icon: "!", color: colors.yellow },
  info: { icon: "i", color: colors.cyan }
};

/**
 * Border characters for toast.
 */
const BORDERS = {
  single: { tl: "\u250C", tr: "\u2510", bl: "\u2514", br: "\u2518", h: "\u2500", v: "\u2502" },
  double: { tl: "\u2554", tr: "\u2557", bl: "\u255A", br: "\u255D", h: "\u2550", v: "\u2551" },
  rounded: { tl: "\u256D", tr: "\u256E", bl: "\u2570", br: "\u256F", h: "\u2500", v: "\u2502" }
};

/**
 * Creates a toast notification string.
 *
 * @param type - Toast type.
 * @param message - Toast message.
 * @param options - Toast options.
 * @returns Formatted toast string.
 *
 * @example
 * ```ts
 * console.log(toast("success", "Deployment completed"));
 * ```
 */
export function toast(type: ToastType, message: string, options: ToastOptions = {}): string {
  const { borderStyle = "rounded" } = options;
  const config = TOAST_CONFIG[type];
  const border = BORDERS[borderStyle];

  const content = `${config.icon} ${message}`;
  const innerWidth = content.length + 2;

  const lines: string[] = [];

  lines.push(
    config.color(border.tl) +
    config.color(border.h.repeat(innerWidth)) +
    config.color(border.tr)
  );

  lines.push(
    config.color(border.v) +
    ` ${config.icon} ${message} ` +
    config.color(border.v)
  );

  lines.push(
    config.color(border.bl) +
    config.color(border.h.repeat(innerWidth)) +
    config.color(border.br)
  );

  return lines.join("\n");
}

/**
 * Shows a toast notification that auto-dismisses.
 *
 * @param type - Toast type.
 * @param message - Toast message.
 * @param duration - Duration in ms before dismiss.
 */
export function showToast(type: ToastType, message: string, duration: number = 3000): void {
  const toastStr = toast(type, message);
  const lines = toastStr.split("\n");

  console.log(toastStr);

  if (duration > 0) {
    setTimeout(() => {
      for (let i = 0; i < lines.length; i++) {
        process.stdout.write("\x1b[1A\x1b[2K");
      }
    }, duration);
  }
}

/**
 * Creates a notification banner.
 *
 * @param message - Banner message.
 * @param type - Banner type.
 * @returns Formatted banner string.
 */
export function banner(message: string, type: ToastType = "info"): string {
  const config = TOAST_CONFIG[type];
  const padding = 2;
  const width = message.length + padding * 2 + 4;

  const border = config.color("=".repeat(width));
  const content = config.color(`${config.icon}`) + `  ${message}  ` + config.color(config.icon);

  return `${border}\n${content}\n${border}`;
}

/**
 * Creates a notification message with icon.
 *
 * @param type - Notification type.
 * @param message - Notification message.
 * @param details - Optional details.
 * @returns Formatted notification.
 */
export function notify(type: ToastType, message: string, details?: string): string {
  const config = TOAST_CONFIG[type];
  const icon = config.color(config.icon);
  const text = config.color(message);
  const detailPart = details ? "\n  " + colors.dim(details) : "";
  return `${icon} ${text}${detailPart}`;
}

/**
 * Toast queue for managing multiple toasts.
 */
export interface ToastQueue {
  /** Add a toast to the queue */
  add(type: ToastType, message: string): void;
  /** Clear all toasts */
  clear(): void;
}

/**
 * Creates a toast queue manager.
 *
 * @param maxVisible - Maximum visible toasts.
 * @returns ToastQueue object.
 */
export function createToastQueue(maxVisible: number = 3): ToastQueue {
  const queue: Array<{ type: ToastType; message: string }> = [];

  const render = (): void => {
    const visible = queue.slice(-maxVisible);
    process.stdout.write("\x1b[2J\x1b[H");
    for (const t of visible) {
      console.log(toast(t.type, t.message));
      console.log("");
    }
  };

  return {
    add(type: ToastType, message: string): void {
      queue.push({ type, message });
      render();
    },

    clear(): void {
      queue.length = 0;
      process.stdout.write("\x1b[2J\x1b[H");
    }
  };
}
