# @easycli/config

Zero-config configuration loader for EasyCLI apps.

## Features

- **Zero Config**: Works out of the box.
- **Hierarchical Loading**: Loads from home directory, project directory, and environment variables.
- **Multiple Formats**: Supports JSON, JS, and TS config files.
- **Type Safe**: Fully typed with TypeScript.

## Installation

```bash
pnpm add @easycli/config
```

## Usage

```ts
import { loadConfig } from "@easycli/config";

interface MyConfig {
  port: number;
  dbUrl: string;
}

// Loads and merges config from all supported sources
const config = await loadConfig<MyConfig>();

console.log(config);
```

## Configuration Search Order

Configuration is merged in the following order (last one wins):

1. **Home Directory**: `~/.easyclirc.json`
2. **Project Directory** (searched in order):
   - `.easyclirc.json`
   - `.easyclirc`
   - `easycli.config.json`
   - `easycli.config.js`
   - `easycli.config.ts`
3. **Environment Variables**: Variables starting with `EASYCLI_`
   - `EASYCLI_PORT=3000` -> `{ port: 3000 }`
   - `EASYCLI_DB_URL=postgres://...` -> `{ db: { url: "postgres://..." } }`

## API

### `loadConfig<T>(options?: ConfigLoaderOptions): Promise<T>`

Loads the configuration.

- **options.cwd**: Directory to search for config files (default: `process.cwd()`)
- **options.name**: Config name namespace (default: "easycli")
