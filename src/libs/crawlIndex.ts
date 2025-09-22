import algoliasearch from "algoliasearch";
import { JSDOM } from "jsdom";

const appID = process.env.NEXT_PUBLIC_ALGOLIA_PROJECT_ID ?? "";
const apiKEY = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? "";
const INDEX = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? "";

const client = algoliasearch(appID, apiKEY);
const index = client.initIndex(INDEX);

export const structuredAlgoliaHtmlData = async ({
	pageUrl = "",
	htmlString = "",
	title = "",
	type = "",
	imageURL = "",
}) => {
	try {
		const dom = new JSDOM(htmlString);
		const textContent = dom.window.document.body.textContent || "";
		
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
	} catch (error) {
		console.log("error in structuredAlgoliaHtmlData", error);
		throw error;
	}
};

export const batchIndexToAlgolia = async (records: any[]) => {
	try {
		const result = await index.saveObjects(records);
		console.log(`Successfully indexed ${records.length} objects!`);
		return result;
	} catch (error) {
		console.error("Error in batchIndexToAlgolia:", error);
		throw error;
	}
};
