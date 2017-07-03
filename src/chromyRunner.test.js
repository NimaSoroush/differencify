import fs from 'fs';
import { ChromyRunner } from './chromyRunner';
import logger from './logger';

jest.mock('chromy', () => jest.fn().mockImplementation(() =>
    ({
      chain: jest.fn(),
      goto: jest.fn(),
      screenshotDocument: jest.fn(() => 'png file'),
      screenshotSelector: jest.fn(() => 'png file'),
    }),
  ));

const loggerCalls = [];
logger.log = (...args) => {
  loggerCalls.push(...args);
};

const writeFileSyncCalls = [];
fs.writeFileSync = (...args) => {
  writeFileSyncCalls.push(...args);
};

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
    { name: 'goto', value: 'www.example.com' },
    { name: 'capture', value: 'document' },
  ],
};

const chromyRunner = new ChromyRunner(globalConfig);

describe('ChromyRunner', () => {
  it('runs tests', async () => {
    await chromyRunner.run(testConfig);
    expect(chromyRunner.currentTestId).toEqual(1);
    expect(loggerCalls[0]).toEqual('goto -> www.example.com');
    expect(loggerCalls[1]).toEqual('screenshot saved in -> ./screenshots/default');
    expect(chromyRunner.options)
      .toEqual({
        debug: false,
        screenshots: './screenshots',
        timeout: 30000,
        visible: true,
      });
    expect(writeFileSyncCalls).toEqual(['./screenshots/default.png', 'png file']);
  });
});
