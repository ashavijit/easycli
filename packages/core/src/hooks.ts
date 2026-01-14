import type { CLIHooks, HookContext, PluginDef } from "./types.js";

export function createHookRunner(
  hooks?: CLIHooks,
  plugins?: PluginDef[]
): {
  runOnInit: () => Promise<void>;
  runOnBeforeCommand: (ctx: HookContext) => Promise<void>;
  runOnAfterCommand: (ctx: HookContext) => Promise<void>;
  runOnError: (error: Error, ctx: HookContext) => Promise<void>;
  runOnExit: (code: number) => Promise<void>;
} {
  const allHooks: CLIHooks[] = [];

  if (hooks) {
    allHooks.push(hooks);
  }

  if (plugins) {
    for (const plugin of plugins) {
      if (plugin.hooks) {
        allHooks.push(plugin.hooks);
      }
    }
  }

  return {
    async runOnInit() {
      for (const h of allHooks) {
        if (h.onInit) {
          await h.onInit();
        }
      }
    },

    async runOnBeforeCommand(ctx: HookContext) {
      for (const h of allHooks) {
        if (h.onBeforeCommand) {
          await h.onBeforeCommand(ctx);
        }
      }
    },

    async runOnAfterCommand(ctx: HookContext) {
      for (const h of allHooks) {
        if (h.onAfterCommand) {
          await h.onAfterCommand(ctx);
        }
      }
    },

    async runOnError(error: Error, ctx: HookContext) {
      for (const h of allHooks) {
        if (h.onError) {
          await h.onError(error, ctx);
        }
      }
    },

    async runOnExit(code: number) {
      for (const h of allHooks) {
        if (h.onExit) {
          await h.onExit(code);
        }
      }
    }
  };
}
