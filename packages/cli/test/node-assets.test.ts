import { expect, test } from "bun:test"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { Client } from "@modelcontextprotocol/client"
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio"
import { collectNodeAssets, copyNodeAssets } from "../script/node-assets"
import { collectMcpAssets } from "../script/mcp-assets"
import { nodeTarget, photonWasmAsset } from "../src/node/target"
import { tmpdir } from "../../core/test/fixture/tmpdir"
import { mkdir } from "node:fs/promises"

test("collects each SEA asset key once", async () => {
  const assets = await collectNodeAssets(nodeTarget(process.platform, process.arch))
  const keys = assets.map((asset) => asset.key)

  expect(new Set(keys).size).toBe(keys.length)
  expect(keys.filter((key) => key === nodeTarget(process.platform, process.arch).warcodePtyAsset)).toHaveLength(1)
  expect(assets.filter((asset) => asset.key === photonWasmAsset)).toEqual([
    {
      key: photonWasmAsset,
      source: fileURLToPath(import.meta.resolve(photonWasmAsset)),
    },
  ])
})

test("private MCP package keeps its dependencies and assets after relocation", async () => {
  await using directory = await tmpdir("warcode-private-mcp-")
  const fixture = path.join(directory.path, "package")
  const support = path.join(directory.path, "support/package")
  await mkdir(support, { recursive: true })
  await Bun.write(
    path.join(support, "package.json"),
    JSON.stringify({
      name: "portable-mcp-support",
      version: "1.0.0",
      type: "module",
      main: "index.js",
    }),
  )
  await Bun.write(path.join(support, "index.js"), 'export default "packaged dependency"')
  const dependency = path.join(directory.path, "support.tgz")
  const packDependency = Bun.spawn(["tar", "-czf", dependency, "-C", path.dirname(support), "package"], {
    stderr: "pipe",
  })
  expect(await new Response(packDependency.stderr).text()).toBe("")
  expect(await packDependency.exited).toBe(0)
  await Bun.write(
    path.join(fixture, "package.json"),
    JSON.stringify({
      name: "@palantir/mcp",
      version: "0.0.0-test",
      type: "module",
      bin: { mcp: "index.js" },
      dependencies: { "portable-mcp-support": `file:${dependency.replaceAll("\\", "/")}` },
    }),
  )
  await Bun.write(path.join(fixture, "asset.txt"), "packaged asset")
  await Bun.write(
    path.join(fixture, "index.js"),
    `import support from "portable-mcp-support"
import { readFileSync } from "node:fs"
console.log(JSON.stringify([support, readFileSync(new URL("./asset.txt", import.meta.url), "utf8"), ...process.argv.slice(2)]))`,
  )
  const archive = path.join(directory.path, "private-mcp.tgz")
  const pack = Bun.spawn(["tar", "-czf", archive, "-C", directory.path, "package"], { stderr: "pipe" })
  expect(await new Response(pack.stderr).text()).toBe("")
  expect(await pack.exited).toBe(0)
  const output = path.join(directory.path, "relocated")
  const build = Bun.spawn(
    [
      process.execPath,
      "-e",
      `
    import { collectMcpAssets } from "./script/mcp-assets.ts"
    import { copyNodeAssets } from "./script/node-assets.ts"
    import { nodeTarget } from "./src/node/target.ts"
    await copyNodeAssets(await collectMcpAssets(nodeTarget(process.platform, process.arch)), ${JSON.stringify(output)})
  `,
    ],
    {
      cwd: path.resolve(import.meta.dirname, ".."),
      env: { ...process.env, WARCODE_PALANTIR_MCP_PACKAGE: archive },
      stdout: "ignore",
      stderr: "pipe",
    },
  )
  const errors = await new Response(build.stderr).text()
  expect(errors).not.toContain("error:")
  expect(await build.exited).toBe(0)
  const run = Bun.spawn([process.execPath, path.join(output, "assets/mcp/palantir.mjs"), "--no-tool-search"], {
    cwd: directory.path,
    env: { ...process.env, PATH: "" },
    stdout: "pipe",
    stderr: "pipe",
  })
  expect(await new Response(run.stderr).text()).toBe("")
  expect(await run.exited).toBe(0)
  expect(JSON.parse(await new Response(run.stdout).text())).toEqual([
    "packaged dependency",
    "packaged asset",
    "--no-tool-search",
  ])
})

// The portable VS Code distribution targets Windows; tool discovery does not capture or control the desktop.
test.skipIf(process.platform !== "win32")(
  "copied Computer Use server lists tools without Node or npx on PATH",
  async () => {
    await using directory = await tmpdir("warcode-portable-mcp-")
    await copyNodeAssets(await collectMcpAssets(nodeTarget(process.platform, process.arch)), directory.path)
    const client = new Client({ name: "portable-mcp-test", version: "1.0.0" })
    const transport = new StdioClientTransport({
      command: path.join(directory.path, "assets/mcp/open-computer-use/open-computer-use.exe"),
      args: ["mcp"],
      env: { PATH: "", SystemRoot: process.env.SystemRoot ?? "C:\\Windows" },
      stderr: "pipe",
    })
    try {
      await client.connect(transport)
      expect((await client.listTools()).tools.length).toBeGreaterThan(0)
    } finally {
      await client.close()
    }
  },
)
