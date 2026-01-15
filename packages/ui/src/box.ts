import { colors, type ColorName } from "./colors.js";

/**
 * Border style presets for the box component.
 */
export type BorderStyle = "single" | "double" | "rounded" | "bold" | "none";

/**
 * Title position in the top border.
 */
export type TitlePosition = "left" | "center" | "right";

/**
 * Text alignment within the box.
 */
export type TextAlign = "left" | "center" | "right";

/**
 * Options for customizing the box appearance.
 */
export interface BoxOptions {
  /** Title displayed in the top border */
  title?: string;
  /** Position of the title in the top border */
  titlePosition?: TitlePosition;
  /** Border style preset */
  borderStyle?: BorderStyle;
  /** Color for the border (from colors module) */
  borderColor?: ColorName;
  /** Inner padding (number of spaces) */
  padding?: number;
  /** Outer margin (number of empty lines) */
  margin?: number;
  /** Fixed width (auto-calculated if not specified) */
  width?: number;
  /** Text alignment within the box */
  textAlign?: TextAlign;
  /** Dim the border for a subtle look */
  dimBorder?: boolean;
}

/**
 * Border character definitions for each style.
 */
interface BorderChars {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
}

const BORDERS: Record<BorderStyle, BorderChars> = {
  single: {
    topLeft: "┌",
    topRight: "┐",
    bottomLeft: "└",
    bottomRight: "┘",
    horizontal: "─",
    vertical: "│"
  },
  double: {
    topLeft: "╔",
    topRight: "╗",
    bottomLeft: "╚",
    bottomRight: "╝",
    horizontal: "═",
    vertical: "║"
  },
  rounded: {
    topLeft: "╭",
    topRight: "╮",
    bottomLeft: "╰",
    bottomRight: "╯",
    horizontal: "─",
    vertical: "│"
  },
  bold: {
    topLeft: "┏",
    topRight: "┓",
    bottomLeft: "┗",
    bottomRight: "┛",
    horizontal: "━",
    vertical: "┃"
  },
  none: {
    topLeft: " ",
    topRight: " ",
    bottomLeft: " ",
    bottomRight: " ",
    horizontal: " ",
    vertical: " "
  }
};

/**
 * Strip ANSI escape codes to get visible string length.
 */
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

/**
 * Get visible length of a string (excluding ANSI codes).
 */
function visibleLength(str: string): number {
  return stripAnsi(str).length;
}

/**
 * Wrap text to fit within a given width.
 */
function wrapText(text: string, maxWidth: number): string[] {
  if (maxWidth <= 0) return [text];
  
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const wordLen = visibleLength(word);
    const lineLen = visibleLength(currentLine);
    
    if (lineLen + wordLen + (currentLine ? 1 : 0) <= maxWidth) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [""];
}

/**
 * Align text within a given width.
 */
function alignText(text: string, width: number, align: TextAlign): string {
  const len = visibleLength(text);
  const padding = Math.max(0, width - len);
  
  switch (align) {
    case "center": {
      const left = Math.floor(padding / 2);
      const right = padding - left;
      return " ".repeat(left) + text + " ".repeat(right);
    }
    case "right":
      return " ".repeat(padding) + text;
    case "left":
    default:
      return text + " ".repeat(padding);
  }
}

/**
 * Creates a bordered box around content.
 *
 * Perfect for announcements, update notices, or highlighting important messages.
 *
 * @param content - The text content (string or array of lines).
 * @param options - Customization options for the box.
 * @returns The formatted box as a string.
 *
 * @example
 * ```ts
 * import { box } from "@easycli/ui";
 *
 * // Simple announcement
 * console.log(box("Update available: 1.0.0 → 2.0.0", {
 *   borderStyle: "rounded",
 *   borderColor: "yellow",
 *   padding: 1
 * }));
 *
 * // Multi-line with title
 * console.log(box([
 *   "New features:",
 *   "• Box component",
 *   "• Better prompts"
 * ], {
 *   title: " What's New ",
 *   borderStyle: "double",
 *   borderColor: "cyan"
 * }));
 * ```
 */
export function box(content: string | string[], options: BoxOptions = {}): string {
  const {
    title,
    titlePosition = "left",
    borderStyle = "rounded",
    borderColor,
    padding = 1,
    margin = 0,
    width,
    textAlign = "left",
    dimBorder = false
  } = options;

  const border = BORDERS[borderStyle];
  
  const inputLines = Array.isArray(content) ? content : content.split("\n");
  
  let contentWidth: number;
  if (width) {
    contentWidth = width - 2 - padding * 2;
  } else {
    const maxLineWidth = Math.max(...inputLines.map(visibleLength));
    const titleWidth = title ? visibleLength(title) : 0;
    contentWidth = Math.max(maxLineWidth, titleWidth);
  }
  
  const wrappedLines: string[] = [];
  for (const line of inputLines) {
    if (width && visibleLength(line) > contentWidth) {
      wrappedLines.push(...wrapText(line, contentWidth));
    } else {
      wrappedLines.push(line);
    }
  }
  
  if (!width) {
    contentWidth = Math.max(
      ...wrappedLines.map(visibleLength),
      title ? visibleLength(title) : 0
    );
  }
  
  const innerWidth = contentWidth + padding * 2;
  
  const colorize = (char: string): string => {
    let result = char;
    if (borderColor && borderColor in colors) {
      result = (colors[borderColor] as (s: string) => string)(result);
    }
    if (dimBorder) {
      result = colors.dim(result);
    }
    return result;
  };
  
  const lines: string[] = [];
  
  for (let i = 0; i < margin; i++) {
    lines.push("");
  }
  
  let topBorder = border.horizontal.repeat(innerWidth);
  if (title) {
    const titleLen = visibleLength(title);
    const availableSpace = innerWidth - 2;
    
    if (titleLen <= availableSpace) {
      let insertPos: number;
      switch (titlePosition) {
        case "center":
          insertPos = Math.floor((innerWidth - titleLen) / 2);
          break;
        case "right":
          insertPos = innerWidth - titleLen - 1;
          break;
        case "left":
        default:
          insertPos = 1;
      }
      
      topBorder = 
        border.horizontal.repeat(insertPos) + 
        title + 
        border.horizontal.repeat(innerWidth - insertPos - titleLen);
    }
  }
  lines.push(colorize(border.topLeft) + colorize(topBorder) + colorize(border.topRight));
  
  const paddingLine = colorize(border.vertical) + " ".repeat(innerWidth) + colorize(border.vertical);
  for (let i = 0; i < padding; i++) {
    lines.push(paddingLine);
  }
  
  for (const line of wrappedLines) {
    const paddedLeft = " ".repeat(padding);
    const alignedContent = alignText(line, contentWidth, textAlign);
    const paddedRight = " ".repeat(padding);
    lines.push(
      colorize(border.vertical) + 
      paddedLeft + 
      alignedContent + 
      paddedRight + 
      colorize(border.vertical)
    );
  }
  
  for (let i = 0; i < padding; i++) {
    lines.push(paddingLine);
  }
  
  const bottomBorder = border.horizontal.repeat(innerWidth);
  lines.push(colorize(border.bottomLeft) + colorize(bottomBorder) + colorize(border.bottomRight));
  
  for (let i = 0; i < margin; i++) {
    lines.push("");
  }
  
  return lines.join("\n");
}
