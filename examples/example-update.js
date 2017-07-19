const Differencify = require('differencify');
const globalConfig = require('./configs/global-config');
const testConfig = require('./configs/test-config');

const differencify = new Differencify(globalConfig.default);

differencify.update(testConfig.default).then((result) => {
  console.log(result);
  differencify.cleanup();
});
