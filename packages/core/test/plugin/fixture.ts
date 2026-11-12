import { Agent } from "@warcode/core/agent"
import { App } from "@warcode/core/app"
import { Artifact } from "@warcode/core/artifact"
import { AISDK } from "@warcode/core/aisdk"
import { Command } from "@warcode/core/command"
import { Config } from "@warcode/core/config"
import { Credential } from "@warcode/core/credential"
import { Database } from "@warcode/core/database/database"
import { Environment } from "@warcode/core/environment/index"
import { FileAccess } from "@warcode/core/file-access"
import { Flag } from "@warcode/core/flag"
import { LayerNodePlatform } from "@warcode/util/effect/app-node-platform"
import { AppProcess } from "@warcode/util/process"
import { LayerNode } from "@warcode/util/effect/layer-node"
import { Bus } from "@warcode/core/bus"
import { FileSystem } from "@warcode/core/filesystem"
import { FSUtil } from "@warcode/util/fs-util"
import { Global } from "@warcode/util/global"
import { Form } from "@warcode/core/form"
import { Generate } from "@warcode/core/generate"
import { InstructionDiscovery } from "@warcode/core/instruction-discovery"
import { Integration } from "@warcode/core/integration"
import { Job } from "@warcode/core/job"
import { KV } from "@warcode/core/kv"
import { Location } from "@warcode/core/location"
import { Mcp } from "@warcode/core/mcp/index"
import { Model } from "@warcode/core/model"
import { Npm } from "@warcode/util/npm"
import { Plugin } from "@warcode/core/plugin"
import { PluginHooks } from "@warcode/core/plugin/hooks"
import { Provider } from "@warcode/core/provider"
import { Session } from "@warcode/core/session"
import { SharedCache } from "@warcode/core/shared-cache"
import { InstructionEntry } from "@warcode/core/session/instruction-entry"
import { PersistentPty } from "@warcode/core/persistent-pty"
import { LocationServiceMap } from "@warcode/core/location-service-map"
import { AppNodeBuilder } from "@warcode/core/effect/app-node-builder"
import { Permission } from "@warcode/core/permission"
import { Reference } from "@warcode/core/reference"
import { Rpc } from "@warcode/core/rpc"
import { Skill } from "@warcode/core/skill"
import { SkillDiscovery } from "@warcode/core/skill/discovery"
import { Watcher } from "@warcode/core/filesystem/watcher"
import { Tool } from "@warcode/core/tool"
import { Vcs } from "@warcode/core/vcs"
import { WebSearch } from "@warcode/core/websearch"
import { Worktree } from "@warcode/core/worktree"
import { WorktreeStrategies } from "@warcode/core/worktree/strategies"
import { Effect, Layer } from "effect"
import { tempLocationLayer } from "../fixture/location"
import { emptyMcpLayer } from "../fixture/mcp"
import { offlineModels } from "../fixture/models"

const npmLayer = Layer.succeed(
  Npm.Service,
  Npm.Service.of({
    add: (name) => Effect.succeed({ directory: "", name }),
    resolve: (name) => Effect.succeed({ directory: "", name }),
    check: () => Effect.succeed(false),
    update: (name) => Effect.succeed({ directory: "", name }),
    which: () => Effect.undefined,
  }),
)

const generateLayer = Layer.succeed(
  Generate.Service,
  Generate.Service.of({
    text: () => Effect.succeed(""),
    image: () => Effect.die("unused"),
    decisions: () => Effect.die("unused"),
  }),
)

const configLayer = Config.testLayer()

const permissionLayer = Layer.succeed(
  Permission.Service,
  Permission.Service.of({
    close: Effect.void,
    ask: (input) => Effect.succeed({ id: input.id ?? Permission.ID.create(), effect: "ask" }),
    assert: () => Effect.void,
    assertNotDenied: () => Effect.void,
    allows: () => Effect.succeed(false),
    reply: () => Effect.void,
    get: () => Effect.succeed(undefined),
    forSession: () => Effect.succeed([]),
    list: () => Effect.succeed([]),
  }),
)

export const makePluginTestLayer = (permission = permissionLayer, generate = generateLayer) =>
  AppNodeBuilder.build(
    LayerNode.group([
      App.node,
      AppProcess.node,
      FileSystem.node,
      FSUtil.node,
      Location.node,
      Npm.node,
      Credential.node,
      Config.node,
      Flag.node,
      Database.node,
      Environment.node,
      FileAccess.node,
      Global.node,
      Bus.node,
      Form.node,
      Generate.node,
      LayerNodePlatform.httpClient,
      Plugin.node,
      Agent.node,
      Artifact.node,
      AISDK.node,
      Provider.node,
      Model.node,
      Command.node,
      InstructionDiscovery.node,
      Integration.node,
      Job.node,
      KV.node,
      Mcp.node,
      Session.node,
      SharedCache.node,
      InstructionEntry.node,
      PersistentPty.node,
      LocationServiceMap.node,
      Permission.node,
      PluginHooks.node,
      Reference.node,
      Rpc.node,
      Skill.node,
      SkillDiscovery.node,
      Tool.node,
      Vcs.node,
      Watcher.node,
      WebSearch.node,
      Worktree.node,
      WorktreeStrategies.node,
    ]),
    [
      Location.node.replace(tempLocationLayer),
      Npm.node.replace(npmLayer),
      Config.node.replace(configLayer),
      Mcp.node.replace(emptyMcpLayer),
      Generate.node.replace(generate),
      Permission.node.replace(permission),
      offlineModels,
    ],
  ).pipe(Layer.provideMerge(configLayer))

export const PluginTestLayer = makePluginTestLayer()
