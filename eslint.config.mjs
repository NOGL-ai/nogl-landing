import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginNext from "@next/eslint-plugin-next";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";

export default [
	{ files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	pluginReact.configs.flat.recommended,
	{
		plugins: {
			"react-hooks": pluginReactHooks,
			"@next/next": pluginNext,
			"jsx-a11y": pluginJsxA11y,
		},
		rules: {
			"react/react-in-jsx-scope": "off",
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					"argsIgnorePattern": "^_"
				}
			],
			"@typescript-eslint/no-var-requires": "off",
			"@typescript-eslint/no-require-imports": "off",
			"@typescript-eslint/no-empty-object-type": "warn",
			"@typescript-eslint/no-unsafe-function-type": "warn",
			"@typescript-eslint/no-unused-expressions": "warn",
			"@typescript-eslint/no-non-null-asserted-optional-chain": "error",
			"@typescript-eslint/ban-ts-comment": "warn",
			"react/no-unknown-property": "warn",
			"react/prop-types": "off",
			"react/display-name": "warn",
			"react/no-children-prop": "warn",
			"react/no-unescaped-entities": "warn",
			"react-hooks/exhaustive-deps": "warn",
			"@next/next/no-img-element": "warn",
			"jsx-a11y/anchor-has-content": "warn",
			"no-undef": "off",
			"no-var": "warn",
			"prefer-const": "warn"
		}
	}
];
