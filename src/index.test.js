import fs from 'fs';
import Chromy from 'chromy';
import Differencify from './index';
import logger from './logger';

jest.mock('chromy', () => jest.fn().mockImplementation(() =>
    ({
      goto: jest.fn(),
      close: jest.fn(),
      screenshotDocument: jest.fn(() => 'png file'),
      screenshotSelector: jest.fn(() => 'png file'),
    }),
  ));

jest.mock('./compareImage', () => jest.fn(arg =>
    new Promise((resolve, reject) => {
      if (arg.screenshots === 'screenshots') {
        return resolve('Writting the diff image to disk');
      }
      return reject('error');
    }),
  ));

let writeFileSyncCalls = [];
fs.writeFileSync = (...args) => {
  writeFileSyncCalls.push(...args);
};
fs.mkdirSync = (...args) => {
  writeFileSyncCalls.push(...args);
};

let loggerCalls = [];
logger.log = (...args) => {
  loggerCalls.push(...args);
};

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
    { name: 'goto', value: 'www.example.com' },
    { name: 'capture', value: 'document' },
  ],
};

const differencify = new Differencify(globalConfig);

describe('Differencify', () => {
  afterEach(() => {
    loggerCalls = [];
    writeFileSyncCalls = [];
  });
  it('update fn', async () => {
    const result = await differencify.update(testConfig);
    expect(result).toEqual(true);
    expect(differencify.chromeInstancesId).toEqual(9223);
    expect(loggerCalls[0]).toEqual('goto -> www.example.com');
    expect(loggerCalls[1]).toEqual('Capturing screenshot of whole DOM');
    expect(loggerCalls[2]).toEqual('screenshot saved in -> screenshots/default.png');
    expect(writeFileSyncCalls).toEqual(['screenshots', './differencify_report', 'screenshots/default.png', 'png file']);
  });
  it('test fn', async () => {
    const result = await differencify.test(testConfig);
    expect(result).toEqual(true);
    expect(differencify.chromeInstancesId).toEqual(9224);
    expect(loggerCalls[0]).toEqual('goto -> www.example.com');
    expect(loggerCalls[1]).toEqual('Capturing screenshot of whole DOM');
    expect(loggerCalls[2]).toEqual('screenshot saved in -> ./differencify_report/default.png');
    expect(loggerCalls[4]).toEqual('Writting the diff image to disk');
    expect(writeFileSyncCalls).toEqual(['./differencify_report/default.png', 'png file']);
  });
  it('cleanup fn', async () => {
    const chromy1 = new Chromy();
    differencify.chromeInstances[1] = chromy1;
    const chromy2 = new Chromy();
    differencify.chromeInstances[2] = chromy2;
    await differencify.cleanup();
    expect(loggerCalls[0]).toEqual('All browsers been closed');
  });
});
