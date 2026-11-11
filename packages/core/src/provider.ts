export * as Provider from "./provider.js"

import { Context, Effect, Layer, Option, Schema, Stream, Struct } from "effect"
import { Provider } from "@warcode/schema/provider"
import { Model } from "@warcode/schema/model"
import { makeLocationNode } from "@warcode/util/effect/app-node"
import { HttpTimeout, type ProviderPackage } from "@warcode/ai/effect"
import { Npm } from "@warcode/util/npm"
import type { DeepMutable } from "./schema.js"
import { importModule, resolveModule } from "@warcode/util/runtime-import"
import { Bus } from "./bus.js"
import { Integration } from "./integration.js"
import { State } from "./state.js"
import { IntegrationConnection } from "./integration/connection.js"
import { Credential } from "@warcode/schema/credential"
import { Location } from "./location.js"
import { freeze } from "immer"
import { AISDKNative } from "./aisdk-native.js"

export { AISDK_PREFIX, aisdk, isAISDK, mergeHeaders, mergeOverlay, packageName } from "./aisdk-native.js"

export const ID = Provider.ID
export type ID = typeof ID.Type

export class LoadError extends Schema.TaggedError<LoadError>()("Provider.LoadError", {
  package: Schema.String,
  cause: Schema.Defect(),
}) {}

