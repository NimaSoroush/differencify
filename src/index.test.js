import { Differencify } from './index';
import logger from './logger';

logger.enable();

const globalConfig = {
  screenshots: './screenshots',
  debug: false,
  visible: true,
  timeout: 30000,
};

const testConfig = {
  name: 'default',
  resolution: {
    width: 800,
    height: 600,
  },
  steps: [
    { name: 'goto', value: 'http://www.example.com/' },
    { name: 'capture', value: 'document' },
  ],
};

const differencify = new Differencify(globalConfig);

describe('Differencify', () => {
  it('update test', async () => {
    await differencify.update(testConfig);
  });
});
