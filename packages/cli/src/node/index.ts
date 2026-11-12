import "./plugin-runtime.promise"
import "./plugin-runtime.effect"
import path from "node:path"
import { pathToFileURL } from "node:url"

process.stdout.on("error", (error) => {
  if ("code" in error && error.code === "EPIPE") return
  throw error
})

await main()

async function main() {
  if (process.argv[2] !== "--bundled-mcp") return import("../index")
  if (process.argv[3] !== "palantir") throw new Error("Unknown bundled MCP server")
  const entry = path.join(process.env.WARCODE_NODE_ASSETS_DIR!, "mcp/palantir.mjs")
  process.argv = [process.execPath, entry, ...process.argv.slice(4)]
  await import(pathToFileURL(entry).href)
}
