const { jest: jestConfig } = require('../../package.json');

// eslint-disable-next-line prefer-object-spread/prefer-object-spread
module.exports = Object.assign({}, jestConfig, {
  rootDir: '../',
  reporters: [
    'default',
    [
      'differencify-jest-reporter',
      {
        debug: true,
        reportPath: './src/integration.tests/differencify_reports',
        reportTypes: {
          html: 'index.html',
          json: 'index.json',
        },
      },
    ],
  ],
});
