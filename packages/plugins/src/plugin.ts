export interface HookContext {
  command: string;
  args: Record<string, unknown>;
  flags: Record<string, unknown>;
}

export interface PluginHooks {
  onInit?: () => Promise<void> | void;
  onBeforeCommand?: (ctx: HookContext) => Promise<void> | void;
  onAfterCommand?: (ctx: HookContext) => Promise<void> | void;
  onError?: (error: Error, ctx: HookContext) => Promise<void> | void;
  onExit?: (code: number) => Promise<void> | void;
}

export interface PluginDef {
  name: string;
  hooks?: PluginHooks;
}

export interface PluginContext {
  cwd: string;
  config: Record<string, unknown>;
}

export type PluginFactory = (ctx: PluginContext) => PluginDef;

export function definePlugin(factory: PluginFactory): PluginFactory;
export function definePlugin(def: PluginDef): PluginDef;
/**
 * Defines a new plugin for EasyCLI.
 *
 * @param input - The plugin definition or a factory function that returns a plugin definition.
 * @returns The plugin definition or factory (identity function for type inference).
 *
 * @example
 * ```ts
 * const myPlugin = definePlugin({
 *   name: "my-plugin",
 *   hooks: {
 *     onInit: () => console.log("Init")
 *   }
 * });
 *
 * const myFactoryPlugin = definePlugin((ctx) => ({
 *   name: "my-factory-plugin",
 *   hooks: {
 *     onInit: () => console.log(`Init in ${ctx.cwd}`)
 *   }
 * }));
 * ```
 */
export function definePlugin(
  input: PluginDef | PluginFactory
): PluginDef | PluginFactory {
  return input;
}

export function createPluginRegistry(): {
  register: (plugin: PluginDef) => void;
  getAll: () => PluginDef[];
  getHooks: () => PluginHooks[];
} {
  const plugins: PluginDef[] = [];

  return {
    register(plugin: PluginDef) {
      plugins.push(plugin);
    },

    getAll() {
      return [...plugins];
    },

    getHooks() {
      return plugins.filter((p) => p.hooks).map((p) => p.hooks as PluginHooks);
    }
  };
}
