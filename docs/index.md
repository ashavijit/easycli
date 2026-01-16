---
layout: default
title: EasyCLI - Build Beautiful CLIs with TypeScript
---

# EasyCLI

**Build beautiful CLIs with TypeScript**

[![npm](https://img.shields.io/npm/v/easycli-core)](https://www.npmjs.com/package/easycli-core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## Features

- **Type-Safe Commands** - Full TypeScript inference from schema to handler
- **Rich Error System** - Actionable errors with hints and documentation links
- **Task Runner API** - Multi-step workflows with progress tracking
- **15+ UI Components** - Spinners, progress bars, tables, cards, trees, toasts, dashboards
- **Interactive Prompts** - Built-in text, password, confirm, select, and multiselect
- **Colored Help** - Beautiful, colorized help output generated automatically

---

## Quick Start

```bash
npm install easycli-core easycli-ui
```

```typescript
import { defineCLI } from "easycli-core";

const cli = defineCLI({
  name: "myapp",
  version: "1.0.0",
  commands: {
    deploy: {
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

## UI Components

| Component | Description |
|-----------|-------------|
| **Timeline** | Step-by-step progress for deployments, CI pipelines |
| **Dashboard** | HUD-style displays with percentage bars |
| **Cards** | Bordered info panels |
| **Tree** | File system and config visualization |
| **Sparklines** | Inline charts for metrics |
| **Badges** | Status pills and indicators |
| **Heatmap** | Activity grids |
| **Toast** | Notification popups |
| **Diff** | Side-by-side comparisons |
| **Preview** | Dry-run displays |

---

## Documentation

- [Getting Started](getting-started) - Quick setup guide
- [Features](features) - Complete feature documentation
- [API Reference](api-reference) - Full API docs
- [Why EasyCLI?](why-easycli) - Framework comparisons

---

## Example Output

```
Timeline:
> Build (12s)
|
> Test (8s)
|
* Deploy
|
o Verify

Dashboard:
CPU    ██████████████░░░░░░ 68%
Memory █████████░░░░░░░░░░░ 54%

Cards:
┌── API Server ──┐
│ Status Running │
│ Port   3000    │
└────────────────┘
```

---

## License

MIT License - see [LICENSE](https://github.com/ashavijit/easycli/blob/main/LICENSE)

[GitHub](https://github.com/ashavijit/easycli) | [npm](https://www.npmjs.com/package/easycli-core)
