module.exports = {
  extends: [
    'react-app',
    'standard',
    'prettier',
    'prettier/standard'
  ],
  plugins: [
    'react',
    'prettier',
    'standard'
  ],
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    es6: true,
    node: true
  },
  rules: {
    'prettier/prettier': 'error'
  },

  overrides: [
    {
      files: 'test/**/*.js',
      env: {
        jest: true,
      },
    },
  ],
}
