import { colors } from "./colors.js";

/**
 * Prints a formatted table to stdout.
 *
 * @param rows - Array of objects to display as table rows.
 *
 * @example
 * ```ts
 * table([
 *   { name: "api", status: "running" },
 *   { name: "worker", status: "stopped" }
 * ]);
 * // Output:
 * // NAME     STATUS
 * // api      running
 * // worker   stopped
 * ```
 */
export function table(rows: Record<string, unknown>[]): void {
  if (rows.length === 0) return;

  const firstRow = rows[0];
  if (!firstRow) return;

  const headers = Object.keys(firstRow);

  // Calculate column widths
  const widths: Record<string, number> = {};
  for (const header of headers) {
    widths[header] = header.length;
  }
  for (const row of rows) {
    for (const header of headers) {
      const value = String(row[header] ?? "");
      const currentWidth = widths[header] ?? 0;
      widths[header] = Math.max(currentWidth, value.length);
    }
  }

  // Print header with cyan bold styling
  const headerLine = headers
    .map((h) => colors.cyan(colors.bold(h.toUpperCase().padEnd((widths[h] ?? 0) + 2))))
    .join("");
  process.stdout.write(headerLine + "\n");

  // Print rows with intelligent coloring
  for (const row of rows) {
    const rowLine = headers
      .map((h) => {
        const value = String(row[h] ?? "");
        const paddedValue = value.padEnd((widths[h] ?? 0) + 2);
        
        // Apply intelligent coloring based on common status values
        const lowerValue = value.toLowerCase();
        if (lowerValue === "running" || lowerValue === "active" || lowerValue === "success" || lowerValue === "online") {
          return colors.green(paddedValue);
        }
        if (lowerValue === "stopped" || lowerValue === "error" || lowerValue === "failed" || lowerValue === "offline") {
          return colors.red(paddedValue);
        }
        if (lowerValue === "pending" || lowerValue === "maintenance" || lowerValue === "warning") {
          return colors.yellow(paddedValue);
        }
        return paddedValue;
      })
      .join("");
    process.stdout.write(rowLine + "\n");
  }
}
