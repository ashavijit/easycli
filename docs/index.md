---
layout: default
title: EasyCLI - Build Beautiful CLIs with TypeScript
---

# EasyCLI

**The modern CLI framework for TypeScript**

A complete replacement for Commander.js + Inquirer with better DX.

[![npm](https://img.shields.io/npm/v/easycli-core)](https://www.npmjs.com/package/easycli-core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## Quick Start

```bash
npx create-easycli my-cli
cd my-cli
pnpm dev hello World
```

---

## Why EasyCLI?

| Feature | Commander.js | Inquirer | EasyCLI |
|---------|--------------|----------|---------|
| Type inference | Manual | Manual | Automatic |
| UI components | None | Prompts only | 15+ components |
| Error handling | Basic | None | Rich errors with hints |
| Signal handling | Manual | Partial | Built-in |
| Scaffolding | None | None | `npx create-easycli` |

---

## Features

- **Type-Safe Commands** - Full TypeScript inference from schema to handler
- **Rich UI Components** - Spinners, progress bars, tables, boxes, colors
- **Interactive Prompts** - Text, password, confirm, select, multiselect
- **Signal Handling** - Graceful SIGINT/SIGTERM with cleanup hooks
- **Input Sanitization** - Built-in protection against injection attacks
- **Array Flags** - Collect `--flag a --flag b` into arrays
- **Optional Arguments** - `args: { name: { type: "string", optional: true } }`
- **Nested Subcommands** - `my-cli db migrate`, `my-cli db seed`
- **Rich Errors** - Actionable errors with hints and exit codes
- **Auto Help** - Colorized help generated from schema

---

## Example

```typescript
import { defineCLI } from "@easycli/core";
import { colors, spinner, box } from "@easycli/ui";

const cli = defineCLI({
  name: "deploy",
  version: "1.0.0",
  commands: {
    up: {
      description: "Deploy to environment",
      args: { env: ["staging", "production"] },
      flags: {
        force: { type: "boolean", alias: "f" },
        replicas: { type: "number", default: 3 }
      },
      async run({ env, force, replicas }, ctx) {
        if (!force) {
          const proceed = await ctx.ask.confirm(`Deploy to ${env}?`);
          if (!proceed) return;
        }

        const s = spinner(`Deploying to ${env}...`);
        s.start();
        await deploy(env, replicas);
        s.success("Deployed!");

        console.log(box([
          `Environment: ${colors.cyan(env)}`,
          `Replicas: ${replicas}`
        ], { borderStyle: "rounded" }));
      }
    }
  }
});

cli.run();
```

---

## Packages

| Package | Description |
|---------|-------------|
| `@easycli/core` | CLI definition, parsing, routing |
| `@easycli/ui` | Colors, spinners, progress, tables, boxes |
| `@easycli/prompts` | Interactive prompts, sanitization |
| `@easycli/help` | Help text generation |
| `@easycli/config` | Config file loading |
| `@easycli/plugins` | Plugin system |
| `create-easycli` | Project scaffolder |

---

## Documentation

- [Getting Started](getting-started) - Setup in 5 minutes
- [API Reference](api-reference) - Full API docs
- [Building Beautiful CLIs](building-beautiful-clis) - Complete guide
- [Why EasyCLI?](why-easycli) - Framework comparisons

---

## Example Output

```
$ my-cli deploy up production --replicas 5

╭──────────────────────────╮
│ Deploying to production  │
╰──────────────────────────╯

? Deploy to production? (y/n) y

⠋ Deploying to production...
✔ Deployed!

╭─────────────────────────╮
│ Environment: production │
│ Replicas: 5             │
╰─────────────────────────╯
```

---

## License

MIT License - see [LICENSE](https://github.com/ashavijit/easycli/blob/main/LICENSE)

[GitHub](https://github.com/ashavijit/easycli) | [npm](https://www.npmjs.com/package/easycli-core)
