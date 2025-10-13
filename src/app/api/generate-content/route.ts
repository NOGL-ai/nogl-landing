import OpenAI from "openai";

/**
 * Get OpenAI API key with priority fallback (same logic as ai-config.ts)
 * Priority order: MASTRA_OPENAI_API_KEY > NOGL_OPENAI_API_KEY > OPENAI_API_KEY
 */
function getOpenAIKey(): string {
	const mastraKey = process.env.MASTRA_OPENAI_API_KEY;
	const noglKey = process.env.NOGL_OPENAI_API_KEY;
	const standardKey = process.env.OPENAI_API_KEY;

	if (mastraKey) return mastraKey;
	if (noglKey) return noglKey;
	if (standardKey) return standardKey;

	throw new Error(
		`OpenAI API key not found. Please set one of: MASTRA_OPENAI_API_KEY, NOGL_OPENAI_API_KEY, or OPENAI_API_KEY`
	);
}

export async function POST(req: Request) {
	const body = await req.json();

	const { prompt, apiKey } = body;

	const openai = new OpenAI({
		apiKey: apiKey ? apiKey : getOpenAIKey(),
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
