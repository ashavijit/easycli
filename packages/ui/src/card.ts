import { colors } from "./colors.js";

/**
 * Card options.
 */
export interface CardOptions {
  /** Card title */
  title?: string;
  /** Card width (auto if not specified) */
  width?: number;
  /** Border color */
  borderColor?: "green" | "red" | "yellow" | "cyan" | "blue" | "magenta";
  /** Padding inside the card */
  padding?: number;
}

/**
 * Card field definition.
 */
export interface CardField {
  /** Field label */
  label: string;
  /** Field value */
  value: string | number;
  /** Value color */
  color?: "green" | "red" | "yellow" | "cyan";
}

/**
 * Creates a card UI component.
 *
 * @param fields - Array of card fields.
 * @param options - Card options.
 * @returns Formatted card string.
 *
 * @example
 * ```ts
 * console.log(card([
 *   { label: "Status", value: "Running", color: "green" },
 *   { label: "Port", value: 3000 },
 *   { label: "Region", value: "us-east" }
 * ], { title: "API Server" }));
 * ```
 */
export function card(fields: CardField[], options: CardOptions = {}): string {
  const { title, padding = 1, borderColor } = options;

  const labelWidth = Math.max(...fields.map((f) => f.label.length));
  const valueWidth = Math.max(...fields.map((f) => String(f.value).length));
  const contentWidth = labelWidth + valueWidth + 4;
  const titleWidth = title ? title.length + 2 : 0;
  const innerWidth = Math.max(contentWidth, titleWidth, options.width ?? 0);

  const colorFn = borderColor ? colors[borderColor] : colors.dim;

  const lines: string[] = [];

  let topBorder = "\u2500".repeat(innerWidth);
  if (title) {
    const titlePadded = ` ${title} `;
    const leftLen = Math.floor((innerWidth - titlePadded.length) / 2);
    const rightLen = innerWidth - leftLen - titlePadded.length;
    topBorder =
      "\u2500".repeat(leftLen) +
      colors.bold(titlePadded) +
      "\u2500".repeat(rightLen);
  }

  lines.push(colorFn("\u250C") + colorFn(topBorder) + colorFn("\u2510"));

  for (let i = 0; i < padding; i++) {
    lines.push(colorFn("\u2502") + " ".repeat(innerWidth) + colorFn("\u2502"));
  }

  for (const field of fields) {
    const label = colors.dim(field.label.padEnd(labelWidth));
    let value = String(field.value);
    if (field.color) {
      value = colors[field.color](value);
    }

    const content = ` ${label}  ${value}`;
    const paddedContent = content.padEnd(innerWidth);
    lines.push(colorFn("\u2502") + paddedContent + colorFn("\u2502"));
  }

  for (let i = 0; i < padding; i++) {
    lines.push(colorFn("\u2502") + " ".repeat(innerWidth) + colorFn("\u2502"));
  }

  const bottomBorder = "\u2500".repeat(innerWidth);
  lines.push(colorFn("\u2514") + colorFn(bottomBorder) + colorFn("\u2518"));

  return lines.join("\n");
}

/**
 * Creates a simple info card.
 *
 * @param title - Card title.
 * @param content - Card content (string or lines).
 * @param options - Card options.
 * @returns Formatted card string.
 */
export function infoCard(
  title: string,
  content: string | string[],
  options: Omit<CardOptions, "title"> = {}
): string {
  const lines = Array.isArray(content) ? content : content.split("\n");
  const fields = lines.map((line, i) => ({
    label: i === 0 ? "" : "",
    value: line
  }));

  return card(
    fields.length > 0 ? fields : [{ label: "", value: "" }],
    { ...options, title }
  );
}

/**
 * Creates a row of cards.
 *
 * @param cards - Array of card strings.
 * @param gap - Gap between cards.
 * @returns Formatted card row.
 */
export function cardRow(cards: string[], gap: number = 2): string {
  const cardLines = cards.map((c) => c.split("\n"));
  const maxHeight = Math.max(...cardLines.map((c) => c.length));
  const cardWidths = cardLines.map((c) => c[0]?.length ?? 0);

  const result: string[] = [];

  for (let row = 0; row < maxHeight; row++) {
    const lineParts = cardLines.map((lines, i) => {
      const line = lines[row] ?? "";
      return line.padEnd(cardWidths[i] ?? 0);
    });
    result.push(lineParts.join(" ".repeat(gap)));
  }

  return result.join("\n");
}
