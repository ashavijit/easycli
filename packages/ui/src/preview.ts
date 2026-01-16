import { colors } from "./colors.js";

/**
 * Preview action definition.
 */
export interface PreviewAction {
  /** Action description */
  action: string;
  /** Action status */
  status?: "will" | "warning" | "danger";
  /** Additional details */
  details?: string;
}

/**
 * Preview options.
 */
export interface PreviewOptions {
  /** Title for the preview */
  title?: string;
  /** Show confirmation prompt */
  showPrompt?: boolean;
  /** Custom prompt message */
  promptMessage?: string;
}

/**
 * Creates a command preview/dry-run display.
 *
 * @param actions - Array of preview actions.
 * @param options - Preview options.
 * @returns Formatted preview string.
 *
 * @example
 * ```ts
 * console.log(preview([
 *   { action: "Build project", status: "will" },
 *   { action: "Upload artifacts", status: "will" },
 *   { action: "Restart services", status: "warning", details: "~10s downtime" }
 * ]));
 * ```
 */
export function preview(actions: PreviewAction[], options: PreviewOptions = {}): string {
  const { title = "This command will:", showPrompt = true, promptMessage = "Proceed?" } = options;

  const lines: string[] = [];

  lines.push(colors.bold(title));
  lines.push("");

  for (const action of actions) {
    let icon: string;
    let text: string;

    switch (action.status) {
      case "warning":
        icon = colors.yellow("!");
        text = colors.yellow(action.action);
        break;
      case "danger":
        icon = colors.red("!");
        text = colors.red(action.action);
        break;
      default:
        icon = colors.green(">");
        text = action.action;
    }

    let line = `${icon} ${text}`;
    if (action.details) {
      line += colors.dim(` (${action.details})`);
    }

    lines.push(line);
  }

  if (showPrompt) {
    lines.push("");
    lines.push(colors.dim(`${promptMessage} (y/n)`));
  }

  return lines.join("\n");
}

/**
 * Creates a diff preview for changes.
 *
 * @param changes - Array of changes.
 * @param title - Preview title.
 * @returns Formatted preview string.
 */
export function changePreview(
  changes: Array<{ type: "add" | "modify" | "delete"; path: string; details?: string }>,
  title: string = "Changes to be made:"
): string {
  const lines: string[] = [];

  lines.push(colors.bold(title));
  lines.push("");

  const counts = { add: 0, modify: 0, delete: 0 };

  for (const change of changes) {
    counts[change.type]++;

    let icon: string;
    let text: string;

    switch (change.type) {
      case "add":
        icon = colors.green("+");
        text = colors.green(change.path);
        break;
      case "modify":
        icon = colors.yellow("~");
        text = colors.yellow(change.path);
        break;
      case "delete":
        icon = colors.red("-");
        text = colors.red(change.path);
        break;
    }

    let line = `  ${icon} ${text}`;
    if (change.details) {
      line += colors.dim(` (${change.details})`);
    }

    lines.push(line);
  }

  lines.push("");
  const summary: string[] = [];
  if (counts.add > 0) summary.push(colors.green(`${counts.add} added`));
  if (counts.modify > 0) summary.push(colors.yellow(`${counts.modify} modified`));
  if (counts.delete > 0) summary.push(colors.red(`${counts.delete} deleted`));
  lines.push(summary.join(colors.dim(", ")));

  return lines.join("\n");
}

/**
 * Creates a confirmation box for destructive actions.
 *
 * @param message - Warning message.
 * @param consequences - List of consequences.
 * @returns Formatted confirmation prompt.
 */
export function confirmBox(message: string, consequences: string[]): string {
  const lines: string[] = [];

  lines.push(colors.red("!") + " " + colors.red(colors.bold(message)));
  lines.push("");

  for (const consequence of consequences) {
    lines.push(colors.dim("  - ") + colors.dim(consequence));
  }

  lines.push("");
  lines.push(colors.dim("Type 'yes' to confirm or 'no' to cancel:"));

  return lines.join("\n");
}
