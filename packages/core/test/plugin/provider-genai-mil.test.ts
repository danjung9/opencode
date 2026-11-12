import { describe, expect } from "bun:test"
import { Effect, Layer, Stream } from "effect"
import { ai } from "@warcode/ai/effect"
import { LLMClient, RequestExecutor } from "@warcode/ai/route"
import { Credential } from "@warcode/core/credential"
import { Integration } from "@warcode/core/integration"
import { Model } from "@warcode/core/model"
import { ModelResolver } from "@warcode/core/model-resolver"
import { Plugin } from "@warcode/core/plugin"
import { PluginHost } from "@warcode/core/plugin/host"
import { GenAIMilPlugin } from "@warcode/core/plugin/provider/genai-mil"
import { Provider } from "@warcode/core/provider"
import { withEnv } from "../fixture/env"
import { testEffect } from "../lib/effect"
import { PluginTestLayer } from "./fixture"
import { eventually } from "../lib/eventually"

const it = testEffect(PluginTestLayer)
const providerID = Provider.ID.make("genai-mil")
const environment = { GENAI_MIL_API_KEY: undefined, GENAI_MIL_BASE_URL: undefined, GENAI_MIL_MODELS: undefined }
const addPlugin = Effect.fn(function* () {
  const plugins = yield* Plugin.Service
  const host = yield* PluginHost.make(plugins, "test")
  yield* GenAIMilPlugin.effect(host)
})

describe("GenAIMilPlugin", () => {
  it.live("connects after startup and sends inference to the supplied endpoint with bearer authentication", () =>
    withEnv(environment, () =>
      Effect.acquireUseRelease(
        Effect.sync(() => {
          const requests: { path: string; authorization: string | null; body: unknown }[] = []
          const server = Bun.serve({
            port: 0,
            fetch: async (request) => {
              requests.push({
                path: new URL(request.url).pathname,
                authorization: request.headers.get("authorization"),
                body: await request.json(),
              })
              return new Response(
                'data: {"id":"test","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":"Connected"},"finish_reason":null}]}\n\ndata: {"id":"test","object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
                { headers: { "content-type": "text/event-stream" } },
              )
            },
          })
          return { server, requests }
        }),
        ({ server, requests }) =>
          Effect.gen(function* () {
            yield* addPlugin()
            const integrations = yield* Integration.Service
            yield* integrations.connection.key({
              integrationID: Integration.ID.make(providerID),
              key: "test-key",
              answer: { baseURL: `${server.url.origin}/tenant/v1`, modelIDs: "account-model" },
            })
            const models = yield* Model.Service
            const available = yield* eventually(models.available(), (items) =>
              items.some((model) => model.providerID === providerID),
            )
            const model = available.find((model) => model.providerID === providerID)
            if (!model) throw new Error("Expected GenAI.mil model")
            const resolved = yield* ModelResolver.resolveModel(
              model,
              undefined,
              Credential.Key.make({ type: "key", key: "test-key" }),
            )
            yield* LLMClient.stream(ai.request({ model: resolved, prompt: "Hello" })).pipe(
              Stream.runDrain,
              Effect.provide(LLMClient.layer.pipe(Layer.provide(RequestExecutor.layer))),
            )
            expect(requests).toHaveLength(1)
            expect(requests[0]).toMatchObject({
              path: "/tenant/v1/chat/completions",
              authorization: "Bearer test-key",
              body: { model: "account-model", stream: true },
            })
          }),
        ({ server }) => Effect.sync(() => server.stop(true)),
      ),
    ),
  )

  it.effect("requires an endpoint and model IDs and offers no invented default models", () =>
    withEnv(environment, () =>
      Effect.gen(function* () {
        yield* addPlugin()
        const integrations = yield* Integration.Service
        const providers = yield* Provider.Service
        const models = yield* Model.Service
        expect((yield* integrations.get(Integration.ID.make(providerID)))?.methods).toContainEqual({
          type: "key",
          label: "GenAI.mil API key",
          form: [
            expect.objectContaining({ key: "baseURL", format: "uri", required: true }),
            expect.objectContaining({ key: "modelIDs", required: true }),
          ],
        })
        expect((yield* providers.get(providerID))?.name).toBe("GenAI.mil")
        expect((yield* providers.get(providerID))?.settings?.baseURL).toBeUndefined()
        expect(yield* providers.available()).toEqual([])
        expect(yield* models.available()).toEqual([])
      }),
    ),
  )

  it.effect("uses the saved endpoint and models with the OpenAI-compatible adapter", () =>
    withEnv(environment, () =>
      Effect.gen(function* () {
        const credentials = yield* Credential.Service
        yield* credentials.create({
          integrationID: Integration.ID.make(providerID),
          value: Credential.Key.make({
            type: "key",
            key: "test-key",
            metadata: {
              baseURL: "https://gateway.example.test/openai/v1/",
              modelIDs: " model-one,model-two,model-one ",
            },
          }),
        })
        yield* addPlugin()
        const providers = yield* Provider.Service
        const models = yield* Model.Service
        expect((yield* providers.get(providerID))?.package).toBe("@warcode/ai/providers/openai-compatible")
        expect((yield* providers.get(providerID))?.settings).toEqual({
          baseURL: "https://gateway.example.test/openai/v1",
        })
        expect((yield* models.available()).map((model) => model.modelID)).toEqual([
          Model.ID.make("model-one"),
          Model.ID.make("model-two"),
        ])
      }),
    ),
  )
})
