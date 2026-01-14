import type { Token } from "./lexer.js";
import { TokenType } from "./lexer.js";
import type { FlagDef } from "../types.js";

export interface GrammarNode {
  commands: string[];
  flags: Map<string, string | boolean | number>;
  args: string[];
}

export function parseGrammar(
  tokens: Token[],
  flagDefs: Record<string, FlagDef>,
  shortToLong: Map<string, string>
): GrammarNode {
  const result: GrammarNode = {
    commands: [],
    flags: new Map(),
    args: []
  };

  let commandPhase = true;
  let expectValue: string | null = null;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token || token.type === TokenType.End) break;

    if (token.type === TokenType.DoubleDash) {
      commandPhase = false;
      continue;
    }

    if (expectValue !== null) {
      const def = flagDefs[expectValue];
      if (def) {
        result.flags.set(expectValue, coerceValue(token.value, def.type));
      }
      expectValue = null;
      continue;
    }

    if (token.type === TokenType.Flag) {
      const def = flagDefs[token.value];
      if (def?.type === "boolean") {
        result.flags.set(token.value, true);
      } else if (def) {
        expectValue = token.value;
      } else {
        result.flags.set(token.value, true);
      }
      commandPhase = false;
      continue;
    }

    if (token.type === TokenType.ShortFlag) {
      const longName = shortToLong.get(token.value);
      const flagName = longName ?? token.value;
      const def = flagDefs[flagName];
      if (def?.type === "boolean") {
        result.flags.set(flagName, true);
      } else if (def) {
        expectValue = flagName;
      } else {
        result.flags.set(flagName, true);
      }
      commandPhase = false;
      continue;
    }

    if (token.type === TokenType.Value) {
      if (commandPhase) {
        result.commands.push(token.value);
      } else {
        result.args.push(token.value);
      }
    }
  }

  return result;
}

function coerceValue(
  value: string,
  type: "string" | "boolean" | "number"
): string | boolean | number {
  switch (type) {
    case "boolean":
      return value === "true" || value === "1";
    case "number":
      return Number(value);
    default:
      return value;
  }
}
