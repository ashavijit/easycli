# easycli-ui

Terminal UI components for EasyCLI applications.

## Features

- **Spinner**: Animated loading indicators with success/fail states
- **Progress Bar**: Visual progress tracking for long-running tasks
- **Table**: Auto-aligned tabular output

## Installation

```bash
pnpm add easycli-ui
```

## Usage

### Spinner

```ts
import { spinner } from "easycli-ui";

const s = spinner("Deploying...");
s.start();
await deploy();
s.success("Deployed!");
```

**Output:**
```
⠋ Deploying...
✔ Deployed!
```

### Progress Bar

```ts
import { progress } from "easycli-ui";

const bar = progress(100);
bar.update(20);
bar.update(50);
bar.complete();
```

**Output:**
```
██████████████░░░░░░░░░░░░░░░░ 50%
```

### Table

```ts
import { table } from "easycli-ui";

table([
  { name: "api", status: "running" },
  { name: "worker", status: "stopped" }
]);
```

**Output:**
```
NAME     STATUS
api      running
worker   stopped
```
