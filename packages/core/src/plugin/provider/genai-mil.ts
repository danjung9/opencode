import { Effect } from "effect"
import { define } from "@warcode/plugin/effect/plugin"
import { Form } from "@warcode/schema/form"
import { Integration } from "../../integration.js"
import { Model } from "../../model.js"
import { Provider } from "../../provider.js"
import { configuredSettings } from "./configured.js"
import { credentialSettings, metadataSettings } from "./credential-settings.js"

const providerID = Provider.ID.make("genai-mil")

export const GenAIMilPlugin = define({
  id: "warcode.provider.genai.mil",
  effect: Effect.fn(function* (ctx) {
    const configured = yield* configuredSettings(providerID)
    const baseURL = configured?.baseURL ?? process.env.GENAI_MIL_BASE_URL
    const modelIDs = configured?.modelIDs ?? process.env.GENAI_MIL_MODELS
    yield* ctx.integration.transform((editor) => {
      editor.update(providerID, (integration) => (integration.name = "GenAI.mil"))
      editor.method.update({
        integrationID: providerID,
        method: {
          type: "key",
          label: "GenAI.mil API key",
          form: Form.Fields.make([
            {
              type: "string",
              key: "baseURL",
              title: "API base URL",
              description:
                "Use the OpenAI-compatible API base URL supplied by GenAI.mil, including its API version path.",
              format: "uri",
              pattern: "^https?://",
              required: true,
              ...(typeof baseURL === "string" ? { default: baseURL } : {}),
            },
            {
              type: "string",
              key: "modelIDs",
              title: "Model IDs",
              description: "Enter the model IDs available to your account, separated by commas.",
              required: true,
              ...(typeof modelIDs === "string" ? { default: modelIDs } : {}),
            },
          ]),
        },
      })
      editor.method.update({
        integrationID: providerID,
        method: { type: "env", names: ["GENAI_MIL_API_KEY"] },
      })
    })
    const login = yield* credentialSettings(ctx, providerID, (value) =>
      value.type === "key" ? metadataSettings(value.metadata, ["baseURL", "modelIDs"]) : {},
    )
    yield* ctx.provider.transform((providers) => {
      const endpoint = login.settings.baseURL ?? baseURL
      const ids = login.settings.modelIDs ?? modelIDs
      providers.update(providerID, (provider) => {
        provider.name = "GenAI.mil"
        provider.integrationID = Integration.ID.make(providerID)
        provider.package = "@warcode/ai/providers/openai-compatible"
        // No commercial endpoint fallback: requests only use the account's configured endpoint.
        provider.settings = {
          ...provider.settings,
          ...(typeof endpoint === "string" ? { baseURL: endpoint.trim().replace(/\/+$/, "") } : {}),
        }
      })
      if (typeof endpoint !== "string" || !/^https?:\/\//.test(endpoint.trim()) || typeof ids !== "string") return
      for (const id of new Set(
        ids
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean),
      )) {
        providers.models.update(providerID, Model.ID.make(id), (model) => {
          model.modelID = Model.ID.make(id)
          model.name = id
          model.capabilities = { tools: true, input: ["text"], output: ["text"] }
        })
      }
    })
  }),
})
