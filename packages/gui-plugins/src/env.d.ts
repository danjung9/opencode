interface ImportMetaEnv {
  /** The commit a beta desktop build was built from; undefined in every other build. */
  readonly WARCODE_COMMIT?: string
  /** A beta desktop build's commit, recent history and notes as JSON (packages/desktop/script/beta-notes.ts). */
  readonly WARCODE_BETA_NOTES?: string
}
