export const available = true

export async function resolveBinary() {
  return process.env.WARCODE_PTY_BIN || "warcode-pty"
}
