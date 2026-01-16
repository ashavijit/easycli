# easycli-help

Automatic help text generation for EasyCLI.

## Features

- **Automated**: Generates help from your CLI and command definitions.
- **Consistent**: Ensures uniform help text across your entire CLI.
- **Detailed**: Shows arguments, flags, default values, and subcommands.

## Usage

This package is used internally by `easycli-core` to generate help text when users run your CLI with `--help` or `-h`.

You generally do not need to use this package directly unless you are building a custom runtime or extending the default help behavior.

### API

```ts
import { generateHelp, generateCommandHelp } from "easycli-help";

// Generate global CLI help
const help = generateHelp({
  name: "my-cli",
  version: "1.0.0",
  commands: { ... }
});

console.log(help);

// Generate command-specific help
const cmdHelp = generateCommandHelp(
  "my-cli",
  ["db", "migrate"],
  migrateCommandDef
);

console.log(cmdHelp);
```
