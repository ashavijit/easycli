#!/usr/bin/env node
import { defineCLI } from "easycli-core";
import { colors, spinner, progress, table, box } from "easycli-ui";

/**
 * Simulates an async operation with a delay.
 * @param ms - Milliseconds to wait.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock authentication check.
 * @returns Whether the user is authenticated.
 */
function isAuthenticated(): boolean {
  return process.env.DEPLOY_TOKEN !== undefined;
}

/**
 * Mock build process.
 */
async function buildProject(): Promise<{ size: string; files: number }> {
  await delay(1500);
  return { size: "2.4 MB", files: 147 };
}

/**
 * Mock upload process.
 */
async function uploadBundle(): Promise<{ url: string }> {
  await delay(2000);
  return { url: "https://cdn.example.com/v1.2.3/bundle.js" };
}

/**
 * Mock verification process.
 */
async function verifyDeployment(): Promise<boolean> {
  await delay(1000);
  return true;
}

const cli = defineCLI({
  name: "deploy",
  version: "1.0.0",
  description: "Production-level deployment CLI demonstrating all EasyCLI features",

  commands: {
    /**
     * Deploy command - demonstrates Task Runner API.
     */
    up: {
      description: "Deploy your application to production",
      args: {
        environment: ["staging", "production"]
      },
      flags: {
        force: { type: "boolean", alias: "f", description: "Skip confirmation prompts" },
        verbose: { type: "boolean", alias: "V", description: "Show detailed output" }
      },
      async run({ environment, force, verbose }, ctx) {
        if (!isAuthenticated()) {
          throw ctx.error("Authentication required", {
            hint: "Run: deploy auth login",
            docs: "https://docs.deploy.dev/auth"
          });
        }

        if (!force) {
          const confirmed = await ctx.ask.confirm(
            `Deploy to ${colors.bold(String(environment))}?`
          );
          if (!confirmed) {
            console.log(colors.dim("Deployment cancelled."));
            return;
          }
        }

        const t = ctx.task("Deploying to " + environment);

        const buildResult = await t.step("Building project", async () => {
          return await buildProject();
        });

        if (verbose) {
          console.log(colors.dim(`  Bundle size: ${buildResult.size}`));
          console.log(colors.dim(`  Files: ${buildResult.files}`));
        }

        const uploadResult = await t.step("Uploading bundle", async () => {
          return await uploadBundle();
        });

        if (verbose) {
          console.log(colors.dim(`  URL: ${uploadResult.url}`));
        }

        await t.step("Verifying deployment", async () => {
          const ok = await verifyDeployment();
          if (!ok) {
            throw new Error("Verification failed");
          }
        });

        t.success("Deployment complete!");

        console.log("");
        console.log(box([
            `Environment: ${colors.cyan(String(environment))}`,
            `Bundle: ${colors.dim(buildResult.size)}`,
            `URL: ${colors.cyan(uploadResult.url)}`
          ].join("\n"), {
          title: "Deployment Summary",
          padding: 1,
          borderStyle: "rounded"
        }));
      }
    },

    /**
     * Auth command group - demonstrates subcommands and Rich Error System.
     */
    auth: {
      description: "Authentication commands",
      commands: {
        login: {
          description: "Authenticate with the deployment service",
          flags: {
            token: { type: "string", alias: "t", description: "API token" }
          },
          async run({ token }, ctx) {
            let authToken = token as string | undefined;

            if (!authToken) {
              authToken = await ctx.ask.password("Enter your API token:");
            }

            if (!authToken || authToken.length < 10) {
              throw ctx.error("Invalid token format", {
                hint: "Tokens must be at least 10 characters",
                docs: "https://docs.deploy.dev/tokens"
              });
            }

            const s = spinner("Authenticating...");
            s.start();
            await delay(1500);
            s.success("Authenticated successfully!");

            console.log(colors.dim("Token saved to ~/.deployrc"));
          }
        },

        logout: {
          description: "Sign out of the deployment service",
          async run() {
            const s = spinner("Signing out...");
            s.start();
            await delay(800);
            s.success("Signed out successfully!");
          }
        },

        status: {
          description: "Show current authentication status",
          run() {
            if (isAuthenticated()) {
              console.log(colors.green("> Authenticated"));
              console.log(colors.dim("  Token: ****" + (process.env.DEPLOY_TOKEN?.slice(-4) ?? "")));
            } else {
              console.log(colors.yellow("> Not authenticated"));
              console.log(colors.dim("  Run: deploy auth login"));
            }
          }
        }
      }
    },

    /**
     * Status command - demonstrates table and colors.
     */
    status: {
      description: "Show deployment status across environments",
      async run() {
        const s = spinner("Fetching status...");
        s.start();
        await delay(1000);
        s.stop();

        console.log(colors.bold("\nDeployment Status\n"));

        const data = [
          { env: "production", version: "v1.2.3", status: "healthy", uptime: "99.9%" },
          { env: "staging", version: "v1.2.4-rc1", status: "healthy", uptime: "99.5%" },
          { env: "development", version: "v1.3.0-dev", status: "building", uptime: "N/A" }
        ];

        const formatted = data.map((row) => ({
          Environment: colors.cyan(row.env),
          Version: row.version,
          Status: row.status === "healthy"
            ? colors.green(row.status)
            : colors.yellow(row.status),
          Uptime: row.uptime
        }));

        console.log(table(formatted));
      }
    },

    /**
     * Init command - demonstrates interactive prompts and flow.
     */
    init: {
      description: "Initialize a new deployment configuration",
      async run(_, ctx) {
        console.log(colors.bold("\nDeploy Configuration Wizard\n"));

        const [projectName, environment, region] = await ctx.flow([
          () => ctx.ask.text("Project name:", "my-app"),
          () => ctx.ask.select("Default environment:", ["staging", "production"]),
          () => ctx.ask.select("Region:", ["us-east-1", "eu-west-1", "ap-south-1"])
        ]);

        const features = await ctx.ask.multiselect("Enable features:", [
          "auto-scaling",
          "cdn",
          "ssl",
          "monitoring"
        ]);

        console.log("");
        console.log(box([
            `Project: ${colors.cyan(projectName)}`,
            `Environment: ${colors.cyan(environment)}`,
            `Region: ${colors.cyan(region)}`,
            `Features: ${colors.cyan(features.join(", ") || "none")}`
          ].join("\n"), {
          title: "Configuration",
          padding: 1,
          borderStyle: "double"
        }));

        const s = spinner("Creating configuration...");
        s.start();
        await delay(1200);
        s.success("Configuration saved to deploy.config.json");
      }
    },

    /**
     * Logs command - demonstrates progress bar.
     */
    logs: {
      description: "Stream deployment logs",
      args: {
        environment: { type: "string", optional: true, description: "Environment name" }
      },
      flags: {
        lines: { type: "number", alias: "n", default: 100, description: "Number of lines" }
      },
      async run({ environment, lines }) {
        const env = environment ?? "production";
        console.log(colors.dim(`Fetching last ${lines} lines from ${env}...\n`));

        const bar = progress(100);
        for (let i = 0; i <= 100; i += 10) {
          bar.update(i);
          await delay(150);
        }
        bar.complete();

        console.log("");
        const mockLogs = [
          "[2026-01-16 10:00:00] INFO  Server started on port 3000",
          "[2026-01-16 10:00:01] INFO  Connected to database",
          "[2026-01-16 10:00:02] INFO  Cache warmed up",
          "[2026-01-16 10:00:05] INFO  Ready to accept connections"
        ];

        mockLogs.forEach((log) => {
          console.log(colors.dim(log));
        });
      }
    },

    /**
     * Rollback command - demonstrates error handling.
     */
    rollback: {
      description: "Rollback to a previous deployment",
      args: {
        version: "string"
      },
      async run({ version }, ctx) {
        if (!isAuthenticated()) {
          throw ctx.error("Authentication required for rollback", {
            hint: "Run: deploy auth login",
            docs: "https://docs.deploy.dev/auth"
          });
        }

        const ver = String(version);
        if (!ver.startsWith("v")) {
          throw ctx.error("Invalid version format", {
            hint: "Version must start with 'v', e.g., v1.2.3",
            docs: "https://docs.deploy.dev/versioning"
          });
        }

        const t = ctx.task("Rolling back to " + ver);

        await t.step("Fetching deployment artifact", async () => {
          await delay(1000);
        });

        await t.step("Restoring configuration", async () => {
          await delay(800);
        });

        await t.step("Switching traffic", async () => {
          await delay(1200);
        });

        t.success("Rollback complete!");
      }
    }
  }
});

cli.run();
