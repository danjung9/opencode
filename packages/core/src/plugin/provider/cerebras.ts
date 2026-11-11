import { Effect } from "effect"
import { define } from "@warcode/plugin/effect/plugin"

export const CerebrasPlugin = define({
  id: "warcode.provider.cerebras",
  effect: Effect.fn(function* (ctx) {
    yield* ctx.provider.transform((evt) => {
      for (const item of evt.list()) {
        if (item.provider.package !== "@warcode/ai/providers/cerebras") continue
        evt.update(item.provider.id, (provider) => {
          provider.headers = { ...provider.headers, "X-Cerebras-3rd-Party-Integration": "warcode" }
        })
      }
    })
  }),
})
