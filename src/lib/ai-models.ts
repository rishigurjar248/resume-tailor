/**
 * Centralized AI Model Management
 * This file contains all AI model and provider configurations used throughout the application
 */

import { ServiceName } from './types'

// ========================
// Type Definitions
// ========================

export interface AIProvider {
  id: ServiceName
  name: string
  apiLink: string
  logo?: string
  envKey: string
  sdkInitializer: string
  unstable?: boolean
}

export interface AIModel {
  id: string
  name: string
  provider: ServiceName
  /** Hidden compatibility models remain resolvable but are not shown in the selector. */
  isVisible?: boolean
  features: {
    isFree?: boolean
    isRecommended?: boolean
    isUnstable?: boolean
    maxTokens?: number
    supportsVision?: boolean
    supportsTools?: boolean
    isPro?: boolean
  }
  availability: {
    requiresApiKey: boolean
    requiresPro: boolean
  }
}

export interface ApiKey {
  service: ServiceName
  key: string
  addedAt: string
}

export interface AIConfig {
  model: string
  apiKeys: ApiKey[]
  customPrompts?: import('./types').CustomPrompts
}

export interface GroupedModels {
  provider: ServiceName
  name: string
  models: AIModel[]
}

// ========================
// Provider Configurations
// ========================

export const PROVIDERS: Partial<Record<ServiceName, AIProvider>> = {
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter Free',
    apiLink: 'https://openrouter.ai/keys',
    logo: '/logos/gemini-logo.webp',
    envKey: 'OPENROUTER_API_KEY',
    sdkInitializer: 'openrouter',
    unstable: false,
  },
  google: {
    id: 'google',
    name: 'Google Gemini Free',
    apiLink: 'https://aistudio.google.com/apikey',
    logo: '/logos/gemini-logo.webp',
    envKey: 'GOOGLE_GENERATIVE_AI_API_KEY',
    sdkInitializer: 'google',
    unstable: false,
  },
  groq: {
    id: 'groq',
    name: 'Groq Free',
    apiLink: 'https://console.groq.com/keys',
    logo: '/logos/chat-gpt-logo.png',
    envKey: 'GROQ_API_KEY',
    sdkInitializer: 'groq',
    unstable: false,
  },
};

export const AI_MODELS: AIModel[] = [
  {
    id: 'openrouter/free',
    name: 'OpenRouter Free Router',
    provider: 'openrouter',
    features: { isFree: true, isRecommended: true, supportsVision: false, supportsTools: true },
    availability: { requiresApiKey: false, requiresPro: false },
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (Free)',
    provider: 'google',
    features: { isFree: true, isRecommended: true, supportsVision: true, supportsTools: true, maxTokens: 65536 },
    availability: { requiresApiKey: false, requiresPro: false },
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B (Groq Free)',
    provider: 'groq',
    features: { isFree: true, isRecommended: false, supportsVision: false, supportsTools: true, maxTokens: 32768 },
    availability: { requiresApiKey: false, requiresPro: false },
  },
];

// ========================
// Legacy ID Aliases
// ========================

// Map legacy or shorthand model IDs to current canonical IDs
const MODEL_ALIASES: Record<string, string> = {
  'gpt-5': 'openrouter/free',
  'gpt-5.2': 'openrouter/free',
  'gpt-5.2-pro': 'openrouter/free',
  'gpt-5.4': 'openrouter/free',
  'gpt-5.5': 'openrouter/free',
  'gpt-5-mini': 'openrouter/free',
  'claude-4-sonnet': 'openrouter/free',
  'claude-sonnet-5': 'openrouter/free',
  'claude-opus-5': 'openrouter/free',
  'deepseek-chat': 'openrouter/free',
  'deepseek-reasoner': 'openrouter/free',
  'gemini-3-pro-preview': 'gemini-2.5-flash',
};

// ========================
// Default Model Configuration
// ========================

export const DEFAULT_MODELS = {
  PRO_USER: 'openrouter/free',
  FREE_USER: 'openrouter/free',
} as const

export const MODEL_DESIGNATIONS = {
  FAST_CHEAP: 'openrouter/free',
  FAST_CHEAP_FREE: 'openrouter/free',
  STRUCTURED_EXTRACTION: 'openrouter/free',
  RESUME_SCORING: 'openrouter/free',
  SIMPLE_REWRITE: 'openrouter/free',
  CONTENT_GENERATION: 'openrouter/free',
  COVER_LETTER: 'openrouter/free',
  JOB_TAILORING_FREE: 'openrouter/free',
  JOB_TAILORING_PRO: 'openrouter/free',
  CHAT_ASSISTANT_FREE: 'openrouter/free',
  CHAT_ASSISTANT_PRO: 'openrouter/free',
  FRONTIER: 'gemini-2.5-flash',
  FRONTIER_ALT: 'llama-3.3-70b-versatile',
  BALANCED: 'gemini-2.5-flash',
  VISION: 'gemini-2.5-flash',
  DEFAULT_PRO: 'openrouter/free',
  DEFAULT_FREE: 'openrouter/free',
} as const

