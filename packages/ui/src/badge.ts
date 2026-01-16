import { colors } from "./colors.js";

/**
 * Badge/pill status types.
 */
export type BadgeStatus = "success" | "error" | "warning" | "info" | "pending" | "running";

/**
 * Badge configuration.
 */
interface BadgeConfig {
  icon: string;
  color: (s: string) => string;
  bgColor?: (s: string) => string;
}

/**
 * Badge configurations for each status.
 */
const BADGE_CONFIG: Record<BadgeStatus, BadgeConfig> = {
  success: { icon: ">", color: colors.green },
  error: { icon: "X", color: colors.red },
  warning: { icon: "!", color: colors.yellow },
  info: { icon: "i", color: colors.cyan },
  pending: { icon: "o", color: colors.dim },
  running: { icon: "*", color: colors.cyan }
};

/**
 * Creates a status badge/pill.
 *
 * @param status - Badge status.
 * @param text - Badge text (optional, uses status name if not provided).
 * @returns Formatted badge string.
 *
 * @example
 * ```ts
 * console.log(badge("success", "DEPLOYED"));
 * // > DEPLOYED
 *
 * console.log(badge("error"));
 * // X ERROR
 * ```
 */
export function badge(status: BadgeStatus, text?: string): string {
  const config = BADGE_CONFIG[status];
  const label = text ?? status.toUpperCase();
  return `${config.color(config.icon)} ${config.color(label)}`;
}

/**
 * Creates a bordered badge.
 *
 * @param status - Badge status.
 * @param text - Badge text.
 * @returns Formatted bordered badge.
 */
export function borderedBadge(status: BadgeStatus, text?: string): string {
  const config = BADGE_CONFIG[status];
  const label = text ?? status.toUpperCase();
  const padded = ` ${label} `;
  return config.color(`[${padded}]`);
}

/**
 * Creates a row of badges.
 *
 * @param badges - Array of badge definitions.
 * @returns Formatted badge row.
 */
export function badgeRow(
  badges: Array<{ status: BadgeStatus; text?: string }>
): string {
  return badges.map((b) => borderedBadge(b.status, b.text)).join("  ");
}

/**
 * Creates a status line with icon and message.
 *
 * @param status - Status type.
 * @param message - Status message.
 * @param details - Optional details.
 * @returns Formatted status line.
 */
export function statusLine(
  status: BadgeStatus,
  message: string,
  details?: string
): string {
  const config = BADGE_CONFIG[status];
  const icon = config.color(config.icon);
  const text = config.color(message);
  const detailPart = details ? colors.dim(` (${details})`) : "";
  return `${icon} ${text}${detailPart}`;
}

/**
 * Creates a labeled status display.
 *
 * @param items - Array of label-status pairs.
 * @param labelWidth - Width for labels.
 * @returns Formatted status display.
 */
export function statusList(
  items: Array<{ label: string; status: BadgeStatus; message?: string }>,
  labelWidth: number = 15
): string {
  const lines = items.map((item) => {
    const label = colors.dim(item.label.padEnd(labelWidth));
    const statusBadge = badge(item.status, item.message);
    return `${label}${statusBadge}`;
  });

  return lines.join("\n");
}

/**
 * Creates an inline indicator dot.
 *
 * @param status - Status type.
 * @returns Colored dot character.
 */
export function dot(status: BadgeStatus): string {
  const config = BADGE_CONFIG[status];
  return config.color("*");
}

/**
 * Creates a status summary line.
 *
 * @param counts - Status counts.
 * @returns Formatted summary.
 */
export function statusSummary(counts: Partial<Record<BadgeStatus, number>>): string {
  const parts: string[] = [];

  if (counts.success) {
    parts.push(colors.green(`${counts.success} passed`));
  }
  if (counts.error) {
    parts.push(colors.red(`${counts.error} failed`));
  }
  if (counts.warning) {
    parts.push(colors.yellow(`${counts.warning} warnings`));
  }
  if (counts.pending) {
    parts.push(colors.dim(`${counts.pending} pending`));
  }
  if (counts.running) {
    parts.push(colors.cyan(`${counts.running} running`));
  }

  return parts.join(colors.dim(" | "));
}
