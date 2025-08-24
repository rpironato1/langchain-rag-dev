/**
 * Multi-provider LLM abstraction layer
 * Supports OpenAI, Anthropic, Google Gemini, OpenRouter, Ollama, and LM Studio
 */

import { ChatOpenAI } from "@langchain/openai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

export type LLMProvider = 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'ollama' | 'lmstudio';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  baseURL?: string;
}

export interface ProviderConfig {
  models: string[];
  defaultModel: string;
  requiresApiKey: boolean;
  supportsStreaming: boolean;
  baseURL?: string;
}

/**
 * Provider configurations for each supported LLM provider
 */
export const PROVIDER_CONFIGS: Record<LLMProvider, ProviderConfig> = {
  openai: {
    models: [
      'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'
    ],
    defaultModel: 'gpt-4o-mini',
    requiresApiKey: true,
    supportsStreaming: true,
  },
  anthropic: {
    models: [
      'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 
      'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'
    ],
    defaultModel: 'claude-3-5-sonnet-20241022',
    requiresApiKey: true,
    supportsStreaming: true,
  },
  gemini: {
    models: [
      'gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'
    ],
    defaultModel: 'gemini-1.5-flash',
    requiresApiKey: true,
    supportsStreaming: true,
  },
  openrouter: {
    models: [
      'meta-llama/llama-3.2-90b-vision-instruct',
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4o-mini',
      'google/gemini-2.0-flash-exp',
      'qwen/qwen-2.5-72b-instruct'
    ],
    defaultModel: 'openai/gpt-4o-mini',
    requiresApiKey: true,
    supportsStreaming: true,
    baseURL: 'https://openrouter.ai/api/v1',
  },
  ollama: {
    models: [
      'llama3.2', 'llama3.1', 'codellama', 'mistral', 'phi3', 'qwen2.5'
    ],
    defaultModel: 'llama3.2',
    requiresApiKey: false,
    supportsStreaming: true,
    baseURL: 'http://localhost:11434',
  },
  lmstudio: {
    models: [
      'local-model' // LM Studio serves any local model
    ],
    defaultModel: 'local-model',
    requiresApiKey: false,
    supportsStreaming: true,
    baseURL: 'http://localhost:1234/v1',
  },
};

/**
 * Get the appropriate environment variable key for a provider
 */
function getProviderApiKeyEnvVar(provider: LLMProvider): string {
  const envVars: Record<LLMProvider, string> = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    gemini: 'GOOGLE_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
    ollama: '', // No API key needed
    lmstudio: '', // No API key needed
  };
  return envVars[provider];
}

/**
 * Create a chat model instance for the specified provider and configuration
 * Uses dynamic imports to avoid build-time dependency issues
 */
export async function createChatModel(config: LLMConfig): Promise<BaseChatModel> {
  const providerConfig = PROVIDER_CONFIGS[config.provider];
  
  // Validate model
  if (!providerConfig.models.includes(config.model)) {
    throw new Error(`Model ${config.model} not supported by provider ${config.provider}`);
  }

  // Get API key from environment if not provided
  let apiKey = config.apiKey;
  if (providerConfig.requiresApiKey && !apiKey) {
    const envVar = getProviderApiKeyEnvVar(config.provider);
    apiKey = process.env[envVar];
    if (!apiKey) {
      throw new Error(`API key required for ${config.provider}. Set ${envVar} environment variable.`);
    }
  }

  // Determine base URL
  const baseURL = config.baseURL || providerConfig.baseURL;

  try {
    switch (config.provider) {
      case 'openai':
        return new ChatOpenAI({
          model: config.model,
          temperature: config.temperature ?? 0.7,
          maxTokens: config.maxTokens,
          apiKey,
        });

      case 'anthropic':
        // Use dynamic import to avoid build-time issues
        try {
          const { ChatAnthropic } = await import("@langchain/anthropic");
          return new ChatAnthropic({
            model: config.model,
            temperature: config.temperature ?? 0.7,
            maxTokens: config.maxTokens,
            apiKey,
          });
        } catch (error) {
          throw new Error(`Failed to load Anthropic provider: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

      case 'gemini':
        // Use dynamic import to avoid build-time issues
        try {
          const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");
          return new ChatGoogleGenerativeAI({
            model: config.model,
            temperature: config.temperature ?? 0.7,
            maxOutputTokens: config.maxTokens,
            apiKey,
          });
        } catch (error) {
          throw new Error(`Failed to load Gemini provider: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

      case 'openrouter':
        // Use OpenAI interface with custom base URL
        return new ChatOpenAI({
          model: config.model,
          temperature: config.temperature ?? 0.7,
          maxTokens: config.maxTokens,
          apiKey,
          configuration: {
            baseURL,
          },
        });

      case 'ollama':
        // Use dynamic import to avoid build-time issues
        try {
          const { ChatOllama } = await import("@langchain/ollama");
          return new ChatOllama({
            model: config.model,
            temperature: config.temperature ?? 0.7,
            baseUrl: baseURL,
          });
        } catch (error) {
          throw new Error(`Failed to load Ollama provider: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

      case 'lmstudio':
        // Use OpenAI interface with LM Studio's local server
        return new ChatOpenAI({
          model: config.model,
          temperature: config.temperature ?? 0.7,
          maxTokens: config.maxTokens,
          apiKey: 'lm-studio', // LM Studio requires any non-empty key
          configuration: {
            baseURL,
          },
        });

      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Failed to load')) {
      throw error;
    }
    throw new Error(`Failed to create chat model for provider ${config.provider}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get the default configuration for a provider
 */
export function getDefaultConfig(provider: LLMProvider): LLMConfig {
  const providerConfig = PROVIDER_CONFIGS[provider];
  return {
    provider,
    model: providerConfig.defaultModel,
    temperature: 0.7,
  };
}

/**
 * Parse provider configuration from environment variables or request
 */
export function parseProviderConfig(request?: any): LLMConfig {
  // Check for provider preference in request body
  const requestProvider = request?.provider as LLMProvider;
  const requestModel = request?.model as string;
  
  // Default to OpenAI if no provider specified or invalid provider
  let provider: LLMProvider = 'openai';
  if (requestProvider && requestProvider in PROVIDER_CONFIGS) {
    provider = requestProvider;
  }
  
  const providerConfig = PROVIDER_CONFIGS[provider];
  
  return {
    provider,
    model: requestModel || providerConfig.defaultModel,
    temperature: request?.temperature ?? 0.7,
    maxTokens: request?.maxTokens,
  };
}

/**
 * Validate that a provider is available (has required API keys, etc.)
 */
export async function validateProvider(provider: LLMProvider): Promise<boolean> {
  const providerConfig = PROVIDER_CONFIGS[provider];
  
  if (providerConfig.requiresApiKey) {
    const envVar = getProviderApiKeyEnvVar(provider);
    return !!process.env[envVar];
  }
  
  // For local providers (Ollama, LM Studio), we could check if the service is running
  // but for now, we'll assume they're available if configured
  return true;
}

/**
 * Get list of available providers (ones with valid configuration)
 */
export async function getAvailableProviders(): Promise<LLMProvider[]> {
  const providers: LLMProvider[] = [];
  
  for (const provider of Object.keys(PROVIDER_CONFIGS) as LLMProvider[]) {
    if (await validateProvider(provider)) {
      providers.push(provider);
    }
  }
  
  return providers;
}