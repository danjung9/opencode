import fs from "fs/promises"
import { expect } from "bun:test"
import { App } from "@warcode/core/app"
import { Bus } from "@warcode/core/bus"
import { Database } from "@warcode/core/database/database"
import { Watcher } from "@warcode/core/filesystem/watcher"
import { LocationServiceMap } from "@warcode/core/location-service-map"
import { ModelsDev } from "@warcode/core/models-dev"
import { Session } from "@warcode/core/session"
import { SessionExecution } from "@warcode/core/session/execution"
import { Location } from "@warcode/schema/location"
import { AbsolutePath } from "@warcode/schema/schema"
import { LayerNode } from "@warcode/util/effect/layer-node"
import { Global } from "@warcode/util/global"
import { Context, Effect, Layer, RcMap } from "effect"
import { HttpEffect, HttpRouter, HttpServer } from "effect/http"
import { tempGlobalLayer } from "../../core/test/fixture/global"
import { tmpdirScoped } from "../../core/test/fixture/tmpdir"
import { it } from "../../core/test/lib/effect"
import { createEmbeddedRoutes } from "../src/routes"

it.live("admits synthetic messages and compaction requests without booting or requiring the session Location", () =>
  Effect.gen(function* () {
    const activeDir = yield* tmpdirScoped()
    const deletedDir = yield* tmpdirScoped()
    const activeLocation = LocationServiceMap.canonical(
      Location.Ref.make({ directory: AbsolutePath.make(activeDir.path) }),
    )
    const deletedLocation = LocationServiceMap.canonical(
      Location.Ref.make({ directory: AbsolutePath.make(deletedDir.path) }),
    )

    const replacements: LayerNode.Replacements = [
      Global.node.replace(tempGlobalLayer),
      Database.node.replace(Database.node),
      Bus.node.replace(Bus.node),
      App.node.replace(App.node),
      ModelsDev.node.replace(ModelsDev.configured({ fetch: false })),
      Watcher.node.replace(Watcher.configured({ enabled: false })),
      SessionExecution.node.replace(SessionExecution.noopLayer),
    ]

    const context = yield* Layer.build(
      createEmbeddedRoutes({}, replacements).pipe(Layer.provide(HttpServer.layerServices)),
    )
    const sessions = Context.get(context, Session.Service)
    const locations = Context.get(context, LocationServiceMap.Service)
    const handler = Context.get(context, HttpRouter.HttpRouter)
      .asHttpEffect()
      .pipe(HttpEffect.toWebHandlerWith(context))

    const post = (route: string, body: unknown) =>
      Effect.promise(() =>
        handler(
          new Request(`http://opencode.local${route}`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
          }),
        ),
      )

    const coldSession = yield* sessions.create({ location: activeLocation, title: "cold" })
    const strandedSession = yield* sessions.create({ location: deletedLocation, title: "stranded" })

    // Remove the worktree directory after session creation to model a pruned worktree.
    yield* Effect.promise(() => fs.rm(deletedDir.path, { recursive: true, force: true }))
    expect(Array.from(yield* RcMap.keys(locations.rcMap))).toEqual([])

    const coldSynthetic = yield* post(`/api/session/${coldSession.id}/synthetic`, {
      text: "background notice",
      resume: false,
    })
    expect(coldSynthetic.status).toBe(200)
    expect(Array.from(yield* RcMap.keys(locations.rcMap))).toEqual([])

    const coldCompact = yield* post(`/api/session/${coldSession.id}/compact`, {})
    expect(coldCompact.status).toBe(200)
    expect(Array.from(yield* RcMap.keys(locations.rcMap))).toEqual([])

    const strandedSynthetic = yield* post(`/api/session/${strandedSession.id}/synthetic`, {
      text: "note on deleted worktree",
      resume: false,
    })
    expect(strandedSynthetic.status).toBe(200)

    const strandedCompact = yield* post(`/api/session/${strandedSession.id}/compact`, {})
    expect(strandedCompact.status).toBe(200)

    expect((yield* sessions.inbox(strandedSession.id)).map((item) => item.type)).toEqual(["synthetic", "compaction"])
  }),
)
