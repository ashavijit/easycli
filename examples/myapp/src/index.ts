import { defineCLI } from "@easycli/core";

const tasks: Map<string, { name: string; done: boolean; priority: string }> = new Map();
let nextId = 1;

const cli = defineCLI({
  name: "myapp",
  version: "1.0.0",
  description: "A simple task manager CLI built with EasyCLI",

  commands: {
    add: {
      description: "Add a new task",
      args: {
        name: "string"
      },
      flags: {
        priority: { type: "string", default: "medium", alias: "p" }
      },
      run({ name, priority }) {
        const id = String(nextId++);
        tasks.set(id, { name: name as string, done: false, priority: priority as string });
        console.log(`Task added: [${id}] ${name} (priority: ${priority})`);
      }
    },

    list: {
      description: "List all tasks",
      flags: {
        all: { type: "boolean", default: false, alias: "a" }
      },
      run({ all }) {
        if (tasks.size === 0) {
          console.log("No tasks found.");
          return;
        }
        console.log("\nTasks:");
        console.log("-".repeat(50));
        for (const [id, task] of tasks) {
          if (!all && task.done) continue;
          const status = task.done ? "[x]" : "[ ]";
          console.log(`${status} ${id}. ${task.name} (${task.priority})`);
        }
        console.log("");
      }
    },

    done: {
      description: "Mark a task as complete",
      args: {
        id: "string"
      },
      run({ id }) {
        const task = tasks.get(id as string);
        if (!task) {
          console.log(`Task ${id} not found.`);
          return;
        }
        task.done = true;
        console.log(`Task marked complete: ${task.name}`);
      }
    },

    remove: {
      description: "Remove a task",
      args: {
        id: "string"
      },
      run({ id }) {
        const task = tasks.get(id as string);
        if (!task) {
          console.log(`Task ${id} not found.`);
          return;
        }
        tasks.delete(id as string);
        console.log(`Task removed: ${task.name}`);
      }
    },

    clear: {
      description: "Clear all completed tasks",
      run() {
        let count = 0;
        for (const [id, task] of tasks) {
          if (task.done) {
            tasks.delete(id);
            count++;
          }
        }
        console.log(`Cleared ${count} completed task(s).`);
      }
    },

    interactive: {
      description: "Interactive mode to add tasks",
      async run(_, ctx) {
        const name = await ctx.ask.text("Task name");
        const priority = await ctx.ask.select("Priority", ["low", "medium", "high"]);
        const confirm = await ctx.ask.confirm("Add this task?");

        if (confirm) {
          const id = String(nextId++);
          tasks.set(id, { name, done: false, priority });
          console.log(`Task added: [${id}] ${name} (priority: ${priority})`);
        } else {
          console.log("Task cancelled.");
        }
      }
    },

    demo: {
      description: "Showcase all UI features (Wizard, Spinner, Progress, Table)",
      async run(_, ctx) {
        console.log("\n🚀 EasyCLI UI Demo\n");

        // 1. Wizard Flow
        console.log("--- 1. Wizard Flow ---");
        const [projectName, env] = await ctx.flow([
          () => ctx.ask.text("Project name"),
          () => ctx.ask.select("Environment", ["dev", "staging", "prod"])
        ]);
        console.log(`Setup complete: ${projectName} (${env})`);

        // 2. Multiselect
        console.log("\n--- 2. Multiselect ---");
        const features = await ctx.ask.multiselect(
          "Select features to enable",
          ["auth", "database", "analytics", "realtime"]
        );
        console.log(`Enabled features: ${features.join(", ")}`);

        // 3. Spinner
        console.log("\n--- 3. Spinner ---");
        // Dynamic import to avoid build issues if @easycli/ui isn't in core types yet
        const { spinner, progress, table, box } = await import("@easycli/ui");
        
        // Box demo
        console.log("\\n--- 0. Box Component ---");
        console.log(box("Update available: 1.0.0 → 2.0.0", {
          borderStyle: "rounded",
          borderColor: "yellow",
          padding: 1
        }));
        
        console.log(box([
          "New features:",
          "• Box component",
          "• Better prompts"
        ], {
          title: " What's New ",
          borderStyle: "double",
          borderColor: "cyan"
        }));

        
        const s = spinner("Provisioning resources...");
        s.start();
        await new Promise(r => setTimeout(r, 1500));
        s.success("Resources provisioned");

        // 4. Progress Bar
        console.log("\n--- 4. Progress Bar ---");
        const bar = progress(100);
        let val = 0;
        const interval = setInterval(() => {
          val += 10;
          bar.update(val);
          if (val >= 100) {
            clearInterval(interval);
            bar.complete();
            
            // 5. Table
            console.log("\n--- 5. Table ---");
            table([
              { ID: "srv-123", Name: "api-server", Status: "Running", CPU: "12%" },
              { ID: "srv-124", Name: "worker-01", Status: "Running", CPU: "45%" },
              { ID: "srv-125", Name: "db-primary", Status: "Maintenance", CPU: "0%" }
            ]);
            console.log("\n✨ Demo complete!");
          }
        }, 300);
      }
    }
  },

  hooks: {
    onBeforeCommand({ command }) {
      console.log(`> Running: ${command}`);
    }
  }
});

cli.run();
