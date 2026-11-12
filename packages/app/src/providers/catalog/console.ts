type Provider = {
  id: string
  integrationID?: string
  name: string
}

export function consoleProviderGroup<T extends Provider>(providers: readonly T[]) {
  const suffix = " / Warcode"
  const root = providers.find(
    (provider) =>
      (provider.id === "warcode" || provider.id === "opencode") &&
      provider.integrationID === "warcode" &&
      provider.name.endsWith(suffix),
  )

  if (!root?.name.endsWith(suffix)) return
  const workspace = root.name.slice(0, -suffix.length).trim()

  if (!workspace) return
  const prefix = `${workspace} / `

  return {
    root,
    workspace,
    prefix,
    providers: providers.filter(
      (provider) => provider.integrationID === "warcode" && provider.name.startsWith(prefix),
    ),
  }
}

// A signed-in Console workspace adds its own providers next to the free `warcode` catalog.
export function consoleCatalogLoaded(providers: readonly Provider[]) {
  return (
    consoleProviderGroup(providers) !== undefined ||
    providers.some((provider) => provider.integrationID === "warcode" && provider.id !== "warcode")
  )
}

export function consoleProviderName(group: { prefix: string }, name: string) {
  return name.startsWith(group.prefix) ? name.slice(group.prefix.length) : name
}
