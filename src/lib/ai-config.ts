/**
 * AI SDK Configuration
 * 
 * This file configures the AI SDK providers with the correct API keys
 * from environment variables. Supports multiple environment variable names
 * with priority fallback to prevent conflicts and overrides.
 */

import { createOpenAI } from '@ai-sdk/openai';

/**
 * Get OpenAI API key with priority fallback
 * Priority order (highest to lowest):
 * 1. MASTRA_OPENAI_API_KEY (Mastra-specific, won't conflict)
 * 2. NOGL_OPENAI_API_KEY (Project-specific)
 * 3. OPENAI_API_KEY (Standard, backward compatible)
 */
function getOpenAIKey(): string {
  const mastraKey = process.env.MASTRA_OPENAI_API_KEY;
  const noglKey = process.env.NOGL_OPENAI_API_KEY;
  const standardKey = process.env.OPENAI_API_KEY;

  if (mastraKey) {
    console.log('Using MASTRA_OPENAI_API_KEY for OpenAI configuration');
    return mastraKey;
  }
  
  if (noglKey) {
    console.log('Using NOGL_OPENAI_API_KEY for OpenAI configuration');
    return noglKey;
  }
  
  if (standardKey) {
    console.log('Using OPENAI_API_KEY for OpenAI configuration');
    return standardKey;
  }

  // No key found - provide helpful error message
  const availableVars = [
    'MASTRA_OPENAI_API_KEY',
    'NOGL_OPENAI_API_KEY', 
    'OPENAI_API_KEY'
  ].filter(key => process.env[key] !== undefined);
  
  throw new Error(
    `OpenAI API key not found. Please set one of these environment variables: ${availableVars.join(', ')}. ` +
    `Recommended: MASTRA_OPENAI_API_KEY (won't conflict with other services)`
  );
}

// Configure OpenAI provider with API key from environment
export const openai = createOpenAI({
  apiKey: getOpenAIKey(),
});

// Export for use in Mastra agents
export { openai as openaiProvider };


