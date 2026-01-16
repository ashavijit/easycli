import { defineCLI } from "easycli-core";
import { colors, spinner } from "easycli-ui";

const cli = defineCLI({
  name: "create-next-app",
  version: "14.1.0",
  description: "The best way to start a Next.js app",

  commands: {
    // Default command
    root: {
      description: "Initialize a new project",
      args: {
        project: { type: "string", optional: true }
      },
      async run({ project }, ctx) {
        console.log(colors.bold("\n🚀 Welcome to the Next.js CLI clone!\n"));

        // 1. Gather inputs
        const projectName = project || await ctx.ask.text("What is your project named?", "my-app");
        
        const isTS = await ctx.ask.confirm("Would you like to use TypeScript?");
        const isESLint = await ctx.ask.confirm("Would you like to use ESLint?");
        const isTailwind = await ctx.ask.confirm("Would you like to use Tailwind CSS?");
        const isSrcDir = await ctx.ask.confirm("Would you like to use `src/` directory?");
        const isAppRouter = await ctx.ask.confirm("Would you like to use App Router? (recommended)");
        const alias = await ctx.ask.text("What import alias would you like configured?", "@/*");

        console.log(""); // Spacer

        // 2. Simulate Installation
        const s = spinner(`Creating a new Next.js app in ${colors.green(process.cwd() + "/" + projectName)}.`);
        s.start();

        await sleep(800);
        s.stop();
        console.log(`
Using:
${colors.cyan("✔")} ${colors.bold(isTS ? "TypeScript" : "JavaScript")}
${colors.cyan("✔")} ${colors.bold(isESLint ? "ESLint" : "No ESLint")}
${colors.cyan("✔")} ${colors.bold(isTailwind ? "Tailwind CSS" : "No Tailwind")}
${colors.cyan("✔")} ${colors.bold(isSrcDir ? "src/ directory" : "No src/ directory")}
${colors.cyan("✔")} ${colors.bold(isAppRouter ? "App Router" : "Pages Router")}
${colors.cyan("✔")} Import alias: ${colors.bold(alias)}
`);

        const s2 = spinner("Installing dependencies...");
        s2.start();
        await sleep(2000); // Fake npm install
        s2.success("Dependencies installed");

        const s3 = spinner("Initializing git...");
        s3.start();
        await sleep(500);
        s3.success("Git initialized");

        // 3. Success Message
        console.log(colors.green(`\nSuccess! Created ${projectName} at ${process.cwd()}/${projectName}\n`));
        console.log("Inside that directory, you can run several commands:\n");
        
        console.log(`  ${colors.cyan("npm run dev")}`);
        console.log("    Starts the development server.\n");

        console.log(`  ${colors.cyan("npm run build")}`);
        console.log("    Builds the app for production.\n");

        console.log(`  ${colors.cyan("npm start")}`);
        console.log("    Runs the built app in production mode.\n");

        console.log("We suggest that you begin by typing:\n");
        console.log(`  ${colors.cyan("cd")} ${projectName}`);
        console.log(`  ${colors.cyan("npm run dev")}`);
        console.log("");
      }
    }
  }
});

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

cli.run();
