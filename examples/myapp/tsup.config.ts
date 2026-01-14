import type { Options } from "tsup";

const config: Options = {
  entry: ["src/index.ts"],
  format: ["esm"],
  clean: true,
  target: "node18",
  outDir: "dist",
  banner: {
    js: "#!/usr/bin/env node"
  }
};

export default config;
