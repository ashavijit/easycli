export type FlagType = "string" | "boolean" | "number";

export interface FlagDef {
  type: FlagType;
  default?: string | boolean | number;
  alias?: string;
  description?: string;
  required?: boolean;
}

export type FlagValue = string | boolean | number | undefined;

export type FlagsSchema = Record<string, FlagDef | FlagType>;

export type ArgsSchema = Record<string, string[] | "string" | "number">;

export interface AskMethods {
  text(message: string): Promise<string>;
  password(message: string): Promise<string>;
  confirm(message: string): Promise<boolean>;
  select<T extends string>(message: string, options: T[]): Promise<T>;
  multiselect<T extends string>(message: string, options: T[]): Promise<T[]>;
}

export interface CLIContext<TConfig = Record<string, unknown>> {
  config: TConfig;
  ask: AskMethods;
  flow: <T extends unknown[]>(steps: { [K in keyof T]: () => Promise<T[K]> }) => Promise<T>;
  cwd: string;
  argv: string[];
}

export type CommandHandler<
  TArgs = Record<string, unknown>,
  TFlags = Record<string, FlagValue>,
  TConfig = Record<string, unknown>
> = (args: TArgs & TFlags, ctx: CLIContext<TConfig>) => Promise<void> | void;

export interface CommandDef<
  TArgs extends ArgsSchema = ArgsSchema,
  TFlags extends FlagsSchema = FlagsSchema
> {
  args?: TArgs;
  flags?: TFlags;
  description?: string;
  alias?: string | string[];
  commands?: CommandsSchema;
  run?: CommandHandler<
    InferArgs<TArgs>,
    InferFlags<TFlags>
  >;
}

export type CommandsSchema = Record<string, CommandDef>;

export interface HookContext {
  command: string;
  args: Record<string, unknown>;
  flags: Record<string, FlagValue>;
}

export interface CLIHooks {
  onInit?: () => Promise<void> | void;
  onBeforeCommand?: (ctx: HookContext) => Promise<void> | void;
  onAfterCommand?: (ctx: HookContext) => Promise<void> | void;
  onError?: (error: Error, ctx: HookContext) => Promise<void> | void;
  onExit?: (code: number) => Promise<void> | void;
}

export interface PluginDef {
  name: string;
  hooks?: CLIHooks;
}

export interface CLIConfig {
  name: string;
  version?: string;
  description?: string;
  commands: CommandsSchema;
  hooks?: CLIHooks;
  plugins?: PluginDef[];
}

export type InferFlagType<T> = T extends { type: "string" }
  ? string
  : T extends { type: "boolean" }
  ? boolean
  : T extends { type: "number" }
  ? number
  : T extends "string"
  ? string
  : T extends "boolean"
  ? boolean
  : T extends "number"
  ? number
  : unknown;

export type InferFlags<T extends FlagsSchema> = {
  [K in keyof T]: InferFlagType<T[K]>;
};

export type InferArgType<T> = T extends readonly string[]
  ? T[number]
  : T extends "string"
  ? string
  : T extends "number"
  ? number
  : unknown;

export type InferArgs<T extends ArgsSchema> = {
  [K in keyof T]: InferArgType<T[K]>;
};

export interface ParsedCommand {
  path: string[];
  args: Record<string, unknown>;
  flags: Record<string, FlagValue>;
}

export interface TrieNode {
  children: Map<string, TrieNode>;
  command?: CommandDef;
  aliases: Map<string, string>;
}

export interface ValidationErrorInfo {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationErrorInfo[];
}
