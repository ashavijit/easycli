# @easycli/plugins

Plugin system for EasyCLI applications.

## Features

- **Lifecycle Hooks**: Hook into `onInit`, `onBeforeCommand`, `onAfterCommand`, `onError`, and `onExit`.
- **Flexible Definition**: Define plugins as simple objects or factory functions with context.
- **Context Aware**: Access CLI configuration and execution context within hooks.

## Usage

### Defining a Plugin

```ts
import { definePlugin } from "@easycli/plugins";

export const loggerPlugin = definePlugin({
  name: "logger",
  hooks: {
    onBeforeCommand: (ctx) => {
      console.log(`Executing command: ${ctx.command}`);
    },
    onAfterCommand: (ctx) => {
      console.log(`Finished command: ${ctx.command}`);
    }
  }
});
```

### Using a Plugin

Plugins are passed to `defineCLI` in the core package:

```ts
import { defineCLI } from "@easycli/core";
import { loggerPlugin } from "./plugins/logger";

const cli = defineCLI({
  name: "my-app",
  plugins: [loggerPlugin],
  commands: { ... }
});
```

## API

### `definePlugin(def)`

Defines a plugin. Can take an object or a function that returns the plugin object.

#### Hooks available:

- `onInit`: Called when CLI starts.
- `onBeforeCommand`: Called before a command runs.
- `onAfterCommand`: Called after a command runs.
- `onError`: Called when an error occurs.
- `onExit`: Called before the process exits.
