import { expect, test } from "bun:test"
import { rankSessionTitle } from "./session-match"

test.each([
  { title: "WARCODE CONSOLE", query: "open con", rank: 1 },
  { title: "WARCODE CONSOLE", query: "WARCODE CONSOLE", rank: 0 },
  { title: "WARCODE CONSOLE", query: "warcode console", rank: 0 },
  { title: "WARCODE CONSOLE", query: "console", rank: 2 },
  { title: "WARCODE CONSOLE", query: "WARCODE CONSOLE ", rank: undefined },
  { title: "WARCODE CONSOLE", query: "WARCODE CONSOLE on", rank: undefined },
  { title: "HOME", query: "HOME ", rank: undefined },
  { title: "HOME", query: "home", rank: 0 },
  { title: "Home office", query: "home", rank: 1 },
  { title: "Back home", query: "home", rank: 2 },
  { title: "foobar", query: "foo bar", rank: undefined },
  { title: "foo bar", query: "foo bar", rank: 0 },
  { title: "console", query: "sole", rank: undefined },
])("$query against $title: $rank", (row) => {
  expect(rankSessionTitle(row.title, row.query)).toBe(row.rank)
})
