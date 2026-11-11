import type { ElectronAPI } from "../api-types"

const deepLinkEvent = "warcode:deep-link"

// Main sends each link to one renderer at a time and forgets it once acknowledged, so a reload or a new window
// never handles it again.
export function startDeepLinks(api: ElectronAPI) {
  api.onDeepLink((delivery) => {
    emitDeepLinks(delivery.urls)
    api.acknowledgeDeepLinks(delivery.attempt)
  })
  api.readyDeepLinks()
}

function emitDeepLinks(urls: string[]) {
  if (urls.length === 0) return
  window.__WARCODE__ ??= {}
  window.__WARCODE__.deepLinks = [...(window.__WARCODE__.deepLinks ?? []), ...urls]
  window.dispatchEvent(new CustomEvent(deepLinkEvent, { detail: { urls } }))
}
