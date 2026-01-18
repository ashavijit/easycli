import { defineCLI, CLIContext } from "easycli-core";
import { colors, spinner, box } from "easycli-ui";

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
      run({ name }: { name?: string }) {
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
        verbose: { type: "boolean", alias: "V" }
      },
      run({ file, verbose }: { file?: string[]; verbose?: boolean }) {
        console.log(colors.cyan("Files received:"));
        if (Array.isArray(file)) {
          file.forEach((f: string, i: number) => {
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
      run({ type }: { type: string }, ctx: CLIContext) {
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
      async run(_: Record<string, unknown>, ctx: CLIContext) {
        console.log(colors.cyan("Testing input sanitization..."));
        const input = await ctx.ask.text("Enter some text (try special chars)");
        console.log(colors.green("Sanitized input:"), input);
        console.log(colors.dim("Length:"), input.length);
      }
    }
  }
});

cli.run();
