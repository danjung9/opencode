import type { ElectronNative } from "../preload/types"

declare global {
  interface ImportMetaEnv {
    readonly WARCODE_TEST_ONBOARDING: boolean
  }

  interface Window {
    electron: ElectronNative
    __WARCODE__?: {
      deepLinks?: string[]
    }
  }
}
