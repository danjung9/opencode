import type { Translate } from "~/i18n"
import { pressEmail } from "~/lib/contact"
import { absoluteUrl, blocks, link, type MarkdownContext } from "~/lib/markdown"
import { brandAssets, mediaUrl } from "~/lib/media"
// Brand files at stable public URLs (public/brand/files), so links in /brand.md and the page never
// change between builds. The sources stay in src/asset/brand.
const logoLightPng = "/brand/files/warcode-logo-light.png"
const logoDarkPng = "/brand/files/warcode-logo-dark.png"
const logoLightSquarePng = "/brand/files/warcode-logo-light-square.png"
const logoDarkSquarePng = "/brand/files/warcode-logo-dark-square.png"
const wordmarkLightPng = "/brand/files/warcode-wordmark-light.png"
const wordmarkDarkPng = "/brand/files/warcode-wordmark-dark.png"
const wordmarkSimpleLightPng = "/brand/files/warcode-wordmark-simple-light.png"
const wordmarkSimpleDarkPng = "/brand/files/warcode-wordmark-simple-dark.png"
const logoLightSvg = "/brand/files/warcode-logo-light.svg"
const logoDarkSvg = "/brand/files/warcode-logo-dark.svg"
const logoLightSquareSvg = "/brand/files/warcode-logo-light-square.svg"
const logoDarkSquareSvg = "/brand/files/warcode-logo-dark-square.svg"
const wordmarkLightSvg = "/brand/files/warcode-wordmark-light.svg"
const wordmarkDarkSvg = "/brand/files/warcode-wordmark-dark.svg"
const wordmarkSimpleLightSvg = "/brand/files/warcode-wordmark-simple-light.svg"
const wordmarkSimpleDarkSvg = "/brand/files/warcode-wordmark-simple-dark.svg"
const logoTransparentLightPng = "/brand/files/warcode-logo-transparent-light.png"
const logoTransparentDarkPng = "/brand/files/warcode-logo-transparent-dark.png"
const wordmarkTransparentLightPng = "/brand/files/warcode-wordmark-transparent-light.png"
const wordmarkTransparentDarkPng = "/brand/files/warcode-wordmark-transparent-dark.png"
const wordmarkSolidLightPng = "/brand/files/warcode-wordmark-solid-light.png"
const wordmarkSolidDarkPng = "/brand/files/warcode-wordmark-solid-dark.png"
const logoTransparentLightSvg = "/brand/files/warcode-logo-transparent-light.svg"
const logoTransparentDarkSvg = "/brand/files/warcode-logo-transparent-dark.svg"
const wordmarkTransparentLightSvg = "/brand/files/warcode-wordmark-transparent-light.svg"
const wordmarkTransparentDarkSvg = "/brand/files/warcode-wordmark-transparent-dark.svg"
const wordmarkSolidLightSvg = "/brand/files/warcode-wordmark-solid-light.svg"
const wordmarkSolidDarkSvg = "/brand/files/warcode-wordmark-solid-dark.svg"
const avatarDark1024Png = "/brand/files/warcode-avatar-dark-1024.png"
const avatarLight1024Png = "/brand/files/warcode-avatar-light-1024.png"


