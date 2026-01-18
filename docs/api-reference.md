# API Reference

Complete API documentation for all EasyCLI packages.

---

## easycli-core

### defineCLI

Creates a CLI application.

```typescript
import { defineCLI } from "easycli-core";

const cli = defineCLI({
  name: "my-app",
  version: "1.0.0",
  description: "My CLI application",
  commands: { ... },
  hooks: { ... },
  plugins: [ ... ]
});

cli.run();
```

**CLIConfig Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | CLI executable name |
| `version` | `string` | No | Version string (shown with `--version`) |
| `description` | `string` | No | CLI description (shown in help) |
| `commands` | `CommandsSchema` | Yes | Command definitions |
| `hooks` | `CLIHooks` | No | Lifecycle hooks |
| `plugins` | `PluginDef[]` | No | Plugin array |

---

### defineCommand

Type-safe command definition helper.

```typescript
import { defineCommand } from "easycli-core";

export default defineCommand({
  description: "Create a new project",
  args: { name: "string" },
  flags: { 
    template: { type: "string", default: "default" } 
  },
  run({ name, template }) {
    console.log(`Creating ${name} with template ${template}`);
  }
});
```

---

### CommandDef

Command definition structure.

| Property | Type | Description |
|----------|------|-------------|
| `description` | `string` | Command description for help |
| `alias` | `string \| string[]` | Command aliases |
| `args` | `ArgsSchema` | Positional arguments |
| `flags` | `FlagsSchema` | Flag definitions |
| `commands` | `CommandsSchema` | Nested subcommands |
| `run` | `CommandHandler` | Handler function |

---

### ArgsSchema

Argument type definitions.

```typescript
args: {
  name: "string",                              // Required string
  count: "number",                             // Required number
  env: ["dev", "staging", "prod"],             // Enum (typed union)
  file: { type: "string", optional: true },    // Optional string
  port: { type: "number", optional: true }     // Optional number
}
```

**ArgDef Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `type` | `"string" \| "number"` | Argument type |
| `optional` | `boolean` | Allow missing argument |
| `description` | `string` | Help text |

---

### FlagsSchema

Flag type definitions.

```typescript
flags: {
  verbose: "boolean",                           // Shorthand
  port: { type: "number", default: 3000 },      // With default
  env: { type: "string", alias: "e" },          // With alias
  file: { type: "string", array: true },        // Collect multiple
  debug: { type: "boolean", required: true }    // Required flag
}
```

**FlagDef Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `type` | `"string" \| "boolean" \| "number"` | Flag type |
| `alias` | `string` | Short flag (e.g., `-v`) |
| `default` | `any` | Default value |
| `required` | `boolean` | Fail if not provided |
| `array` | `boolean` | Collect multiple values |
| `description` | `string` | Help text |

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

| Method | Signature | Description |
|--------|-----------|-------------|
| `text` | `(message: string, default?: string) => Promise<string>` | Text input |
| `password` | `(message: string) => Promise<string>` | Hidden input |
| `confirm` | `(message: string) => Promise<boolean>` | Yes/no confirmation |
| `select` | `<T>(message: string, options: T[]) => Promise<T>` | Single selection |
| `multiselect` | `<T>(message: string, options: T[]) => Promise<T[]>` | Multi selection |

**Example:**
```typescript
async run(_, ctx) {
  const name = await ctx.ask.text("Project name");
  const template = await ctx.ask.select("Template", ["basic", "advanced"]);
  const features = await ctx.ask.multiselect("Features", ["eslint", "prettier", "tests"]);
  const proceed = await ctx.ask.confirm("Create project?");
}
```

---

### Signal Handling

Graceful shutdown on SIGINT/SIGTERM.

```typescript
import { installSignalHandlers, onCleanup, resetTerminal } from "easycli-core";

onCleanup(async () => {
  await database.disconnect();
});

installSignalHandlers();
```

| Function | Description |
|----------|-------------|
| `installSignalHandlers()` | Install SIGINT/SIGTERM handlers |
| `onCleanup(fn)` | Register cleanup function |
| `resetTerminal()` | Reset terminal state (cursor, raw mode) |

---

### CLIHooks

Lifecycle hooks.

```typescript
hooks: {
  onInit() { },
  onBeforeCommand({ command, args, flags }) { },
  onAfterCommand({ command }) { },
  onError(error, ctx) { },
  onExit(code) { }
}
```

---

## easycli-ui

### colors

Terminal color utilities.

**Styles:**
```typescript
colors.bold("text")
colors.dim("text")
colors.italic("text")
colors.underline("text")
colors.inverse("text")
colors.strikethrough("text")
```

