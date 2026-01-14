export const enum TokenType {
  Command = "COMMAND",
  Flag = "FLAG",
  ShortFlag = "SHORT_FLAG",
  Value = "VALUE",
  DoubleDash = "DOUBLE_DASH",
  End = "END"
}

export interface Token {
  type: TokenType;
  value: string;
  raw: string;
}

export function tokenize(argv: string[]): Token[] {
  const tokens: Token[] = [];
  let passthrough = false;

  for (const arg of argv) {
    if (passthrough) {
      tokens.push({ type: TokenType.Value, value: arg, raw: arg });
      continue;
    }

    if (arg === "--") {
      passthrough = true;
      tokens.push({ type: TokenType.DoubleDash, value: "--", raw: "--" });
      continue;
    }

    if (arg.startsWith("--")) {
      const eqIndex = arg.indexOf("=");
      if (eqIndex !== -1) {
        const name = arg.slice(2, eqIndex);
        const value = arg.slice(eqIndex + 1);
        tokens.push({ type: TokenType.Flag, value: name, raw: arg });
        tokens.push({ type: TokenType.Value, value, raw: value });
      } else {
        tokens.push({ type: TokenType.Flag, value: arg.slice(2), raw: arg });
      }
      continue;
    }

    if (arg.startsWith("-") && arg.length > 1) {
      const flags = arg.slice(1);
      for (let i = 0; i < flags.length; i++) {
        const char = flags[i];
        if (char === undefined) continue;
        tokens.push({
          type: TokenType.ShortFlag,
          value: char,
          raw: `-${char}`
        });
      }
      continue;
    }

    tokens.push({ type: TokenType.Value, value: arg, raw: arg });
  }

  tokens.push({ type: TokenType.End, value: "", raw: "" });
  return tokens;
}
