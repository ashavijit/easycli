# Getting Started

Get up and running with EasyCLI in under 5 minutes.

---

## Quick Start (Recommended)

The fastest way to create a new CLI:

```bash
npx create-easycli my-cli
cd my-cli
pnpm dev hello World
```

This scaffolds a complete project with TypeScript, build tooling, and example commands.

---

## Manual Installation

```bash
pnpm add easycli-core easycli-ui
pnpm add -D typescript tsup tsx
```

---

## Your First CLI

Create `src/index.ts`:

```typescript
import { defineCLI } from "easycli-core";
import { colors } from "easycli-ui";

const cli = defineCLI({
  name: "hello",
  version: "1.0.0",
  description: "My first CLI",
  commands: {
    greet: {
      description: "Say hello",
      args: { name: "string" },
      run({ name }) {
        console.log(colors.green(`Hello, ${name}!`));
      }
    }
  }
});

cli.run();
```

---

## Build and Run

```bash
npx tsx src/index.ts greet World
```

Output:
```
Hello, World!
```

For production:
```bash
npx tsup src/index.ts --format esm
node dist/index.js greet World
```

---

## Add Interactive Prompts

```typescript
import { defineCLI } from "easycli-core";
import { colors, spinner } from "easycli-ui";

const cli = defineCLI({
  name: "hello",
  version: "1.0.0",
  commands: {
    greet: {
      description: "Say hello interactively",
      async run(_, ctx) {
        const name = await ctx.ask.text("What is your name?");
        
        const s = spinner("Preparing greeting...");
        s.start();
        await new Promise(r => setTimeout(r, 1000));
        s.success("Ready!");
        
        console.log(colors.green(`Hello, ${name}!`));
      }
    }
  }
});

cli.run();
```

---

## Add Flags and Options

```typescript
commands: {
  greet: {
    args: {
      name: { type: "string", optional: true }
    },
    flags: {
      loud: { type: "boolean", alias: "l", description: "Shout it" },
      times: { type: "number", default: 1, description: "Repeat N times" }
    },
    run({ name, loud, times }) {
      const greeting = `Hello, ${name || "stranger"}!`;
      const message = loud ? greeting.toUpperCase() : greeting;
      
      for (let i = 0; i < times; i++) {
        console.log(message);
      }
    }
  }
}
```

Usage:
```bash
my-cli greet Alice --loud --times 3
my-cli greet -l -t 3
```

---

## Add Subcommands

```typescript
commands: {
  db: {
    description: "Database commands",
    commands: {
      migrate: {
        description: "Run migrations",
        run() { console.log("Migrating..."); }
      },
      seed: {
        description: "Seed database",
        run() { console.log("Seeding..."); }
      }
    }
  }
}
```

Usage:
```bash
my-cli db migrate
my-cli db seed
```

---

## Error Handling

```typescript
commands: {
  deploy: {
    args: { env: ["staging", "production"] },
    async run({ env }, ctx) {
      if (!process.env.API_KEY) {
        throw ctx.error("API key required", {
          hint: "Set the API_KEY environment variable",
          exitCode: 1
        });
      }
      
      console.log(`Deploying to ${env}...`);
    }
  }
}
```

---

## Project Structure

Recommended structure for larger CLIs:

```
my-cli/
  src/
    index.ts           # Entry point
    commands/
      deploy.ts        # Deploy command
      db/
        migrate.ts     # db migrate subcommand
        seed.ts        # db seed subcommand
  package.json
  tsconfig.json
  tsup.config.ts
```

---

## package.json

```json
{
  "name": "my-cli",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "my-cli": "./dist/index.js"
  },
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsup",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "easycli-core": "^0.0.1",
    "easycli-ui": "^0.0.1"
  },
  "devDependencies": {
    "tsup": "^8.0.1",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

---

## tsup.config.ts

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

## Next Steps

- [API Reference](./api-reference.md) - Full API documentation
- [Building Beautiful CLIs](./building-beautiful-clis.md) - Complete feature guide
- [Why EasyCLI?](./why-easycli.md) - Framework comparisons
