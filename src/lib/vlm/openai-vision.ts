import OpenAI from "openai";

let client: OpenAI | null = null;
function getClient(): OpenAI {
	if (!client) client = new OpenAI();
	return client;
}

const SYSTEM_PROMPT = `You are a senior art director evaluating marketing creative.
Rate visual aesthetic quality on a 0–10 integer scale:
 - 0–3 low (cluttered, off-brand, poor composition),
 - 4–6 average (functional, brand-safe),
 - 7–8 strong (clear hierarchy, good rhythm),
 - 9–10 exceptional (memorable, awards-level).
Never mention CTR, conversion, or performance predictions.
Reply ONLY with strict JSON: {"score": <0-10>, "reason": "<=25 words"}.`;

export type AestheticResult = { score: number; reason: string };

export async function scoreAesthetic(imageUrl: string): Promise<AestheticResult> {
	const res = await getClient().chat.completions.create({
		model: "gpt-4o-mini",
		max_tokens: 120,
		temperature: 0.2,
		messages: [
			{ role: "system", content: SYSTEM_PROMPT },
			{
				role: "user",
				content: [
					{ type: "text", text: "Score this marketing asset." },
					{ type: "image_url", image_url: { url: imageUrl } },
				],
			},
		],
		response_format: { type: "json_object" },
	});

	const raw = res.choices[0]?.message?.content ?? '{"score":0,"reason":"empty response"}';
	try {
		const parsed = JSON.parse(raw) as AestheticResult;
		const score = Math.max(0, Math.min(10, Math.round(Number(parsed.score) || 0)));
		return { score, reason: typeof parsed.reason === "string" ? parsed.reason.slice(0, 200) : "" };
	} catch {
		return { score: 0, reason: "unparseable model response" };
	}
}

export async function embedText(text: string): Promise<number[]> {
	const res = await getClient().embeddings.create({
		model: "text-embedding-3-small",
		input: text.slice(0, 8000),
	});
	return res.data[0]?.embedding ?? [];
}
