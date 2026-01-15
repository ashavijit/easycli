# Building Beautiful CLI Apps

In 2026, Command Line Interfaces (CLIs) don't have to be boring black-and-white text streams. Developers expect **polished**, **interactive**, and **informative** tools that rival the UX of web applications.

This guide covers the complete **EasyCLI** API with examples.

---

## Table of Contents

1. [Core API](#1-core-api)
2. [Colors](#2-colors-api)
3. [Spinners](#3-spinner-api)
4. [Progress Bars](#4-progress-bar-api)
5. [Tables](#5-table-api)
6. [Boxes](#6-box-api)
7. [Interactive Prompts](#7-prompts-api)
8. [Hooks & Plugins](#8-hooks--plugins)

---

## 1. Core API

### `defineCLI(config)`

The main entry point for creating a CLI application.

```typescript
import { defineCLI } from "@easycli/core";

const cli = defineCLI({
  name: "my-app",
  version: "1.0.0",
  description: "My awesome CLI",
  
  commands: {
    deploy: {
      description: "Deploy the application",
      args: {
        env: ["prod", "staging", "dev"]  // Typed enum argument
      },
      flags: {
        force: { type: "boolean", alias: "f", description: "Force deploy" },
        region: { type: "string", default: "us-east-1" },
        replicas: { type: "number", default: 3 }
      },
      run({ env, force, region, replicas }) {
        // All args and flags are fully typed!
        console.log(`Deploying to ${env} in ${region} with ${replicas} replicas`);
      }
    }
  }
});

cli.run();
```

### Argument Types

| Type | Example | Result |
|------|---------|--------|
| `"string"` | `args: { name: "string" }` | `name: string` |
| `"number"` | `args: { count: "number" }` | `count: number` |
| `string[]` | `args: { env: ["prod", "dev"] }` | `env: "prod" \| "dev"` |
| `ArgDef` | `args: { name: { type: "string", optional: true } }` | `name: string \| undefined` |

### Flag Types

```typescript
flags: {
  verbose: "boolean",                           // Shorthand
  port: { type: "number", default: 3000 },      // With default
  env: { type: "string", alias: "e" },          // With alias
  debug: { type: "boolean", required: true }    // Required
}
```

### Nested Subcommands

```typescript
const cli = defineCLI({
  name: "docker",
  commands: {
    container: {
      description: "Manage containers",
      commands: {
        ls: {
          description: "List containers",
          run() { /* ... */ }
        },
        rm: {
          description: "Remove container",
          args: { id: "string" },
          run({ id }) { /* ... */ }
        }
      }
    }
  }
});
```

---

## 2. Colors API

Zero-dependency ANSI colors with automatic TTY detection.

```typescript
import { colors } from "@easycli/ui";
```

### Styles

| Method | Description |
|--------|-------------|
| `colors.bold(text)` | Bold text |
| `colors.dim(text)` | Dimmed/faded text |
| `colors.italic(text)` | Italic text |
| `colors.underline(text)` | Underlined text |
| `colors.inverse(text)` | Inverted colors |
| `colors.strikethrough(text)` | Strikethrough text |

### Foreground Colors

| Method | Method | Method |
|--------|--------|--------|
| `colors.black()` | `colors.red()` | `colors.green()` |
| `colors.yellow()` | `colors.blue()` | `colors.magenta()` |
| `colors.cyan()` | `colors.white()` | `colors.gray()` |

### Bright Colors

| Method | Method | Method |
|--------|--------|--------|
| `colors.redBright()` | `colors.greenBright()` | `colors.yellowBright()` |
| `colors.blueBright()` | `colors.magentaBright()` | `colors.cyanBright()` |

### Background Colors

| Method | Method | Method |
|--------|--------|--------|
| `colors.bgRed()` | `colors.bgGreen()` | `colors.bgYellow()` |
| `colors.bgBlue()` | `colors.bgMagenta()` | `colors.bgCyan()` |
| `colors.bgBlack()` | `colors.bgWhite()` | |

### Chaining Colors

```typescript
// Combine styles and colors
console.log(colors.bold(colors.red("Error!")));
console.log(colors.bgYellow(colors.black(" WARNING ")));
console.log(colors.dim(colors.italic("Hint: use --help")));
```

### Best Practices

```typescript
// Semantic color usage
const success = (msg: string) => colors.green(`✔ ${msg}`);
const error = (msg: string) => colors.red(`✖ ${msg}`);
const info = (msg: string) => colors.cyan(`ℹ ${msg}`);
const warn = (msg: string) => colors.yellow(`⚠ ${msg}`);
```

---

## 3. Spinner API

Animated spinners for async operations.

```typescript
import { spinner } from "@easycli/ui";
```

### Methods

| Method | Description |
|--------|-------------|
| `spinner(message)` | Create a spinner |
| `.start()` | Start the animation |
| `.success(msg?)` | Stop with ✔ green checkmark |
| `.fail(msg?)` | Stop with ✖ red X |
| `.stop()` | Stop without message |

### Example

```typescript
const s = spinner("Deploying to production...");
s.start();

try {
  await deployApp();
  s.success("Deployed successfully!");
} catch (err) {
  s.fail("Deployment failed");
  throw err;
}
```

Output:
```
⠋ Deploying to production...
✔ Deployed successfully!
```

---

## 4. Progress Bar API

Progress bars for deterministic tasks.

```typescript
import { progress } from "@easycli/ui";
```

### Methods

| Method | Description |
|--------|-------------|
| `progress(total, width?)` | Create a progress bar (default width: 30) |
| `.update(value)` | Update current progress |
| `.complete()` | Mark as 100% complete |

### Example

```typescript
const bar = progress(100);

for (let i = 0; i <= 100; i += 10) {
  await downloadChunk();
  bar.update(i);
}

bar.complete();
```

Output:
```
████████████████████░░░░░░░░░░ 70%
████████████████████████████████ 100%
```

---

## 5. Table API

Beautiful tables with automatic column sizing.

```typescript
import { table } from "@easycli/ui";
```

### Usage

```typescript
table([
  { ID: "srv-123", Name: "api-server", Status: "Running" },
  { ID: "srv-124", Name: "worker-01", Status: "Stopped" },
  { ID: "srv-125", Name: "db-primary", Status: "Maintenance" }
]);
```

Output:
```
ID        NAME         STATUS
srv-123   api-server   Running       (green)
srv-124   worker-01    Stopped       (red)
srv-125   db-primary   Maintenance   (yellow)
```

### Automatic Status Coloring

The table automatically colors status values:
- **Green**: running, active, success, online
- **Red**: stopped, error, failed, offline
- **Yellow**: pending, maintenance, warning

---

## 6. Box API

Bordered boxes for announcements and notices.

```typescript
import { box } from "@easycli/ui";
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `borderStyle` | `"single" \| "double" \| "rounded" \| "bold"` | `"rounded"` | Border characters |
| `borderColor` | `ColorName` | - | Border color |
| `padding` | `number` | `1` | Inner padding |
| `margin` | `number` | `0` | Outer margin |
| `title` | `string` | - | Title in top border |
| `titlePosition` | `"left" \| "center" \| "right"` | `"left"` | Title position |
| `textAlign` | `"left" \| "center" \| "right"` | `"left"` | Content alignment |
| `dimBorder` | `boolean` | `false` | Dim the border |

### Examples

```typescript
// Simple announcement
console.log(box("Update available: 1.0.0 → 2.0.0", {
  borderStyle: "rounded",
  borderColor: "yellow",
  padding: 1
}));
```

Output:
```
╭─────────────────────────────────╮
│                                 │
│ Update available: 1.0.0 → 2.0.0 │
│                                 │
╰─────────────────────────────────╯
```

```typescript
// Multi-line with title
console.log(box([
  "New features:",
  "• Box component",
  "• Better prompts",
  "• Scaffolder"
], {
  title: " What's New ",
  borderStyle: "double",
  borderColor: "cyan"
}));
```

Output:
```
╔═ What's New ═════╗
║ New features:    ║
║ • Box component  ║
║ • Better prompts ║
║ • Scaffolder     ║
╚══════════════════╝
```

### Border Styles

```
single:  ┌───┐     double:  ╔═══╗
         │   │              ║   ║
         └───┘              ╚═══╝

rounded: ╭───╮     bold:    ┏━━━┓
         │   │              ┃   ┃
         ╰───╯              ┗━━━┛
```

---

## 7. Prompts API

Interactive prompts with CLI flag/config fallback.

```typescript
// Available via ctx.ask in command handlers
run(args, ctx) {
  const name = await ctx.ask.text("Project name");
}
```

### Methods

| Method | Description |
|--------|-------------|
| `ask.text(message, default?)` | Text input |
| `ask.password(message)` | Hidden input |
| `ask.confirm(message)` | Yes/No confirmation |
| `ask.select(message, options)` | Single selection |
| `ask.multiselect(message, options)` | Multiple selection |

### Text Input

```typescript
const name = await ctx.ask.text("Project name", "my-app");
// ? Project name (my-app): _
```

### Password Input

```typescript
const token = await ctx.ask.password("API Token");
// ? API Token: ****
```

### Confirmation

```typescript
const proceed = await ctx.ask.confirm("Deploy to production?");
// ? Deploy to production? (y/n): _
```

### Single Select

```typescript
const env = await ctx.ask.select("Environment", ["dev", "staging", "prod"]);
// ? Environment:
//   1. dev
//   2. staging
//   3. prod
// Select: _
```

### Multi-Select

```typescript
const features = await ctx.ask.multiselect("Features", [
  "auth", "database", "analytics", "realtime"
]);
// ? Features
// > [x] auth
//   [ ] database
//   [x] analytics
//   [ ] realtime
// (Use ↑↓, space to select, enter to continue)
```

### Wizard Flow

Chain prompts together for setup wizards:

```typescript
const [name, region, ci] = await ctx.flow([
  () => ctx.ask.text("Project name"),
  () => ctx.ask.select("Region", ["us-east", "eu-west", "ap-south"]),
  () => ctx.ask.confirm("Enable CI?")
]);
```

---

## 8. Hooks & Plugins

### Lifecycle Hooks

```typescript
const cli = defineCLI({
  name: "my-cli",
  commands: { /* ... */ },
  
  hooks: {
    onInit() {
      console.log("CLI initialized");
    },
    onBeforeCommand({ command, args, flags }) {
      console.log(`Running: ${command}`);
    },
    onAfterCommand({ command }) {
      console.log(`Completed: ${command}`);
    },
    onError(error, ctx) {
      console.error(`Error in ${ctx.command}:`, error.message);
    },
    onExit(code) {
      console.log(`Exiting with code ${code}`);
    }
  }
});
```

### Plugins

Create reusable hook bundles:

```typescript
import { definePlugin } from "@easycli/plugins";

const analyticsPlugin = definePlugin({
  name: "analytics",
  hooks: {
    onBeforeCommand({ command }) {
      trackEvent("command_start", { command });
    },
    onAfterCommand({ command }) {
      trackEvent("command_complete", { command });
    }
  }
});

const cli = defineCLI({
  plugins: [analyticsPlugin],
  // ...
});
```

---

## Putting It All Together

```typescript
import { defineCLI } from "@easycli/core";
import { colors, spinner, box, table, progress } from "@easycli/ui";

const cli = defineCLI({
  name: "deploy-cli",
  version: "1.0.0",

  commands: {
    deploy: {
      description: "Deploy application",
      args: { env: ["prod", "staging", "dev"] },
      
      async run({ env }, ctx) {
        // 1. Welcome
        console.log(box(`Deploying to ${colors.bold(env)}`, {
          borderStyle: "rounded",
          borderColor: "cyan"
        }));

        // 2. Confirm
        const proceed = await ctx.ask.confirm("Proceed with deployment?");
        if (!proceed) return;

        // 3. Long operation
        const s = spinner("Building...");
        s.start();
        await build();
        s.success("Build complete");

        // 4. Progress
        const bar = progress(100);
        for (let i = 0; i <= 100; i += 20) {
          await uploadChunk();
          bar.update(i);
        }
        bar.complete();

        // 5. Summary
        table([
          { Service: "api", Status: "Running", Replicas: 3 },
          { Service: "worker", Status: "Running", Replicas: 2 }
        ]);

        console.log(colors.green("\n✔ Deployment complete!"));
      }
    }
  }
});

cli.run();
```

---

Check out the [packages/ui source code](../packages/ui) to see how these components are built!
