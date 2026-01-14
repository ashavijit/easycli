# @easycli/core

The core engine for building powerful, type-safe CLI applications with EasyCLI.

## Features

- **Type-Safe**: Full TypeScript support for arguments and flags.
- **Declarative**: Define commands and CLIs with simple objects.
- **Fast**: deeply nested subcommands with efficient routing.
- **Extensible**: Built-in hook system and plugin architecture.

## Installation

```bash
pnpm add @easycli/core
```

## Usage

### 1. Define a Command

`commands/hello.ts`:
```ts
import { defineCommand } from "@easycli/core";

export default defineCommand({
  description: "Say hello",
  flags: {
    name: { type: "string", default: "World", alias: "n" }
  },
  async run({ flags }) {
    console.log(`Hello, ${flags.name}!`);
  }
});
```

### 2. Create the CLI

`index.ts`:
```ts
import { defineCLI } from "@easycli/core";
import hello from "./commands/hello";

const cli = defineCLI({
  name: "my-cli",
  version: "1.0.0",
  commands: {
    hello
  }
});

cli.run();
```

## API

### `defineCLI(config)`

Creates the CLI application.

- `name`: Name of the executable.
- `version`: Current version.
- `commands`: Object mapping command names to definitions.

### `defineCommand(definition)`

Defines a command with:

- `description`: Help text.
- `flags`: Flag definitions (type, alias, default).
- `args`: Positional argument definitions.
- `run`: Async function to execute.

## Advanced

- **Hooks**: `onInit`, `onExit`, `onError` hooks for lifecycle management.
- **Plugins**: Extend functionality with the plugin system.
