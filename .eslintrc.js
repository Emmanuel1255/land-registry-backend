// .eslintrc.js
module.exports = {
    env: {
      node: true,
      es2021: true,
      jest: true,
    },
    extends: [
      'airbnb-base',
      'plugin:prettier/recommended',
      'plugin:jest/recommended',
    ],
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: ['prettier', 'jest'],
    rules: {
      'prettier/prettier': 'error',
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: 'next' }],
      'import/prefer-default-export': 'off',
      'jest/expect-expect': 'error',
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/valid-expect': 'error'
    },
  };