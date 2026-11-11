import { Option, Schema } from "effect"

declare const WARCODE_VERSION: string
declare const WARCODE_CHANNEL: string
declare const WARCODE_ARTIFACT: string
declare const WARCODE_RELEASE_HIGHLIGHTS: string

const version = typeof WARCODE_VERSION === "string" ? WARCODE_VERSION : "local"
const channel = typeof WARCODE_CHANNEL === "string" ? WARCODE_CHANNEL : "local"
const artifact = typeof WARCODE_ARTIFACT === "string" ? WARCODE_ARTIFACT : "cli"
// Stable release builds embed the release notes' Highlights; every other build has none.
const highlights =
  typeof WARCODE_RELEASE_HIGHLIGHTS === "string"
    ? Option.getOrElse(
        Schema.decodeUnknownOption(
          Schema.fromJsonString(Schema.Array(Schema.Struct({ title: Schema.String, body: Schema.String }))),
        )(WARCODE_RELEASE_HIGHLIGHTS),
        () => [],
      )
    : []

export {
  version as WARCODE_VERSION,
  channel as WARCODE_CHANNEL,
  artifact as WARCODE_ARTIFACT,
  highlights as WARCODE_HIGHLIGHTS,
}
export const WARCODE_LOCAL = channel === "local"
