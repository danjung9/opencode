import { expect, test } from "bun:test"
import { consoleProviderGroup, consoleProviderName } from "./console"

test.each(["warcode", "opencode"])("groups only providers managed by the active Console workspace with root %s", (root) => {
  const direct = { id: "openai", integrationID: "openai", name: "Anomaly / OpenAI" }

  const group = consoleProviderGroup([
    { id: "warcode", integrationID: "warcode", name: "Warcode" },
    { id: root, integrationID: "warcode", name: "Anomaly / Warcode" },
    { id: "console-openai", integrationID: "warcode", name: "Anomaly / OpenAI" },
    { id: "console-google", integrationID: "warcode", name: "Anomaly / Google" },
    direct,
  ])

  expect(group).toBeDefined()

  if (!group) throw new Error("Expected Console provider group")
  expect(group.workspace).toBe("Anomaly")
  expect(group.providers.map((provider) => provider.id)).toEqual([root, "console-openai", "console-google"])
  expect(consoleProviderName(group, group.providers[1].name)).toBe("OpenAI")
  expect(group.providers).not.toContain(direct)
})