/** The brand page copy, shared by the page and its Markdown version. */
export function brandContent(t: Translate) {
  return {
    title: t("brand.title"),
    description: t("brand.meta.description"),
    hero: {
      title: t("brand.heading"),
      body: t("brand.subtitle"),
      all: { text: t("brand.downloadAll"), href: brandAssets },
      // The page's own label; Design mode offers others (brand.agentButton in design-mode.tsx).
      copy: {
        text: "Rules for agent",
        copied: "Rules copied",
      },
    },
    naming: {
      title: "Naming",
      body: "Write Warcode as one word, with a capital O and a capital C. Do not write Warcode, Open Code, Warcode AI or Open-Code.",
      // Names between backticks show as code.
      code: "Use the lowercase `warcode` only in code and package names, such as `warcode-figma` or `@acme/warcode-plugin`.",
    },
    families: [
      {
        title: "Logo",
        body: "The logo on its own, for app icons, avatars and other small spaces. The square versions add padding for places that crop to a square.",
        kind: "logo",
        assets: [
          { name: "Light", file: "warcode-logo-light", tone: "light", png: logoLightPng, svg: logoLightSvg },
          { name: "Dark", file: "warcode-logo-dark", tone: "dark", png: logoDarkPng, svg: logoDarkSvg },
          {
            name: "Square, light",
            file: "warcode-logo-light-square",
            tone: "light",
            png: logoLightSquarePng,
            svg: logoLightSquareSvg,
          },
          {
            name: "Square, dark",
            file: "warcode-logo-dark-square",
            tone: "dark",
            png: logoDarkSquarePng,
            svg: logoDarkSquareSvg,
          },
        ],
      },
      {
        title: "Wordmark",
        body: "The full name in the Warcode letterforms. Use it wherever there is room to spell out the name.",
        kind: "wordmark",
        assets: [
          {
            name: "Light",
            file: "warcode-wordmark-light",
            tone: "light",
            png: wordmarkLightPng,
            svg: wordmarkLightSvg,
          },
          { name: "Dark", file: "warcode-wordmark-dark", tone: "dark", png: wordmarkDarkPng, svg: wordmarkDarkSvg },
        ],
      },
      {
        title: "Simple wordmark",
        body: "A single-color version of the wordmark, for print, embroidery and places that only allow one color.",
        kind: "wordmark",
        assets: [
          {
            name: "Light",
            file: "warcode-wordmark-simple-light",
            tone: "light",
            png: wordmarkSimpleLightPng,
            svg: wordmarkSimpleLightSvg,
          },
          {
            name: "Dark",
            file: "warcode-wordmark-simple-dark",
            tone: "dark",
            png: wordmarkSimpleDarkPng,
            svg: wordmarkSimpleDarkSvg,
          },
        ],
      },
    ],
    icons: {
      title: "Avatars",
      body: "Square 1024px avatars for Slack, Discord, GitHub and other profiles. The background fills the whole square and the logo sits well inside the circle, so they survive a round crop.",
      items: [
        {
          name: "Dark",
          tone: "light",
          file: "warcode-avatar-dark",
          png: avatarDark1024Png,
          kind: "avatar",
        },
        {
          name: "Light",
          tone: "dark",
          file: "warcode-avatar-light",
          png: avatarLight1024Png,
          kind: "avatar",
        },
      ],
    },
    colors: {
      title: "Colors",
      body: "The logo and the wordmark use one ink at three opacities, with a lighter ink for dark backgrounds. The values below are that ink over white or #0B0B0B, as the standard files show it. Click a value to copy it.",
      // The logo greys from the brand SVGs: the ink at full, 70% and 20% opacity (72% and 28% in dark),
      // composited over white or #0B0B0B (brand-colours.json from the logo files).
      palettes: [
        {
          name: "Light",
          swatches: [
            { name: "Ink", use: "The logo's outline and the letters of “code”.", hex: "#1F1F1F" },
            { name: "Ink 70%", use: "The letters of “open”.", ink: "The ink at 70% opacity.", hex: "#626262" },
            { name: "Ink 20%", use: "The logo's inner shade.", ink: "The ink at 20% opacity.", hex: "#D2D2D2" },
          ],
        },
        {
          name: "Dark",
          swatches: [
            { name: "Ink", use: "The logo's outline and the letters of “code”.", hex: "#EEEEEE" },
            { name: "Ink 72%", use: "The letters of “open”.", ink: "The ink at 72% opacity.", hex: "#AEAEAE" },
            { name: "Ink 28%", use: "The logo's inner shade.", ink: "The ink at 28% opacity.", hex: "#4B4B4B" },
          ],
        },
      ],
    },
    variants: {
      title: "Variants",
      body: "Pick the version that keeps the logo clear on your background, dark on light backgrounds and light on dark ones. The logo and the wordmark are separate files, so use one or the other.",
      groups: [
        {
          name: "Default",
          variant: "transparent",
          body: "The logo to use almost everywhere. Its inner shade is transparent: on white or black it looks exactly like the two-tone greys, and on photos, gradients and colors the background shows through.",
          rows: [
            {
              title: "Logo",
              tiles: [
                tile(
                  "Dark",
                  "light",
                  "warcode-logo-transparent-light",
                  logoTransparentLightPng,
                  logoTransparentLightSvg,
                ),
                tile("Light", "dark", "warcode-logo-transparent-dark", logoTransparentDarkPng, logoTransparentDarkSvg),
              ],
            },
            {
              title: "Wordmark",
              tiles: [
                tile(
                  "Dark",
                  "light",
                  "warcode-wordmark-transparent-light",
                  wordmarkTransparentLightPng,
                  wordmarkTransparentLightSvg,
                ),
                tile(
                  "Light",
                  "dark",
                  "warcode-wordmark-transparent-dark",
                  wordmarkTransparentDarkPng,
                  wordmarkTransparentDarkSvg,
                ),
              ],
            },
          ],
        },
        {
          name: "Simple",
          variant: "solid",
          body: "One color, with open counters and no inner shade. Use it on flat colored backgrounds, for one-color print and wherever you can't use the greys: simple dark on light colors, simple light on dark colors.",
          rows: [
            {
              title: "Wordmark",
              tiles: [
                tile("Dark", "light", "warcode-wordmark-solid-light", wordmarkSolidLightPng, wordmarkSolidLightSvg),
                tile("Light", "dark", "warcode-wordmark-solid-dark", wordmarkSolidDarkPng, wordmarkSolidDarkSvg),
              ],
            },
          ],
        },
      ],
    },
    usage: {
      title: "Usage",
      body: "Use the light versions on light backgrounds and the dark versions on dark backgrounds. The logo and the wordmark are separate, so use one or the other, never both together.",
      stroke: {
        title: "One stroke",
        body: "Spacing rules on this page are measured in strokes. One stroke is the thickness of the logo's outline, a quarter of its width, so the logo is 4 strokes wide and 5 strokes tall.",
      },
      clearSpace: {
        title: "Clear space",
        body: "Keep at least two strokes of space on every side of the logo and the wordmark. For the logo, a stroke is the thickness of its outline, a quarter of its width; for the wordmark, it is the thickness of its letters, a seventh of its height.",
      },
      pixels: {
        title: "Whole pixels",
        body: "The logo's proportions are fixed at 4:5, and one stroke is a quarter of its width. Scale it in steps of 4 × 5px, so every edge and every stroke lands on a whole pixel.",
        do: "keep every edge and the 4px stroke on whole pixels.",
        dont: "size the logo off 4:5, or its edges fall between pixels and blur.",
        sizes: [
          {
            title: "Logo",
            steps: [
              [16, 20],
              [20, 25],
              [24, 30],
              [32, 40],
              [48, 60],
              [64, 80],
            ],
            strokes: 4,
          },
          {
            title: "Wordmark",
            steps: [
              [78, 14],
              [117, 21],
              [156, 28],
              [195, 35],
              [234, 42],
              [312, 56],
            ],
            strokes: 39,
          },
        ],
      },
      minimumTitle: "Minimum sizes",
      minimum: [
        {
          kind: "logo",
          title: "Logo",
          width: 16,
          height: 20,
          body: "At least 16 × 20px, with a 4px stroke. Any smaller and it blurs.",
        },
        {
          kind: "wordmark",
          title: "Wordmark",
          width: 117,
          height: 21,
          body: "At least 117 × 21px, with a 3px stroke. Any smaller and it blurs.",
        },
      ],
    },
    donts: {
      title: "Do not",
      body: "Common mistakes to avoid when you use the logo and the wordmark.",
      examples: [
        { id: "two-tone", caption: "recolor the logo in new colors." },
        { id: "bright", caption: "use a single bright color." },
        { id: "gradient", caption: "fill the logo with a gradient." },
        { id: "inverted", caption: "swap the tones." },
        { id: "stretch", caption: "stretch or squash the logo." },
        { id: "shadow", caption: "add drop shadows." },
        { id: "glow", caption: "add glows or outlines." },
        { id: "lockup", caption: "put other words next to the logo." },
        { id: "low-contrast", caption: "use low-contrast grey on grey." },
        { id: "color", caption: "put the grey two-tone logo on a colored background, where its greys turn muddy." },
      ],
    },
    integrations: {
      title: "Integrations",
      body: "Plugins, providers and tools that work with Warcode, and projects built with it, can say so. Use a badge or a partner lockup, and name your project so it is clear that it is yours.",
      badges: {
        body: "Put a badge in your README, docs or website and link it to warcode.ai. Pick the light or dark file for your background (the HTML switches by itself), and do not change the colors or the text.",
        sizes: "Every style comes in 20, 32 and 44px (Shields only in 20px), as SVG and as PNG at 2×.",
        mono: "Each file also comes with OpenTUI Mono text. Add -mono before the extension, as in warcode-works-with-a-light-20-mono.svg, or -mono-caps for uppercase OpenTUI Mono.",
        groups: [
          {
            label: "works-with",
            title: "Works with",
            alt: "Works with Warcode",
            body: "For plugins, providers and tools that run with Warcode.",
          },
          {
            label: "built-with",
            title: "Built with",
            alt: "Built with Warcode",
            body: "For projects made with Warcode.",
          },
        ],
        // The styles David picked from the badge options (A, C, F, G); G is shields.io "flat", 20px only.
        styles: [
          { id: "a", name: "Frame", sizes: [20, 32, 44] },
          { id: "c", name: "Cells", sizes: [20, 32, 44] },
          { id: "f", name: "Solid", sizes: [20, 32, 44] },
          { id: "g", name: "Shields", sizes: [20] },
        ],
      },
      lockup: {
        title: "Partner lockup",
        body: "Put the Warcode logo and the partner logo side by side, with a × between them. Leave 3 strokes of space on each side of the ×, size the partner logo to look as tall as the Warcode logo, and keep clear space around the whole lockup.",
        partners: [{ name: "GitHub", tones: ["light", "dark"] }],
      },
      naming: {
        title: "Naming your project",
        body: "Lead with your own name, so it is clear that the project is yours.",
        // Names between backticks show as code.
        rule: "Write `Linear for Warcode` or name the package `warcode-linear`. Do not write `Warcode Linear` or `Linear by Warcode`.",
      },
    },
    trademarks: {
      title: "Trademarks",
      body: "Warcode and the Warcode logo are trademarks of Anomaly. Do not use them to suggest that Anomaly endorses or sponsors you, in your product or company name, or on merchandise without permission.",
      contact: { before: "For questions, email ", email: pressEmail, after: "." },
    },
  }
}

