const Differencify = require('differencify');
const globalConfig = require('./configs/global-config');
const testConfig = require('./configs/test-config');

const differencify = new Differencify(globalConfig);

differencify.test(testConfig).then((r) => {
  console.log(r);
});
