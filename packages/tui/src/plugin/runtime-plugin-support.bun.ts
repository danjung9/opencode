import { ensurePluginRuntime, provides } from "@warcode/plugin/runtime"
import { Plugin, PluginContextProvider, usePlugin } from "@warcode/plugin/tui"
import { ensureRuntimePluginSupport } from "@opentui/solid/runtime-plugin-support/configure"

ensurePluginRuntime()
ensureRuntimePluginSupport({
  additional: {
    "@warcode/plugin/tui": { Plugin, PluginContextProvider, usePlugin },
  },
  preserve: provides,
})
