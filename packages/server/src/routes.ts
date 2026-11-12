import { Database } from "@warcode/core/database/database"
import { V1Migration } from "@warcode/core/database/v1-migration"
import { App } from "@warcode/core/app"
import { LayerNode } from "@warcode/util/effect/layer-node"
import { Node } from "@warcode/util/effect/app-node"
import { fetchLayer, httpClient, httpFetch } from "@warcode/util/effect/app-node-platform"
import { AppNodeBuilder } from "@warcode/core/effect/app-node-builder"
import { Bus } from "@warcode/core/bus"
import { EventLogger } from "@warcode/core/event-logger"
import { FileSystemSearch } from "@warcode/core/filesystem/search"
import { Credential } from "@warcode/core/credential"
import { Config } from "@warcode/core/config"
import { PermissionSaved } from "@warcode/core/permission/saved"
import { PtyTicket } from "@warcode/core/pty/ticket"
import { PersistentPty } from "@warcode/core/persistent-pty"
import { Project } from "@warcode/core/project"
import { Worktree } from "@warcode/core/worktree"
import { Session } from "@warcode/core/session"
import { Instance } from "@warcode/core/instance/service"
import { SessionTransfer } from "@warcode/core/session/transfer"
import { InstructionEntry } from "@warcode/core/session/instruction-entry"
import { ShellSelect } from "@warcode/core/shell/select"
import { Shell } from "@warcode/core/shell"
import { Job } from "@warcode/core/job"
import { KV } from "@warcode/core/kv"
import { Mcp } from "@warcode/core/mcp/index"
import { Global } from "@warcode/util/global"
import { FSUtil } from "@warcode/util/fs-util"
import { InstructionDiscovery } from "@warcode/core/instruction-discovery"
import { LocationServiceMap } from "@warcode/core/location-service-map"
import { LocationActivity } from "@warcode/core/location-activity"
import { ModelsDev } from "@warcode/core/models-dev"
import { SessionRestart } from "@warcode/core/session/execution/restart"
import { Schedule } from "@warcode/core/schedule"
import { PluginUpdate } from "@warcode/core/plugin/update"
import { SdkPlugins } from "@warcode/core/plugin/sdk"
import { WellKnown } from "@warcode/core/wellknown"
import { Workspace } from "@warcode/core/workspace"
import { Watcher } from "@warcode/core/filesystem/watcher"
import { FileWatch } from "@warcode/core/filesystem/file-watch"
import { HttpRouter } from "effect/http"
import { HttpApiBuilder } from "effect/http-api"
import { Context, Effect, Layer, Option } from "effect"
import { Api } from "./api"
import { ServerAuth } from "./auth"
import { CorsConfig } from "./cors"
import { handlers } from "./handlers"
import { authorizationLayer } from "./middleware/authorization"
import { schemaErrorLayer } from "./middleware/schema-error"
import { ServerPairing } from "./pairing"
import { layer } from "./location"
import { formLocationLayer } from "./middleware/form-location"
import { sessionLocationLayer } from "./middleware/session-location"
import { ServerInfo } from "./server-info"
import type { ServerOptions } from "./options"

const applicationServiceNodes = [
  App.node,
  Global.node,
  FSUtil.node,
  Database.node,
  KV.node,
  Bus.node,
  // Before the jobs and sessions, so they are released after them: a shutdown's interrupted shell calls and jobs
  // still reach the daemon to stop their commands, and a command being created never falls back to spawning.
  PersistentPty.node,
  // Daemon-run shell commands belong to the server, so a Location closing never takes them down.
  Shell.daemonNode,
  EventLogger.node,
  httpClient,
  Job.node,
  Project.node,
  Project.sweepNode,
  Worktree.node,
  Session.node,
  Instance.node,
  SessionTransfer.node,
  InstructionEntry.node,
  SdkPlugins.node,
  PluginUpdate.node,
  PermissionSaved.node,
  PtyTicket.node,
  Credential.node,
  WellKnown.node,
  ServerPairing.node,
  LocationServiceMap.node,
  LocationActivity.node,
  SessionRestart.node,
  Schedule.node,
  Workspace.node,
  FileWatch.node,
] as const
const applicationServices = LayerNode.group(applicationServiceNodes)

export function createRoutes(
  options: ServerOptions = {},
  serviceURLs: () => ReadonlyArray<string> = () => [],
  overrides: LayerNode.Replacements = [],
) {
  return makeRoutes(
    options.password
      ? ServerAuth.Config.configLayer({ password: Option.some(options.password) })
      : ServerAuth.Config.layer,
    options,
    serviceURLs,
    overrides,
  )
}

