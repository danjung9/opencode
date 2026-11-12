import { Plugin } from "@warcode/plugin/tui"
import { createMermaidCodeBlockRenderer } from "./markdown.js"
import { resolveWarcodeDiagramPalette } from "./palette.js"

export default Plugin.define({
  id: "warcode.merman",
  setup(context) {
    context.markdown.registerCodeBlockRenderer(
      "mermaid",
      createMermaidCodeBlockRenderer(context.renderer, () => ({
        colors: resolveWarcodeDiagramPalette(context.theme, context.themeMode),
      })),
    )
  },
})
