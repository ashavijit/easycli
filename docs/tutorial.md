# Tutorial: Building a CLI from Scratch

Learn how to build a complete CLI application using EasyCLI. We'll create a **project manager CLI** that can create, list, and deploy projects.

---

## What We're Building

```bash
project-cli create my-app --template react
project-cli list
project-cli deploy my-app --env production --force
```

---

## Step 1: Project Setup

Create a new project:

```bash
npx create-easycli project-cli
cd project-cli
```

Or manually:

```bash
mkdir project-cli && cd project-cli
pnpm init
pnpm add easycli-core easycli-ui
pnpm add -D typescript tsup tsx
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

Create `tsup.config.ts`:

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  clean: true,
  dts: true,
  banner: {
    js: "#!/usr/bin/env node"
  }
});
```

---

## Step 2: Basic CLI Structure

Create `src/index.ts`:

```typescript
import { defineCLI } from "easycli-core";
import { colors } from "easycli-ui";

const cli = defineCLI({
  name: "project-cli",
  version: "1.0.0",
  description: "Manage your projects",
  commands: {}
});

cli.run();
```

Test it:

```bash
pnpm tsx src/index.ts --help
```

---

## Step 3: Create Command

Add the `create` command:

```typescript
import { defineCLI } from "easycli-core";
import { colors, spinner, box } from "easycli-ui";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const cli = defineCLI({
  name: "project-cli",
  version: "1.0.0",
  description: "Manage your projects",
  
  commands: {
    create: {
      description: "Create a new project",
      args: {
        name: "string"
      },
      flags: {
        template: { 
          type: "string", 
          alias: "t", 
          default: "basic",
          description: "Project template (basic, react, api)"
        }
      },
      async run({ name, template }) {
        const s = spinner(`Creating project "${name}"...`);
        s.start();

        const projectDir = join(process.cwd(), name);
        await mkdir(projectDir, { recursive: true });
        await mkdir(join(projectDir, "src"), { recursive: true });

        const pkg = {
          name,
          version: "1.0.0",
          type: "module",
          scripts: {
            dev: "tsx src/index.ts",
            build: "tsup"
          }
        };

        await writeFile(
          join(projectDir, "package.json"),
          JSON.stringify(pkg, null, 2)
        );

        await writeFile(
          join(projectDir, "src/index.ts"),
          `console.log("Hello from ${name}!");`
        );

        s.success(`Project "${name}" created!`);

        console.log();
        console.log(box([
          colors.bold("Next steps:"),
          "",
          `  cd ${name}`,
          "  pnpm install",
          "  pnpm dev"
        ], {
          borderStyle: "rounded",
          borderColor: "green",
          padding: 1
        }));
      }
    }
  }
});

cli.run();
```

Test it:

```bash
pnpm tsx src/index.ts create my-app
```

---

## Step 4: List Command

Add project listing:

```typescript
import { readdir, stat, readFile } from "fs/promises";

commands: {
  // ... create command ...

  list: {
    description: "List all projects",
    flags: {
      dir: { 
        type: "string", 
        alias: "d", 
        default: ".",
        description: "Directory to scan"
      }
    },
    async run({ dir }) {
      const { table } = await import("easycli-ui");
      
      const entries = await readdir(dir, { withFileTypes: true });
      const projects = [];

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        
        const pkgPath = join(dir, entry.name, "package.json");
        try {
          const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
          projects.push({
            Name: entry.name,
            Version: pkg.version || "-",
            Type: pkg.type || "commonjs"
          });
        } catch {
          continue;
        }
      }

      if (projects.length === 0) {
        console.log(colors.yellow("No projects found."));
        return;
      }

      console.log(colors.bold(`Found ${projects.length} project(s):`));
      console.log();
      table(projects);
    }
  }
}
```

---

## Step 5: Deploy Command with Prompts

Add deployment with interactive confirmation:

