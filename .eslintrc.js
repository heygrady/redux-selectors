module.exports = {
  extends: ['react-app', 'standard', 'standard-react', 'prettier'],

  overrides: [
    {
      files: 'test/**/*.js',
      env: {
        jest: true,
      },
    },
  ],
}
