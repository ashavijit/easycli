import { defineCLI } from "@easycli/core";
import { colors } from "@easycli/ui";

const cli = defineCLI({
  name: "simple",
  version: "1.0.0",
  description: "A simple example app",

  commands: {
    hello: {
      description: "Say hello",
      args: {
        name: "string"
      },
      run({ name }) {
        console.log(`Hello, ${name}!`);
      }
    },

    colors: {
      description: "Show off colors",
      run() {
        console.log(colors.bold("\n--- Colors Demo ---\n"));
        
        console.log(colors.red("This is red"));
        console.log(colors.green("This is green"));
        console.log(colors.blue("This is blue"));
        console.log(colors.yellow("This is yellow"));
        console.log(colors.cyan("This is cyan"));
        console.log(colors.magenta("This is magenta"));
        
        console.log("\n" + colors.underline("Styles:"));
        console.log(colors.bold("Bold text"));
        console.log(colors.italic("Italic text"));
        console.log(colors.dim("Dim text"));
        console.log(colors.inverse("Inverse text"));
        console.log(colors.strikethrough("Strikethrough text"));

        console.log("\n" + colors.bgBlue(colors.whiteBright(" Background Colors ")));
      }
    }
  }
});

cli.run();