const packages = new Map<string, Promise<unknown>>()
const builtins = new Map<string, () => Promise<unknown>>([
  ["@warcode/ai/providers/alibaba", () => import("@warcode/ai/providers/alibaba")],
  ["@warcode/ai/providers/alibaba/chat", () => import("@warcode/ai/providers/alibaba/chat")],
  ["@warcode/ai/providers/alibaba/messages", () => import("@warcode/ai/providers/alibaba/messages")],
  ["@warcode/ai/providers/alibaba/responses", () => import("@warcode/ai/providers/alibaba/responses")],
  ["@warcode/ai/providers/alibaba/images", () => import("@warcode/ai/providers/alibaba/images")],
  ["@warcode/ai/providers/alibaba/embeddings", () => import("@warcode/ai/providers/alibaba/embeddings")],
  ["@warcode/ai/providers/amazon-bedrock", () => import("@warcode/ai/providers/amazon-bedrock")],
  ["@warcode/ai/providers/amazon-bedrock/mantle", () => import("@warcode/ai/providers/amazon-bedrock/mantle")],
  [
    "@warcode/ai/providers/amazon-bedrock/mantle/chat",
    () => import("@warcode/ai/providers/amazon-bedrock/mantle/chat"),
  ],
  [
    "@warcode/ai/providers/amazon-bedrock/mantle/messages",
    () => import("@warcode/ai/providers/amazon-bedrock/mantle/messages"),
  ],
  [
    "@warcode/ai/providers/amazon-bedrock/mantle/responses",
    () => import("@warcode/ai/providers/amazon-bedrock/mantle/responses"),
  ],
  ["@warcode/ai/providers/anthropic", () => import("@warcode/ai/providers/anthropic")],
  ["@warcode/ai/providers/anthropic-compatible", () => import("@warcode/ai/providers/anthropic-compatible")],
  ["@warcode/ai/providers/azure", () => import("@warcode/ai/providers/azure")],
  ["@warcode/ai/providers/azure/chat", () => import("@warcode/ai/providers/azure/chat")],
  ["@warcode/ai/providers/azure/responses", () => import("@warcode/ai/providers/azure/responses")],
  ["@warcode/ai/providers/azure/images", () => import("@warcode/ai/providers/azure/images")],
  ["@warcode/ai/providers/azure/embeddings", () => import("@warcode/ai/providers/azure/embeddings")],
  ["@warcode/ai/providers/azure/messages", () => import("@warcode/ai/providers/azure/messages")],
  ["@warcode/ai/providers/baseten", () => import("@warcode/ai/providers/baseten")],
  ["@warcode/ai/providers/baseten/decisions", () => import("@warcode/ai/providers/baseten/decisions")],
  ["@warcode/ai/providers/cerebras", () => import("@warcode/ai/providers/cerebras")],
  ["@warcode/ai/providers/cloudflare-ai-gateway", () => import("@warcode/ai/providers/cloudflare-ai-gateway")],
  [
    "@warcode/ai/providers/cloudflare-ai-gateway/decisions",
    () => import("@warcode/ai/providers/cloudflare-ai-gateway/decisions"),
  ],
  ["@warcode/ai/providers/cloudflare-workers-ai", () => import("@warcode/ai/providers/cloudflare-workers-ai")],
  [
    "@warcode/ai/providers/cloudflare-workers-ai/decisions",
    () => import("@warcode/ai/providers/cloudflare-workers-ai/decisions"),
  ],
  [
    "@warcode/ai/providers/cloudflare-workers-ai/images",
    () => import("@warcode/ai/providers/cloudflare-workers-ai/images"),
  ],
  ["@warcode/ai/providers/cohere", () => import("@warcode/ai/providers/cohere")],
  ["@warcode/ai/providers/cohere/chat", () => import("@warcode/ai/providers/cohere/chat")],
  ["@warcode/ai/providers/cohere/embeddings", () => import("@warcode/ai/providers/cohere/embeddings")],
  ["@warcode/ai/providers/deepinfra", () => import("@warcode/ai/providers/deepinfra")],
  ["@warcode/ai/providers/deepinfra/embeddings", () => import("@warcode/ai/providers/deepinfra/embeddings")],
  ["@warcode/ai/providers/deepseek", () => import("@warcode/ai/providers/deepseek")],
  ["@warcode/ai/providers/digitalocean", () => import("@warcode/ai/providers/digitalocean")],
  ["@warcode/ai/providers/digitalocean/decisions", () => import("@warcode/ai/providers/digitalocean/decisions")],
  ["@warcode/ai/providers/digitalocean/embeddings", () => import("@warcode/ai/providers/digitalocean/embeddings")],
  ["@warcode/ai/providers/digitalocean/images", () => import("@warcode/ai/providers/digitalocean/images")],
  ["@warcode/ai/providers/digitalocean/responses", () => import("@warcode/ai/providers/digitalocean/responses")],
  ["@warcode/ai/providers/fireworks", () => import("@warcode/ai/providers/fireworks")],
  ["@warcode/ai/providers/fireworks/embeddings", () => import("@warcode/ai/providers/fireworks/embeddings")],
  ["@warcode/ai/providers/google", () => import("@warcode/ai/providers/google")],
  ["@warcode/ai/providers/google/interactions", () => import("@warcode/ai/providers/google/interactions")],
  ["@warcode/ai/providers/google/embeddings", () => import("@warcode/ai/providers/google/embeddings")],
  ["@warcode/ai/providers/google/images", () => import("@warcode/ai/providers/google/images")],
  ["@warcode/ai/providers/google-vertex", () => import("@warcode/ai/providers/google-vertex")],
  ["@warcode/ai/providers/google-vertex/chat", () => import("@warcode/ai/providers/google-vertex/chat")],
  ["@warcode/ai/providers/google-vertex/gemini", () => import("@warcode/ai/providers/google-vertex/gemini")],
  [
    "@warcode/ai/providers/google-vertex/interactions",
    () => import("@warcode/ai/providers/google-vertex/interactions"),
  ],
  ["@warcode/ai/providers/google-vertex/messages", () => import("@warcode/ai/providers/google-vertex/messages")],
  ["@warcode/ai/providers/google-vertex/mistral", () => import("@warcode/ai/providers/google-vertex/mistral")],
  ["@warcode/ai/providers/google-vertex/responses", () => import("@warcode/ai/providers/google-vertex/responses")],
  ["@warcode/ai/providers/google-vertex/embeddings", () => import("@warcode/ai/providers/google-vertex/embeddings")],
  ["@warcode/ai/providers/google-vertex/images", () => import("@warcode/ai/providers/google-vertex/images")],
  ["@warcode/ai/providers/google-vertex-messages", () => import("@warcode/ai/providers/google-vertex-messages")],
  ["@warcode/ai/providers/groq", () => import("@warcode/ai/providers/groq")],
  ["@warcode/ai/providers/meta", () => import("@warcode/ai/providers/meta")],
  ["@warcode/ai/providers/meta/chat", () => import("@warcode/ai/providers/meta/chat")],
  ["@warcode/ai/providers/meta/images", () => import("@warcode/ai/providers/meta/images")],
  ["@warcode/ai/providers/meta/messages", () => import("@warcode/ai/providers/meta/messages")],
  ["@warcode/ai/providers/meta/responses", () => import("@warcode/ai/providers/meta/responses")],
  ["@warcode/ai/providers/minimax", () => import("@warcode/ai/providers/minimax")],
  ["@warcode/ai/providers/minimax/chat", () => import("@warcode/ai/providers/minimax/chat")],
  ["@warcode/ai/providers/minimax/images", () => import("@warcode/ai/providers/minimax/images")],
  ["@warcode/ai/providers/minimax/messages", () => import("@warcode/ai/providers/minimax/messages")],
  ["@warcode/ai/providers/minimax/responses", () => import("@warcode/ai/providers/minimax/responses")],
  ["@warcode/ai/providers/mistral", () => import("@warcode/ai/providers/mistral")],
  ["@warcode/ai/providers/moonshot", () => import("@warcode/ai/providers/moonshot")],
  ["@warcode/ai/providers/moonshot/chat", () => import("@warcode/ai/providers/moonshot/chat")],
  ["@warcode/ai/providers/moonshot/messages", () => import("@warcode/ai/providers/moonshot/messages")],
  ["@warcode/ai/providers/moonshot/responses", () => import("@warcode/ai/providers/moonshot/responses")],
  ["@warcode/ai/providers/openai", () => import("@warcode/ai/providers/openai")],
  ["@warcode/ai/providers/openai/chat", () => import("@warcode/ai/providers/openai/chat")],
  ["@warcode/ai/providers/openai/responses", () => import("@warcode/ai/providers/openai/responses")],
  ["@warcode/ai/providers/openai/images", () => import("@warcode/ai/providers/openai/images")],
  ["@warcode/ai/providers/openai/embeddings", () => import("@warcode/ai/providers/openai/embeddings")],
  ["@warcode/ai/providers/openai-compatible", () => import("@warcode/ai/providers/openai-compatible")],
  [
    "@warcode/ai/providers/openai-compatible/responses",
    () => import("@warcode/ai/providers/openai-compatible/responses"),
  ],
  ["@warcode/ai/providers/openai-compatible/images", () => import("@warcode/ai/providers/openai-compatible/images")],
  [
    "@warcode/ai/providers/openai-compatible/embeddings",
    () => import("@warcode/ai/providers/openai-compatible/embeddings"),
  ],
  [
    "@warcode/ai/providers/openai-compatible-responses",
    () => import("@warcode/ai/providers/openai-compatible-responses"),
  ],
  ["@warcode/ai/providers/warcode/decisions", () => import("@warcode/ai/providers/warcode/decisions")],
  ["@warcode/ai/providers/openrouter", () => import("@warcode/ai/providers/openrouter")],
  ["@warcode/ai/providers/openrouter/decisions", () => import("@warcode/ai/providers/openrouter/decisions")],
  ["@warcode/ai/providers/openrouter/embeddings", () => import("@warcode/ai/providers/openrouter/embeddings")],
  ["@warcode/ai/providers/openrouter/images", () => import("@warcode/ai/providers/openrouter/images")],
  ["@warcode/ai/providers/openrouter/responses", () => import("@warcode/ai/providers/openrouter/responses")],
  ["@warcode/ai/providers/togetherai", () => import("@warcode/ai/providers/togetherai")],
  ["@warcode/ai/providers/typesafe-ai/decisions", () => import("@warcode/ai/providers/typesafe-ai/decisions")],
  ["@warcode/ai/providers/venice", () => import("@warcode/ai/providers/venice")],
  ["@warcode/ai/providers/venice/responses", () => import("@warcode/ai/providers/venice/responses")],
  ["@warcode/ai/providers/vercel-ai-gateway", () => import("@warcode/ai/providers/vercel-ai-gateway")],
  ["@warcode/ai/providers/vercel-ai-gateway/chat", () => import("@warcode/ai/providers/vercel-ai-gateway/chat")],
  [
    "@warcode/ai/providers/vercel-ai-gateway/messages",
    () => import("@warcode/ai/providers/vercel-ai-gateway/messages"),
  ],
  [
    "@warcode/ai/providers/vercel-ai-gateway/responses",
    () => import("@warcode/ai/providers/vercel-ai-gateway/responses"),
  ],
  [
    "@warcode/ai/providers/vercel-ai-gateway/decisions",
    () => import("@warcode/ai/providers/vercel-ai-gateway/decisions"),
  ],
  ["@warcode/ai/providers/vercel-ai-gateway/images", () => import("@warcode/ai/providers/vercel-ai-gateway/images")],
  [
    "@warcode/ai/providers/vercel-ai-gateway/embeddings",
    () => import("@warcode/ai/providers/vercel-ai-gateway/embeddings"),
  ],
  ["@warcode/ai/providers/xai", () => import("@warcode/ai/providers/xai")],
  ["@warcode/ai/providers/xai/images", () => import("@warcode/ai/providers/xai/images")],
  ["@warcode/ai/providers/zai", () => import("@warcode/ai/providers/zai")],
  ["@warcode/ai/providers/zai/chat", () => import("@warcode/ai/providers/zai/chat")],
  ["@warcode/ai/providers/zai/images", () => import("@warcode/ai/providers/zai/images")],
  ["@warcode/ai/providers/zai-coding-plan", () => import("@warcode/ai/providers/zai-coding-plan")],
  ["@warcode/ai/providers/zai-coding-plan/chat", () => import("@warcode/ai/providers/zai-coding-plan/chat")],
  ["@warcode/ai/providers/zai-coding-plan/messages", () => import("@warcode/ai/providers/zai-coding-plan/messages")],
  [
    "@warcode/ai/providers/zai-coding-plan/responses",
    () => import("@warcode/ai/providers/zai-coding-plan/responses"),
  ],
])

