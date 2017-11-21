const { jest: jestConfig } = require('../../package.json');

// eslint-disable-next-line prefer-object-spread/prefer-object-spread
module.exports = Object.assign({}, jestConfig, {
  rootDir: '../',
  reporters: [
    'default',
    [
      '../dist/reporter',
      {
        debug: true,
        reportPath: 'differencify_reports',
        reportTypes: {
          html: 'index.html',
          json: 'index.json',
        },
      },
    ],
  ],
});
