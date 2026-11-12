interface ImportMetaEnv {
  readonly WARCODE_CHANNEL: string
  readonly WARCODE_VERSION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
