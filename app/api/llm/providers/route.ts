import { NextRequest, NextResponse } from "next/server";
import { 
  getAvailableProviders, 
  PROVIDER_CONFIGS, 
  validateProvider,
  type LLMProvider 
} from "@/lib/llm-providers";

// Remove edge runtime for compatibility with dynamic imports
// export const runtime = "edge";

/**
 * GET /api/llm/providers
 * Returns information about available LLM providers and their configurations
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeUnavailable = searchParams.get('includeUnavailable') === 'true';

    if (includeUnavailable) {
      // Return all providers with their availability status
      const allProviders = Object.keys(PROVIDER_CONFIGS) as LLMProvider[];
      const providersWithStatus = await Promise.all(
        allProviders.map(async (provider) => ({
          provider,
          available: await validateProvider(provider),
          config: PROVIDER_CONFIGS[provider],
        }))
      );

      return NextResponse.json({
        providers: providersWithStatus,
        total: allProviders.length,
      });
    } else {
      // Return only available providers
      const availableProviders = await getAvailableProviders();
      const providersInfo = availableProviders.map(provider => ({
        provider,
        available: true,
        config: PROVIDER_CONFIGS[provider],
      }));

      return NextResponse.json({
        providers: providersInfo,
        total: availableProviders.length,
      });
    }
  } catch (error: any) {
    console.error('Error getting LLM providers:', error);
    return NextResponse.json(
      { error: 'Failed to get LLM providers', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/llm/providers/validate
 * Validates if a specific provider is available and properly configured
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider } = body;

    if (!provider || typeof provider !== 'string') {
      return NextResponse.json(
        { error: 'Provider parameter is required' },
        { status: 400 }
      );
    }

    if (!(provider in PROVIDER_CONFIGS)) {
      return NextResponse.json(
        { error: `Unknown provider: ${provider}` },
        { status: 400 }
      );
    }

    const isValid = await validateProvider(provider as LLMProvider);
    const config = PROVIDER_CONFIGS[provider as LLMProvider];

    return NextResponse.json({
      provider,
      available: isValid,
      config,
      message: isValid 
        ? `Provider ${provider} is available` 
        : `Provider ${provider} is not properly configured`,
    });
  } catch (error: any) {
    console.error('Error validating provider:', error);
    return NextResponse.json(
      { error: 'Failed to validate provider', details: error.message },
      { status: 500 }
    );
  }
}