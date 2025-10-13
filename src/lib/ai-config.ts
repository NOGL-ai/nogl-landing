/**
 * AI SDK Configuration
 * 
 * This file configures the AI SDK providers with the correct API keys
 * from environment variables. Supports multiple environment variable names
 * with priority fallback to prevent conflicts and overrides.
 */

import { createOpenAI } from '@ai-sdk/openai';

/**
 * Mask API key for safe logging (shows first 7 chars + ... + last 4 chars)
 * Example: sk-proj-...Yt4A
 */
function maskApiKey(key: string): string {
  if (!key || key.length < 11) return 'INVALID';
  return `${key.substring(0, 7)}...${key.substring(key.length - 4)}`;
}

/**
 * Get OpenAI API key with priority fallback and comprehensive logging
 * Priority order (highest to lowest):
 * 1. MASTRA_OPENAI_API_KEY (Mastra-specific, won't conflict)
 * 2. NOGL_OPENAI_API_KEY (Project-specific)
 * 3. OPENAI_API_KEY (Standard, backward compatible)
 */
function getOpenAIKey(): string {
  const timestamp = new Date().toISOString();
  console.log(`[AI-CONFIG] ${timestamp} - Checking environment variables:`);
  
  const mastraKey = process.env.MASTRA_OPENAI_API_KEY;
  const noglKey = process.env.NOGL_OPENAI_API_KEY;
  const standardKey = process.env.OPENAI_API_KEY;

  // Log all environment variables with their status
  console.log(`[AI-CONFIG]   MASTRA_OPENAI_API_KEY: ${mastraKey ? `SET (${maskApiKey(mastraKey)})` : 'NOT SET'}`);
  console.log(`[AI-CONFIG]   NOGL_OPENAI_API_KEY: ${noglKey ? `SET (${maskApiKey(noglKey)})` : 'NOT SET'}`);
  console.log(`[AI-CONFIG]   OPENAI_API_KEY: ${standardKey ? `SET (${maskApiKey(standardKey)})` : 'NOT SET'}`);

  // Validate key format if present
  const validateKey = (key: string, name: string): boolean => {
    if (!key) return false;
    if (!key.startsWith('sk-')) {
      console.warn(`[AI-CONFIG] ⚠️  ${name} has invalid format (should start with 'sk-'): ${maskApiKey(key)}`);
      return false;
    }
    if (key.length < 20) {
      console.warn(`[AI-CONFIG] ⚠️  ${name} seems too short: ${maskApiKey(key)}`);
      return false;
    }
    return true;
  };

  // Check keys in priority order
  if (mastraKey && validateKey(mastraKey, 'MASTRA_OPENAI_API_KEY')) {
    console.log(`[AI-CONFIG] ✓ Using MASTRA_OPENAI_API_KEY (${maskApiKey(mastraKey)})`);
    return mastraKey;
  }
  
  if (noglKey && validateKey(noglKey, 'NOGL_OPENAI_API_KEY')) {
    console.log(`[AI-CONFIG] ✓ Using NOGL_OPENAI_API_KEY (${maskApiKey(noglKey)})`);
    return noglKey;
  }
  
  if (standardKey && validateKey(standardKey, 'OPENAI_API_KEY')) {
    console.log(`[AI-CONFIG] ✓ Using OPENAI_API_KEY (${maskApiKey(standardKey)})`);
    return standardKey;
  }

  // No valid key found - provide helpful error message
  const availableVars = [
    'MASTRA_OPENAI_API_KEY',
    'NOGL_OPENAI_API_KEY', 
    'OPENAI_API_KEY'
  ].filter(key => process.env[key] !== undefined);
  
  console.error(`[AI-CONFIG] ❌ No valid OpenAI API key found!`);
  console.error(`[AI-CONFIG] Available variables: ${availableVars.join(', ')}`);
  
  throw new Error(
    `OpenAI API key not found. Please set one of these environment variables: ${availableVars.join(', ')}. ` +
    `Recommended: MASTRA_OPENAI_API_KEY (won't conflict with other services)`
  );
}

// Configure OpenAI provider with API key from environment
const selectedKey = getOpenAIKey();
console.log(`[AI-CONFIG] Initializing OpenAI with key: ${maskApiKey(selectedKey)}`);

export const openai = createOpenAI({
  apiKey: selectedKey,
});

// Export for use in Mastra agents
export { openai as openaiProvider };


