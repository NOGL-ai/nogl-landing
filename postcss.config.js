module.exports = {
	plugins: {
		"@tailwindcss/postcss": {
			// Ensure LightningCSS works properly on Vercel
			lightningcss: {
				targets: {
					chrome: 95,
					firefox: 78,
					safari: 12
				}
			}
		},
		autoprefixer: {},
	},
};
