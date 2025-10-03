import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginNext from "@next/eslint-plugin-next";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";

export default [
	{
		files: ["src/**/*.{js,mjs,cjs,ts,jsx,tsx}", "*.{js,mjs,cjs,ts,jsx,tsx}"],
		ignores: [
			".next/**",
			"next-env.d.ts",
			"node_modules/**",
			"yarn.lock",
			"package-lock.json",
			"public/**",
			"build/**",
			"dist/**",
			"**/*.min.js",
			"**/*.bundle.js",
			"**/polyfills.js",
			"**/webpack.js",
			"**/edge-runtime-webpack.js",
			"**/middleware-build-manifest.js",
		],
	},
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	pluginReact.configs.flat.recommended,
	{
		settings: {
			react: {
				version: "detect",
			},
		},
		plugins: {
			"react-hooks": pluginReactHooks,
			"@next/next": pluginNext,
			"jsx-a11y": pluginJsxA11y,
		},
		rules: {
			// React rules
			"react/react-in-jsx-scope": "off", // Not needed in Next.js
			"react/prop-types": "off", // Using TypeScript instead
			"react/no-unknown-property": "off",
			"react/display-name": "off",
			"react/no-children-prop": "off",
			"react/no-unescaped-entities": "off",

			// TypeScript rules
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-var-requires": "off", // Allow require() in some cases
			"@typescript-eslint/no-require-imports": "off", // Allow require() in some cases
			"@typescript-eslint/no-empty-object-type": "off",
			"@typescript-eslint/no-unsafe-function-type": "off",
			"@typescript-eslint/no-unused-expressions": "off",
			"@typescript-eslint/no-non-null-asserted-optional-chain": "off",
			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/triple-slash-reference": "off",

			// React Hooks rules
			"react-hooks/exhaustive-deps": "off",

			// Next.js rules
			"@next/next/no-img-element": "off",

			// Accessibility rules
			"jsx-a11y/anchor-has-content": "off",

			// General JavaScript rules
			"no-undef": "off", // TypeScript handles this
			"no-var": "off",
			"prefer-const": "off",
		},
	},
];
