module.exports = {
    parser: '@babel/eslint-parser',
    extends: ['standard', 'typescript'],
    env: {
        es6: true,
        jest: true
    },
    plugins: ['typescript', 'prettier'],
    parserOptions: {
        sourceType: 'module'
    },
    rules: {
        semi: [2, 'always'],
        indent: ['error', 4],
        'space-before-function-paren': 0,
        'prettier/prettier': 'error'
    }
};
