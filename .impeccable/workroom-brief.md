# Warcode Workroom

## Approved scope

Rebrand the application as Warcode and remove the previous product name from application-facing copy and graphics. The owner selected the Workroom image and explicitly required the existing Electron desktop application's skeleton and foundation. Preserve the actual navigation, sessions, coding workflows, model integrations, and service architecture. The mockup establishes the visual identity. Its illustrative messages and code changes are examples, and the owner required the real application structure to govern implementation.

## Reference

The approved image is `.impeccable/mocks/decision/workroom.png`. Its prompt sidecar records approval. The implementation is the existing application under `packages/desktop`, `packages/app`, `packages/ui`, and the shared runtime packages.

## Visual direction

Use warm ivory `#F3F0E8`, a deeper sidebar surface `#E8E3D8`, ink `#252821`, and burnt-orange actions `#B94C2C`. Use the existing font roles and self-hosted Inter, IBM Plex Mono, and terminal font. The logo combines a W monogram with a bold uppercase WARCODE wordmark. Existing native controls, navigation, review panels, dialogs, and keyboard commands remain the structure. The default color scheme is light, with a complementary warm dark variant and the existing theme controls.

## State and motion

The existing desktop state machines own navigation, sessions, settings, and provider selection. Keep their focus behavior and native affordances. Primary action emphasis follows the action tokens, with readable light and dark contrast. The existing session wordmark motion uses the new glyphs, and reduced-motion handling remains available.

## Verification evidence

The live desktop captures at the user's actual 1264 by 761 window size are `.impeccable/review/desktop.png`, `appearance.png`, and `about.png`. Matching accessibility text is beside them. The live model catalog uses Warcode labels and the standalone local service is connected on port 3085. The provider's daily free-message limit prevented a successful live model reply. The coding engine and provider behavior are checked through the existing focused tests.

## Compatibility boundaries

Retain published dependency coordinates, registered external OAuth client identifiers, real external service endpoints, and original software license attribution where required for working integrations. Application-owned names, local package namespaces, configuration, branding, app identifiers, and copy use Warcode. The fork uses its own repository for application feedback and release notes, and requires its own configured update feed before native binary updates are enabled.