/** Native `@warcode/ai/providers/*` entrypoints bundled with Core and loadable by name from config. */
export const builtinPackages: ReadonlySet<string> = new Set(builtins.keys())

export const loadPackage = Effect.fn("Provider.loadPackage")(function* (input: string, npm?: Npm.Interface) {
  const specifier = AISDKNative.packageName(input)
  const builtin = builtins.get(specifier)
  if (builtin) return yield* importPackage(specifier, specifier, builtin)
  const resolved = yield* Effect.sync(() => {
    if (specifier.startsWith("file://") || specifier.startsWith("@warcode/ai/")) return specifier
    try {
      return import.meta.resolve(specifier)
    } catch {
      return undefined
    }
  })
  if (resolved) return yield* importPackage(specifier, resolved)
  if (!npm) {
    return yield* new LoadError({
      package: specifier,
      cause: new Error(`Provider package ${specifier} is not installed`),
    })
  }
  const parts = specifier.split("/")
  const root = specifier.startsWith("@") ? parts.slice(0, 2).join("/") : (parts[0] ?? specifier)
  const installed = yield* npm.add(root).pipe(Effect.mapError((cause) => new LoadError({ package: specifier, cause })))
  const entrypoint = yield* Effect.try({
    try: () => resolveModule(specifier, installed.directory),
    catch: (cause) => new LoadError({ package: specifier, cause }),
  })
  return yield* importPackage(specifier, entrypoint)
})

