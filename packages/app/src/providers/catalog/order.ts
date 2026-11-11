export const popularProviders = ["genai-mil", "anthropic", "github-copilot", "openai", "google", "openrouter", "vercel"]

export function isOfferedProvider(provider: { id: string; integrationID?: string }) {
  return provider.id !== "warcode" && provider.id !== "warcode-go" && provider.integrationID !== "warcode"
}
