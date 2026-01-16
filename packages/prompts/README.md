# easycli-prompts

Interactive prompts for EasyCLI applications.

## Features

- **Smart Defaults**: Skips prompts if flags or config values are present.
- **Interactive**: Uses `readline` for text, password, confirm, and select prompts.
- **Unified**: Consistent API regardless of input source.

## Usage

This package is typically used via the `ctx.ask` object available in EasyCLI commands.

```ts
// In a command definition
async run({ ctx }) {
  // Will only prompt if --name flag not provided and not in config
  const name = await ctx.ask.text("What is your name?");
  
  // Will only prompt if --db-password not provided
  const password = await ctx.ask.password("Database password");
  
  const proceed = await ctx.ask.confirm("Continue?");
  
  const type = await ctx.ask.select("Deploy type", ["prod", "staging"]);
}
```

## API

### `ctx.ask.text(message)`

Prompts for text input.

### `ctx.ask.password(message)`

Prompts for hidden text input.

### `ctx.ask.confirm(message)`

Prompts for Yes/No (y/n) confirmation. Returns boolean.

### `ctx.ask.select(message, options)`

Prompts to select one option from a list.
