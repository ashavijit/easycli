/**
 * Result of a CLI test execution.
 */
export interface RunResult {
  /** The exit code of the process (0 for success, non-zero for error). */
  exitCode: number;
  /** The captured stdout output. */
  stdout: string;
  /** The captured stderr output. */
  stderr: string;
}



/**
 * Creates a reusable test runner for a specific CLI instance.
 *
 * @param cli - The CLI instance to test.
 * @returns A function that takes args and returns a Promise resolving to RunResult.
 *
 * @example
 * ```ts
 * const run = createTestRunner(myCli);
 * const { stdout } = await run(["version"]);
 * expect(stdout).toContain("1.0.0");
 * ```
 */
export function createTestRunner(cli: {
  run: (argv: string[]) => Promise<void>;
}) {
  return async function run(args: string[]): Promise<RunResult> {
    let stdout = "";
    let stderr = "";
    let exitCode = 0;

    const originalStdoutWrite = process.stdout.write.bind(process.stdout);
    const originalStderrWrite = process.stderr.write.bind(process.stderr);
    const originalExit = process.exit;

    process.stdout.write = (chunk: string | Uint8Array): boolean => {
      stdout += String(chunk);
      return true;
    };

    process.stderr.write = (chunk: string | Uint8Array): boolean => {
      stderr += String(chunk);
      return true;
    };

    process.exit = ((code?: number): never => {
      exitCode = code ?? 0;
      throw new ExitError(exitCode);
    }) as typeof process.exit;

    try {
      await cli.run(args);
    } catch (error) {
      if (error instanceof ExitError) {
        exitCode = error.code;
      } else if (error instanceof Error) {
        stderr += error.message + "\n";
        exitCode = 1;
      }
    } finally {
      process.stdout.write = originalStdoutWrite;
      process.stderr.write = originalStderrWrite;
      process.exit = originalExit;
    }

    return { stdout, stderr, exitCode };
  };
}

class ExitError extends Error {
  constructor(public code: number) {
    super(`Process exited with code ${code}`);
    this.name = "ExitError";
  }
}

/**
 * Runs a CLI command in a test environment.
 *
 * Captures stdout, stderr, and exit code without actually exiting the process.
 *
 * @param cli - The CLI instance to run.
 * @param args - CLI arguments (e.g., ["build", "--verbose"]).
 * @returns Promise resolving to the execution result.
 */
export async function run(
  cli: { run: (argv: string[]) => Promise<void> },
  args: string[]
): Promise<RunResult> {
  const runner = createTestRunner(cli);
  return runner(args);
}
