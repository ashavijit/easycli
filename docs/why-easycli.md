# Why EasyCLI?

Build production-ready CLIs in minutes, not hours.

---

## The Problem

Building a CLI tool in Node.js typically means:

- **Parsing hell**: Manual argv parsing or complex commander.js setup
- **No type safety**: Runtime errors from wrong argument types
- **Poor UX**: Basic help text, no colors, no spinners
- **Scattered code**: Logic spread across multiple files
- **No standards**: Every project reinvents the wheel

---

## The Solution

EasyCLI provides a complete, type-safe toolkit for building beautiful command-line applications.

```typescript
import { defineCLI } from "easycli-core";

const cli = defineCLI({
  name: "myapp",
  version: "1.0.0",
  commands: {
    deploy: {
      description: "Deploy to production",
      args: { env: ["staging", "production"] },
      async run({ env }, ctx) {
        const t = ctx.task("Deploying");
        await t.step("Build", build);
        await t.step("Upload", upload);
        t.success("Done!");
      }
    }
  }
});

cli.run();
```

---

## Comparison

### vs Commander.js

| Feature | Commander.js | EasyCLI |
|---------|-------------|---------|
| Type Safety | Manual | Built-in |
| Argument Validation | Manual | Automatic |
| Subcommands | Verbose setup | Nested objects |
| Interactive Prompts | Separate package | Integrated |
| Spinners/Progress | Separate package | Integrated |
| Rich Errors | Manual | Built-in |
| Task Runners | Not available | Built-in |
| Colors | Separate package | Integrated |

**Commander.js**
```javascript
const { program } = require('commander');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');

program
  .command('deploy <env>')
  .description('Deploy to production')
  .action(async (env) => {
    const { confirm } = await inquirer.prompt([
      { type: 'confirm', name: 'confirm', message: 'Continue?' }
    ]);
    if (!confirm) return;
    
    const spinner = ora('Building...').start();
    await build();
    spinner.succeed('Built!');
  });

program.parse();
```

**EasyCLI**
```typescript
const cli = defineCLI({
  name: "myapp",
  commands: {
    deploy: {
      args: { env: ["staging", "production"] },
      async run({ env }, ctx) {
        const confirmed = await ctx.ask.confirm("Continue?");
        if (!confirmed) return;
        
        const t = ctx.task("Deploying");
        await t.step("Building", build);
        t.success("Built!");
      }
    }
  }
});
```

---

### vs Yargs

| Feature | Yargs | EasyCLI |
|---------|-------|---------|
| TypeScript Support | Partial | Full |
| Learning Curve | Steep | Minimal |
| Bundle Size | ~150KB | ~40KB |
| UI Components | None | Spinner, Progress, Table, Box |
| Prompts | Separate | Integrated |
| Configuration | Complex | Simple Objects |

---

### vs Oclif

| Feature | Oclif | EasyCLI |
|---------|-------|---------|
| Setup Time | Hours | Minutes |
| Boilerplate | Heavy | Minimal |
| Class-based | Required | Optional |
| Plugin System | Complex | Simple |
| Learning Curve | Steep | Gentle |

---

## Key Features

### Type-Safe by Design

Full TypeScript inference from schema to handler:

```typescript
commands: {
  create: {
    args: { name: "string" },
    flags: { 
      template: { type: "string", default: "default" },
      force: { type: "boolean", alias: "f" }
    },
    run({ name, template, force }) {
      // name: string, template: string, force: boolean
      // All inferred automatically!
    }
  }
}
```

### Rich Error System

Beautiful, actionable error messages:

```typescript
throw ctx.error("Invalid token", {
  hint: "Run: myapp auth login",
  docs: "https://docs.myapp.dev/auth"
});
```

Output:
```
X Invalid token
Hint: Run: myapp auth login
Docs: https://docs.myapp.dev/auth
```

### Task Runner API

Progress tracking for multi-step workflows:

```typescript
const t = ctx.task("Deploying");
await t.step("Build", build);
await t.step("Upload", upload);
await t.step("Verify", verify);
t.success("Deployment complete!");
```

Output:
```
Deploying
  > Build
  > Upload
  > Verify
> Deployment complete!
```

### Interactive Prompts

Built-in prompts with zero config:

```typescript
const name = await ctx.ask.text("Project name:", "my-app");
const port = await ctx.ask.select("Port:", ["3000", "8080"]);
const features = await ctx.ask.multiselect("Features:", ["auth", "api", "db"]);
const confirmed = await ctx.ask.confirm("Continue?");
```

### UI Components

Everything you need, included:

```typescript
import { spinner, progress, table, box, colors } from "easycli-ui";

// Spinner
const s = spinner("Loading...");
s.start();
await load();
s.success("Done!");

// Progress bar
const bar = progress(100);
bar.update(50);
bar.complete();

// Table
console.log(table([
  { Name: "Alice", Role: "Admin" },
  { Name: "Bob", Role: "User" }
]));

// Box
console.log(box("Important message", {
  title: "Notice",
  borderStyle: "rounded"
}));

// Colors
console.log(colors.green("Success!"));
console.log(colors.bold(colors.cyan("Title")));
```

---

## Quick Start

```bash
npm install easycli-core easycli-ui
```

```typescript
import { defineCLI } from "easycli-core";

const cli = defineCLI({
  name: "hello",
  version: "1.0.0",
  commands: {
    greet: {
      description: "Say hello",
      args: { name: "string" },
      run({ name }) {
        console.log(`Hello, ${name}!`);
      }
    }
  }
});

cli.run();
```

---

## Who Uses EasyCLI?

Perfect for:

- **Developer Tools**: Build CLI companions for your libraries
- **DevOps Scripts**: Create deployment and automation tools
- **Internal Tools**: Build team utilities quickly
- **Open Source**: Ship beautiful CLIs for your projects

---

## Get Started

```bash
npx create-easycli my-cli
cd my-cli
npm run dev
```

[View Documentation](./building-beautiful-clis.md) | [GitHub](https://github.com/easycli/easycli)
