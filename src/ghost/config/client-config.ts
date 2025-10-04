const config = {
	url: process.env.NEXT_PUBLIC_GHOST_URL || "",
	key: process.env.NEXT_PUBLIC_GHOST_CONTENT_API_KEY || "",
	version: "v5.0",
};

// Validate required environment variables
if (!config.url || !config.key) {
	console.warn(
		"Ghost Content API configuration is missing. Please set NEXT_PUBLIC_GHOST_URL and NEXT_PUBLIC_GHOST_CONTENT_API_KEY environment variables."
	);
}

export default config;
