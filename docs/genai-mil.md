# GenAI.mil

Warcode supports a GenAI.mil endpoint through its OpenAI-compatible Chat Completions adapter. Obtain your API base URL, API key, and available model IDs from your GenAI.mil administrator or developer portal.

In the desktop app, open **Settings → Providers → GenAI.mil**. Enter the API base URL (including the version path), comma-separated model IDs, and your API key. The endpoint and model IDs are saved with the credential through Warcode's existing connection flow. Select one of those models in the session model picker.

Warcode does not supply a default endpoint or guess which models your account can access. Requests use your configured endpoint, append `/chat/completions`, and authenticate with `Authorization: Bearer <key>`.

For environment-based setup, set `GENAI_MIL_API_KEY`, `GENAI_MIL_BASE_URL`, and `GENAI_MIL_MODELS` before starting Warcode. `GENAI_MIL_MODELS` accepts comma-separated IDs. You can also configure the provider and model-specific limits in `warcode.json` using the existing custom-provider configuration.

Advertised free model tiers and Warcode's bundled keyless models are excluded from the catalog. Paid providers, local models, and models with unknown pricing remain available through their existing connections.

The integration is tested against an OpenAI-compatible local server. Access to your actual GenAI.mil endpoint and account is needed to verify a live response.
