---
name: Warcode Workroom
description: Warm, focused coding tools within the established Electron workroom.
colors:
  primary: "#B94C2C"
  accent-text: "#A43F25"
  accent-text-hover: "#86331D"
  ivory: "#F3F0E8"
  sidebar: "#E8E3D8"
  raised: "#ECE7DD"
  raised-hover: "#E4DDD0"
  layer-two: "#E1DACB"
  ink: "#252821"
  body-ink: "#45463D"
  muted: "#626456"
  weak-text: "#69695F"
  faint: "#706756"
  border-weak: "#CFC6B7"
  border-weaker: "#DDD5C8"
  contrast: "#FFFFFF"
  success: "#35724B"
  warning: "#9B681E"
  error: "#B24038"
  info: "#446A7A"
  diff-add: "#C6DFBF"
  diff-delete: "#F0C8BF"
  dark-base: "#211F1B"
  dark-sidebar: "#191814"
  dark-layer-one: "#2B2822"
  dark-layer-two: "#373229"
  dark-ink: "#F0EADD"
  dark-body: "#D7D0C4"
  dark-muted: "#B4AC9E"
  dark-primary: "#DD865D"
  dark-accent-text: "#EEA17B"
typography:
  body:
    fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "14px"
    fontWeight: 440
    lineHeight: "150%"
    letterSpacing: "0"
  label:
    fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "13px"
    fontWeight: 530
    lineHeight: "20px"
    letterSpacing: "-0.04px"
  title:
    fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "16px"
    fontWeight: 530
  headline:
    fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "20px"
  code:
    fontFamily: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  tag:
    fontSize: "11px"
    fontWeight: 530
    lineHeight: "1"
    letterSpacing: "0.05px"
rounded:
  xs: "0.125rem"
  sm: "0.25rem"
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.625rem"
spacing:
  unit: "0.25rem"
  compact-gap: "6px"
  gap: "8px"
  field-inline: "12px"
  scroll-clearance: "16px"
components:
  button-contrast:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.contrast}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 11px"
    height: "28px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 11px"
    height: "28px"
  input:
    typography: "{typography.body}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "2px 12px"
    height: "32px"
  navigation-row:
    rounded: "{rounded.md}"
    padding: "0 8px"
    height: "28px"
    textColor: "{colors.muted}"
  tag-neutral:
    backgroundColor: "{colors.layer-two}"
    textColor: "{colors.muted}"
    typography: "{typography.tag}"
    rounded: "{rounded.xs}"
    padding: "0 4px"
    height: "16px"
  card:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 12px 10px 10px"
---

# Design System: Warcode Workroom

## Overview

**Creative North Star: "Workroom"**

Warcode is a warm, focused desktop coding environment. Ivory work surfaces, a deeper neutral sidebar, ink typography, and burnt-orange actions give the existing application its approved identity. Density remains appropriate to sessions, projects, code, and model-provider controls.

This identity fits over the established Electron skeleton. Keep the existing navigation, workspace panels, native controls, session state, keyboard commands, and coding workflows. The approved image establishes material and identity; its illustrative content does not replace the real application structure. PRODUCT.md and .impeccable/workroom-brief.md record this commitment.

**Key Characteristics:**
- Warm tonal layers with restrained functional orange.
- Compact Inter controls, IBM Plex Mono code, and a separately configured terminal font.
- Shared vector W monogram and uppercase WARCODE wordmark.
- Existing desktop interaction and accessibility behavior.

Source of truth: packages/ui/src/theme/themes/workroom.json; packages/ui/src/styles/theme.css; packages/ui/src/styles/tokens/theme.css; packages/ui/src/actions/button/button.css; packages/ui/src/components/text-field.css; packages/ui/src/components/card.css; packages/ui/src/data-display/badge/badge.css; packages/app/src/shell/titlebar/titlebar.css; packages/app/src/shell/titlebar/sidebar-organized.tsx; packages/app/src/shell/titlebar/sidebar-customized.tsx.

## Colors

The default light palette combines warm paper neutrals with orange actions. Frontmatter records exact source values; component CSS continues to consume the application's semantic custom properties.

### Primary
- **Burnt Orange** (`primary`): contrast actions, the Workroom new-session action, accent backgrounds, and focus indication.
- **Deep Orange Ink** (`accent-text`, `accent-text-hover`): readable inline accent text and its hover state, distinct from the solid action fill.

