# easycli-test-utils

Testing utilities for EasyCLI applications.

## Features

- **In-Memory Execution**: Run your CLI commands without spawning child processes.
- **Output Capture**: Captures `stdout` and `stderr` for assertion.
- **Exit Code Capture**: Captures process exit codes without killing the test runner.

## Usage

### Testing a CLI

```ts
import { describe, it, expect } from "vitest";
import { createTestRunner } from "easycli-test-utils";
import { defineCLI } from "easycli-core";

// Define your CLI (or import it)
const cli = defineCLI({
  name: "my-cli",
  commands: { ... }
});

const run = createTestRunner(cli);

describe("my-cli", () => {
  it("should print version", async () => {
    const { stdout, exitCode } = await run(["--version"]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("0.0.0");
  });

  it("should fail on unknown command", async () => {
    const { stderr, exitCode } = await run(["unknown"]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("Command not found");
  });
});
```

## API

### `createTestRunner(cli)`

Creates a test runner for the given CLI instance.

- Returns an async function `run(args: string[])` that returns `{ stdout, stderr, exitCode }`.
