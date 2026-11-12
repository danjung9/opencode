import { Effect } from "effect"
import { define } from "@warcode/plugin/effect/plugin"

export const NvidiaPlugin = define({
  id: "warcode.provider.nvidia",
  effect: Effect.fn(function* (ctx) {
    yield* ctx.provider.transform((evt) => {
      for (const item of evt.list()) {
        if (item.provider.package !== "@warcode/ai/providers/openai-compatible") continue
        if (item.provider.settings?.baseURL !== "https://integrate.api.nvidia.com/v1") continue
        evt.update(item.provider.id, (provider) => {
          provider.headers = {
            ...provider.headers,
            "HTTP-Referer": "https://opencode.ai/",
            "X-Title": "warcode",
            "X-BILLING-INVOKE-ORIGIN": provider.headers?.["X-BILLING-INVOKE-ORIGIN"] ?? "Warcode",
          }
        })
      }
    })
  }),
})
