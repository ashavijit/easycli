export type FlagType = "string" | "boolean" | "number";

export interface FlagDef {
  type: FlagType;
  default?: string | boolean | number | string[] | number[];
  alias?: string;
  description?: string;
  required?: boolean;
  /** When true, multiple flag occurrences collect into an array. */
  array?: boolean;
}

export type FlagValue = string | boolean | number | string[] | number[] | undefined;

export type FlagsSchema = Record<string, FlagDef | FlagType>;

export interface ArgDef {
  type: "string" | "number";
  optional?: boolean;
  description?: string;
}

export type ArgsSchema = Record<string, string[] | "string" | "number" | ArgDef>;

export interface AskMethods {
  text(message: string, defaultValue?: string): Promise<string>;
  password(message: string): Promise<string>;
  confirm(message: string): Promise<boolean>;
  select<T extends string>(message: string, options: T[]): Promise<T>;
  multiselect<T extends string>(message: string, options: T[]): Promise<T[]>;
}

/** Options for rich error creation. */
export interface RichErrorOptions {
  hint?: string;
  docs?: string;
  exitCode?: number;
}

/** Task runner for multi-step workflows. */
export interface Task {
  step<T>(name: string, fn: () => T | Promise<T>): Promise<T>;
  success(message: string): void;
  fail(message: string): void;
}

export interface CLIContext<TConfig = Record<string, unknown>> {
  config: TConfig;
  ask: AskMethods;
  flow: <T extends unknown[]>(steps: { [K in keyof T]: () => Promise<T[K]> }) => Promise<T>;
  cwd: string;
  argv: string[];
  /** Creates a rich error with hint and docs support. */
  error(message: string, options?: RichErrorOptions): Error;
  /** Creates a task runner for multi-step workflows. */
  task(name: string): Task;
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
  : T extends { type: "string"; optional: true }
  ? string | undefined
  : T extends { type: "string" }
  ? string
  : T extends { type: "number"; optional: true }
  ? number | undefined
  : T extends { type: "number" }
  ? number
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
