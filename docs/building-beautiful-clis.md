# Building Beautiful CLI Apps

In 2026, Command Line Interfaces (CLIs) don't have to be boring black-and-white text streams. Developers expect **polished**, **interactive**, and **informative** tools that rival the UX of web applications.

This guide will walk you through building a stunning CLI using **EasyCLI**.

---

## 1. The Foundation: Type-Safe Command Structure

Great UX starts with a solid DX. EasyCLI ensures your commands are robust and self-documenting.

```typescript
import { defineCLI } from "@easycli/core";

// Define your CLI structure clearly
const cli = defineCLI({
  name: "deploy-tool",
  version: "1.0.0",
  commands: {
    // Commands are nested objects - easy to read, easy to refactor
    deploy: {
      description: "Deploy the application to the cloud",
      args: { env: ["prod", "staging"] }, // Typed arguments!
      run({ env }) {
        // 'env' is strongly typed as "prod" | "staging"
      }
    }
  }
});
```

## 2. Visual Hierarchy with Colors

Use colors meaningfully, not randomly.
- **Green**: Success, safe actions.
- **Red**: Errors, dangerous actions.
- **Cyan/Blue**: Info, headers, primary keys.
- **Dim/Gray**: Secondary info, hints.

```typescript
import { colors } from "@easycli/ui";

console.log(colors.cyan(colors.bold("\n🚀 DEPLOYMENT INITIATED\n")));
console.log(`${colors.dim("Target:")}   ${colors.green("Production")}`);
console.log(`${colors.dim("Region:")}   ${colors.yellow("us-east-1")}`);
```

## 3. Handling Time with Spinners

Never let the user guess if the app is frozen. Use spinners for any async operation longer than 500ms.

```typescript
import { spinner } from "@easycli/ui";

const s = spinner("Building docker image...");
s.start();

try {
  await buildImage();
  s.success("Image built successfully"); // Replaces spinner with ✔
} catch (err) {
  s.fail("Build failed"); // Replaces spinner with ✖
}
```

## 4. Visualizing Data with Tables

Don't dump JSON. Use tables to present structured data cleanly.

```typescript
import { table } from "@easycli/ui";

const resources = [
  { ID: "i-0a1b2c", Type: "t3.micro", Status: "Running" },
  { ID: "i-0d4e5f", Type: "t3.large", Status: "Stopped" },
];

// EasyCLI tables handle column width and padding automatically
// Bonus: Add color logic to your status fields!
table(resources);
```

## 5. Engaging Progress Bars

For deterministic long-running tasks (uploads, downloads), show a progress bar.

```typescript
import { progress } from "@easycli/ui";

const bar = progress(100); // 100% total

for (let i = 0; i <= 100; i += 10) {
  await uploadChunk();
  bar.update(i);
}

bar.complete();
```

---

## Putting It All Together

A beautiful CLI combines these elements into a seamless flow:

1.  **Clear Entry**: Friendly greeting and status summary.
2.  **Guided Action**: Spinners for waiting, progress bars for working.
3.  **Clean Exit**: Formatted success message or structured error table.

Check out the [source code for our ui package](../packages/ui) to see how these are built!
