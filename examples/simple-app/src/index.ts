
import { defineCLI } from "easycli-core";
import {
  colors,
  spinner,
  progress,
  table,
  box,
  timeline,
  diff,
  objectDiff,
  dashboard,
  sparkline,
  barChart,
  badge,
  borderedBadge,
  statusSummary,
  card,
  tree,
  pathsToTree,
  preview,
  heatmap,
  activityGrid,
  toast,
  banner
} from "easycli-ui";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const cli = defineCLI({
  name: "ui-demo",
  version: "1.0.0",
  description: "Demonstrates all EasyCLI UI components",

  commands: {
    timeline: {
      description: "Timeline/Stepper UI demo",
      async run() {
        console.log(colors.bold("\nTimeline Demo\n"));

        console.log(timeline([
          { name: "Build", status: "success", duration: 12 },
          { name: "Test", status: "success", duration: 8 },
          { name: "Deploy", status: "success", duration: 21 },
          { name: "Verify", status: "running" }
        ]));

        console.log("\n" + colors.dim("With pending steps:") + "\n");

        console.log(timeline([
          { name: "Initialize", status: "success" },
          { name: "Download", status: "running" },
          { name: "Install", status: "pending" },
          { name: "Configure", status: "pending" }
        ]));
      }
    },

    diff: {
      description: "Diff viewer demo",
      run() {
        console.log(colors.bold("\nSide-by-Side Diff\n"));

        console.log(diff(
          ["port: 3000", "debug: false", "cache: true"],
          ["port: 4000", "debug: true", "cache: true", "timeout: 30"]
        ));

        console.log("\n" + colors.bold("Object Diff\n"));

        console.log(objectDiff(
          { port: 3000, debug: false, region: "us-east" },
          { port: 4000, debug: true, region: "us-east", timeout: 30 }
        ));
      }
    },

    dashboard: {
      description: "Dashboard/HUD demo",
      run() {
        console.log(colors.bold("\nDashboard Demo\n"));

        console.log(dashboard([
          { label: "CPU", value: 68, unit: "%" },
          { label: "Memory", value: 54, unit: "%" },
          { label: "Disk", value: 32, unit: "%" },
          { label: "Network", value: 85, unit: "%", thresholds: { warning: 70, danger: 90 } }
        ]));
      }
    },

    /**
     * Sparkline demo
     */
    sparkline: {
      description: "Sparkline/chart demo",
      run() {
        console.log(colors.bold("\nSparkline Demo\n"));

        const requests = [10, 25, 40, 35, 50, 45, 60, 55, 70, 65, 80];
        const latency = [80, 75, 60, 65, 50, 55, 40, 45, 30, 35, 20];

        console.log("Requests: " + sparkline(requests, { color: "green" }));
        console.log("Latency:  " + sparkline(latency, { color: "cyan" }));

        console.log("\n" + colors.bold("Bar Chart\n"));

        console.log(barChart([
          { label: "Monday", value: 120 },
          { label: "Tuesday", value: 85 },
          { label: "Wednesday", value: 150 },
          { label: "Thursday", value: 95 },
          { label: "Friday", value: 200 }
        ]));
      }
    },

    /**
     * Badges demo
     */
    badges: {
      description: "Status badges/pills demo",
      run() {
        console.log(colors.bold("\nBadge Demo\n"));

        console.log(badge("success", "DEPLOYED"));
        console.log(badge("error", "FAILED"));
        console.log(badge("warning", "PENDING"));
        console.log(badge("running", "IN PROGRESS"));

        console.log("\n" + colors.bold("Bordered Badges\n"));

        console.log(borderedBadge("success", "RUNNING"));
        console.log(borderedBadge("error", "FAILED"));
        console.log(borderedBadge("pending", "QUEUED"));

        console.log("\n" + colors.bold("Status Summary\n"));

        console.log(statusSummary({
          success: 12,
          error: 2,
          warning: 3,
          pending: 5
        }));
      }
    },

    /**
     * Card demo
     */
    cards: {
      description: "Card UI demo",
      run() {
        console.log(colors.bold("\nCard Demo\n"));

        console.log(card([
          { label: "Status", value: "Running", color: "green" },
          { label: "Port", value: 3000, color: "cyan" },
          { label: "Region", value: "us-east" },
          { label: "Uptime", value: "99.9%" }
        ], { title: "API Server", borderColor: "cyan" }));

        console.log("");

        console.log(card([
          { label: "Queue", value: "3 jobs" },
          { label: "Memory", value: "256 MB" },
          { label: "Status", value: "Healthy", color: "green" }
        ], { title: "Worker" }));
      }
    },

    /**
     * Tree demo
     */
    tree: {
      description: "Tree view demo",
      run() {
        console.log(colors.bold("\nTree View Demo\n"));

        console.log(tree({
          name: "my-project",
          children: [
            {
              name: "src",
              children: [
                { name: "index.ts" },
                { name: "utils.ts" },
                {
                  name: "components",
                  children: [
                    { name: "Button.tsx" },
                    { name: "Card.tsx" }
                  ]
                }
              ]
            },
            { name: "package.json" },
            { name: "tsconfig.json" }
          ]
        }));

        console.log("\n" + colors.bold("From Paths\n"));

        console.log(tree(pathsToTree([
          "src/index.ts",
          "src/utils/helpers.ts",
          "src/utils/format.ts",
          "tests/unit.test.ts",
          "package.json"
        ])));
      }
    },

    /**
     * Preview demo
     */
    preview: {
      description: "Command preview/dry-run demo",
      run() {
        console.log(colors.bold("\nPreview Demo\n"));

        console.log(preview([
          { action: "Build project", status: "will" },
          { action: "Upload artifacts", status: "will" },
          { action: "Restart services", status: "warning", details: "~10s downtime" },
          { action: "Invalidate cache", status: "danger", details: "may cause errors" }
        ]));
      }
    },

    /**
     * Heatmap demo
     */
    heatmap: {
      description: "Heatmap/activity grid demo",
      run() {
        console.log(colors.bold("\nHeatmap Demo\n"));

        console.log(heatmap([
          [5, 3, 0, 4, 5],
          [2, 4, 1, 3, 4],
          [1, 2, 5, 4, 3],
          [3, 5, 2, 1, 4]
        ], { colorScheme: "green" }));

        console.log("\n" + colors.bold("Activity Grid\n"));

        console.log(activityGrid([
          [3, 5, 2, 4, 1],
          [4, 3, 5, 2, 3],
          [2, 4, 3, 5, 4],
          [5, 2, 4, 3, 2]
        ], ["Mon", "Tue", "Wed", "Thu", "Fri"]));
      }
    },

    /**
     * Toast demo
     */
    toast: {
      description: "Toast notification demo",
      run() {
        console.log(colors.bold("\nToast Demo\n"));

        console.log(toast("success", "Deployment completed"));
        console.log("");
        console.log(toast("error", "Build failed"));
        console.log("");
        console.log(toast("warning", "Deprecated API"));
        console.log("");
        console.log(toast("info", "New version available"));

        console.log("\n" + colors.bold("Banner\n"));

        console.log(banner("Server started on port 3000", "success"));
      }
    },

    /**
     * All components demo
     */
    all: {
      description: "Run all demos",
      async run() {
        const demos = [
          "timeline", "diff", "dashboard", "sparkline",
          "badges", "cards", "tree", "preview", "heatmap", "toast"
        ];

        for (const demo of demos) {
          console.log("\n" + colors.bgCyan(colors.black(` ${demo.toUpperCase()} `)));
          await delay(500);
        }

        console.log("\n" + colors.green("Run individual demos with: ui-demo <command>"));
      }
    }
  }
});

cli.run();