const settingsKeys = Struct.keys(Provider.Settings.schema.fields)
const providerOnlyKeys = settingsKeys.filter((key) => !(key in Model.Settings.schema.fields))

/** The provider options: every settings key Warcode doesn't read itself. */
export function nativeSettings(settings: Settings) {
  return Struct.omit(settings, settingsKeys)
}

/** Settings a model inherits from its provider. */
export function modelSettings(settings: Settings | undefined) {
  return settings && Struct.omit(settings, providerOnlyKeys)
}

const decodeTimeout = Schema.decodeUnknownOption(HttpTimeout)

/** Applied to `headerTimeout` when provider settings leave it unset or invalid. */
export const DEFAULT_TIMEOUT_MS = 300_000

/**
 * Applied to `chunkTimeout` when provider settings leave it unset or invalid. Some providers, such as DeepSeek, have
 * specifically asked clients to allow at least 15 minutes, because their models can stream nothing for minutes while
 * they reason.
 */
export const DEFAULT_CHUNK_TIMEOUT_MS = 900_000

/** One timeout setting without a default; invalid values are dropped. */
export function timeout(value: unknown) {
  return Option.getOrUndefined(decodeTimeout(value))
}

/** Request timeouts from provider settings, resolved for every route. `timeout` has no default. */
export function timeouts(settings: Readonly<Record<string, unknown>>) {
  return {
    timeout: timeout(settings.timeout),
    headerTimeout: timeout(settings.headerTimeout) ?? DEFAULT_TIMEOUT_MS,
    chunkTimeout: timeout(settings.chunkTimeout) ?? DEFAULT_CHUNK_TIMEOUT_MS,
  }
}

const decodeEncoding = Schema.decodeUnknownOption(Provider.Encoding)

/** Request body encoding from provider or model settings; invalid values are dropped. */
export function encoding(settings: Readonly<Record<string, unknown>>) {
  return Option.getOrUndefined(decodeEncoding(settings.encoding))
}

export const Request = Provider.Request
export type Request = Provider.Request

export const Compaction = Provider.Compaction
export type Compaction = Provider.Compaction

export const Cache = Provider.Cache
export type Cache = Provider.Cache

export const Transport = Provider.Transport
export type Transport = Provider.Transport

