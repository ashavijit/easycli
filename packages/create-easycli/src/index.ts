import { join, resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { createInterface } from "node:readline";
import { box, colors, spinner } from "@easycli/ui";


async function promptText(message: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${colors.cyan("?")} ${message}: `, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function promptSelect<T extends string>(message: string, options: T[]): Promise<T> {
  console.log(`${colors.cyan("?")} ${message}:`);
  options.forEach((opt, i) => {
    console.log(`  ${colors.dim(`${i + 1}.`)} ${opt}`);
  });
  
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${colors.dim("Select (1-" + options.length + "):")} `, (answer) => {
      rl.close();
      const index = parseInt(answer, 10) - 1;
      resolve(options[index] ?? options[0] as T);
    });
  });
}

async function main() {

  console.log();
  console.log(box([
    "",
    `  ${colors.bold(colors.cyan("🚀 create-easycli"))}`,
    `  ${colors.dim("The modern CLI framework")}`,
    ""
  ], {
    borderStyle: "rounded",
    borderColor: "cyan",
    padding: 0
  }));
  console.log();


  const args = process.argv.slice(2);
  let projectName = args[0];

  if (!projectName) {
    projectName = await promptText("Project name");
  }

  if (!projectName || projectName.trim() === "") {
    console.error(colors.red("✖ Project name is required"));
    process.exit(1);
  }

  projectName = projectName.trim().toLowerCase().replace(/\s+/g, "-");


  const targetDir = resolve(process.cwd(), projectName);
  if (existsSync(targetDir)) {
    console.error(colors.red(`✖ Directory "${projectName}" already exists`));
    process.exit(1);
  }


  const template = await promptSelect("Template", [
    "basic",
    "advanced"
  ]);


  const packageManager = await promptSelect("Package manager", [
    "pnpm",
    "npm", 
    "yarn"
  ]);

  console.log();


  const s = spinner("Creating project...");
  s.start();

  try {

    await mkdir(targetDir, { recursive: true });
    await mkdir(join(targetDir, "src"), { recursive: true });


    const pkg = {
      name: projectName,
      version: "1.0.0",
      type: "module",
      main: "./dist/index.js",
      bin: {
        [projectName]: "./dist/index.js"
      },
      scripts: {
        build: "tsup",
        dev: "tsx src/index.ts",
        start: "node dist/index.js"
      },
      dependencies: {
        "@easycli/core": "^0.0.1",
        "@easycli/ui": "^0.0.1"
      },
      devDependencies: {
        tsup: "^8.0.1",
        tsx: "^4.7.0",
        typescript: "^5.3.3"
      }
    };

    await writeFile(
      join(targetDir, "package.json"),
      JSON.stringify(pkg, null, 2)
    );


    const tsconfig = {
      compilerOptions: {
        target: "ES2022",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        esModuleInterop: true,
        strict: true,
        skipLibCheck: true,
        outDir: "./dist",
        rootDir: "./src",
        declaration: true
      },
      include: ["src/**/*"]
    };

    await writeFile(
      join(targetDir, "tsconfig.json"),
      JSON.stringify(tsconfig, null, 2)
    );


    const tsupConfig = `import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  clean: true,
  dts: true,
  sourcemap: true,
  banner: {
    js: "#!/usr/bin/env node"
  }
});
`;

    await writeFile(join(targetDir, "tsup.config.ts"), tsupConfig);


    const gitignore = `node_modules/
dist/
*.log
.DS_Store
`;

    await writeFile(join(targetDir, ".gitignore"), gitignore);


    const mainFile = template === "advanced" 
      ? generateAdvancedTemplate(projectName)
      : generateBasicTemplate(projectName);

    await writeFile(join(targetDir, "src", "index.ts"), mainFile);

    s.success("Project created");


    const installSpinner = spinner("Installing dependencies...");
    installSpinner.start();

    try {
      const installCmd = packageManager === "npm" 
        ? "npm install"
        : packageManager === "yarn" 
          ? "yarn"
          : "pnpm install";
      
      execSync(installCmd, { 
        cwd: targetDir, 
        stdio: "pipe" 
      });
      installSpinner.success("Dependencies installed");
    } catch {
      installSpinner.fail("Failed to install dependencies");
      console.log(colors.dim(`  Run "${packageManager === "npm" ? "npm install" : packageManager === "yarn" ? "yarn" : "pnpm install"}" manually`));
    }


    console.log();
    console.log(box([
      "",
      colors.green("  ✔ Project ready!"),
      "",
      colors.dim("  Next steps:"),
      "",
      `    ${colors.cyan("cd")} ${projectName}`,
      `    ${colors.cyan(packageManager === "npm" ? "npm run" : packageManager)} dev hello World`,
      ""
    ], {
      borderStyle: "rounded",
      borderColor: "green",
      padding: 0
    }));
    console.log();

  } catch (error) {
    s.fail("Failed to create project");
    console.error(error);
    process.exit(1);
  }
}