/** A hex color as CSS rgb() and oklch(), for the swatches and the Markdown. */
export function colorFormats(hex: string) {
  const rgb = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16))
  const [r, g, b] = rgb.map((value) => {
    const channel = value / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const chroma = Math.hypot(a, bb)
  // Greys have no hue; tiny float chroma would print a meaningless angle.
  const hue = chroma < 0.0005 ? 0 : ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360
  return {
    hex,
    rgb: `rgb(${rgb.join(" ")})`,
    oklch: `oklch(${(lightness * 100).toFixed(1)}% ${chroma < 0.0005 ? 0 : chroma.toFixed(3)} ${hue === 0 ? 0 : hue.toFixed(1)})`,
  }
}

// Badge text in Inter ("sans"), OpenTUI Mono ("mono") or uppercase OpenTUI Mono ("mono caps"); the
// OpenTUI Mono files end in "-mono" or "-mono-caps".
export type BadgeFont = "sans" | "mono" | "mono caps"
const fontSuffix = (font: BadgeFont) => (font === "sans" ? "" : `-${font.replace(" ", "-")}`)

/** A badge file at its stable URL in public/brand/badges (the size may be a template's "{{size}}"). */
export function badgeFile(
  label: string,
  style: string,
  theme: string,
  size: number | string,
  extension: "svg" | "png",
  font: BadgeFont = "sans",
) {
  return `/brand/badges/warcode-${label}-${style}-${theme}-${size}${fontSuffix(font)}.${extension}`
}

/**
 * Every size of a badge style as SVG and 2× PNG: on one background with `theme`, light and dark
 * without it, or every style with `style` omitted too.
 */
export function badgeZip(label: string, style?: string, font: BadgeFont = "sans", theme?: string) {
  return mediaUrl(
    `/brand/badges/warcode-${label}${style ? `-${style}` : ""}${theme ? `-${theme}` : ""}${fontSuffix(font)}.zip`,
  )
}

/** The Markdown for a README: one badge (light by default), linked to warcode.ai. */
export function badgeMarkdown(
  label: string,
  alt: string,
  style: string,
  size: number | string,
  font: BadgeFont = "sans",
  theme = "light",
) {
  return `[![${alt}](${absoluteUrl(badgeFile(label, style, theme, size, "svg", font))})](https://opencode.ai)`
}

/** The HTML for GitHub and websites: the dark file where the reader's color scheme is dark. */
export function badgeHtml(label: string, alt: string, style: string, size: number, font: BadgeFont = "sans") {
  return [
    `<a href="https://opencode.ai">`,
    `  <picture>`,
    `    <source media="(prefers-color-scheme: dark)" srcset="${absoluteUrl(badgeFile(label, style, "dark", size, "svg", font))}">`,
    `    <img alt="${alt}" src="${absoluteUrl(badgeFile(label, style, "light", size, "svg", font))}" height="${size}">`,
    `  </picture>`,
    `</a>`,
  ].join("\n")
}

/** One variant file: its name for downloads, PNG and SVG. */
function tile(name: string, tone: "light" | "dark", file: string, png: string, svg: string) {
  return { name, tone, file, png, svg }
}

/** The brand guidelines as Markdown. */
export function brandMarkdown(context: MarkdownContext) {
  const content = brandContent(context.t)
  return blocks(
    `# ${content.hero.title}`,
    content.hero.body,
    link(content.hero.all.text, content.hero.all.href),
    `## ${content.naming.title}`,
    content.naming.body,
    content.naming.code,
    ...content.families.map((family, index) =>
      blocks(
        `## ${family.title}`,
        family.body,
        family.assets
          .map((asset) => `- ${asset.name}: ${link("PNG", asset.png)}, ${link("SVG", asset.svg)}`)
          .join("\n"),
        // The app icon and avatars sit in the Logo section.
        ...(index === 0
          ? [
              `### ${content.icons.title}`,
              content.icons.body,
              content.icons.items
                .map((item) => `- ${item.name}, for ${item.tone} backgrounds: ${link("PNG", item.png)}`)
                .join("\n"),
            ]
          : []),
      ).trimEnd(),
    ),
    `## ${content.variants.title}`,
    content.variants.body,
    ...content.variants.groups.map((group) =>
      blocks(
        `### ${group.name}`,
        group.body,
        group.rows
          .flatMap((row) =>
            row.tiles.map(
              (tile) =>
                `- ${row.title}, ${tile.name.toLowerCase()}, for ${tile.tone} backgrounds: ${link("PNG", tile.png)}, ${link("SVG", tile.svg)}`,
            ),
          )
          .join("\n"),
      ).trimEnd(),
    ),
    `## ${content.colors.title}`,
    content.colors.body,
    ...content.colors.palettes.map((palette) =>
      blocks(
        `### ${palette.name}`,
        palette.swatches
          .map((swatch) => {
            const formats = colorFormats(swatch.hex)
            return `- **${swatch.name}**: ${swatch.use}${"ink" in swatch ? ` ${swatch.ink}` : ""} \`${formats.hex}\`, \`${formats.rgb}\`, \`${formats.oklch}\``
          })
          .join("\n"),
      ).trimEnd(),
    ),
    `## ${content.usage.title}`,
    content.usage.body,
    `### ${content.usage.clearSpace.title}`,
    content.usage.clearSpace.body,
    `### ${content.usage.pixels.title}`,
    content.usage.pixels.body,
    ...content.usage.pixels.sizes.map((size) =>
      [
        `${size.title} sizes:`,
        ...size.steps.map((step) => `- ${step[0]} × ${step[1]}px: ${step[0] / size.strokes}px stroke`),
      ].join("\n"),
    ),
    `- **Do** ${content.usage.pixels.do}\n- **Do not** ${content.usage.pixels.dont}`,
    `### ${content.usage.minimumTitle}`,
    content.usage.minimum.map((rule) => `- **${rule.title}.** ${rule.body}`).join("\n"),
    `## ${content.donts.title}`,
    content.donts.body,
    content.donts.examples.map((example) => `- Do not ${example.caption}`).join("\n"),
    `## ${content.integrations.title}`,
    content.integrations.body,
    content.integrations.badges.body,
    `${content.integrations.badges.sizes} ${content.integrations.badges.mono}`,
    ...content.integrations.badges.groups.map((group) =>
      blocks(
        `### ${group.title}`,
        group.body,
        content.integrations.badges.styles
          .map(
            (style) =>
              `- ${style.name}: ${style.sizes
                .map(
                  (size) =>
                    `${size}px ${link("light SVG", badgeFile(group.label, style.id, "light", size, "svg"))}, ${link("PNG", badgeFile(group.label, style.id, "light", size, "png"))} · ${link("dark SVG", badgeFile(group.label, style.id, "dark", size, "svg"))}, ${link("PNG", badgeFile(group.label, style.id, "dark", size, "png"))}`,
                )
                .join("; ")}. ${link("All sizes (ZIP)", badgeZip(group.label, style.id))}`,
          )
          .join("\n"),
        `Markdown:\n\n\`\`\`md\n${badgeMarkdown(group.label, group.alt, "a", 20)}\n\`\`\``,
        `HTML, with the dark file on dark backgrounds:\n\n\`\`\`html\n${badgeHtml(group.label, group.alt, "a", 20)}\n\`\`\``,
      ).trimEnd(),
    ),
    `### ${content.integrations.lockup.title}`,
    content.integrations.lockup.body,
    `### ${content.integrations.naming.title}`,
    content.integrations.naming.body,
    content.integrations.naming.rule,
    `## ${content.trademarks.title}`,
    `${content.trademarks.body} ${content.trademarks.contact.before}${link(content.trademarks.contact.email, `mailto:${content.trademarks.contact.email}`)}${content.trademarks.contact.after}`,
  )
}