export type ModelDesignation = keyof typeof MODEL_DESIGNATIONS

export function getCanonicalModelId(modelId: string): string {
  let canonical = modelId.trim()

  // Resolve aliases repeatedly so future migrations can point at another
  // legacy alias without leaving a stale ID in localStorage or telemetry.
  for (let i = 0; i < 5; i += 1) {
    const next = MODEL_ALIASES[canonical] ?? MODEL_ALIASES[canonical.toLowerCase()]
    if (!next || next === canonical) break
    canonical = next
  }

  return canonical
}

/**
 * Read and migrate the browser's saved model selection in one place. This is
 * intentionally safe to call from server-rendered modules: it is a no-op
 * until a browser is available.
 */
export function getStoredModelSelection(fallback = ""): string {
  if (typeof window === "undefined") return fallback

  const storageKey = "resumelm-default-model"
  const stored = window.localStorage.getItem(storageKey) ?? ""
  const normalized = getCanonicalModelId(stored || fallback)

  if (normalized !== stored) {
    window.localStorage.setItem(storageKey, normalized)
  }

  return normalized
}

// ========================
// Utility Functions
// ========================

/**
 * Get all providers as an array
 */
export function getProvidersArray(): AIProvider[] {
  // Include providers that still have hidden compatibility models so existing
  // BYOK users can continue to manage their keys in Settings.
  const selectableProviders = new Set(AI_MODELS.map(model => model.provider))
  return Object.values(PROVIDERS).filter(provider => selectableProviders.has(provider.id))
}

/**
 * Get a model by its ID
 */
export function getModelById(id: string): AIModel | undefined {
  const resolvedId = getCanonicalModelId(id)
  return AI_MODELS.find(model => model.id === resolvedId)
}

/**
 * Get a provider by its ID
 */
export function getProviderById(id: ServiceName): AIProvider | undefined {
  return PROVIDERS[id]
}

/**
 * Get all models for a specific provider
 */
export function getModelsByProvider(provider: ServiceName): AIModel[] {
  return AI_MODELS.filter(model => model.provider === provider && model.isVisible !== false)
}

/**
 * Check if a model is available for a user
 */
export function isModelAvailable(
  modelId: string,
  isPro: boolean,
  apiKeys: ApiKey[]
): boolean {
  const model = getModelById(modelId)
  if (!model) return false


  if (model.availability.requiresApiKey) {
    return apiKeys.some(
      key => key.service === model.provider && key.key.trim().length > 0,
    )
  }

  // Free model allowance
  if (model.features.isFree) return true

  return true
}

/**
 * Get the default model for a user type
 */
export function getDefaultModel(isPro: boolean): string {
  return isPro ? DEFAULT_MODELS.PRO_USER : DEFAULT_MODELS.FREE_USER
}

/**
 * Get the provider for a model
 */
export function getModelProvider(modelId: string): AIProvider | undefined {
  const model = getModelById(modelId)
  if (!model) return undefined
  return getProviderById(model.provider)
}

/**
 * Group models by provider for display
 */
export function groupModelsByProvider(): GroupedModels[] {
  const providerOrder: ServiceName[] = ['openrouter', 'google', 'groq']
  const grouped = new Map<ServiceName, AIModel[]>()

  // Group models by provider
  AI_MODELS.filter(model => model.isVisible !== false).forEach(model => {
    if (!grouped.has(model.provider)) {
      grouped.set(model.provider, [])
    }
    grouped.get(model.provider)!.push(model)
  })

  // Return in ordered format
  return providerOrder
    .map(providerId => {
      const provider = getProviderById(providerId)
      if (!provider) return null
      
      return {
        provider: providerId,
        name: provider.name,
        models: grouped.get(providerId) || []
      }
    })
    .filter((group): group is GroupedModels => group !== null && group.models.length > 0)
}

/**
 * Get selectable models for a user
 */
export function getSelectableModels(isPro: boolean, apiKeys: ApiKey[]): AIModel[] {
  return AI_MODELS.filter(
    model => model.isVisible !== false && isModelAvailable(model.id, isPro, apiKeys)
  )
}

/**
 * Determine which SDK to use for a model
 */
export function getModelSDKConfig(modelId: string): { provider: AIProvider; modelId: string } | undefined {
  const canonicalModelId = getCanonicalModelId(modelId)
  const model = getModelById(canonicalModelId)
  if (!model) return undefined
  
  const provider = getProviderById(model.provider)
  if (!provider) return undefined
  
  return { provider, modelId: canonicalModelId }
}
