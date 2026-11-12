import { expect, test } from "bun:test"
import { selectTheme, selectThemeMode, supportsThemeMode, themeModes } from "@warcode/theme/tui"
import { getWarcodeTheme } from "../../../src/theme"

test("selects complete light and dark themes independently", () => {
  const light = selectTheme(getWarcodeTheme(), "light")
  const dark = selectTheme(getWarcodeTheme(), "dark")
  expect(selectTheme(getWarcodeTheme())).toEqual(light)
  expect(light.hue).toEqual(getWarcodeTheme().light.hue)
  expect(dark.text).toEqual(getWarcodeTheme().base.text)
  expect(dark.hue).toEqual(getWarcodeTheme().dark.hue)
  expect(selectThemeMode(getWarcodeTheme(), "dark")).toEqual({ theme: dark, mode: "dark" })
})

test("selects the available mode when the requested mode is missing", () => {
  const lightOnly = { base: getWarcodeTheme().base, light: getWarcodeTheme().light } as const
  const darkOnly = { base: getWarcodeTheme().base, dark: getWarcodeTheme().dark } as const

  expect(themeModes(lightOnly)).toEqual(["light"])
  expect(themeModes(darkOnly)).toEqual(["dark"])
  expect(supportsThemeMode(lightOnly, "light")).toBeTrue()
  expect(supportsThemeMode(lightOnly, "dark")).toBeFalse()
  expect(selectThemeMode(lightOnly, "dark")).toEqual({ theme: selectTheme(getWarcodeTheme(), "light"), mode: "light" })
  expect(selectThemeMode(darkOnly, "light")).toEqual({ theme: selectTheme(getWarcodeTheme(), "dark"), mode: "dark" })
})