type InstanceNode = (
  replacements: () => LayerNode.Replacements,
) => LayerNode.Provider<Instance.Service, never, typeof Node.tags.values.global>

export function createEmbeddedRoutes(
  options: ServerOptions = {},
  overrides: LayerNode.Replacements = [],
  instances?: InstanceNode,
) {
  return makeRoutes(ServerAuth.Config.configLayer({ password: Option.none() }), options, () => [], overrides, instances)
}

function makeRoutes<AuthError, AuthServices>(
  auth: Layer.Layer<ServerAuth.Config, AuthError, AuthServices>,
  options: ServerOptions,
  serviceURLs: () => ReadonlyArray<string>,
  // Runtime-profile replacements (e.g. workerd) applied after the standard set, so later entries win.
  overrides: LayerNode.Replacements,
  instances?: InstanceNode,
) {
  const standard: LayerNode.Replacements = [
    Database.node.replace(Database.configured(options.database)),
    PersistentPty.node.replace(PersistentPty.configured(options.pty)),
    Bus.node.replace(Bus.configured({ persist: options.events?.persist })),
    App.node.replace(App.configured(options.app)),
    ModelsDev.node.replace(ModelsDev.configured(options.models)),
    httpFetch.replace(fetchLayer(options.fetch)),
    Watcher.node.replace(Watcher.configured({ enabled: options.fs?.filewatcher })),
    FileWatch.node.replace(FileWatch.configured({ enabled: options.fs?.filewatcher })),
    FileSystemSearch.node.replace(FileSystemSearch.configured({ fff: options.fs?.fff })),
    Global.node.replace(Global.layerWith(options.config?.directory ? { config: options.config.directory } : {})),
    Config.node.replace(
      Config.configured({
        project: options.config?.project,
        claude: options.config?.claude,
        file: options.config?.file,
        content: options.config?.content,
      }),
    ),
    InstructionDiscovery.node.replace(InstructionDiscovery.configured({ project: options.config?.project })),
    ShellSelect.node.replace(ShellSelect.configured({ gitbash: options.windows?.gitbash })),
    Mcp.node.replace(
      Mcp.configured({
        clientInfo: {
          name: "warcode",
          version: options.app?.version ?? "unknown",
        },
      }),
    ),
  ]
  const build = (overrides: LayerNode.Replacements) => {
    const replacements: LayerNode.Replacements = [
      ...standard,
      // Private instances resolve this list lazily so they inherit the complete host graph, including the selector.
      ...(instances ? [Instance.node.replace(instances(() => replacements))] : []),
      ...overrides,
    ]
    return AppNodeBuilder.build(applicationServices, replacements)
  }
  const serviceLayer = options.simulation
    ? Layer.unwrap(
        Effect.gen(function* () {
          const { simulationReplacements } = yield* Effect.promise(() => import("@warcode/simulation/backend"))
          const simulation = yield* simulationReplacements({ version: App.make(options.app).version })
          return build([...overrides, ...simulation])
        }),
      )
    : build(overrides)
  return serviceLayer.pipe(
    Layer.flatMap((context) => {
      const services = Layer.succeedContext(context)
      const requestServices = Layer.merge(
        Layer.succeedContext(
          Context.pick(
            Database.Service,
            Credential.Service,
            PermissionSaved.Service,
            PluginUpdate.Service,
            Project.Service,
            WellKnown.Service,
          )(context),
        ),
        ServerInfo.layer(serviceURLs, Context.get(context, Global.Service).tmp, options.app),
      )
      const api = HttpApiBuilder.layer(Api, { openapiPath: "/openapi.json" }).pipe(
        Layer.provide(handlers.pipe(Layer.provide(services), Layer.provide(Layer.succeed(CorsConfig, options)))),
        Layer.provide(formLocationLayer),
        Layer.provide(sessionLocationLayer),
        Layer.provide(layer),
        Layer.provide(authorizationLayer),
        Layer.provide(schemaErrorLayer),
        Layer.provide(auth),
        HttpRouter.provideRequest(requestServices),
        Layer.provideMerge(services),
        Layer.provideMerge(HttpRouter.layer),
      )
      return Layer.merge(api, V1Migration.layer.pipe(Layer.provide(services)))
    }),
  )
}
