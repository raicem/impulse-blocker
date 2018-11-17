module.exports = {
  extends: 'airbnb-base',
  env: {
    browser: true,
    webextensions: true,
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
};
