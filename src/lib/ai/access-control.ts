import {
  getModelById,
  getProviderById,
  type AIModel,
} from "@/lib/ai-models";
import type { ServiceName } from "@/lib/types";
import { FREE_PROVIDER_ORDER } from "@/lib/ai/free-provider-fallback";

interface APIKeyInput {
  service: string;
  key: string;
  addedAt?: string;
}

export interface ResolveAIRequestInput {
  requestedModel: string;
  apiKeys: APIKeyInput[];
  isPro: boolean;
}

export interface ResolvedAIRequest {
  providerId: ServiceName;
  modelId: string;
  apiKey: string;
  usedServerKey: boolean;
  requiresRateLimit: boolean;
}

export type AIRequestAccessCode =
  | "invalid_model"
  | "unsupported_provider"
  | "missing_api_key";

export class AIRequestAccessError extends Error {
  constructor(
    message: string,
    public readonly code: AIRequestAccessCode,
    public readonly modelId?: string,
  ) {
    super(message);
    this.name = "AIRequestAccessError";
  }
}

type HiddenModel = Pick<AIModel, "id" | "name" | "provider" | "features" | "availability">;

const HIDDEN_MODELS: Record<string, HiddenModel> = {};

function getKnownModel(modelId: string): HiddenModel | undefined {
  return getModelById(modelId) ?? HIDDEN_MODELS[modelId];
}

function findUserKey(apiKeys: ResolveAIRequestInput["apiKeys"], providerId: ServiceName) {
  return apiKeys.find(
    (apiKey) => apiKey.service === providerId && apiKey.key.trim().length > 0,
  )?.key.trim();
}

function getServerKey(providerId: ServiceName) {
  const provider = getProviderById(providerId);
  if (!provider) {
    throw new AIRequestAccessError(
      `Unsupported provider: ${providerId}`,
      "unsupported_provider",
      providerId,
    );
  }

  return {
    provider,
    apiKey: process.env[provider.envKey]?.trim(),
  };
}

export function resolveAIRequest(input: ResolveAIRequestInput): ResolvedAIRequest {
  const model = getKnownModel(input.requestedModel);

  if (!model) {
    throw new AIRequestAccessError(
      `Unknown model: ${input.requestedModel}`,
      "invalid_model",
      input.requestedModel,
    );
  }

  const provider = getProviderById(model.provider);
  if (!provider) {
    throw new AIRequestAccessError(
      `Unsupported provider: ${model.provider}`,
      "unsupported_provider",
      model.id,
    );
  }

  const freeServerModel = model.features.isFree === true;

  if (input.isPro || freeServerModel) {
    const primaryServerKey = getServerKey(model.provider).apiKey;
    if (primaryServerKey?.length) {
      return {
        providerId: model.provider,
        modelId: model.id,
        apiKey: primaryServerKey,
        usedServerKey: true,
        requiresRateLimit: false,
      };
    }

    // If the requested free provider is not configured, start with the first
    // configured free provider instead of blocking the request.
    for (const candidate of FREE_PROVIDER_ORDER) {
      if (candidate.provider === model.provider) continue;
      const candidateKey = process.env[candidate.envKey]?.trim();
      if (candidateKey) {
        return {
          providerId: candidate.provider as ServiceName,
          modelId: candidate.model,
          apiKey: candidateKey,
          usedServerKey: true,
          requiresRateLimit: false,
        };
      }
    }
  }

  const userApiKey = findUserKey(input.apiKeys, model.provider);
  if (!userApiKey) {
    throw new AIRequestAccessError(
      `${provider.name} API key not found in user configuration`,
      "missing_api_key",
      model.id,
    );
  }

  return {
    providerId: model.provider,
    modelId: model.id,
    apiKey: userApiKey,
    usedServerKey: false,
    requiresRateLimit: false,
  };
}
