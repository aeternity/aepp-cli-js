module.exports = {
  env: {
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module',
  },
  rules: {
    // TODO: enable these rules back
    'no-console': 0,
    'max-len': 0,
    'no-param-reassign': 0,
    radix: 0,
    'no-restricted-globals': 0,
    'default-param-last': 0,
    'prefer-const': 0,
  },
};
