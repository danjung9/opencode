import {
  evaluatePluginBundle,
  inertModule,
  mainOnlyModule,
  type PluginModule,
  type Entry,
} from "@warcode/plugin/gui/host"

// Plugin bundles share the host's module instances, so tokens, contexts and schemas they import are the same objects
// the host checks against. In a window, the main SDK's name resolves to the window SDK.
const modules = {
  effect: () => import("effect"),
  "@warcode/plugin/gui": () => import("@warcode/plugin/gui"),
  "@warcode/plugin/gui/main": () => import("@warcode/plugin/gui"),
  "@warcode/plugin/gui/file": () => import("@warcode/plugin/gui/file"),
  "@warcode/plugin/gui/review": () => import("@warcode/plugin/gui/review"),
  "@warcode/plugin/gui/browser": () => import("@warcode/plugin/gui/browser"),
  "@warcode/plugin/rpc": () => import("@warcode/plugin/rpc"),
  "@warcode/schema/rpc": () => import("@warcode/schema/rpc"),
  "@warcode/client": () => import("@warcode/client"),
  "@warcode/client/effect": () => import("@warcode/client/effect"),
  "@warcode/client/solid": () => import("@warcode/client/solid"),
  "solid-js": () => import("solid-js"),
  "solid-js/web": () => import("solid-js/web"),
  "solid-js/store": () => import("solid-js/store"),
} satisfies Record<PluginModule, () => Promise<object>>

/**
 * Builds a host `Entry` for a plugin's `./gui-experimental` bundle, read from the desktop app's own server. The
 * bundle is evaluated here so the host reads its `Plugin.define` declarations (`os`, `stores`, `i18n`) before it
 * activates the plugin. A plugin with only a `main` setup gets an empty window setup, so it still lists as active. It
 * takes the server plugin's id. A bundle that fails to evaluate becomes an entry that fails, so Extensions › Plugins
 * reports it.
 */
export async function pluginDefinition(id: string, code: string): Promise<Entry> {
  const loaded = new Map<string, object>(
    await Promise.all(Object.entries(modules).map(async ([name, load]) => [name, await load()] as const)),
  )

  const bundle = await Promise.try(() =>
    evaluatePluginBundle(code, {
      process: "window",
      require: (name) => {
        const module = loaded.get(name)

        if (module) return module

        if (mainOnlyModule(name)) return inertModule(name)

        throw new Error(`Plugin GUI bundle requires a module the app does not share: ${name}`)
      },
    }),
  ).then(
    (value) => ({ ok: true as const, value }),
    (cause: unknown) => ({ ok: false as const, cause }),
  )

  if (!bundle.ok) return { id, windowEntry: () => Promise.reject(bundle.cause) }

  const setup = bundle.value.setup

  // A setup's returned cleanup reaches the host, which runs it when the plugin goes away.
  return { ...bundle.value.definition, id, windowEntry: async () => ({ default: (ctx: never) => setup?.(ctx) }) }
}
