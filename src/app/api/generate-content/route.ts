import OpenAI from "openai";

/**
 * Mask API key for safe logging (shows first 7 chars + ... + last 4 chars)
 * Example: sk-proj-...Yt4A
 */
function maskApiKey(key: string): string {
	if (!key || key.length < 11) return 'INVALID';
	return `${key.substring(0, 7)}...${key.substring(key.length - 4)}`;
}

/**
 * Get OpenAI API key with priority fallback and debug logging (same logic as ai-config.ts)
 * Priority order: MASTRA_OPENAI_API_KEY > NOGL_OPENAI_API_KEY > OPENAI_API_KEY
 */
function getOpenAIKey(): string {
	const timestamp = new Date().toISOString();
	console.log(`[GENERATE-API] ${timestamp} - Checking environment variables:`);
	
	const mastraKey = process.env.MASTRA_OPENAI_API_KEY;
	const noglKey = process.env.NOGL_OPENAI_API_KEY;
	const standardKey = process.env.OPENAI_API_KEY;

	// Log all environment variables with their status
	console.log(`[GENERATE-API]   MASTRA_OPENAI_API_KEY: ${mastraKey ? `SET (${maskApiKey(mastraKey)})` : 'NOT SET'}`);
	console.log(`[GENERATE-API]   NOGL_OPENAI_API_KEY: ${noglKey ? `SET (${maskApiKey(noglKey)})` : 'NOT SET'}`);
	console.log(`[GENERATE-API]   OPENAI_API_KEY: ${standardKey ? `SET (${maskApiKey(standardKey)})` : 'NOT SET'}`);

	// Validate key format if present
	const validateKey = (key: string, name: string): boolean => {
		if (!key) return false;
		if (!key.startsWith('sk-')) {
			console.warn(`[GENERATE-API] ⚠️  ${name} has invalid format (should start with 'sk-'): ${maskApiKey(key)}`);
			return false;
		}
		if (key.length < 20) {
			console.warn(`[GENERATE-API] ⚠️  ${name} seems too short: ${maskApiKey(key)}`);
			return false;
		}
		return true;
	};

	// Check keys in priority order
	if (mastraKey && validateKey(mastraKey, 'MASTRA_OPENAI_API_KEY')) {
		console.log(`[GENERATE-API] ✓ Using MASTRA_OPENAI_API_KEY (${maskApiKey(mastraKey)})`);
		return mastraKey;
	}
	
	if (noglKey && validateKey(noglKey, 'NOGL_OPENAI_API_KEY')) {
		console.log(`[GENERATE-API] ✓ Using NOGL_OPENAI_API_KEY (${maskApiKey(noglKey)})`);
		return noglKey;
	}
	
	if (standardKey && validateKey(standardKey, 'OPENAI_API_KEY')) {
		console.log(`[GENERATE-API] ✓ Using OPENAI_API_KEY (${maskApiKey(standardKey)})`);
		return standardKey;
	}

	// No valid key found
	console.error(`[GENERATE-API] ❌ No valid OpenAI API key found!`);
	throw new Error(
		`OpenAI API key not found. Please set one of: MASTRA_OPENAI_API_KEY, NOGL_OPENAI_API_KEY, or OPENAI_API_KEY`
	);
}

export async function POST(req: Request) {
	const body = await req.json();

	const { prompt, apiKey } = body;

	// Determine which key to use
	const selectedKey = apiKey ? apiKey : getOpenAIKey();
	const keySource = apiKey ? 'REQUEST_BODY' : 'ENVIRONMENT';
	
	console.log(`[GENERATE-API] Using key from ${keySource}: ${maskApiKey(selectedKey)}`);

	const openai = new OpenAI({
		apiKey: selectedKey,
	});

	try {
		const chatCompletion = await openai.chat.completions.create({
			messages: prompt,
			model: "gpt-3.5-turbo",
			temperature: 1,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,
		});

		const generatedContent = chatCompletion.choices[0].message?.content;

		return new Response(JSON.stringify(generatedContent));
	} catch (error: unknown) {
		return new Response(JSON.stringify(error.error.message), { status: 500 });
	}
}
