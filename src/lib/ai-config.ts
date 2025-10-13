/**
 * AI SDK Configuration
 * 
 * This file configures the AI SDK providers with the correct API keys
 * from environment variables.
 */

import { createOpenAI } from '@ai-sdk/openai';

// Configure OpenAI provider with API key from environment
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Export for use in Mastra agents
export { openai as openaiProvider };