```typescript
commands: {
  // ... other commands ...

  deploy: {
    description: "Deploy a project",
    args: {
      name: "string"
    },
    flags: {
      env: { 
        type: "string", 
        alias: "e", 
        default: "staging",
        description: "Target environment"
      },
      force: { 
        type: "boolean", 
        alias: "f",
        description: "Skip confirmation"
      }
    },
    async run({ name, env, force }, ctx) {
      const { progress } = await import("easycli-ui");

      if (!force) {
        const proceed = await ctx.ask.confirm(
          `Deploy "${name}" to ${env}?`
        );
        if (!proceed) {
          console.log(colors.yellow("Deployment cancelled."));
          return;
        }
      }

      console.log();
      console.log(colors.cyan(`Deploying ${name} to ${env}...`));
      console.log();

      const steps = ["Building", "Testing", "Uploading", "Verifying"];
      const bar = progress(100);

      for (let i = 0; i < steps.length; i++) {
        console.log(colors.dim(`  ${steps[i]}...`));
        await new Promise(r => setTimeout(r, 500));
        bar.update((i + 1) * 25);
      }

      bar.complete();
      console.log();
      console.log(colors.green(`Deployed ${name} to ${env}!`));

      console.log();
      console.log(box([
        `Project: ${colors.cyan(name)}`,
        `Environment: ${colors.yellow(env)}`,
        `URL: https://${name}.${env}.example.com`
      ], {
        title: " Deployment Complete ",
        borderStyle: "double",
        borderColor: "green"
      }));
    }
  }
}
```

---

## Step 6: Subcommands

Add database management subcommands:

```typescript
commands: {
  // ... other commands ...

  db: {
    description: "Database commands",
    commands: {
      migrate: {
        description: "Run database migrations",
        flags: {
          dry: { type: "boolean", description: "Dry run" }
        },
        async run({ dry }) {
          const s = spinner("Running migrations...");
          s.start();
          
          await new Promise(r => setTimeout(r, 1000));
          
          if (dry) {
            s.success("Dry run complete - no changes made");
          } else {
            s.success("Migrations complete!");
          }
        }
      },
      
      seed: {
        description: "Seed the database",
        async run() {
          const s = spinner("Seeding database...");
          s.start();
          
          await new Promise(r => setTimeout(r, 800));
          
          s.success("Database seeded!");
        }
      },
      
      reset: {
        description: "Reset the database",
        async run(_, ctx) {
          const confirm = await ctx.ask.confirm(
            "This will DELETE all data. Continue?"
          );
          
          if (!confirm) {
            console.log(colors.yellow("Cancelled."));
            return;
          }
          
          const s = spinner("Resetting database...");
          s.start();
          
          await new Promise(r => setTimeout(r, 1200));
          
          s.success("Database reset!");
        }
      }
    }
  }
}
```

Usage:

```bash
project-cli db migrate --dry
project-cli db seed
project-cli db reset
```

---

## Step 7: Error Handling

Add rich error handling:

```typescript
commands: {
  deploy: {
    // ...
    async run({ name, env, force }, ctx) {
      const projectDir = join(process.cwd(), name);
      
      try {
        await stat(projectDir);
      } catch {
        throw ctx.error(`Project "${name}" not found`, {
          hint: `Run "project-cli create ${name}" first`,
          exitCode: 1
        });
      }

      if (env === "production" && !force) {
        throw ctx.error("Production deployments require --force", {
          hint: "Add --force flag to confirm production deployment"
        });
      }

      // ... rest of deploy logic
    }
  }
}
```

---

## Step 8: Array Flags

Collect multiple values:

```typescript
commands: {
  build: {
    description: "Build project files",
    flags: {
      file: { 
        type: "string", 
        array: true, 
        alias: "f",
        description: "Files to build"
      },
      exclude: { 
        type: "string", 
        array: true,
        description: "Patterns to exclude"
      }
    },
    run({ file, exclude }) {
      console.log("Building files:");
      (file || []).forEach(f => console.log(`  + ${f}`));
      
      if (exclude?.length) {
        console.log("Excluding:");
        exclude.forEach(e => console.log(`  - ${e}`));
      }
    }
  }
}
```

Usage:

```bash
project-cli build --file src/a.ts --file src/b.ts --exclude "*.test.ts"
```

---

## Step 9: Build and Distribute

Add scripts to `package.json`:

```json
{
  "name": "project-cli",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "project-cli": "./dist/index.js"
  },
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsup",
    "start": "node dist/index.js"
  }
}
```

Build:

```bash
pnpm build
```

Test the built version:

```bash
node dist/index.js --help
```

Link globally for testing:

```bash
pnpm link --global
project-cli --help
```

---

## Complete Code

Here's the complete `src/index.ts`:

```typescript
import { defineCLI } from "easycli-core";
import { colors, spinner, box, progress, table } from "easycli-ui";
import { mkdir, writeFile, readdir, readFile, stat } from "fs/promises";
import { join } from "path";

