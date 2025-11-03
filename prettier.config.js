/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
	plugins: ["prettier-plugin-tailwindcss"],
	useTabs: true,
	tabWidth: 2,
	semi: false,
	jsxSingleQuote: false,
	singleQuote: false,
	bracketSpacing: true,
	bracketSameLine: false,
	quoteProps: "as-needed",
	trailingComma: "es5",
	arrowParens: "avoid",
	proseWrap: "always",
}

export default config
