import { NodeFileSystem } from "@effect/platform-node"
import { compile, emitEffectImported, emitEffectShape, emitPromise, write } from "@warcode/httpapi-codegen"
import {
  ClientApi,
  clientNamespace,
  effectOmitEndpoints,
  groupNames,
  promiseOmitEndpoints,
} from "@warcode/protocol/client"
import { Agent } from "@warcode/schema/agent"
import { Artifact } from "@warcode/schema/artifact"
import { Command } from "@warcode/schema/command"
import { Config } from "@warcode/schema/config"
import { Credential } from "@warcode/schema/credential"
import { Event } from "@warcode/schema/event"
import { EventLog } from "@warcode/schema/event-log"
import { FileDiff } from "@warcode/schema/file-diff"
import { FileSystem } from "@warcode/schema/filesystem"
import { Form } from "@warcode/schema/form"
import { Generate } from "@warcode/schema/generate"
import { Instruction } from "@warcode/schema/instruction"
import { InstructionEntry } from "@warcode/schema/instruction-entry"
import { Integration } from "@warcode/schema/integration"
import { Job } from "@warcode/schema/job"
import { Location } from "@warcode/schema/location"
import { Mcp } from "@warcode/schema/mcp"
import { Model } from "@warcode/schema/model"
import { Money } from "@warcode/schema/money"
import { Permission } from "@warcode/schema/permission"
import { PermissionSaved } from "@warcode/schema/permission-saved"
import { Plugin } from "@warcode/schema/plugin"
import { Project } from "@warcode/schema/project"
import { Worktree } from "@warcode/schema/worktree"
import { AgentAttachment, FileAttachment, Prompt, PromptMention } from "@warcode/schema/prompt"
import { PromptInput } from "@warcode/schema/prompt-input"
import { Provider } from "@warcode/schema/provider"
import { Pty } from "@warcode/schema/pty"
import { PtyTicket } from "@warcode/schema/pty-ticket"
import { Question } from "@warcode/schema/question"
import { Reference } from "@warcode/schema/reference"
import { AbsolutePath, RelativePath } from "@warcode/schema/schema"
import { Schedule } from "@warcode/schema/schedule"
import { Session } from "@warcode/schema/session"
import { SessionMessage } from "@warcode/schema/session-message"
import { SessionInbox } from "@warcode/schema/session-inbox"
import { Shell } from "@warcode/schema/shell"
import { Skill } from "@warcode/schema/skill"
import { Snapshot } from "@warcode/schema/snapshot"
import { UsageLimits } from "@warcode/schema/usage-limits"
import { Vcs } from "@warcode/schema/vcs"
import { WebSearch } from "@warcode/schema/websearch"
import { Workspace } from "@warcode/schema/workspace"
import { Effect, Schema } from "effect"
import { fileURLToPath } from "url"