**Colors:**
```typescript
colors.black("text")
colors.red("text")
colors.green("text")
colors.yellow("text")
colors.blue("text")
colors.magenta("text")
colors.cyan("text")
colors.white("text")
colors.gray("text")
```

**Bright Colors:**
```typescript
colors.redBright("text")
colors.greenBright("text")
colors.yellowBright("text")
colors.blueBright("text")
colors.magentaBright("text")
colors.cyanBright("text")
colors.whiteBright("text")
```

**Background:**
```typescript
colors.bgRed("text")
colors.bgGreen("text")
colors.bgYellow("text")
colors.bgBlue("text")
colors.bgMagenta("text")
colors.bgCyan("text")
colors.bgWhite("text")
```

**Chaining:**
```typescript
colors.bold(colors.red("Error!"))
colors.bgRed(colors.white(colors.bold("CRITICAL")))
```

---

### spinner

Animated loading spinner.

```typescript
import { spinner } from "easycli-ui";

const s = spinner("Loading...");
s.start();
await doWork();
s.success("Done!");
```

| Method | Description |
|--------|-------------|
| `start()` | Start animation |
| `success(msg?)` | Stop with success |
| `fail(msg?)` | Stop with failure |
| `stop()` | Stop without status |

---

### progress

Progress bar.

```typescript
import { progress } from "easycli-ui";

const bar = progress(100);
bar.update(50);
bar.complete();
```

| Method | Description |
|--------|-------------|
| `update(value)` | Update progress |
| `complete()` | Mark complete |

Output:
```
████████████████████░░░░░░░░░░░░░░░░░░░░ 50%
```

---

### table

Formatted table output.

```typescript
import { table } from "easycli-ui";

table([
  { Name: "Alice", Role: "Admin", Status: "Active" },
  { Name: "Bob", Role: "User", Status: "Inactive" }
]);
```

Output:
```
┌───────┬───────┬──────────┐
│ Name  │ Role  │ Status   │
├───────┼───────┼──────────┤
│ Alice │ Admin │ Active   │
│ Bob   │ User  │ Inactive │
└───────┴───────┴──────────┘
```

---

### box

Bordered box.

```typescript
import { box } from "easycli-ui";

console.log(box("Hello World!", {
  title: "Greeting",
  borderStyle: "rounded",
  borderColor: "cyan",
  padding: 1
}));
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | - | Box title |
| `titlePosition` | `"left" \| "center" \| "right"` | `"left"` | Title position |
| `borderStyle` | `"single" \| "double" \| "rounded" \| "bold" \| "none"` | `"single"` | Border style |
| `borderColor` | `ColorName` | - | Border color |
| `padding` | `number` | `0` | Inner padding |
| `margin` | `number` | `0` | Outer margin |
| `width` | `number` | auto | Fixed width |
| `textAlign` | `"left" \| "center" \| "right"` | `"left"` | Text alignment |
| `dimBorder` | `boolean` | `false` | Dim the border |

---

### RichError

Error with hints and documentation links.

```typescript
import { createError, RichError } from "easycli-ui";

throw createError("Config file not found", {
  hint: "Run 'my-cli init' to create a config file",
  exitCode: 1
});
```

---

### task

Multi-step task runner.

```typescript
import { task } from "easycli-ui";

const t = task("Deployment");
await t.step("Building", build);
await t.step("Testing", test);
await t.step("Uploading", upload);
t.success("Complete!");
```

---

## easycli-prompts

### sanitize

Input sanitization utilities.

```typescript
import { sanitize, sanitizeWithLimit, isValidPath } from "easycli-prompts";

const clean = sanitize(userInput);
const limited = sanitizeWithLimit(userInput, 100);
const safe = isValidPath(pathInput);
```

| Function | Description |
|----------|-------------|
| `sanitize(input)` | Remove control chars and ANSI codes |
| `sanitizeWithLimit(input, max)` | Sanitize with length limit |
| `validatePattern(input, regex)` | Validate against pattern |
| `isValidPath(input)` | Check for path traversal |

---

## easycli-help

### generateHelp

Generate main help text.

```typescript
import { generateHelp } from "easycli-help";

const help = generateHelp(config);
console.log(help);
```

### generateCommandHelp

Generate command-specific help.

```typescript
import { generateCommandHelp } from "easycli-help";

const help = generateCommandHelp("my-cli", ["deploy"], command);
```

### generateHelpJson

Generate help as JSON.

```typescript
import { generateHelpJson } from "easycli-help";

const json = generateHelpJson(config);
```

### generateHelpMarkdown

Generate help as Markdown.

```typescript
import { generateHelpMarkdown } from "easycli-help";

const md = generateHelpMarkdown(config);
```
