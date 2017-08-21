import Differencify from 'differencify';
import globalConfig from './configs/global-config';
import testConfig from './configs/test-config';

const differencify = new Differencify(globalConfig.default);

describe('My website', () => {
  afterAll(() => {
    differencify.cleanup();
    differencify.generateReport({
      html: 'index.html',
      json: 'report.json',
    });
  });
  it('validate visual regression test', async () => {
    const result = await differencify.test(testConfig.default);
    expect(result).toEqual(true);
  }, 30000);
});