function generateBasicTemplate(name: string): string {
  return `#!/usr/bin/env node
import { defineCLI } from "@easycli/core";
import { colors, spinner, box } from "@easycli/ui";

const cli = defineCLI({
  name: "${name}",
  version: "1.0.0",
  description: "My awesome CLI built with EasyCLI",

  commands: {
    hello: {
      description: "Say hello to someone",
      args: {
        name: { type: "string", description: "Name to greet" }
      },
      flags: {
        loud: { type: "boolean", alias: "l", description: "Shout the greeting" },
        times: { type: "number", alias: "t", default: 1, description: "Repeat N times" }
      },
      run({ name, loud, times }) {
        const greeting = \`Hello, \${name}!\`;
        const message = loud ? greeting.toUpperCase() : greeting;
        
        for (let i = 0; i < (times ?? 1); i++) {
          console.log(loud ? colors.bold(colors.red(message)) : colors.green(message));
        }
      }
    }
  }
});

cli.run();
`;
}

function generateAdvancedTemplate(name: string): string {
  return `#!/usr/bin/env node
import { defineCLI } from "@easycli/core";
import { colors, spinner, box, progress, table } from "@easycli/ui";

const cli = defineCLI({
  name: "${name}",
  version: "1.0.0",
  description: "My awesome CLI built with EasyCLI",

  commands: {
    hello: {
      description: "Say hello to someone",
      args: {
        name: { type: "string", description: "Name to greet" }
      },
      flags: {
        loud: { type: "boolean", alias: "l", description: "Shout it!" }
      },
      run({ name, loud }) {
        const msg = \`Hello, \${name}!\`;
        console.log(loud ? colors.bold(colors.red(msg.toUpperCase())) : colors.green(msg));
      }
    },

    project: {
      description: "Project management commands",
      commands: {
        list: {
          description: "List all projects",
          run() {
            table([
              { name: "api-server", status: "running" },
              { name: "web-app", status: "stopped" },
              { name: "worker", status: "running" }
            ]);
          }
        },
        
        create: {
          description: "Create a new project",
          args: {
            name: { type: "string", description: "Project name" }
          },
          async run({ name }) {
            const s = spinner(\`Creating project "\${name}"...\`);
            s.start();
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            s.success(\`Project "\${name}" created!\`);
            
            console.log();
            console.log(box([
              "",
              \`  cd \${name}\`,
              "  npm install",
              "  npm run dev",
              ""
            ], {
              title: " Next Steps ",
              borderStyle: "rounded",
              borderColor: "cyan"
            }));
          }
        }
      }
    },

    sync: {
      description: "Sync data with remote",
      flags: {
        force: { type: "boolean", alias: "f", description: "Force sync" }
      },
      async run({ force }) {
        console.log(force ? colors.yellow("Force syncing...") : "Syncing...");
        
        const bar = progress(100);
        for (let i = 0; i <= 100; i += 10) {
          bar.update(i);
          await new Promise(resolve => setTimeout(resolve, 150));
        }
        bar.complete();
        
        console.log(colors.green("✔ Sync complete!"));
      }
    }
  }
});

cli.run();
`;
}

main().catch(console.error);
