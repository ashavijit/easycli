# Getting Started

Get up and running with EasyCLI in under 5 minutes.

---

## Installation

```bash
npm install easycli-core easycli-ui
```

Or use the scaffolding tool:

```bash
npx create-easycli my-cli
cd my-cli
npm install
```

---

## Your First CLI

Create `src/index.ts`:

```typescript
#!/usr/bin/env node
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
npx tsup src/index.ts --format esm
node dist/index.js greet World
```

Output:
```
Hello, World!
```

---

## Add Interactive Features

```typescript
import { defineCLI } from "easycli-core";
import { colors, spinner } from "easycli-ui";

const cli = defineCLI({
  name: "hello",
  version: "1.0.0",
  commands: {
    greet: {
      description: "Say hello",
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

## Add Error Handling

```typescript
commands: {
  deploy: {
    args: { env: ["staging", "production"] },
    async run({ env }, ctx) {
      if (!process.env.API_KEY) {
        throw ctx.error("API key required", {
          hint: "Set the API_KEY environment variable",
          docs: "https://docs.example.com/auth"
        });
      }
      
      const t = ctx.task(`Deploying to ${env}`);
      await t.step("Building", build);
      await t.step("Uploading", upload);
      t.success("Done!");
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
    index.ts          # Entry point
    commands/
      deploy.ts       # Deploy command
      db/
        migrate.ts    # db migrate subcommand
        seed.ts       # db seed subcommand
  package.json
  tsconfig.json
  tsup.config.ts
```

---

## Next Steps

- [Why EasyCLI?](./why-easycli.md) - Framework comparisons
- [Features](./features.md) - Complete feature guide
- [API Reference](./api-reference.md) - Full API docs
- [Building Beautiful CLIs](./building-beautiful-clis.md) - End-to-end guide
