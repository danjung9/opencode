export * as SessionRestart from "./restart.js"

import { Cause, Context, Effect, Layer } from "effect"
import { makeGlobalNode } from "@opencode/util/effect/app-node"
import { Bus } from "../../bus.js"
import { Job } from "../../job.js"
import { Session } from "../../session.js"
import { SessionEvent } from "../event.js"
import { SessionExecution } from "../execution.js"
import { SessionSchema } from "../schema.js"
import { SessionStore } from "../store.js"
import { ImageNotice } from "../../image/notice.js"
import { ShellResult } from "../../shell/result.js"
import { SubagentCompletion } from "../subagent-completion.js"
import { SubagentMetadata } from "../subagent-metadata.js"

const CONTINUE_AFTER_SERVER_RESTART =
  "The server restarted while you were working. Continue from where you left off without repeating completed work."

const RESUME_EXHAUSTED = {
  type: "aborted",
  message: "Execution was interrupted repeatedly and will not be resumed automatically.",
} as const

export interface Options {
  /**
   * Times a single turn may be resumed before it is terminalized instead.
   * The counter is durable and only a terminal event resets it, so a turn
   * that keeps dying cannot crash-loop across restarts. Turns that complete
   * never accumulate: the budget is per-turn, not per-session.
   */
  readonly maxAttempts?: number
}

const DEFAULT_MAX_ATTEMPTS = 10

export interface Interface {
  /**
   * Resumes Sessions whose execution claim was never released — turns orphaned
   * by a process that died without teardown, or interrupted by a graceful
   * shutdown (which preserves the claim on purpose). The claim is never
   * cleared here: only a terminal event releases it, so a death anywhere in
   * the resume path leaves the same orphaned claim for the next boot.
   */
  readonly resumeSuspendedSessions: Effect.Effect<void>
}

/**
 * Recovery for orphaned executions. Claims are written at turn start by
 * SessionExecution, so this sweep needs no cooperation from the previous
 * process: crash, SIGKILL, isolate eviction, and graceful restart all leave
 * the same durable signature.
 *
 * Recovery is at-least-once: local coordination prevents concurrent drains,
 * not repeated external side effects after a crash.
 *
 * The sweep assumes every orphaned claim's owner is dead. The managed-server
 * protocol guarantees this: a successor is only spawned after the previous
 * process is confirmed dead (client service `kill`/`evict` poll the PID), the
 * registration lock admits one managed server at a time, and unregistered
 * servers sharing the database never sweep. The service is inert until called
 * — the managed server invokes it at boot; embedders may call it from their
 * own start-up.
 */
export class Service extends Context.Service<Service, Interface>()("@opencode/SessionRestart") {}

