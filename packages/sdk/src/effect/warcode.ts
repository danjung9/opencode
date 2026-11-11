export * as Warcode from "./warcode"

import { Warcode, type WarcodeClient } from "@warcode/client/effect"
import type { Session } from "@warcode/core/session"
import type { Workspace } from "@warcode/core/workspace"
import { Context, Effect, Layer } from "effect"
import type { Config, Scope } from "effect"
import { FetchHttpClient, HttpClient } from "effect/http"
import { EmbeddedHost } from "../internal/host"
import type { SdkInstances } from "../internal/instances"

export type { LogEntry, LogLevel, LogOptions, LogWriter } from "../logging"

export type CreateOptions<R = never> = EmbeddedHost.CreateOptions<R>
export type EmbedOptions = EmbeddedHost.EmbedOptions
export type InstanceOptions<R = never> = SdkInstances.Options<R>
export type InstanceConfiguration = SdkInstances.Configuration

export type Interface = Omit<WarcodeClient, "plugin" | "workspace"> & {
  readonly sessions: Omit<WarcodeClient["session"], "create" | "get" | "move"> & {
    readonly create: Session.Interface["create"]
    readonly get: (input: { readonly sessionID: Session.ID }) => ReturnType<Session.Interface["get"]>
    readonly move: Session.Interface["move"]
  }
  readonly events: WarcodeClient["event"]
  readonly workspace: {
    readonly create: Workspace.Interface["create"]
    readonly provision: (options: {
      readonly workspaceID: Workspace.ID
    }) => ReturnType<Workspace.Interface["provision"]>
    readonly destroy: (options: { readonly workspaceID: Workspace.ID }) => ReturnType<Workspace.Interface["destroy"]>
  }
  readonly plugin: EmbeddedHost.Interface["plugins"]["register"] & WarcodeClient["plugin"]
}

export const create: <R = never>(
  options?: CreateOptions<R>,
  embed?: EmbedOptions,
) => Effect.Effect<Interface, Config.ConfigError | Error, Scope.Scope | R> = Effect.fn("Warcode.create")(function* <
  R = never,
>(options: CreateOptions<R> = {}, embed: EmbedOptions = {}) {
  const host = yield* Effect.acquireRelease(EmbeddedHost.create(options, embed), (host) => Effect.promise(host.close))
  const httpClient = yield* HttpClient.HttpClient.pipe(Effect.provide(FetchHttpClient.layer))
  const client = yield* Warcode.make({ baseUrl: "http://opencode.local" }).pipe(
    Effect.provideService(
      HttpClient.HttpClient,
      // FetchHttpClient reads Fetch at request time; callers must not replace this host's in-process transport.
      HttpClient.transformResponse(httpClient, Effect.provideService(FetchHttpClient.Fetch, host.fetch)),
    ),
  )

  return {
    ...client,
    sessions: {
      ...client.session,
      create: host.sessions.create,
      get: (input: { readonly sessionID: Session.ID }) => host.sessions.get(input.sessionID),
      move: host.sessions.move,
    },
    events: client.event,
    workspace: {
      create: host.workspace.create,
      provision: ({ workspaceID }: { readonly workspaceID: Workspace.ID }) => host.workspace.provision(workspaceID),
      destroy: ({ workspaceID }: { readonly workspaceID: Workspace.ID }) => host.workspace.destroy(workspaceID),
    },
    plugin: Object.assign(host.plugins.register, client.plugin),
  }
})

export class Service extends Context.Service<Service, Interface>()("@warcode/sdk/Warcode") {}

export const layer = <R = never>(
  options: CreateOptions<R> = {},
): Layer.Layer<Service, Config.ConfigError | Error, Exclude<R, Scope.Scope>> => Layer.effect(Service, create(options))
