#!/usr/bin/env node
/**
 * Test app to verify production hardening features:
 * 1. Input sanitization
 * 2. Signal handling (SIGINT/SIGTERM)
 * 3. Error recovery
 * 4. Optional args
 * 5. Array flags
 */
import { defineCLI } from "@easycli/core";
import { colors, spinner, box } from "@easycli/ui";

const cli = defineCLI({
  name: "test-app",
  version: "1.0.0",
  description: "Test app for production features",

  commands: {
    greet: {
      description: "Test optional args",
      args: {
        name: { type: "string", optional: true, description: "Optional name" }
      },
      run({ name }) {
        if (name) {
          console.log(colors.green(`Hello, ${name}!`));
        } else {
          console.log(colors.yellow("Hello, anonymous user!"));
        }
      }
    },

    files: {
      description: "Test array flags",
      flags: {
        file: { type: "string", array: true, alias: "f", description: "Files to process" },
        verbose: { type: "boolean", alias: "v" }
      },
      run({ file, verbose }) {
        console.log(colors.cyan("Files received:"));
        if (Array.isArray(file)) {
          file.forEach((f, i) => {
            console.log(`  ${i + 1}. ${f}`);
          });
        } else if (file) {
          console.log(`  1. ${file}`);
        } else {
          console.log(colors.dim("  (none)"));
        }
        if (verbose) {
          console.log(colors.dim("\nVerbose mode enabled"));
        }
      }
    },

    signal: {
      description: "Test signal handling (Ctrl+C)",
      async run() {
        console.log(box([
          "Press Ctrl+C to test signal handling.",
          "The app should exit gracefully."
        ], { borderStyle: "rounded", borderColor: "yellow" }));

        const s = spinner("Waiting for signal...");
        s.start();

        await new Promise(() => {});
      }
    },

    error: {
      description: "Test error handling",
      flags: {
        type: { type: "string", default: "normal" }
      },
      run({ type }, ctx) {
        if (type === "rich") {
          throw ctx.error("Something went wrong", {
            hint: "Try using --type=normal instead",
            exitCode: 2
          });
        }
        throw new Error("A normal error occurred");
      }
    },

    sanitize: {
      description: "Test input sanitization",
      async run(_, ctx) {
        console.log(colors.cyan("Testing input sanitization..."));
        const input = await ctx.ask.text("Enter some text (try special chars)");
        console.log(colors.green("Sanitized input:"), input);
        console.log(colors.dim("Length:"), input.length);
      }
    }
  }
});

cli.run();