export const Settings = Provider.Settings
export type Settings = Provider.Settings

export const Info = Provider.Info
export type Info = Provider.Info

export type MutableInfo = DeepMutable<Info>

export { Event } from "@warcode/schema/provider"

/** Provider metadata owns its drafts; model definitions remain immutable inputs. */
export type Definition = {
  readonly provider: Info
  readonly models: ReadonlyMap<Model.ID, Model.Info>
  readonly sourceConnection?: IntegrationConnection.Info
}

export interface Editor {
  readonly list: () => readonly Definition[]
  readonly get: (providerID: ID) => Definition | undefined
  readonly add: (definition: {
    readonly info: Info
    readonly models: readonly Model.Info[]
    readonly sourceConnection?: IntegrationConnection.Info
  }) => void
  readonly update: (providerID: ID, update: (provider: MutableInfo) => void) => void
  readonly remove: (providerID: ID) => void
  readonly models: {
    readonly set: (providerID: ID, models: readonly Model.Info[]) => void
    readonly update: (providerID: ID, modelID: Model.ID, update: (model: DeepMutable<Model.Info>) => void) => void
    readonly remove: (providerID: ID, modelID: Model.ID) => void
  }
}

export interface Snapshot {
  readonly records: ReadonlyMap<ID, Definition>
  readonly available: readonly Definition[]
  readonly providers: readonly Info[]
}

export interface Interface extends State.Transformable<Editor> {
  readonly get: (providerID: ID) => Effect.Effect<Info | undefined>
  readonly all: () => Effect.Effect<readonly Info[]>
  readonly available: () => Effect.Effect<readonly Info[]>
  /** Internal definition/access snapshot; raw model inventories never cross the HTTP API. */
  readonly snapshot: () => Effect.Effect<Snapshot>
}

export class Service extends Context.Service<Service, Interface>()("@warcode/Provider") {}

