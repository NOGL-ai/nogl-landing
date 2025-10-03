import { algoliasearch } from "algoliasearch";
import { load as loadHTML } from "cheerio";

const appID = process.env.NEXT_PUBLIC_ALGOLIA_PROJECT_ID ?? "";
const apiKEY = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? "";
const INDEX = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? "";

// Only initialize Algolia client if credentials are provided
const client = appID && apiKEY ? algoliasearch(appID, apiKEY) : null;
const index = client ? client.initIndex(INDEX) : null;

export const structuredAlgoliaHtmlData = async ({
	pageUrl = "",
	htmlString = "",
	title = "",
	type = "",
	imageURL = "",
}) => {
	const $ = loadHTML(htmlString);
	const textContent = $("body").text() || "";

	const data = {
		objectID: pageUrl,
		title: title,
		url: pageUrl,
		content: textContent.slice(0, 7000),
		type: type,
		imageURL: imageURL,
		updatedAt: new Date().toISOString(),
	};

	return data;
};

export const batchIndexToAlgolia = async (
	records: Record<string, unknown>[]
) => {
	// Skip if Algolia is not configured
	if (!index) {
		console.warn("Algolia is not configured. Skipping batch indexing.");
		return null;
	}

	try {
		const result = await index.saveObjects(records);

		return result;
	} catch (error) {
		console.error("Error in batchIndexToAlgolia:", error);
		throw error;
	}
};
