module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'n8n-nodes-base'],
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:n8n-nodes-base/community',
		'plugin:n8n-nodes-base/nodes',
		'plugin:n8n-nodes-base/credentials',
	],
	ignorePatterns: ['dist/**', 'node_modules/**', 'gulpfile.js'],
	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
	},
};
