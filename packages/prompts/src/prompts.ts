import { createInterface } from "node:readline";
import { sanitize } from "./sanitize.js";

/**
 * Interface for interactive prompt methods.
 * All methods automatically check flags and config before prompting.
 */
export interface AskMethods {
  /**
   * Prompts the user for text input.
   * @param message - The question to ask.
   * @param defaultValue - Optional default value if user enters nothing.
   * @returns The user's input.
   */
  text(message: string, defaultValue?: string): Promise<string>;

  /**
   * Prompts the user for sensitive input (hidden).
   * @param message - The question to ask.
   * @returns The user's input.
   */
  password(message: string): Promise<string>;

  /**
   * Prompts the user to confirm an action (y/n).
   * @param message - The question to ask.
   * @returns True if confirmed, false otherwise.
   */
  confirm(message: string): Promise<boolean>;

  /**
   * Prompts the user to select from a list of options.
   * @param message - The question to ask.
   * @param options - Array of available options.
   * @returns The selected option.
   */
  select<T extends string>(message: string, options: T[]): Promise<T>;

  /**
   * Prompts the user to select multiple options (spacebar to toggle, enter to confirm).
   * @param message - The question to ask.
   * @param options - Array of available options.
   * @returns Array of selected options.
   */
  multiselect<T extends string>(message: string, options: T[]): Promise<T[]>;
}

type FlagValue = string | boolean | number | string[] | number[] | undefined;

/**
 * Creates a set of prompt methods backed by readline.
 *
 * Checks for values in order:
 * 1. CLI Flags
 * 2. Configuration file
 * 3. Interactive prompt (if not found in 1 or 2)
 *
 * @param flags - Parsed CLI flags (Map).
 * @param config - User configuration.
 * @returns Object containing `text`, `password`, `confirm`, and `select` methods.
 */
export function createAsk(
  flags: Map<string, FlagValue>,
  config: Record<string, unknown>
): AskMethods {
  return {
    async text(message: string, defaultValue?: string): Promise<string> {
      const key = toKey(message);
      const flagValue = flags.get(key);
      if (typeof flagValue === "string") return sanitize(flagValue);
      const configValue = config[key];
      if (typeof configValue === "string") return sanitize(configValue);
      return prompt(message, defaultValue);
    },

    async password(message: string): Promise<string> {
      const key = toKey(message);
      const flagValue = flags.get(key);
      if (typeof flagValue === "string") return flagValue;
      const configValue = config[key];
      if (typeof configValue === "string") return configValue;
      return promptPassword(message);
    },

    async confirm(message: string): Promise<boolean> {
      const key = toKey(message);
      const flagValue = flags.get(key);
      if (typeof flagValue === "boolean") return flagValue;
      const configValue = config[key];
      if (typeof configValue === "boolean") return configValue;
      return promptConfirm(message);
    },

    async select<T extends string>(message: string, options: T[]): Promise<T> {
      const key = toKey(message);
      const flagValue = flags.get(key);
      if (typeof flagValue === "string" && options.includes(flagValue as T)) {
        return flagValue as T;
      }
      const configValue = config[key];
      if (
        typeof configValue === "string" &&
        options.includes(configValue as T)
      ) {
        return configValue as T;
      }
      return promptSelect(message, options);
    },

    async multiselect<T extends string>(message: string, options: T[]): Promise<T[]> {
      return promptMultiselect(message, options);
    }
  };
}

/**
 * Runs a sequence of prompt steps in order.
 *
 * Use this to create step-based wizards that feel like `create-next-app`.
 *
 * @param steps - Array of async functions that each return a value.
 * @returns Array of collected values from each step.
 *
 * @example
 * ```ts
 * const [name, region, ci] = await flow([
 *   () => ctx.ask.text("Project name"),
 *   () => ctx.ask.select("Region", ["us", "eu"]),
 *   () => ctx.ask.confirm("Enable CI?")
 * ]);
 * ```
 */
export async function flow<T extends unknown[]>(
  steps: { [K in keyof T]: () => Promise<T[K]> }
): Promise<T> {
  const results: unknown[] = [];
  for (const step of steps) {
    results.push(await step());
  }
  return results as T;
}


function toKey(message: string): string {
  return message
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

async function prompt(message: string, defaultValue?: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = defaultValue ? `${message} (${defaultValue})` : message;

  return new Promise((resolve) => {
    rl.question(`${question}: `, (answer) => {
      rl.close();
      const clean = sanitize(answer);
      if (!clean && defaultValue) {
        resolve(sanitize(defaultValue));
      } else {
        resolve(clean);
      }
    });
  });
}

async function promptPassword(message: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${message}: `, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function promptConfirm(message: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/n): `, (answer) => {
      rl.close();
      const lower = answer.toLowerCase().trim();
      resolve(lower === "y" || lower === "yes");
    });
  });
}

async function promptSelect<T extends string>(
  message: string,
  options: T[]
): Promise<T> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  process.stdout.write(`${message}:\n`);
  options.forEach((opt, i) => {
    process.stdout.write(`  ${i + 1}. ${opt}\n`);
  });

  return new Promise((resolve) => {
    rl.question("Select: ", (answer) => {
      rl.close();
      const index = parseInt(answer, 10) - 1;
      const selected = options[index];
      if (selected !== undefined) {
        resolve(selected);
      } else {
        const match = options.find((o) => o === answer);
        resolve(match ?? options[0] as T);
      }
    });
  });
}

async function promptMultiselect<T extends string>(
  message: string,
  options: T[]
): Promise<T[]> {
  const selected = new Set<number>();
  let cursor = 0;

  const render = () => {
    process.stdout.write(`\x1b[${options.length + 1}A`);
    process.stdout.write(`${message}\n`);
    options.forEach((opt, i) => {
      const marker = selected.has(i) ? "[x]" : "[ ]";
      const prefix = i === cursor ? "> " : "  ";
      process.stdout.write(`\x1b[K${prefix}${marker} ${opt}\n`);
    });
    process.stdout.write(`\x1b[K(Use ↑↓, space to select, enter to continue)\n`);
  };

  // Initial render
  process.stdout.write(`${message}\n`);
  options.forEach((opt, i) => {
    const marker = selected.has(i) ? "[x]" : "[ ]";
    const prefix = i === cursor ? "> " : "  ";
    process.stdout.write(`${prefix}${marker} ${opt}\n`);
  });
  process.stdout.write(`(Use ↑↓, space to select, enter to continue)\n`);

  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    const onData = (key: string) => {
      if (key === "\u001b[A") {
        cursor = (cursor - 1 + options.length) % options.length;
        render();
      } else if (key === "\u001b[B") {
        cursor = (cursor + 1) % options.length;
        render();
      } else if (key === " ") {
        if (selected.has(cursor)) {
          selected.delete(cursor);
        } else {
          selected.add(cursor);
        }
        render();
      } else if (key === "\r" || key === "\n") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        const result = Array.from(selected).map((i) => options[i]!);
        resolve(result);
      } else if (key === "\u0003") {
        stdin.setRawMode(false);
        stdin.pause();
        process.exit(0);
      }
    };

    stdin.on("data", onData);
  });
}

