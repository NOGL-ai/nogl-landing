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
			"react/no-unknown-property": "warn",
			"react/display-name": "warn",
			"react/no-children-prop": "warn",
			"react/no-unescaped-entities": "warn",

			// TypeScript rules
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/no-var-requires": "off", // Allow require() in some cases
			"@typescript-eslint/no-require-imports": "off", // Allow require() in some cases
			"@typescript-eslint/no-empty-object-type": "warn",
			"@typescript-eslint/no-unsafe-function-type": "warn",
			"@typescript-eslint/no-unused-expressions": "warn",
			"@typescript-eslint/no-non-null-asserted-optional-chain": "error",
			"@typescript-eslint/ban-ts-comment": "warn",
			"@typescript-eslint/triple-slash-reference": "warn",

			// React Hooks rules
			"react-hooks/exhaustive-deps": "warn",

			// Next.js rules
			"@next/next/no-img-element": "warn",

			// Accessibility rules
			"jsx-a11y/anchor-has-content": "warn",

			// General JavaScript rules
			"no-undef": "off", // TypeScript handles this
			"no-var": "warn",
			"prefer-const": "warn",
		},
	},
];
