import { describe, expect, test } from "bun:test"
import { Effect, Layer, Stream } from "effect"
import { ai } from "@warcode/ai/effect"
import { LLMClient, RequestExecutor } from "@warcode/ai/route"
import { Credential } from "@warcode/core/credential"
import { Integration } from "@warcode/core/integration"
import { Model } from "@warcode/core/model"
import { ModelResolver } from "@warcode/core/model-resolver"
import { Plugin } from "@warcode/core/plugin"
import { PluginHost } from "@warcode/core/plugin/host"
import { ProviderPlugins } from "@warcode/core/plugin/provider"
import { AdvanaPlugin } from "@warcode/core/plugin/provider/advana"
import { Provider } from "@warcode/core/provider"
import { withEnv } from "../fixture/env"
import { eventually } from "../lib/eventually"
import { testEffect } from "../lib/effect"
import { PluginTestLayer } from "./fixture"

const it = testEffect(PluginTestLayer)
const providerID = Provider.ID.make("advana")
const addPlugin = Effect.fn(function* (baseURL?: string) {
  const plugins = yield* Plugin.Service
  const host = yield* PluginHost.make(plugins, "test")
  if (baseURL) {
    yield* host.provider.transform((providers) => {
      providers.update(providerID, (provider) => {
        provider.settings = { baseURL }
      })
    })
  }
  yield* AdvanaPlugin.effect(host)
})

describe("AdvanaPlugin", () => {
  test("is registered as a built-in provider", () => {
    expect(ProviderPlugins.map((plugin) => plugin.id)).toContain(AdvanaPlugin.id)
  })

  it.effect("offers an API key connection and the specified Responses endpoint", () =>
    withEnv({ ADVANA_API_KEY: undefined }, () =>
      Effect.gen(function* () {
        yield* addPlugin()
        const integrations = yield* Integration.Service
        const providers = yield* Provider.Service
        const models = yield* Model.Service
        expect(yield* integrations.get(Integration.ID.make(providerID))).toMatchObject({
          name: "Advana",
          methods: expect.arrayContaining([
            expect.objectContaining({ type: "key", label: "Advana API key" }),
            expect.objectContaining({ type: "env", names: ["ADVANA_API_KEY"] }),
          ]),
        })
        expect(yield* providers.get(providerID)).toMatchObject({
          name: "Advana",
          integrationID: providerID,
          package: "@warcode/ai/providers/openai-compatible-responses",
          settings: { baseURL: "https://advana-platform.cloud.databricks.mil/ai-gateway/openai/v1" },
        })
        expect(yield* providers.available()).toEqual([])
        expect(yield* models.available()).toEqual([])
      }),
    ),
  )

  it.effect("makes both models available through an environment connection", () =>
    withEnv({ ADVANA_API_KEY: "test-key" }, () =>
      Effect.gen(function* () {
        yield* addPlugin()
        const models = yield* Model.Service
        expect(yield* models.get(providerID, Model.ID.make("system.ai.gpt-5-6-terra"))).toMatchObject({
          name: "GPT 5.6 Terra",
          modelID: "system.ai.gpt-5-6-terra",
          capabilities: { tools: true, input: ["text", "image"], output: ["text"] },
        })
        expect(yield* models.get(providerID, Model.ID.make("system.ai.gpt-5-6-luna"))).toMatchObject({
          name: "GPT 5.6 Luna",
          modelID: "system.ai.gpt-5-6-luna",
          capabilities: { tools: false, input: ["text"], output: ["text"] },
        })
        expect((yield* models.available()).map((model) => model.modelID)).toEqual([
          Model.ID.make("system.ai.gpt-5-6-terra"),
          Model.ID.make("system.ai.gpt-5-6-luna"),
        ])
      }),
    ),
  )

  it.live("connects after startup and sends both model IDs to /responses with bearer authentication", () =>
    withEnv({ ADVANA_API_KEY: undefined }, () =>
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
              return new Response('data: {"type":"response.completed","response":{"id":"resp_test"}}\n\n', {
                headers: { "content-type": "text/event-stream" },
              })
            },
          })
          return { server, requests }
        }),
        ({ server, requests }) =>
          Effect.gen(function* () {
            yield* addPlugin(`${server.url.origin}/ai-gateway/openai/v1`)
            const integrations = yield* Integration.Service
            yield* integrations.connection.key({ integrationID: Integration.ID.make(providerID), key: "test-key" })
            const models = yield* Model.Service
            const available = yield* eventually(models.available(), (items) => items.length === 2)
            yield* Effect.forEach(available, (model) =>
              Effect.gen(function* () {
                const resolved = yield* ModelResolver.resolveModel(
                  model,
                  undefined,
                  Credential.Key.make({ type: "key", key: "test-key" }),
                )
                yield* LLMClient.stream(ai.request({ model: resolved, prompt: "Hello" })).pipe(
                  Stream.runDrain,
                  Effect.provide(LLMClient.layer.pipe(Layer.provide(RequestExecutor.layer))),
                )
              }),
            )
            expect(requests).toEqual(
              ["system.ai.gpt-5-6-terra", "system.ai.gpt-5-6-luna"].map((model) => ({
                path: "/ai-gateway/openai/v1/responses",
                authorization: "Bearer test-key",
                body: expect.objectContaining({ model, stream: true }),
              })),
            )
          }),
        ({ server }) => Effect.sync(() => server.stop(true)),
      ),
    ),
  )
})
