module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'module',
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        warnOnUnsupportedTypeScriptVersion: false,
    },
    rules: {
        '@typescript-eslint/restrict-template-expressions': ['error', { allowNullish: true, },],
        '@typescript-eslint/no-unused-vars': ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", },],
        'prettier/prettier': 'error',
    },
    plugins: ['@typescript-eslint', 'prettier'],
    root: true,
};
