# easycli-autocomplete

Automatic shell completion generator for EasyCLI applications.

## Features

- **Multi-Shell Support**: Generates scripts for Bash, Zsh, and Fish.
- **Context Aware**: Autocompletes commands, subcommands, and flags.
- **Fast**: Static script generation for zero-latency completion.

## Installation

```bash
pnpm add easycli-autocomplete
```

## Usage

```ts
import { generateCompletion } from "easycli-autocomplete";

// Get your CLI config (usually from defineCLI)
const config = {
  name: "my-cli",
  commands: { ... }
};

// Generate script for Bash
const script = generateCompletion("bash", config);

console.log(script);
```

## Integration

Typically, you would add a `completion` command to your CLI:

```ts
import { defineCommand } from "easycli-core";
import { generateCompletion } from "easycli-autocomplete";

export const completion = defineCommand({
  description: "Generate completion script",
  args: {
    shell: {
        type: "enum",
        values: ["bash", "zsh", "fish"]
    }
  },
  run({ args, ctx }) {
    // Assuming you have access to the full CLI config
    const script = generateCompletion(args.shell, ctx.config);
    console.log(script);
  }
});
```
