# EasyCLI

<div align="center">

![EasyCLI Logo](./logo.svg)

**The modern framework for building type-safe, beautiful CLI applications.**

*A complete replacement for Commander.js + Inquirer with better DX.*

[![npm version](https://img.shields.io/npm/v/@easycli/core?style=flat-square)](https://www.npmjs.com/package/@easycli/core)
[![Build Status](https://img.shields.io/github/actions/workflow/status/ashavijit/easycli/ci.yml?branch=main&style=flat-square)](https://github.com/ashavijit/easycli/actions)
[![License](https://img.shields.io/npm/l/@easycli/core?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

[Features](#features) • [Installation](#installation) • [Quick Start](#quick-start) • [Documentation](./docs/building-beautiful-clis.md)

</div>

---

## Why EasyCLI?

Building CLIs should be as enjoyable as building web apps. **EasyCLI** provides a robust foundation with strict type safety, a modular architecture, and a suite of beautiful UI components out of the box.

### ✨ Features

- **🔒 End-to-End Type Safety**: Define your schema once, get fully typed arguments and flags in your handlers.
- **🎨 Stunning UI Components**: Built-in support for [Colors](./packages/ui/src/colors.ts), [Spinners](./packages/ui/src/spinner.ts), [Progress Bars](./packages/ui/src/progress.ts), [Tables](./packages/ui/src/table.ts), and [Boxes](./packages/ui/src/box.ts).
- **💬 Interactive Prompts**: Text input, password, confirm, select, and multiselect prompts.
- **🧩 Modular Architecture**: Composable commands, plugins, and deep nesting support.
- **⚡ Zero Config**: Works out of the box with reasonable defaults.
- **🧠 Developer Experience**: Great error messages, autocomplete, and self-documenting code.

## 📦 Installation

### Quick Start with Scaffolder

```bash
npx create-easycli my-app
cd my-app
pnpm dev hello World
```

### Manual Installation

```bash
pnpm add @easycli/core @easycli/ui
```

## 🚀 Quick Start

Create your first CLI in `src/index.ts`:

```typescript
import { defineCLI } from "@easycli/core";
import { colors, box } from "@easycli/ui";

const cli = defineCLI({
  name: "my-cli",
  version: "1.0.0",
  description: "My awesome CLI tool",

  commands: {
    greet: {
      description: "Send a greeting",
      args: {
        name: "string"
      },
      flags: {
        loud: { type: "boolean", alias: "l" }
      },
      run({ name, loud }) {
        const message = `Hello, ${name}!`;
        console.log(loud ? colors.bold(colors.red(message.toUpperCase())) : colors.green(message));
      }
    }
  }
});

cli.run();
```

Run it:
```bash
node src/index.js greet "World" --loud
```

## 📦 UI Components

### Box / Panel

Display beautiful bordered boxes for announcements and notices:

```typescript
import { box } from "@easycli/ui";

console.log(box("Update available: 1.0.0 → 2.0.0", {
  borderStyle: "rounded",  // single, double, rounded, bold
  borderColor: "yellow",
  padding: 1
}));

console.log(box([
  "New features:",
  "• Box component",
  "• Better prompts"
], {
  title: " What's New ",
  borderStyle: "double",
  borderColor: "cyan"
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

## 📚 Documentation

- [**Building Beautiful CLIs**](./docs/building-beautiful-clis.md): A comprehensive guide to designing top-tier command-line experiences.
- [Examples](./examples/): Check out the `simple-app`, `myapp`, and `nextjs-cli` examples for real-world usage.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

MIT © [Avijit](https://github.com/ashavijit)

