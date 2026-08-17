/**
 * Free-provider policy for ResumeLM.
 *
 * The list is deliberately made of providers/endpoints that can be configured
 * with their permitted free tiers. No provider is upgraded or rate-limit bypassed.
 */
export const FREE_PROVIDER_ORDER = [
  { provider: "openrouter", envKey: "OPENROUTER_API_KEY", model: "openrouter/free" },
  { provider: "google", envKey: "GOOGLE_GENERATIVE_AI_API_KEY", model: "gemini-2.5-flash" },
  { provider: "groq", envKey: "GROQ_API_KEY", model: "llama-3.3-70b-versatile" },
] as const;
