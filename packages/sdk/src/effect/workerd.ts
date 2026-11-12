export * as WarcodeWorkerd from "./workerd"

import { Layer } from "effect"
import type { Config, Scope } from "effect"
import { WorkerdProfile } from "../internal/workerd"
import { Warcode } from "./warcode"

export type Configuration = WorkerdProfile.Configuration

export interface CreateOptions<R = never> extends WorkerdProfile.Options {
  readonly log?: Warcode.CreateOptions["log"]
  readonly plugins?: Warcode.CreateOptions["plugins"]
  readonly workspaceProviders?: Warcode.CreateOptions["workspaceProviders"]
  readonly instances?: Warcode.CreateOptions<R>["instances"]
}

export const create = <R = never>({ log, plugins, workspaceProviders, instances, ...options }: CreateOptions<R>) => {
  const profile = WorkerdProfile.make(options)
  return Warcode.create(
    { ...profile.options, log, plugins, workspaceProviders, instances },
    { overrides: profile.replacements },
  )
}

export const layer = <R = never>(
  options: CreateOptions<R>,
): Layer.Layer<Warcode.Service, Config.ConfigError | Error, Exclude<R, Scope.Scope>> =>
  Layer.effect(Warcode.Service, create(options))

export type Interface = Warcode.Interface
export type Requirements = Scope.Scope
