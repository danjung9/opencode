import { Effect } from "effect"
import { define } from "@warcode/plugin/effect/plugin"
import { Integration } from "../../integration.js"
import { Model } from "../../model.js"
import { Provider } from "../../provider.js"

const providerID = Provider.ID.make("advana")

export const AdvanaPlugin = define({
  id: "warcode.provider.advana",
  effect: Effect.fn(function* (ctx) {
    yield* ctx.integration.transform((editor) => {
      editor.update(providerID, (integration) => (integration.name = "Advana"))
      editor.method.update({
        integrationID: providerID,
        method: { type: "key", label: "Advana API key" },
      })
      editor.method.update({
        integrationID: providerID,
        method: { type: "env", names: ["ADVANA_API_KEY"] },
      })
    })
    yield* ctx.provider.transform((providers) => {
      providers.update(providerID, (provider) => {
        provider.name = "Advana"
        provider.integrationID = Integration.ID.make(providerID)
        provider.package = "@warcode/ai/providers/openai-compatible-responses"
        // The Responses adapter appends /responses to this base URL.
        provider.settings = {
          baseURL: "https://advana-platform.cloud.databricks.mil/ai-gateway/openai/v1",
          ...provider.settings,
        }
      })
      providers.models.update(providerID, Model.ID.make("system.ai.gpt-5-6-terra"), (model) => {
        model.modelID = Model.ID.make("system.ai.gpt-5-6-terra")
        model.name = "GPT 5.6 Terra"
        model.capabilities = { tools: true, input: ["text", "image"], output: ["text"] }
      })
      providers.models.update(providerID, Model.ID.make("system.ai.gpt-5-6-luna"), (model) => {
        model.modelID = Model.ID.make("system.ai.gpt-5-6-luna")
        model.name = "GPT 5.6 Luna"
        model.capabilities = { tools: false, input: ["text"], output: ["text"] }
      })
    })
  }),
})
