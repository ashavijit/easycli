/**
 * Signal handling for graceful CLI shutdown.
 * Handles SIGINT (Ctrl+C) and SIGTERM.
 */

type CleanupFn = () => void | Promise<void>;

const cleanupHandlers: CleanupFn[] = [];
let isShuttingDown = false;

/**
 * Registers a cleanup function to run on process exit.
 * @param fn - Cleanup function to execute.
 * @returns Function to unregister the cleanup handler.
 */
export function onCleanup(fn: CleanupFn): () => void {
  cleanupHandlers.push(fn);
  return () => {
    const idx = cleanupHandlers.indexOf(fn);
    if (idx !== -1) cleanupHandlers.splice(idx, 1);
  };
}

/**
 * Executes all registered cleanup handlers.
 */
async function runCleanup(): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  for (const handler of cleanupHandlers) {
    try {
      await handler();
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Installs signal handlers for graceful shutdown.
 * Call this once at CLI startup.
 */
export function installSignalHandlers(): void {
  const handler = async (signal: string) => {
    process.stderr.write(`\nReceived ${signal}, shutting down...\n`);
    await runCleanup();
    process.exit(signal === "SIGTERM" ? 143 : 130);
  };

  process.on("SIGINT", () => handler("SIGINT"));
  process.on("SIGTERM", () => handler("SIGTERM"));

  process.on("uncaughtException", async (error) => {
    process.stderr.write(`Uncaught exception: ${error.message}\n`);
    await runCleanup();
    process.exit(1);
  });

  process.on("unhandledRejection", async (reason) => {
    process.stderr.write(`Unhandled rejection: ${reason}\n`);
    await runCleanup();
    process.exit(1);
  });
}

/**
 * Resets terminal state (useful after raw mode prompts).
 */
export function resetTerminal(): void {
  if (process.stdin.isTTY) {
    try {
      process.stdin.setRawMode(false);
    } catch {
      // Ignore
    }
  }
  process.stdout.write("\x1b[?25h");
}
