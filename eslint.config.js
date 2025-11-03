import eslint from "@eslint/js"
import nextPlugin from "@next/eslint-plugin-next"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import tseslint from "typescript-eslint"

export default tseslint.config(
	{
		ignores: [
			".next/**",
			"prisma-generated/**",
			"node_modules/**",
			"next-env.d.ts",
		],
	},
	// base js config for all files
	{
		files: ["**/*.js", "**/*.jsx"],
		...eslint.configs.recommended,
		plugins: {
			"react-hooks": reactHooksPlugin,
			"@next/next": nextPlugin,
		},
		rules: {
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "warn",
			"@next/next/no-html-link-for-pages": "error",
			"@next/next/no-sync-scripts": "error",
		},
	},
	// ts config for ts/tsx files
	{
		files: ["**/*.ts", "**/*.tsx"],
		extends: [
			...tseslint.configs.recommended,
			...tseslint.configs.recommendedTypeChecked,
			...tseslint.configs.stylisticTypeChecked,
		],
		plugins: {
			"react-hooks": reactHooksPlugin,
			"@next/next": nextPlugin,
		},
		rules: {
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "warn",
			"@next/next/no-html-link-for-pages": "error",
			"@next/next/no-sync-scripts": "error",
			"@typescript-eslint/array-type": "off",
			"@typescript-eslint/consistent-type-definitions": "off",
			"@typescript-eslint/consistent-type-imports": [
				"warn",
				{ prefer: "type-imports", fixStyle: "inline-type-imports" },
			],
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{ argsIgnorePattern: "^_" },
			],
			"@typescript-eslint/require-await": "off",
			"@typescript-eslint/no-misused-promises": [
				"error",
				{ checksVoidReturn: { attributes: false } },
			],
			"func-style": ["error", "declaration", { allowArrowFunctions: false }],
		},
		languageOptions: {
			parserOptions: {
				projectService: true,
			},
		},
		linterOptions: {
			reportUnusedDisableDirectives: true,
		},
	}
)
