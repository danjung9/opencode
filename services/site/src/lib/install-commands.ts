// Every Warcode install command the site shows: the home install row, the Terminal, Mini and SDK
// pages, the docs, llms.txt, the view-source comment, voice answers and the console API.
// Checked on 5 Nov 2026 against the release workflow on origin/dev (.github/release/publish-npm.sh,
// publish-homebrew.sh, publish-aur.sh, the repo's install script) and the live registries, where each
// one installed Warcode 2.2.5:
// - npm: @warcode/cli, dist-tag latest = 2.2.5. Its postinstall links the platform binary, so Bun
//   needs --trust and pnpm needs --allow-build. mise resolves `warcode` to npm:@warcode/cli.
// - https://opencode.ai/v2/install reads warcode.ai/update/api/latest/cli/npm (@warcode/cli 2.2.5).
// - Homebrew: anomalyco/tap/warcode-v2 = 2.2.5. AUR: warcode-beta = 2.2.5-1.
// Warcode 1 still lives under the old names: the warcode-ai npm package (1.19.5),
// https://opencode.ai/install, anomalyco/tap/warcode (1.19.5) and the warcode-bin AUR package
// (1.19.5). test/install-commands.test.ts keeps them out of the site.

/** The home install row, the Terminal and Mini pages, llms.txt, the console API and the view-source comment. */
export const installs = [
  { id: "curl", name: "Script", command: "curl -fsSL https://opencode.ai/v2/install | bash" },
  { id: "npm", name: "npm", command: "npm install -g @warcode/cli" },
  { id: "bun", name: "Bun", command: "bun install -g --trust @warcode/cli" },
  { id: "brew", name: "Homebrew", command: "brew install anomalyco/tap/warcode-v2" },
  { id: "paru", name: "AUR", command: "paru -S warcode-beta" },
] as const

/** The docs intro's install tabs: every channel that installs Warcode 2. */
export const docsInstalls = [
  { label: "curl", code: installs[0].command },
  { label: "homebrew", code: installs[3].command },
  { label: "npm", code: installs[1].command },
  { label: "bun", code: installs[2].command },
  { label: "pnpm", code: "pnpm add -g --allow-build=@warcode/cli @warcode/cli" },
  { label: "yarn", code: "yarn global add @warcode/cli" },
  { label: "vite+", code: "vp install -g @warcode/cli" },
  { label: "aur", code: installs[4].command },
  { label: "mise", code: "mise use -g warcode" },
]

/** The v2 SDK (@warcode/sdk, dist-tag latest = 2.2.5). */
export const sdkInstalls = [
  { id: "npm", command: "npm i @warcode/sdk" },
  { id: "bun", command: "bun add @warcode/sdk" },
] as const

/** The desktop app's Homebrew cask (warcode-desktop = 2.2.5). */
export const desktopInstall = { id: "cask", command: "brew install --cask warcode-desktop" }
