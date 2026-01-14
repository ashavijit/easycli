/**
 * Terminal color utilities using ANSI escape codes.
 * Zero-dependency, lightweight color support for CLI output.
 * 
 * @example
 * ```ts
 * import { colors } from "@easycli/ui";
 * 
 * console.log(colors.green("Success!"));
 * console.log(colors.bold(colors.red("Error!")));
 * console.log(colors.dim("Hint: use --help"));
 * ```
 */

// Check if colors should be disabled
const isColorDisabled = (): boolean => {
  return (
    process.env.NO_COLOR !== undefined ||
    process.env.FORCE_COLOR === "0" ||
    !process.stdout.isTTY
  );
};

const code = (open: number, close: number) => (text: string): string => {
  if (isColorDisabled()) return text;
  return `\x1b[${open}m${text}\x1b[${close}m`;
};

/**
 * Color and style functions for terminal output.
 */
export const colors = {
  // Styles
  reset: code(0, 0),
  bold: code(1, 22),
  dim: code(2, 22),
  italic: code(3, 23),
  underline: code(4, 24),
  inverse: code(7, 27),
  strikethrough: code(9, 29),

  // Foreground colors
  black: code(30, 39),
  red: code(31, 39),
  green: code(32, 39),
  yellow: code(33, 39),
  blue: code(34, 39),
  magenta: code(35, 39),
  cyan: code(36, 39),
  white: code(37, 39),
  gray: code(90, 39),
  grey: code(90, 39),

  // Bright foreground colors
  redBright: code(91, 39),
  greenBright: code(92, 39),
  yellowBright: code(93, 39),
  blueBright: code(94, 39),
  magentaBright: code(95, 39),
  cyanBright: code(96, 39),
  whiteBright: code(97, 39),

  // Background colors
  bgBlack: code(40, 49),
  bgRed: code(41, 49),
  bgGreen: code(42, 49),
  bgYellow: code(43, 49),
  bgBlue: code(44, 49),
  bgMagenta: code(45, 49),
  bgCyan: code(46, 49),
  bgWhite: code(47, 49),

  // Bright background colors
  bgRedBright: code(101, 49),
  bgGreenBright: code(102, 49),
  bgYellowBright: code(103, 49),
  bgBlueBright: code(104, 49),
  bgMagentaBright: code(105, 49),
  bgCyanBright: code(106, 49),
  bgWhiteBright: code(107, 49),
} as const;

export type Colors = typeof colors;
export type ColorName = keyof Colors;