### Neutral
- **Ivory** (`ivory`): primary work surface.
- **Warm Sidebar** (`sidebar`): deeper navigation and first light layer.
- **Raised Paper** (`raised`, `raised-hover`): raised legacy surface and its hover state. These differ from the v2 layer-two token.
- **Layer Two** (`layer-two`): compact v2 tags and layered containers.
- **Ink / Body Ink / Muted / Faint**: strong hierarchy and supporting controls. Legacy weak text remains separate from v2 muted text; do not collapse their token namespaces.
- **Warm Borders** (`border-weak`, `border-weaker`): legacy dividers. V2 borders retain their translucent semantic tokens.

Success, warning, error, information, and diff tokens are functional status colors rather than additional identity accents. Workroom provides palette seeds and explicit overrides; the theme engine generates remaining semantic values. Do not assume that a palette seed is the resolved color of every status component.

Dark mode uses warm charcoal (`dark-base`, `dark-sidebar`), two lifted layers, pale ink, and a peach-orange action (`dark-primary`) with dark contrast text. It is a complementary theme, not a literal inversion. Accent text uses `dark-accent-text`. The theme source also contains dark status and diff seeds. Existing theme selection remains available.

**The Semantic Roles Rule.** Use the relevant semantic token in each namespace; preserve status, code syntax, diff, action, and focus roles independently.

## Typography

Inter is the existing self-hosted interface family; IBM Plex Mono is the existing self-hosted code family. The terminal keeps its configured font and sizing. Do not replace these roles with a new display face. The WARCODE identity is vector lettering, not an instruction to set interface text in a logo font.

### Hierarchy
- **Headline:** existing extra-large scale (20px); weight is chosen by the owning component.
- **Title:** large scale (16px), medium emphasis where applied.
- **Body:** base scale (14px), regular variable weight (440), large line height (150%).
- **Label / button:** small scale (13px), medium variable weight (530); buttons explicitly use a 20px line height and slight negative tracking (-0.04px).
- **Navigation:** compact 13px text; project rows use regular weight (440), with compact line height (16px). Group labels can be medium or 12px according to hierarchy.
- **Tag:** compact 11px text with weight (530); standard appearance instead uses the small 13px scale.
- **Code:** IBM Plex Mono and its fallback stack; inherit the owning editor/code presentation's size.

The shared scale also exposes bold weight (670), normal line height (130%), and expanded line heights (180%, 200%). These are available primitives, not a mandate to use every step on every screen. Sources: packages/ui/src/styles/theme.css, packages/ui/src/styles/base.css, and packages/ui/src/styles/tokens/theme.css.

## Layout

Preserve the Electron shell, titlebar, resizable or collapsible navigation, main work area, session tabs, composer, and existing coding/review panels. New screens inherit this shell and its density. The underlying spacing unit is a quarter rem; compact components also use explicit 6px gaps and 10px padding. Avoid normalizing those deliberate component dimensions into a newly invented scale.

Sidebar project rows are 28px high with 8px inline padding; section controls can be 24px high. Workroom's new-session action is 32px high with block margins (6px 2px). The sidebar scroll area has 16px end padding and scroll clearance, so keyboard navigation clears its feathered edges. Closed-sidebar peek behavior reuses the docked panel's box rather than resizing the zero-width aside; see packages/app/src/shell/sidebar-peek.css.

Shared breakpoint primitives are 40rem, 48rem, 64rem, 80rem, and 96rem. They describe available responsive thresholds, not verified device coverage. The verified live Electron evidence is the 1264 by 761 window in .impeccable/review/desktop.png, appearance.png, and about.png. Phone, tablet, touch, other desktop sizes, and a rendered dark-mode capture were not verified in this documentation pass. Existing mobile drawer implementation remains in place.

## Elevation & Depth

Depth comes primarily from tonal surface changes, fine borders, and compact control shadows. Existing buttons and overlays also use gradients and inset highlights: do not prohibit these native materials. Cards themselves are transparent and unshadowed. The exact v2 button-neutral, button-contrast, overlay, and input shadow expressions live in packages/ui/src/styles/tokens/theme.css and are carried in the sidecar; theme-specific overrides remain authoritative.

## Shapes

