module.exports = {
  extends: [
    'airbnb-base',
    'plugin:prettier/recommended',
    'plugin:react/recommended',
  ],
  env: {
    browser: true,
    webextensions: true,
    es6: true,
  },
  rules: {
    'class-methods-use-this': 0,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