export const layer = (options?: Options) =>
  Layer.effect(
    Service,
    Effect.gen(function* () {
      const store = yield* SessionStore.Service
      const execution = yield* SessionExecution.Service
      const bus = yield* Bus.Service
      const jobs = yield* Job.Service
      const sessions = yield* Session.Service
      const scope = yield* Effect.scope
      const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS

      const prepareResume = Effect.fnUntraced(function* (sessionID: SessionSchema.ID) {
        // Durable before the resume runs, so a crash inside the resumed turn is
        // counted by the next sweep and the budget cannot be dodged.
        const attempts = yield* store.countResume(sessionID)
        if (attempts === undefined) return false
        if (attempts > maxAttempts) {
          // Terminalize instead: the release hook clears the claim and resets the
          // counter atomically with the terminal event.
          yield* bus.publish(
            SessionEvent.Execution.Failed,
            { sessionID, error: RESUME_EXHAUSTED },
            { commit: () => store.release(sessionID) },
          )
          return false
        }
        yield* bus.publish(SessionEvent.Synthetic, {
          sessionID,
          text: CONTINUE_AFTER_SERVER_RESTART,
          description: "Continuing after restart",
          metadata: { notice: "restart" },
        })
        return true
      })

      const restartMessage = (background: Job.Background, recovery: Exclude<Job.Recovery, { kind: "subagent" }>) => {
        const state = background.status === "running" ? "cancelled" : background.status
        if (recovery.kind === "shell") {
          const text =
            background.status === "running"
              ? "Command cancelled because the server restarted"
              : state === "completed"
                ? (background.output ?? "Command completed")
                : state === "error"
                  ? (background.error ?? "Command failed")
                  : "Command cancelled"
          return {
            description: recovery.command,
            ...ShellResult.notification({
              jobID: background.id,
              shellID: recovery.shellID,
              command: recovery.command,
              state,
              text,
            }),
          }
        }
        const body =
          background.status === "running"
            ? `Image request for ${recovery.path} was cancelled because the server restarted.`
            : state === "completed"
              ? (background.output ?? `Image request finished. Saved image: ${recovery.path} (${recovery.model}).`)
              : state === "error"
                ? (background.error ?? `Image request failed for ${recovery.path}.`)
                : `Image request for ${recovery.path} was cancelled.`
        return {
          description: "Image generation",
          text: ImageNotice.text({ id: background.id, state, body }),
          metadata: {
            source: "experimental_image_generate",
            jobID: background.id,
            state,
            path: recovery.path,
          },
        }
      }

      const recoverToolJob = Effect.fnUntraced(function* (
        background: Job.Background,
        recovery: Exclude<Job.Recovery, { kind: "subagent" }>,
      ) {
        const delivered = yield* sessions
          .synthetic({
            id: background.notificationID,
            sessionID: recovery.sessionID,
            ...restartMessage(background, recovery),
            // Restart notices must not revive idle owners of long-lived background tools.
            // Interrupted executions resume separately after their notices are admitted.
            resume: false,
          })
          .pipe(
            Effect.as(true),
            // The owner may be deleted after the pending row was read; the notice is owed
            // to nobody, so acknowledge the row instead of failing the whole sweep.
            Effect.catchTag("Session.NotFoundError", () => Effect.succeed(true)),
            // Retain the owner's row: the conflict proves another item already owns the ID,
            // so deleting it would lose the notice without admitting anything.
            Effect.catchTag("Session.SyntheticConflictError", (error) =>
              Effect.logWarning("Failed to admit recovered tool notification due to ID conflict", {
                notificationID: background.notificationID,
                sessionID: recovery.sessionID,
                error,
              }).pipe(Effect.as(false)),
            ),
            Effect.catchCause((cause) =>
              Cause.hasInterruptsOnly(cause)
                ? Effect.failCause(cause)
                : Effect.logWarning("Unexpected failure delivering recovered tool notification", {
                    notificationID: background.notificationID,
                    sessionID: recovery.sessionID,
                    cause,
                  }).pipe(Effect.as(false)),
            ),
          )
        if (!delivered) return
        yield* jobs.completeBackground(background.notificationID)
      })

      const deliverSubagentSafe = Effect.fnUntraced(function* (
        notificationID: Job.Background["notificationID"],
        recovery: Extract<Job.Recovery, { kind: "subagent" }>,
        result: Pick<Job.Background, "status" | "output" | "error">,
        resume: boolean | undefined,
      ) {
        yield* SubagentCompletion.deliver(sessions, jobs, {
          ...result,
          recovery,
          notificationID,
          resume,
        }).pipe(
          // A deleted parent owes nothing to the report; clear its row.
          Effect.catchTag("Session.NotFoundError", () => jobs.completeBackground(notificationID)),
          // Retain the formatted outbox row for the next boot: the notification ID is
          // already owned by another item, so deleting it would lose the report.
          Effect.catchTag("Session.SyntheticConflictError", (error) =>
            Effect.logWarning("Failed to admit recovered subagent notification due to ID conflict", {
              notificationID,
              parentSessionID: recovery.parentSessionID,
              childSessionID: recovery.childSessionID,
              error,
            }),
          ),
          // One bad row must never abort the sweep for other Sessions. A deleted parent
          // is acknowledged; any other failure keeps the row for the next boot.
          Effect.catchCause((cause) =>
            Cause.hasInterruptsOnly(cause)
              ? Effect.failCause(cause)
              : store.get(recovery.parentSessionID).pipe(
                  Effect.flatMap((parent) =>
                    parent === undefined
                      ? jobs.completeBackground(notificationID)
                      : Effect.logWarning("Unexpected failure delivering recovered subagent notification", {
                          notificationID,
                          parentSessionID: recovery.parentSessionID,
                          childSessionID: recovery.childSessionID,
                          cause,
                        }),
                  ),
                ),
          ),
        )
      })

      const recoverSubagent = Effect.fnUntraced(function* (
        background: Job.Background,
        recovery: Extract<Job.Recovery, { kind: "subagent" }>,
        suspended: ReadonlySet<SessionSchema.ID>,
      ): Effect.fn.Return<boolean> {
        const child = yield* store.get(recovery.childSessionID)
        if (!child || child.parentID !== recovery.parentSessionID || !(yield* store.get(recovery.parentSessionID))) {
          yield* jobs.completeBackground(background.notificationID)
          return false
        }
        const silent = !SubagentMetadata.notify(child.metadata)
        // A suspended owner must receive the notice after its own restart accounting,
        // otherwise admission would wake it before prepareResume can charge the attempt.
        const resumeParent = suspended.has(recovery.parentSessionID) ? false : undefined

        if (background.status !== "running") {
          // The outbox row already holds the formatted result; replay it without touching
          // the child. A silent link owes no report, so only the marker needs clearing.
          if (silent) {
            yield* jobs.completeBackground(background.notificationID)
            return false
          }
          yield* deliverSubagentSafe(background.notificationID, recovery, background, resumeParent)
          return false
        }

        if (yield* execution.isActive(recovery.childSessionID)) return false
        // prepareResume publishes Execution.Failed directly on the bus outside the
        // coordinator, so the settle hook never reports an exhausted child.
        if (!(yield* prepareResume(recovery.childSessionID))) {
          if (silent) {
            yield* jobs.completeBackground(background.notificationID)
            return false
          }
          yield* deliverSubagentSafe(
            background.notificationID,
            recovery,
            { status: "error", error: RESUME_EXHAUSTED.message },
            resumeParent,
          )
          return false
        }
        // Defer the start until every suspended root has counted its attempt; a fast
        // resumed child settling in Phase 1 would wake its parent past that budget.
        return true
      })

      type ResumableSubagent = {
        readonly background: Job.Background
        readonly recovery: Extract<Job.Recovery, { kind: "subagent" }>
      }

      return Service.of({
        resumeSuspendedSessions: Effect.gen(function* () {
          const active = yield* execution.active
          const pending = yield* jobs.pendingBackground
          const children = pending.flatMap((background) =>
            background.status === "running" && background.recovery.kind === "subagent"
              ? [background.recovery.childSessionID]
              : [],
          )
          // Early notices wait for recovery's accounting, including Sessions that exhaust their budget.
          const suspended = new Set(
            [...(yield* store.listSuspended()), ...children].filter((sessionID) => !active.has(sessionID)),
          )
          yield* store.releaseChildClaims(children)
          const resumable: ResumableSubagent[] = []
          yield* Effect.forEach(
            // Admit shell outcomes before a recovered child can start its first model request.
            pending.toSorted((a, b) => Number(a.recovery.kind === "subagent") - Number(b.recovery.kind === "subagent")),
            Effect.fnUntraced(function* (background) {
              if ((yield* jobs.get(background.id))?.status === "running") return
              const recovery = background.recovery
              if (recovery.kind !== "subagent") return yield* recoverToolJob(background, recovery)
              if (yield* recoverSubagent(background, recovery, suspended)) resumable.push({ background, recovery })
            }),
            { discard: true },
          )

          // Count every suspended root's attempt before a resumed child can settle and wake it.
          const resumed = yield* execution.active
          yield* Effect.forEach(
            (yield* store.listSuspended()).filter((sessionID) => !resumed.has(sessionID)),
            (sessionID) =>
              execution
                .resume(sessionID)
                .pipe(Effect.ignore, Effect.forkIn(scope), Effect.when(prepareResume(sessionID))),
            { concurrency: "unbounded", discard: true },
          )

          // Start children only now: their settlement reports wake parents, so the parent's
          // restart budget must already be charged. SessionExecution's settle hook owns the
          // report, so no jobs.wait observer is needed.
          yield* Effect.forEach(
            resumable,
            ({ background, recovery }) =>
              jobs.start({
                id: background.id,
                type: "subagent",
                title: recovery.description,
                notificationID: background.notificationID,
                recovery,
                background: true,
                run: execution.resume(recovery.childSessionID).pipe(
                  Effect.onInterrupt(() =>
                    jobs
                      .isCancelled(background.id)
                      .pipe(
                        Effect.flatMap((cancelled) =>
                          cancelled ? execution.interrupt(recovery.childSessionID) : Effect.void,
                        ),
                      ),
                  ),
                  Effect.as(""),
                ),
              }),
            { discard: true },
          )
          suspended.clear()
        }),
      })
    }),
  )

export const node = makeGlobalNode({
  service: Service,
  layer: layer(),
  deps: [SessionStore.node, SessionExecution.node, Bus.node, Job.node, Session.node],
})
