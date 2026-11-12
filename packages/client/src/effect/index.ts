// TODO: Keep additional network capabilities inside Schema and Protocol as the client grows; /effect must never import
// Core or Server. Preserve these datatype exports so internal model reorganizations do not require caller migrations.
import type { Effect } from "effect"
import type { Warcode } from "./client.js"

export * from "./generated/index"
export { Warcode } from "./client.js"
export type {
  AgentApi,
  AppApi,
  CommandApi,
  ConfigApi,
  EventApi,
  IntegrationApi,
  ModelApi,
  PluginApi,
  ProviderApi,
  ReferenceApi,
  RpcApi,
  RpcClient,
  WebSearchApi,
  SessionApi,
  SkillApi,
} from "./api.js"
export { Agent } from "@warcode/schema/agent"
export { Command } from "@warcode/schema/command"
export { Config } from "@warcode/schema/config"
export { Credential } from "@warcode/schema/credential"
export { Event } from "@warcode/schema/event"
export { EventLog } from "@warcode/schema/event-log"
export { FileSystem } from "@warcode/schema/filesystem"
export { Form } from "@warcode/schema/form"
export { Integration } from "@warcode/schema/integration"
export { Location } from "@warcode/schema/location"
export { Model } from "@warcode/schema/model"
export { Permission } from "@warcode/schema/permission"
export { PermissionSaved } from "@warcode/schema/permission-saved"
export { Project } from "@warcode/schema/project"
export { Worktree } from "@warcode/schema/worktree"
export { Vcs } from "@warcode/schema/vcs"
export { Provider } from "@warcode/schema/provider"
export { Pty } from "@warcode/schema/pty"
export { Question } from "@warcode/schema/question"
export { Reference } from "@warcode/schema/reference"
export { WebSearch } from "@warcode/schema/websearch"
export { AbsolutePath, RelativePath } from "@warcode/schema/schema"
export { Session } from "@warcode/schema/session"
export { SessionInbox } from "@warcode/schema/session-inbox"
export { SessionMessage } from "@warcode/schema/session-message"
export { Skill } from "@warcode/schema/skill"
export { Prompt } from "@warcode/schema/prompt"
export { PromptInput } from "@warcode/schema/prompt-input"
export type { WarcodeEvent } from "@warcode/protocol/groups/event"
export type WarcodeClient = Effect.Success<ReturnType<typeof Warcode.make>>