// Every location references the same index for a shared immutable definition array.
const definitions = new WeakMap<readonly Model.Info[], Map<ID, ReadonlyMap<Model.ID, Model.Info>>>()
function index(providerID: ID, models: readonly Model.Info[]) {
  const indexes = definitions.get(models) ?? new Map<ID, ReadonlyMap<Model.ID, Model.Info>>()
  const cached = indexes.get(providerID)
  if (cached) return cached
  // Model shares these definitions without copying, so a foreign definition takes this provider's identity here.
  const result = freeze(
    new Map(models.map((model) => [model.id, model.providerID === providerID ? model : { ...model, providerID }])),
    true,
  )
  indexes.set(providerID, result)
  definitions.set(models, indexes)
  return result
}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const bus = yield* Bus.Service
    const integrations = yield* Integration.Service
    const location = yield* Location.Service
    const state = State.create<
      Map<
        ID,
        {
          provider: MutableInfo
          models: ReadonlyMap<Model.ID, Model.Info>
          sourceConnection?: IntegrationConnection.Info
        }
      >,
      Editor
    >({
      name: "provider",
      initial: () => new Map(),
      editor: (records) => {
        const maps = new WeakSet<ReadonlyMap<Model.ID, Model.Info>>()
        const models = new WeakSet<Model.Info>()
        const entry = (id: ID) => {
          const current = records.get(id)
          if (current) return current
          const added = { provider: Info.empty(id) as MutableInfo, models: new Map<Model.ID, Model.Info>() }
          records.set(id, added)
          maps.add(added.models)
          return added
        }
        const writable = (id: ID) => {
          const record = entry(id)
          if (maps.has(record.models)) return record.models as Map<Model.ID, Model.Info>
          const owned = new Map(record.models)
          record.models = owned
          maps.add(owned)
          return owned
        }
        return {
          list: () => Array.from(records.values()),
          get: (id) => records.get(id),
          add: (definition) => {
            records.set(definition.info.id, {
              provider: structuredClone(definition.info) as MutableInfo,
              models: index(definition.info.id, definition.models),
              sourceConnection: definition.sourceConnection,
            })
          },
          update: (id, update) => {
            const record = entry(id)
            update(record.provider)
            record.provider.id = id
            AISDKNative.rewrite(record.provider, {
              builtins: builtinPackages,
              specifier: record.provider.package,
              providerID: id,
              canonical: record.provider.canonical,
            })
          },
          remove: (id) => {
            records.delete(id)
          },
          models: {
            set: (id, values) => {
              entry(id).models = index(id, values)
            },
            update: (providerID, modelID, update) => {
              const record = entry(providerID)
              const target = writable(providerID)
              const current = target.get(modelID)
              const model = // An earlier add/set can publish and freeze an owned model within this fold.
                (
                  current && models.has(current) && !Object.isFrozen(current)
                    ? current
                    : current
                      ? structuredClone(current)
                      : Model.Info.default(providerID, modelID)
                ) as DeepMutable<Model.Info>
              update(model)
              model.id = modelID
              model.providerID = providerID
              AISDKNative.rewrite(model, {
                builtins: builtinPackages,
                specifier: model.package ?? record.provider.package,
                providerID,
                canonical: model.canonical ?? record.provider.canonical,
                modelID: model.modelID ?? modelID,
              })
              models.add(model)
              target.set(modelID, model)
            },
            remove: (providerID, modelID) => {
              if (!records.has(providerID)) return
              writable(providerID).delete(modelID)
            },
          },
        }
      },
      notify: () => notify,
    })
    // Registrations may outlive a borrowed service layer; their later disposal must
    // not query dependencies that have already closed.
    yield* Effect.addFinalizer(() => State.shutdown(state.reload()))
    let cached: { records: Snapshot["records"]; value: Snapshot } | undefined
    const snapshot = Effect.fn("Provider.snapshot")(function* () {
      while (true) {
        const revision = integrations.revision()
        const records = state.get()
        // Connection presence decides availability; resolving OAuth tokens belongs to execution.
        const connections = yield* integrations.list()
        // Either fold can disable a plugin that also contributed to the other domain.
        if (revision !== integrations.revision() || records !== state.get()) continue
        const byID = new Map(connections.map((integration) => [integration.id, integration]))
        const available = Array.from(records.values()).filter((record) => {
          if (record.provider.activation === "disabled") return false
          const integration = byID.get(record.provider.integrationID ?? Integration.ID.make(record.provider.id))
          // Never combine the previous account's discovered endpoints/models with a new connection.
          if (
            record.sourceConnection &&
            IntegrationConnection.key(record.sourceConnection) !==
              IntegrationConnection.key(integration?.connections[0])
          )
            return false
          if (record.provider.activation === "enabled") return true
          if (integration?.connections.length) return true
          return record.provider.integrationID === undefined && !integration
        })
        // A credential change that leaves the same definitions available is not a catalog change.
        if (
          cached?.records === records &&
          cached.value.available.length === available.length &&
          cached.value.available.every((record, index) => record === available[index])
        )
          return cached.value
        const value = freeze({ records, available, providers: available.map((record) => record.provider) }, true)
        cached = { records, value }
        return value
      }
    })
    let published: Snapshot | undefined
    const notify: Effect.Effect<void> = Effect.gen(function* () {
      const value = yield* snapshot()
      if (value === published) return
      published = value
      yield* bus.publish(
        Provider.Event.Updated,
        {},
        {
          location: { directory: location.directory, workspaceID: location.workspaceID },
        },
      )
    })
    yield* bus.subscribe([Integration.Event.Updated, Credential.Event.Switched]).pipe(
      Stream.runForEach(() => notify),
      Effect.forkScoped({ startImmediately: true }),
    )
    return Service.of({
      transform: state.transform,
      reload: state.reload,
      get: Effect.fn("Provider.get")((id) => Effect.sync(() => freeze(state.get().get(id)?.provider, true))),
      all: Effect.fn("Provider.all")(() =>
        Effect.sync(() => Array.from(state.get().values(), (record) => freeze(record.provider, true))),
      ),
      available: Effect.fn("Provider.available")(() => snapshot().pipe(Effect.map((value) => value.providers))),
      snapshot,
    })
  }),
)

export const node = makeLocationNode({ service: Service, layer, deps: [Bus.node, Integration.node, Location.node] })

const importPackage = Effect.fn("Provider.importPackage")(function* (
  specifier: string,
  entrypoint: string,
  load = () => importModule(entrypoint),
) {
  const module = yield* Effect.tryPromise({
    try: () => {
      const existing = packages.get(entrypoint)
      if (existing) return existing
      const loaded = load()
      packages.set(entrypoint, loaded)
      return loaded
    },
    catch: (cause) => new LoadError({ package: specifier, cause }),
  })
  if (typeof module !== "object" || module === null || typeof (module as { model?: unknown }).model !== "function") {
    return yield* new LoadError({
      package: specifier,
      cause: new Error(`Provider package ${specifier} does not export model(modelID, settings)`),
    })
  }
  return module as ProviderPackage.Definition
})
