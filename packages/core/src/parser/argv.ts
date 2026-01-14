import { tokenize } from "./lexer.js";
import { parseGrammar, type GrammarNode } from "./grammar.js";
import type { FlagDef } from "../types.js";

export interface ParseOptions {
  flagDefs: Record<string, FlagDef>;
  shortToLong: Map<string, string>;
}

export function parseArgv(argv: string[], options: ParseOptions): GrammarNode {
  const tokens = tokenize(argv);
  return parseGrammar(tokens, options.flagDefs, options.shortToLong);
}

export { tokenize } from "./lexer.js";
export { parseGrammar } from "./grammar.js";
