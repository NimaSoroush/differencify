import Differencify from 'differencify';
import globalConfig from './configs/global-config';
import testConfig from './configs/test-config';

const differencify = new Differencify(globalConfig);

describe('My website', () => {
  it('validate visual regression test', async () => {
    const result = await differencify.test(testConfig);
    expect(result).toEqual(true);
  }, 30000);
});
