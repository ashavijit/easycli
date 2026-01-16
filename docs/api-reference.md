# API Reference

Complete API documentation for EasyCLI packages.

---

## easycli-core

### defineCLI

Creates a CLI application.

```typescript
function defineCLI(config: CLIConfig): {
  run: (argv?: string[]) => Promise<void>;
  config: CLIConfig;
  router: TrieNode;
}
```

**Parameters:**

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | CLI name |
| `version` | `string?` | Version string |
| `description` | `string?` | CLI description |
| `commands` | `CommandsSchema` | Command definitions |
| `hooks` | `CLIHooks?` | Lifecycle hooks |
| `plugins` | `PluginDef[]?` | Plugin array |

**Example:**

```typescript
const cli = defineCLI({
  name: "myapp",
  version: "1.0.0",
  commands: { ... }
});

cli.run();
```

---

### defineCommand

Type-safe command definition helper.

```typescript
function defineCommand<TArgs, TFlags>(
  def: CommandDef<TArgs, TFlags>
): CommandDef<TArgs, TFlags>
```

**Example:**

```typescript
import { defineCommand } from "easycli-core";

export default defineCommand({
  description: "Create a new project",
  args: { name: "string" },
  flags: { template: { type: "string", default: "default" } },
  run({ name, template }) {
    // ...
  }
});
```

---

### CLIContext

Context passed to command handlers.

```typescript
interface CLIContext<TConfig = Record<string, unknown>> {
  config: TConfig;
  ask: AskMethods;
  flow: <T extends unknown[]>(steps: PromiseArray<T>) => Promise<T>;
  cwd: string;
  argv: string[];
  error(message: string, options?: RichErrorOptions): Error;
  task(name: string): Task;
}
```

---

### AskMethods

Interactive prompt methods.

```typescript
interface AskMethods {
  text(message: string, defaultValue?: string): Promise<string>;
  password(message: string): Promise<string>;
  confirm(message: string): Promise<boolean>;
  select<T extends string>(message: string, options: T[]): Promise<T>;
  multiselect<T extends string>(message: string, options: T[]): Promise<T[]>;
}
```

---

### RichErrorOptions

Options for rich error creation.

```typescript
interface RichErrorOptions {
  hint?: string;
  docs?: string;
  exitCode?: number;
}
```

---

### Task

Task runner for multi-step workflows.

```typescript
interface Task {
  step<T>(name: string, fn: () => T | Promise<T>): Promise<T>;
  success(message: string): void;
  fail(message: string): void;
}
```

---

## easycli-ui

### spinner

Creates an animated spinner.

```typescript
function spinner(message: string): Spinner

interface Spinner {
  start(): void;
  success(message?: string): void;
  fail(message?: string): void;
  stop(): void;
}
```

**Example:**

```typescript
const s = spinner("Loading...");
s.start();
await doWork();
s.success("Done!");
```

---

### progress

Creates a progress bar.

```typescript
function progress(total: number, width?: number): ProgressBar

interface ProgressBar {
  update(value: number): void;
  complete(): void;
}
```

**Example:**

```typescript
const bar = progress(100);
bar.update(50);
bar.complete();
```

---

### table

Formats data as a table.

```typescript
function table(data: Record<string, unknown>[]): string
```

**Example:**

```typescript
console.log(table([
  { Name: "Alice", Role: "Admin" },
  { Name: "Bob", Role: "User" }
]));
```

---

### box

Creates a bordered box.

```typescript
function box(content: string | string[], options?: BoxOptions): string

interface BoxOptions {
  title?: string;
  titlePosition?: "left" | "center" | "right";
  borderStyle?: "single" | "double" | "rounded" | "bold" | "none";
  borderColor?: ColorName;
  padding?: number;
  margin?: number;
  width?: number;
  textAlign?: "left" | "center" | "right";
  dimBorder?: boolean;
}
```

**Example:**

```typescript
console.log(box("Hello World!", {
  title: "Greeting",
  borderStyle: "rounded",
  padding: 1
}));
```

---

### colors

Terminal color utilities.

```typescript
const colors: {
  // Styles
  reset: (text: string) => string;
  bold: (text: string) => string;
  dim: (text: string) => string;
  italic: (text: string) => string;
  underline: (text: string) => string;
  inverse: (text: string) => string;
  strikethrough: (text: string) => string;

  // Colors
  black: (text: string) => string;
  red: (text: string) => string;
  green: (text: string) => string;
  yellow: (text: string) => string;
  blue: (text: string) => string;
  magenta: (text: string) => string;
  cyan: (text: string) => string;
  white: (text: string) => string;
  gray: (text: string) => string;

  // Bright colors
  redBright: (text: string) => string;
  greenBright: (text: string) => string;
  // ... and more

  // Background colors
  bgRed: (text: string) => string;
  bgGreen: (text: string) => string;
  // ... and more
}
```

**Example:**

```typescript
console.log(colors.green("Success!"));
console.log(colors.bold(colors.red("Error!")));
```

---

### RichError

Error with hint and docs support.

```typescript
class RichError extends Error {
  readonly hint?: string;
  readonly docs?: string;
  readonly exitCode: number;

  constructor(message: string, options?: RichErrorOptions);
}
```

---

### createError

Factory function for rich errors.

```typescript
function createError(message: string, options?: RichErrorOptions): RichError
```

---

### task

Creates a task runner.

```typescript
function task(name: string): Task
```

**Example:**

```typescript
const t = task("Processing");
await t.step("Step 1", doStep1);
await t.step("Step 2", doStep2);
t.success("Complete!");
```

---

## easycli-help

### generateHelp

Generates main CLI help.

```typescript
function generateHelp(config: CLIConfig): string
```

---

### generateCommandHelp

Generates command-specific help.

```typescript
function generateCommandHelp(
  cliName: string,
  matchedPath: string[],
  command: CommandDef
): string
```

---

### generateHelpJson

Generates help as JSON.

```typescript
function generateHelpJson(config: CLIConfig): string
```

---

### generateHelpMarkdown

Generates help as Markdown.

```typescript
function generateHelpMarkdown(config: CLIConfig): string
```
