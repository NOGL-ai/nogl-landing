import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginNext from "@next/eslint-plugin-next";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import pluginReactYouMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect";

export default [
	{
		ignores: [
			".next/**",
			"**/.next/**",
			"**/out/**",
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
			"next-env.d.ts",
		],
	},
	{
		files: ["src/**/*.{js,mjs,cjs,ts,jsx,tsx}"],
	},
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	pluginReact.configs.flat.recommended,
	pluginReactYouMightNotNeedAnEffect.configs.recommended,
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
			"react-you-might-not-need-an-effect": pluginReactYouMightNotNeedAnEffect,
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
