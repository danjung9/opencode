import type { FileSystem } from "@warcode/core/filesystem"
import { Bus } from "@warcode/core/bus"
import { Image } from "@warcode/core/image"
import { LocationServiceMap } from "@warcode/core/location-service-map"
import type { LocationServices } from "@warcode/core/location-services"
import { Plugin } from "@warcode/core/plugin"
import { PluginHooks } from "@warcode/core/plugin/hooks"
import { Skill } from "@warcode/core/skill"
import type { Location } from "@warcode/schema/location"
import { makeGlobalNode } from "@warcode/util/effect/app-node"
import { LayerNode } from "@warcode/util/effect/layer-node"
import { Effect, Layer, LayerMap } from "effect"

// Plain-prompt unit fixtures use virtual directories.
export const promptLocationNode = makeGlobalNode({
  service: LocationServiceMap.Service,
  layer: Layer.effect(
    LocationServiceMap.Service,
    Effect.gen(function* () {
      const bus = yield* Bus.Service
      return yield* LayerMap.make(
        (_ref: Location.Ref) =>
          LayerNode.compile(LayerNode.group([PluginHooks.node, Image.node, Skill.node, Plugin.node]), {
            replacements: [
              Bus.node.replace(Layer.succeed(Bus.Service, bus)),
              Plugin.node.replace(Layer.mock(Plugin.Service, { awaitActivation: Effect.void })),
            ],
          }) as unknown as Layer.Layer<LocationServices, FileSystem.DirectoryNotFoundError>,
      )
    }),
  ),
  deps: [Bus.node],
})
