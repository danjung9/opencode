import path from "node:path"
import { WARCODE_CHANNEL } from "./version"

export function databasePath(data: string) {
  const filename =
    process.env.WARCODE_DB ??
    (["latest", "dev", "beta", "next", "prod"].includes(WARCODE_CHANNEL) ||
    process.env.WARCODE_DISABLE_CHANNEL_DB === "1" ||
    process.env.WARCODE_DISABLE_CHANNEL_DB === "true"
      ? "warcode.db"
      : `warcode-${WARCODE_CHANNEL.replace(/[^a-zA-Z0-9._-]/g, "-")}.db`)
  return filename === ":memory:" ? filename : path.resolve(data, filename)
}
