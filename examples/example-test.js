const Differencify = require('differencify');
const globalConfig = require('./configs/global-config').default;
const testConfig = require('./configs/test-config').default;

const differencify = new Differencify(globalConfig);

differencify.test(testConfig).then((result) => {
  console.log(result); // true or false
  differencify.cleanup();
  differencify.generateReport({
    html: 'index.html',
    json: 'report.json',
  });
});
