# EasyCLI

<div align="center">

**The modern framework for building type-safe, beautiful CLI applications.**

*A complete replacement for Commander.js + Inquirer with better DX.*

[![npm version](https://img.shields.io/npm/v/easycli-core?style=flat-square&color=blue)](https://www.npmjs.com/package/easycli-core)
[![npm downloads](https://img.shields.io/npm/dm/easycli-core?style=flat-square&color=green)](https://www.npmjs.com/package/easycli-core)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/easycli-core?style=flat-square&color=orange)](https://bundlephobia.com/package/easycli-core)
[![Build Status](https://img.shields.io/github/actions/workflow/status/ashavijit/easycli/ci.yml?branch=main&style=flat-square)](https://github.com/ashavijit/easycli/actions)
[![License](https://img.shields.io/npm/l/easycli-core?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](./CONTRIBUTING.md)

[Features](#features) | [Quick Start](#quick-start) | [Documentation](#documentation) | [Tutorial](./docs/tutorial.md)

</div>

---

## Quick Start

```bash
npx create-easycli my-app
cd my-app
pnpm dev hello World
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Type Safety** | Full TypeScript inference from schema to handler |
| **UI Components** | Colors, spinners, progress bars, tables, boxes |
| **Prompts** | Text, password, confirm, select, multiselect |
| **Signal Handling** | Graceful SIGINT/SIGTERM with cleanup hooks |
| **Input Sanitization** | Built-in injection attack protection |
| **Array Flags** | `--file a.ts --file b.ts` collects into arrays |
| **Optional Args** | `{ type: "string", optional: true }` |
| **Subcommands** | `cli db migrate`, `cli db seed` |
| **Rich Errors** | Errors with hints and exit codes |

---

## Example

```typescript
import { defineCLI } from "easycli-core";
import { colors, spinner, box } from "easycli-ui";

const cli = defineCLI({
  name: "deploy-cli",
  version: "1.0.0",
  commands: {
    up: {
      description: "Deploy to environment",
      args: { env: ["staging", "production"] },
      flags: {
        force: { type: "boolean", alias: "f" },
        file: { type: "string", array: true, alias: "F" }
      },
      async run({ env, force, file }, ctx) {
        if (!force) {
          const proceed = await ctx.ask.confirm(`Deploy to ${env}?`);
          if (!proceed) return;
        }

        const s = spinner(`Deploying ${file?.length || 0} files to ${env}...`);
        s.start();
        await deploy(env);
        s.success("Deployed!");

        console.log(box(`Environment: ${colors.cyan(env)}`, {
          borderStyle: "rounded",
          borderColor: "green"
        }));
      }
    }
  }
});

cli.run();
```

Usage:
```bash
deploy-cli up production --force --file api.ts --file worker.ts
```

---

## Packages

| Package | Description | Install |
|---------|-------------|---------|
| `easycli-core` | CLI definition, parsing, routing | `pnpm add easycli-core` |
| `easycli-ui` | Colors, spinners, progress, tables, boxes | `pnpm add easycli-ui` |
| `easycli-prompts` | Interactive prompts, sanitization | `pnpm add easycli-prompts` |
| `easycli-help` | Help text generation | `pnpm add easycli-help` |
| `easycli-config` | Config file loading | `pnpm add easycli-config` |
| `easycli-plugins` | Plugin system | `pnpm add easycli-plugins` |
| `create-easycli` | Project scaffolder | `npx create-easycli` |

---

## UI Components

### Colors

```typescript
import { colors } from "easycli-ui";

console.log(colors.green("Success!"));
console.log(colors.bold(colors.red("Error!")));
console.log(colors.bgCyan(colors.white("Highlight")));
```

### Spinner

```typescript
import { spinner } from "easycli-ui";

const s = spinner("Loading...");
s.start();
await doWork();
s.success("Done!");
```

### Progress Bar

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

```typescript
import { table } from "easycli-ui";

table([
  { Name: "api", Status: "Running", Port: 3000 },
  { Name: "worker", Status: "Stopped", Port: 3001 }
]);
```

### Box

```typescript
import { box } from "easycli-ui";

console.log(box("Hello World!", {
  title: "Greeting",
  borderStyle: "rounded",
  borderColor: "cyan",
  padding: 1
}));
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](./docs/getting-started.md) | Setup in 5 minutes |
| [Tutorial](./docs/tutorial.md) | Build a CLI from scratch |
| [API Reference](./docs/api-reference.md) | Complete API docs |
| [Building Beautiful CLIs](./docs/building-beautiful-clis.md) | Full feature guide |
| [Why EasyCLI?](./docs/why-easycli.md) | Framework comparison |

---

## Examples

| Example | Description |
|---------|-------------|
| [simple-app](./examples/simple-app) | Basic CLI with one command |
| [myapp](./examples/myapp) | Full-featured demo |
| [test-features](./examples/test-features) | Tests all production features |
| [deploy-cli](./examples/deploy-cli) | Deployment tool example |

---

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

MIT - [Avijit](https://github.com/ashavijit)
