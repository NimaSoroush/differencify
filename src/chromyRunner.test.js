import fs from 'fs';
import Chromy from 'chromy';
import { ChromyRunner } from './chromyRunner';
import logger from './logger';
import { globalConfig, testConfig, configTypes } from './defaultConfig';
import actions from './actions';

jest.mock('chromy', () => jest.fn().mockImplementation(() =>
    ({
      goto: jest.fn(),
      close: jest.fn(),
      screenshotDocument: jest.fn(() => 'png file'),
      screenshotSelector: jest.fn(() => 'png file'),
      screenshot: jest.fn(() => 'png file'),
    }),
  ));

jest.mock('./compareImage', () => jest.fn(arg =>
    new Promise((resolve, reject) => {
      if (arg.screenshots === './screenshots') {
        return resolve('Writting the diff image to disk');
      }
      return reject('error');
    }),
  ));

let loggerCalls = [];
logger.log = (...args) => {
  loggerCalls.push(...args);
};

let writeFileSyncCalls = [];
fs.writeFileSync = (...args) => {
  writeFileSyncCalls.push(...args);
};

const chromyRunner = new ChromyRunner(globalConfig);
const chromy = new Chromy();

describe('ChromyRunner', () => {
  afterEach(() => {
    loggerCalls = [];
    writeFileSyncCalls = [];
  });
  it('run update', async () => {
    testConfig.type = configTypes.update;
    const result = await chromyRunner.run(chromy, testConfig);
    expect(result).toEqual(true);
    expect(loggerCalls[0]).toEqual('goto -> www.example.com');
    expect(loggerCalls[1]).toEqual('Capturing screenshot of whole DOM');
    expect(loggerCalls[2]).toEqual('screenshot saved in -> ./screenshots/default.png');
    expect(chromyRunner.options)
      .toEqual({
        screenshots: './screenshots',
        testReportPath: './differencify_report',
        saveDifferencifiedImage: true,
        debug: false,
        visible: false,
        timeout: 30000,
        mismatchThreshold: 0.01,
      });
    expect(writeFileSyncCalls).toEqual(['./screenshots/default.png', 'png file']);
  });
  it('run test', async () => {
    testConfig.type = configTypes.test;
    const result = await chromyRunner.run(chromy, testConfig);
    expect(result).toEqual(true);
    expect(loggerCalls[0]).toEqual('goto -> www.example.com');
    expect(loggerCalls[1]).toEqual('Capturing screenshot of whole DOM');
    expect(loggerCalls[2]).toEqual('screenshot saved in -> ./differencify_report/default.png');
    expect(chromyRunner.options)
      .toEqual({
        screenshots: './screenshots',
        testReportPath: './differencify_report',
        saveDifferencifiedImage: true,
        debug: false,
        visible: false,
        timeout: 30000,
        mismatchThreshold: 0.01,
      });
    expect(writeFileSyncCalls).toEqual(['./differencify_report/default.png', 'png file']);
  });
  describe('Chromy runner', () => {
    it('Step runner: test action', async () => {
      testConfig.type = configTypes.test;
      testConfig.steps.push({ name: actions.test, value: globalConfig.testReportPath });
      const result = await chromyRunner.run(chromy, testConfig);
      testConfig.steps.pop({ name: actions.test, value: globalConfig.testReportPath });
      expect(result).toEqual(true);
      expect(loggerCalls[0]).toEqual('goto -> www.example.com');
      expect(loggerCalls[1]).toEqual('Capturing screenshot of whole DOM');
      expect(loggerCalls[2]).toEqual('screenshot saved in -> ./differencify_report/default.png');
      expect(loggerCalls[4]).toEqual('Writting the diff image to disk');
      expect(writeFileSyncCalls).toEqual(['./differencify_report/default.png', 'png file']);
    });
    it('Step runner: update action', async () => {
      testConfig.type = configTypes.update;
      const result = await chromyRunner.run(chromy, testConfig);
      expect(result).toEqual(true);
      expect(loggerCalls[0]).toEqual('goto -> www.example.com');
      expect(loggerCalls[1]).toEqual('Capturing screenshot of whole DOM');
      expect(loggerCalls[2]).toEqual('screenshot saved in -> ./screenshots/default.png');
      expect(writeFileSyncCalls).toEqual(['./screenshots/default.png', 'png file']);
    });
  });
  describe('Chromy runner', () => {
    it('Capture: screenshot', async () => {
      const newConfig = {
        name: 'default',
        resolution: {
          width: 800,
          height: 600,
        },
        steps: [
          { name: 'goto', value: 'www.example.com' },
          { name: 'capture' },
        ],
      };
      newConfig.type = configTypes.test;
      const result = await chromyRunner.run(chromy, newConfig);
      expect(result).toEqual(true);
      expect(loggerCalls[0]).toEqual('goto -> www.example.com');
      expect(loggerCalls[1]).toEqual('Capturing screenshot of chrome window');
      expect(loggerCalls[2]).toEqual('screenshot saved in -> ./differencify_report/default.png');
      expect(writeFileSyncCalls).toEqual(['./differencify_report/default.png', 'png file']);
    });
    it('Capture: screenshotDocument', async () => {
      const newConfig = {
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
      newConfig.type = configTypes.test;
      const result = await chromyRunner.run(chromy, newConfig);
      expect(result).toEqual(true);
      expect(loggerCalls[0]).toEqual('goto -> www.example.com');
      expect(loggerCalls[1]).toEqual('Capturing screenshot of whole DOM');
      expect(loggerCalls[2]).toEqual('screenshot saved in -> ./differencify_report/default.png');
      expect(writeFileSyncCalls).toEqual(['./differencify_report/default.png', 'png file']);
    });
    it('Capture: screenshotDocument', async () => {
      const newConfig = {
        name: 'default',
        resolution: {
          width: 800,
          height: 600,
        },
        steps: [
          { name: 'goto', value: 'www.example.com' },
          { name: 'capture', value: '#form' },
        ],
      };
      newConfig.type = configTypes.test;
      const result = await chromyRunner.run(chromy, newConfig);
      expect(result).toEqual(true);
      expect(loggerCalls[0]).toEqual('goto -> www.example.com');
      expect(loggerCalls[1]).toEqual('Capturing screenshot of #form selector');
      expect(loggerCalls[2]).toEqual('screenshot saved in -> ./differencify_report/default.png');
      expect(writeFileSyncCalls).toEqual(['./differencify_report/default.png', 'png file']);
    });
  });
});
