import { expect, test } from "bun:test"
import { Env } from "../src/env"

test("session environment omits server credentials", () => {
  const previousPassword = process.env.WARCODE_PASSWORD
  const previousLegacyPassword = process.env.WARCODE_SERVER_PASSWORD
  const previousValue = process.env.WARCODE_SESSION_ENV_TEST
  process.env.WARCODE_PASSWORD = "password"
  process.env.WARCODE_SERVER_PASSWORD = "legacy"
  process.env.WARCODE_SESSION_ENV_TEST = "included"

  const environment = Env.session()

  if (previousPassword === undefined) delete process.env.WARCODE_PASSWORD
  else process.env.WARCODE_PASSWORD = previousPassword
  if (previousLegacyPassword === undefined) delete process.env.WARCODE_SERVER_PASSWORD
  else process.env.WARCODE_SERVER_PASSWORD = previousLegacyPassword
  if (previousValue === undefined) delete process.env.WARCODE_SESSION_ENV_TEST
  else process.env.WARCODE_SESSION_ENV_TEST = previousValue

  expect(environment.WARCODE_PASSWORD).toBeUndefined()
  expect(environment.WARCODE_SERVER_PASSWORD).toBeUndefined()
  expect(environment.WARCODE_SESSION_ENV_TEST).toBe("included")
})
