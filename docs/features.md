# Feature Overview

A complete toolkit for building production-ready CLI applications.

---

## Core Features

### Command Routing

Define commands as simple objects with automatic routing:

```typescript
commands: {
  deploy: { ... },
  db: {
    commands: {
      migrate: { ... },
      seed: { ... }
    }
  }
}
```

Commands are invoked naturally:
```bash
myapp deploy
myapp db migrate
myapp db seed
```

### Argument Parsing

Automatic parsing with validation:

```typescript
args: {
  name: "string",                    // Required string
  port: "number",                    // Required number
  env: ["dev", "staging", "prod"],   // Enum (validates)
  file: { type: "string", optional: true }  // Optional
}
```

### Flag Handling

Full-featured flag support:

```typescript
flags: {
  verbose: { type: "boolean", alias: "v" },
  port: { type: "number", default: 3000 },
  config: { type: "string", description: "Config file path" }
}
```

Usage:
```bash
myapp start --verbose --port 8080
myapp start -v -p 8080
```

### Automatic Help

Beautiful, colorized help generated from your schema:

```
myapp v1.0.0
A modern CLI toolkit

USAGE
  myapp <command> [options]

COMMANDS
  deploy    Deploy to production
  db        Database commands

OPTIONS
  -h, --help     Show help
  -v, --version  Show version
```

---

## Interactive Features

### Prompts

Built-in interactive prompts:

| Method | Description |
|--------|-------------|
| `ctx.ask.text(message)` | Text input |
| `ctx.ask.password(message)` | Hidden input |
| `ctx.ask.confirm(message)` | Yes/No |
| `ctx.ask.select(message, options)` | Single choice |
| `ctx.ask.multiselect(message, options)` | Multiple choice |

### Flow Control

Sequential prompt execution:

```typescript
const [name, email, plan] = await ctx.flow([
  () => ctx.ask.text("Name:"),
  () => ctx.ask.text("Email:"),
  () => ctx.ask.select("Plan:", ["free", "pro", "enterprise"])
]);
```

---

## UI Components

### Spinner

Animated loading indicator:

```typescript
import { spinner } from "easycli-ui";

const s = spinner("Processing...");
s.start();
await process();
s.success("Complete!");
```

### Progress Bar

Visual progress tracking:

```typescript
import { progress } from "easycli-ui";

const bar = progress(100);
for (let i = 0; i <= 100; i += 10) {
  bar.update(i);
  await delay(100);
}
bar.complete();
```

### Table

Formatted data display:

```typescript
import { table } from "easycli-ui";

console.log(table([
  { Name: "Alice", Email: "alice@example.com", Role: "Admin" },
  { Name: "Bob", Email: "bob@example.com", Role: "User" }
]));
```

### Box

Bordered content container:

```typescript
import { box } from "easycli-ui";

console.log(box("Welcome to MyApp!", {
  title: "Notice",
  borderStyle: "rounded",
  borderColor: "cyan",
  padding: 1
}));
```

### Colors

Terminal color utilities:

```typescript
import { colors } from "easycli-ui";

console.log(colors.red("Error"));
console.log(colors.green("Success"));
console.log(colors.bold(colors.cyan("Title")));
console.log(colors.dim("Hint: use --help"));
```

---

## Error Handling

### Rich Errors

Actionable error messages:

```typescript
throw ctx.error("Configuration not found", {
  hint: "Run: myapp init",
  docs: "https://docs.myapp.dev/setup"
});
```

### Automatic Validation

Validation errors with suggestions:

```
Error: Validation failed:
  - Argument <env> must be one of: staging, production
```

---

## Task Runner

### Multi-Step Workflows

Track progress through sequential steps:

```typescript
const t = ctx.task("Deploying to production");

await t.step("Building", async () => {
  await build();
});

await t.step("Uploading", async () => {
  await upload();
});

await t.step("Verifying", async () => {
  await verify();
});

t.success("Deployment complete!");
```

### Return Values

Steps can return values:

```typescript
const buildResult = await t.step("Building", async () => {
  return await build();  // Returns { size: "2MB", files: 100 }
});

console.log(`Built ${buildResult.files} files (${buildResult.size})`);
```

---

## Configuration

### Config Files

Automatic config loading from:

1. `~/.easyclirc.json` (global)
2. `.easyclirc.json` (project)
3. `easycli.config.json` (project)
4. Environment variables (`EASYCLI_*`)

### Accessing Config

```typescript
run(args, ctx) {
  const apiKey = ctx.config.apiKey;
  const debug = ctx.config.debug;
}
```

---

## Lifecycle Hooks

### Available Hooks

```typescript
defineCLI({
  hooks: {
    onInit: () => { /* Before parsing */ },
    onBeforeCommand: (ctx) => { /* Before command runs */ },
    onAfterCommand: (ctx) => { /* After command completes */ },
    onError: (error, ctx) => { /* On error */ },
    onExit: (code) => { /* Before exit */ }
  }
});
```

---

## Plugin System

### Creating Plugins

```typescript
const loggingPlugin = {
  name: "logging",
  hooks: {
    onBeforeCommand(ctx) {
      console.log(`Running: ${ctx.command}`);
    },
    onError(error) {
      console.error(`Failed: ${error.message}`);
    }
  }
};
```

### Using Plugins

```typescript
defineCLI({
  plugins: [loggingPlugin, analyticsPlugin]
});
```

---

## TypeScript Integration

### Full Type Inference

Arguments and flags are fully typed:

```typescript
commands: {
  create: {
    args: { name: "string" },
    flags: { force: { type: "boolean" } },
    run({ name, force }) {
      // name: string
      // force: boolean
    }
  }
}
```

### Exported Types

```typescript
import type { CLIConfig, CommandDef, CLIContext } from "easycli-core";
```