const promiseContract = compile(ClientApi, {
  groupNames,
  omitEndpoints: promiseOmitEndpoints,
  namespace: clientNamespace,
  aliases: true,
})
const effectContract = compile(ClientApi, {
  groupNames,
  omitEndpoints: effectOmitEndpoints,
  namespace: clientNamespace,
  aliases: true,
})
const effectTypeReferences = [
  ...namespaceTypes("Agent", "@warcode/schema/agent", Agent),
  ...namespaceTypes("Artifact", "@warcode/schema/artifact", Artifact),
  ...namespaceTypes("Command", "@warcode/schema/command", Command),
  ...namespaceTypes("Config", "@warcode/schema/config", Config),
  ...namespaceTypes("Credential", "@warcode/schema/credential", Credential),
  ...namespaceTypes("Event", "@warcode/schema/event", Event),
  ...namespaceTypes("EventLog", "@warcode/schema/event-log", EventLog),
  ...namespaceTypes("FileDiff", "@warcode/schema/file-diff", FileDiff),
  ...namespaceTypes("FileSystem", "@warcode/schema/filesystem", FileSystem),
  ...namespaceTypes("Form", "@warcode/schema/form", Form),
  ...namespaceTypes("Generate", "@warcode/schema/generate", Generate),
  ...namespaceTypes("Instruction", "@warcode/schema/instruction", Instruction),
  ...namespaceTypes("InstructionEntry", "@warcode/schema/instruction-entry", InstructionEntry),
  ...namespaceTypes("Integration", "@warcode/schema/integration", Integration),
  ...namespaceTypes("Job", "@warcode/schema/job", Job),
  typeReference("Location.PublicRef", "@warcode/schema/location", Location.PublicRef),
  typeReference("Location.PublicInfo", "@warcode/schema/location", Location.PublicInfo),
  ...namespaceTypes("Mcp", "@warcode/schema/mcp", Mcp),
  ...namespaceTypes("Model", "@warcode/schema/model", Model),
  ...namespaceTypes("Money", "@warcode/schema/money", Money),
  ...namespaceTypes("Permission", "@warcode/schema/permission", Permission),
  ...namespaceTypes("PermissionSaved", "@warcode/schema/permission-saved", PermissionSaved),
  ...namespaceTypes("Plugin", "@warcode/schema/plugin", Plugin),
  ...namespaceTypes("Project", "@warcode/schema/project", Project),
  ...namespaceTypes("Worktree", "@warcode/schema/worktree", Worktree),
  ...namespaceTypes("PromptInput", "@warcode/schema/prompt-input", PromptInput),
  ...namespaceTypes("Provider", "@warcode/schema/provider", Provider),
  ...namespaceTypes("Pty", "@warcode/schema/pty", Pty),
  ...namespaceTypes("PtyTicket", "@warcode/schema/pty-ticket", PtyTicket),
  ...namespaceTypes("Question", "@warcode/schema/question", Question),
  ...namespaceTypes("Reference", "@warcode/schema/reference", Reference),
  ...namespaceTypes("Schedule", "@warcode/schema/schedule", Schedule),
  ...namespaceTypes("Session", "@warcode/schema/session", Session),
  ...namespaceTypes("SessionMessage", "@warcode/schema/session-message", SessionMessage),
  ...namespaceTypes("SessionInbox", "@warcode/schema/session-inbox", SessionInbox),
  ...namespaceTypes("Shell", "@warcode/schema/shell", Shell),
  ...namespaceTypes("Skill", "@warcode/schema/skill", Skill),
  ...namespaceTypes("Snapshot", "@warcode/schema/snapshot", Snapshot),
  ...namespaceTypes("UsageLimits", "@warcode/schema/usage-limits", UsageLimits),
  ...namespaceTypes("Vcs", "@warcode/schema/vcs", Vcs),
  ...namespaceTypes("WebSearch", "@warcode/schema/websearch", WebSearch),
  ...namespaceTypes("Workspace", "@warcode/schema/workspace", Workspace),
  typeReference("Prompt", "@warcode/schema/prompt", Prompt),
  typeReference("PromptMention", "@warcode/schema/prompt", PromptMention),
  typeReference("FileAttachment", "@warcode/schema/prompt", FileAttachment),
  typeReference("AgentAttachment", "@warcode/schema/prompt", AgentAttachment),
  typeReference("AbsolutePath", "@warcode/schema/schema", AbsolutePath),
  typeReference("RelativePath", "@warcode/schema/schema", RelativePath),
]

await Effect.runPromise(
  Effect.all(
    [
      write(
        emitPromise(promiseContract, {
          mutableOutputs: true,
        }),
        fileURLToPath(new URL("../src/promise/generated", import.meta.url)),
      ),
      write(
        emitEffectImported(effectContract, {
          module: "../../contract",
          api: "ClientApi",
          shapeModule: "../api/api.js",
        }),
        fileURLToPath(new URL("../src/effect/generated", import.meta.url)),
      ),
      write(
        emitEffectShape(effectContract, {
          typeReferences: effectTypeReferences,
          outputTypes: {
            "event.subscribe": {
              name: "WarcodeEvent",
              import: 'import type { WarcodeEvent } from "@warcode/protocol/groups/event"',
            },
          },
        }),
        fileURLToPath(new URL("../src/effect/api", import.meta.url)),
      ),
    ],
    { concurrency: 3, discard: true },
  ).pipe(Effect.provide(NodeFileSystem.layer)),
)

function namespaceTypes(namespace: string, module: string, values: object) {
  return Object.entries(values).flatMap(([name, schema]) =>
    Schema.isSchema(schema) ? [typeReference(`${namespace}.${name}`, module, schema)] : [],
  )
}

function typeReference(name: string, module: string, schema: Schema.Top) {
  return {
    schema,
    name,
    import: `import type { ${name.split(".")[0]} } from ${JSON.stringify(module)}`,
  }
}
