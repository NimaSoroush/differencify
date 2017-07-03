import Differencify from './index';
import logger from './logger';

// import Chromy from 'chromy';
// import fs from 'fs';
// const chromy = new Chromy();

logger.enable();

const globalConfig = {
  screenshots: 'screenshots',
  debug: true,
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
    { name: 'goto', value: 'http://www.google.com/' },
    { name: 'capture', value: 'document' },
  ],
};

const differencify = new Differencify(globalConfig);

describe('Differencify', () => {
  it('update test', async () => {
    await differencify.update(testConfig);
    // await chromy.goto('http://example.com');
    // const png = await chromy.screenshotDocument();
    // fs.writeFileSync(`${test.name}.png`, png);
    // await chromy.wait(3000);
    // await chromy.close();
  }, 20000);
});
