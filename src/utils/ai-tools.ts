import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { LanguageModelV1, wrapLanguageModel } from 'ai';
import { type AIConfig } from '@/lib/ai-models';
import {
  resolveAIRequest,
  type ResolvedAIRequest,
} from '@/lib/ai/access-control';
import { createAIModelReliabilityMiddleware, classifyAIError, recordProviderFailure } from '@/lib/ai/reliability';
import { FREE_PROVIDER_ORDER } from '@/lib/ai/free-provider-fallback';

// Re-export types for backward compatibility
export type { ApiKey, AIConfig } from '@/lib/ai-models';

export function createAIClientFromResolvedRequest(
  resolved: ResolvedAIRequest,
  useThinking?: boolean
) {
  void useThinking;

  const createBaseModel = (providerId: string, modelId: string, apiKey: string): LanguageModelV1 => {
    switch (providerId) {
      case 'anthropic':
        return createAnthropic({ apiKey })(modelId) as LanguageModelV1;
      case 'openai':
        return createOpenAI({ apiKey, compatibility: 'strict' })(modelId) as LanguageModelV1;
      case 'openrouter':
        return createOpenRouter({
          apiKey,
          baseURL: 'https://openrouter.ai/api/v1',
          headers: {
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'ResumeLM Free Forever',
          },
        })(modelId) as LanguageModelV1;
      case 'google':
        return createGoogleGenerativeAI({ apiKey })(modelId) as LanguageModelV1;
      case 'groq':
        return createGroq({ apiKey })(modelId) as LanguageModelV1;
      default:
        throw new Error(`Unsupported provider: ${providerId}`);
    }
  };

  const primary = createBaseModel(resolved.providerId, resolved.modelId, resolved.apiKey);

  // Build a server-side fallback chain from only configured free-tier providers.
  // User BYOK remains supported for the explicitly selected provider, while
  // failover never exposes server keys to the client.
  const fallbacks = FREE_PROVIDER_ORDER
    .filter(candidate => candidate.provider !== resolved.providerId)
    .map(candidate => {
      const apiKey = process.env[candidate.envKey]?.trim();
      if (!apiKey) return null;
      try {
        return {
          providerId: candidate.provider,
          modelId: candidate.model,
          apiKey,
          model: createBaseModel(candidate.provider, candidate.model, apiKey),
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean) as Array<{ providerId: any; modelId: string; apiKey: string; model: LanguageModelV1 }>;

  const fallbackMiddleware = {
    middlewareVersion: 'v1' as const,
    wrapGenerate: async ({ doGenerate, params }: any) => {
      try {
        return await doGenerate();
      } catch (firstError) {
        let lastError = firstError;
        for (const fallback of fallbacks) {
          try {
            console.warn(`[ResumeLM] AI provider failed; trying ${fallback.providerId}/${fallback.modelId}`);
            await recordProviderFailure(
              { providerId: resolved.providerId, modelId: resolved.modelId, apiKey: resolved.apiKey, usedServerKey: resolved.usedServerKey },
              classifyAIError(lastError),
            );
            return await fallback.model.doGenerate(params);
          } catch (fallbackError) {
            lastError = fallbackError;
          }
        }
        throw lastError;
      }
    },
    wrapStream: async ({ doStream, params }: any) => {
      try {
        return await doStream();
      } catch (firstError) {
        let lastError = firstError;
        for (const fallback of fallbacks) {
          try {
            console.warn(`[ResumeLM] AI stream provider failed; trying ${fallback.providerId}/${fallback.modelId}`);
            await recordProviderFailure(
              { providerId: resolved.providerId, modelId: resolved.modelId, apiKey: resolved.apiKey, usedServerKey: resolved.usedServerKey },
              classifyAIError(lastError),
            );
            return await fallback.model.doStream(params);
          } catch (fallbackError) {
            lastError = fallbackError;
          }
        }
        throw lastError;
      }
    },
  };

  const fallbackModel = wrapLanguageModel({
    model: primary,
    middleware: fallbackMiddleware,
  });

  return wrapLanguageModel({
    model: fallbackModel,
    middleware: createAIModelReliabilityMiddleware({
      providerId: resolved.providerId,
      modelId: resolved.modelId,
      apiKey: resolved.apiKey,
      usedServerKey: resolved.usedServerKey,
    }),
  });
}

export function resolveAIClient(config?: AIConfig, isPro?: boolean, useThinking?: boolean) {
  if (!config) {
    throw new Error('AI model is required');
  }

  const resolved = resolveAIRequest({
    requestedModel: config.model,
    apiKeys: config.apiKeys ?? [],
    isPro: Boolean(isPro),
  });

  return {
    model: createAIClientFromResolvedRequest(resolved, useThinking),
    resolved,
  };
}

/**
 * Initializes an AI client based on the centralized access-control decision.
 */
export function initializeAIClient(config?: AIConfig, isPro?: boolean, useThinking?: boolean) {
  return resolveAIClient(config, isPro, useThinking).model;
}
