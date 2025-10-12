/** @type {import('next').NextConfig} */

const nextConfig = {
	reactStrictMode: true,
	typedRoutes: true,
	output: 'standalone',
	// Additional Windows compatibility
	poweredByHeader: false,
	serverExternalPackages: ["@mastra/*"],
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'Permissions-Policy',
						value: 'clipboard-write=*'
					}
				]
			}
		]
	},
	webpack: (config, { isServer }) => {
		// Modify PostCSS loader configuration
		const rules = config.module.rules;
		rules.forEach((rule) => {
			if (rule.oneOf) {
				rule.oneOf.forEach((oneOf) => {
					if (oneOf.use && Array.isArray(oneOf.use)) {
						oneOf.use.forEach((loader) => {
							if (
								loader.loader?.includes("postcss-loader") &&
								loader.options?.postcssOptions
							) {
								loader.options.postcssOptions.config = true;
								if (!loader.options.postcssOptions.plugins) {
									loader.options.postcssOptions.plugins = [];
								}
							}
						});
					}
				});
			}
		});
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				stream: require.resolve("stream-browserify"),
				buffer: require.resolve("buffer"),
				fs: false,
				net: false,
				dns: false,
				child_process: false,
				tls: false,
				os: false,
				path: false,
				crypto: false,
			};
		}
		return config;
	},
	images: {
		dangerouslyAllowSVG: true,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "nogl.ai",
				port: "",
			},
			{
				protocol: "https",
				hostname: "images.pexels.com",
				port: "",
			},
			{
				protocol: "https",
				hostname: "randomuser.me",
				port: "",
			},
			{
				protocol: "https",
				hostname: "example.com",
				port: "",
			},
			{
				protocol: "https",
				hostname: "i.ibb.co",
				port: "",
			},
			{
				protocol: "https",
				hostname: "a0.muscache.com",
				port: "",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
				port: "",
			},
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
				port: "",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "www.gstatic.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "pub-beabd1ed711d4df3bbda9b37465d8b04.r2.dev",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname:
					"13e9f73c8bdfbd5ad59f51c1dd20f5eb.eu.r2.cloudflarestorage.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "static.ghost.org",
				port: "",
				pathname: "/**",
			},
		],
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	transpilePackages: ["undici"],
};

module.exports = nextConfig;