const cli = defineCLI({
  name: "project-cli",
  version: "1.0.0",
  description: "Manage your projects",

  commands: {
    create: {
      description: "Create a new project",
      args: { name: "string" },
      flags: {
        template: { type: "string", alias: "t", default: "basic" }
      },
      async run({ name, template }) {
        const s = spinner(`Creating "${name}"...`);
        s.start();

        const dir = join(process.cwd(), name);
        await mkdir(dir, { recursive: true });
        await mkdir(join(dir, "src"), { recursive: true });

        await writeFile(
          join(dir, "package.json"),
          JSON.stringify({ name, version: "1.0.0", type: "module" }, null, 2)
        );

        await writeFile(
          join(dir, "src/index.ts"),
          `console.log("Hello from ${name}!");`
        );

        s.success("Created!");

        console.log(box([
          `cd ${name}`,
          "pnpm install",
          "pnpm dev"
        ], { borderStyle: "rounded", borderColor: "green" }));
      }
    },

    list: {
      description: "List projects",
      async run() {
        const entries = await readdir(".", { withFileTypes: true });
        const projects = [];

        for (const e of entries) {
          if (!e.isDirectory()) continue;
          try {
            const pkg = JSON.parse(
              await readFile(join(e.name, "package.json"), "utf-8")
            );
            projects.push({ Name: e.name, Version: pkg.version || "-" });
          } catch {}
        }

        if (projects.length === 0) {
          console.log(colors.yellow("No projects found."));
          return;
        }

        table(projects);
      }
    },

    deploy: {
      description: "Deploy a project",
      args: { name: "string" },
      flags: {
        env: { type: "string", alias: "e", default: "staging" },
        force: { type: "boolean", alias: "f" }
      },
      async run({ name, env, force }, ctx) {
        if (!force) {
          const ok = await ctx.ask.confirm(`Deploy to ${env}?`);
          if (!ok) return;
        }

        const bar = progress(100);
        for (let i = 0; i <= 100; i += 25) {
          await new Promise(r => setTimeout(r, 300));
          bar.update(i);
        }
        bar.complete();

        console.log(colors.green(`Deployed ${name} to ${env}!`));
      }
    },

    db: {
      description: "Database commands",
      commands: {
        migrate: {
          description: "Run migrations",
          async run() {
            const s = spinner("Migrating...");
            s.start();
            await new Promise(r => setTimeout(r, 800));
            s.success("Done!");
          }
        },
        seed: {
          description: "Seed database",
          async run() {
            const s = spinner("Seeding...");
            s.start();
            await new Promise(r => setTimeout(r, 600));
            s.success("Done!");
          }
        }
      }
    }
  }
});

cli.run();
```

---

## Next Steps

- Add [config file loading](./api-reference.md#easycli-config) with `easycli-config`
- Add [plugins](./building-beautiful-clis.md#8-hooks--plugins) for reusable functionality
- Publish to npm for others to use

---

Check out the [API Reference](./api-reference.md) for complete documentation.