Use the existing small-radius vocabulary: tiny tags (2px), small buttons (4px), normal buttons, inputs, cards, and sidebar rows (6px). Larger shared radius primitives (8px and 10px) remain available. Preserve fine borders and the card's narrow vertical accent line (2px wide, inset 8px from top and bottom), rather than turning every surface into an elevated tile.

The W mark is a rounded-stroke vector with a 16 by 20 viewBox; the splash scales that geometry to 80 by 100. The uppercase wordmark uses shared path data from packages/ui/src/typography/wordmark/letters.ts. packages/ui/src/components/logo.tsx supplies the accessible Warcode-labelled logo and compact mark; preserve their proportions and semantic coloring.

## Components

### Buttons

Compact and tactile. Normal controls are 28px high with 11px inline padding, small controls are 24px with 9px padding, and large controls are 32px with 15px padding. Contrast, neutral, outline, ghost, danger, warning, and loading variants retain existing behavior. Contrast buttons layer the existing highlight gradient and shadow over the Workroom orange. Hover and pressed overlays differ; do not invent transform motion for ordinary buttons.

Keyboard focus uses the existing 2px semantic focus outline with a 2.5px offset. Disabled controls suppress interactive states and use opacity (0.5; contrast 0.4). Loading controls prevent pointer interaction. Workroom's sidebar new-session action adds weight (600) and a 32px height without changing the command it invokes.

### Inputs / Fields

Normal fields have a 6px radius, a 1px semantic border, and the theme-generated input background. Input text is 14px; controls are 32px high with 2px by 12px padding. The wrapper owns focus: a 3px focus-color wash at 25%, a 1px focus ring, and the existing compact shadow. Read-only inputs do not receive that wrapper focus treatment. Invalid inputs retain the critical surface and danger-border roles; placeholders use weak text. Textareas grow from a 32px minimum with 6px by 12px padding.

### Navigation

Use muted compact text, warm navigation surfaces, and existing selection semantics. Project-row hover and keyboard focus reveal the shared overlay and strengthen text; the project-row color transition is 120ms ease-in-out. Sidebar group and section controls retain their own focus background behavior. Preserve keyboard traversal, scroll visibility, organization controls, peek/dock behavior, and mobile drawer state.

### Chips / Tags

Default tags are 16px high, with 4px inline padding, a 2px radius, and a half-pixel border. Accent tags use the action background and contrast text; subtle tags remove the border. Standard tags are 18px high with 6px inline padding and the small interface text scale. These are metadata components; static tags do not acquire fake button behavior.

### Cards / Containers

The canonical shared card is transparent, borderless, 6px-rounded, and padded 10px 12px 10px 10px. Its 2px accent line supplies structure. Title gaps are 8px; icons are 16px and cause aligned action indentation. Descriptions use muted text and allow wrapping. Do not add hover elevation to this noninteractive container.

### Wordmark and motion

The static logo and new-session wordmark reuse the same WARCODE paths. The existing interactive session identity retains its state machine. Its shimmer runs for 800ms with linear timing and is disabled under root data-motion="reduce". The related composer response uses 260ms cubic-bezier(0.34, 1.56, 0.64, 1), with a 3px translation and scale(0.985) only while its existing lodger-over state applies. These are signature behaviors, not a global animation preset. Sources: packages/app/src/new-session/wordmark.css and wordmark.tsx. Retain existing reduced-motion handling in other components.

**The Foundation Rule.** Visual identity changes must preserve the established app skeleton, navigation, commands, sessions, and coding workflows.

## Do's and Don'ts

### Do:
- **Do** use the Workroom semantic colors in both existing token namespaces.
- **Do** preserve Inter, IBM Plex Mono, configured terminal fonts, and the shared vector Warcode identity.
- **Do** retain keyboard focus, disabled/error states, reduced-motion behavior, and the existing desktop navigation structure.
- **Do** check new surfaces in light and dark themes and record which device sizes were actually verified.

### Don't:
- **Don't** replace the existing app foundation with the mockup's illustrative layout or sample coding content.
- **Don't** reuse orange action emphasis as a substitute for independent status or diff semantics.
- **Don't** redraw the wordmark as ordinary text or stretch the shared vector assets.
- **Don't** present unverified device classes or a provider-limited model reply as completed visual or functional verification.
