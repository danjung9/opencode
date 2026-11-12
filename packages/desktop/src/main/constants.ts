import { app } from "electron"

type Channel = "local" | "dev" | "beta" | "prod"

const raw = import.meta.env.WARCODE_CHANNEL

export const CHANNEL: Channel = raw === "local" || raw === "dev" || raw === "beta" || raw === "prod" ? raw : "dev"

export const VERSION = app.isPackaged ? app.getVersion() : (process.env.WARCODE_VERSION ?? app.getVersion())

const appNames: Record<string, string> = {
  dev: "Warcode Dev",
  beta: "Warcode Beta",
  prod: "Warcode",
}

const appIDs: Record<string, string> = {
  dev: "ai.warcode.desktop.dev",
  beta: "ai.warcode.desktop.beta",
  prod: "ai.warcode.desktop",
}

// Local renderer/server mode keeps the dev application identity.
export const APP_NAME = app.isPackaged ? appNames[CHANNEL] : "Warcode Dev"

export const APP_ID = app.isPackaged ? appIDs[CHANNEL] : "ai.warcode.desktop.dev"
