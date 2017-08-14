import fs from 'fs';
import Chromy from 'chromy';
import run from './chromyRunner';
import logger from './logger';
import { globalConfig, testConfig, configTypes } from './defaultConfig';
import actions from './actions';
import functionToString from './helpers/functionToString';
import freezeImage from './freezeImage';

jest.mock('chromy', () => () =>
  ({
    goto: jest.fn(),
    close: jest.fn(),
    screenshotDocument: jest.fn(() => 'png file'),
    screenshotSelector: jest.fn(() => 'png file'),
    screenshot: jest.fn(() => 'png file'),
    wait: jest.fn(),
    evaluate: jest.fn(),
  }));

jest.mock('./compareImage', () => jest.fn(arg =>
  new Promise((resolve, reject) => {
    if (arg.screenshots === './screenshots') {
      return resolve('Saving the diff image to disk');
    }
    return reject('error');
  }),
));

jest.mock('./helpers/functionToString');

let loggerCalls = [];
logger.prefix = () => logger;
logger.log = (...args) => {
  loggerCalls.push(...args);
};

let writeFileSyncCalls = [];
fs.writeFileSync = (...args) => {
  writeFileSyncCalls.push(...args);
};

const chromy = new Chromy();

describe('ChromyRunner', () => {
  afterEach(() => {
    loggerCalls = [];
    writeFileSyncCalls = [];
    chromy.screenshotDocument.mockClear();
    chromy.screenshot.mockClear();
    chromy.screenshotSelector.mockClear();
    chromy.wait.mockClear();
    chromy.evaluate.mockClear();
    functionToString.mockClear();
  });
  it('run update', async () => {
    testConfig.type = configTypes.update;
    const result = await run(chromy, globalConfig, testConfig);
    expect(result).toEqual(true);
    expect(chromy.goto).toHaveBeenCalledWith('www.example.com');
    expect(chromy.screenshotDocument).toHaveBeenCalledTimes(1);
    expect(loggerCalls[0]).toEqual('goto -> www.example.com');
    expect(loggerCalls[1]).toEqual('capturing screenshot of whole DOM');
    expect(loggerCalls[2]).toEqual('screenshot saved in -> ./screenshots/default.png');
    expect(writeFileSyncCalls).toEqual(['./screenshots/default.png', 'png file']);
  });
  it('run test', async () => {
    testConfig.type = configTypes.test;
    const result = await run(chromy, globalConfig, testConfig);
    expect(result).toEqual(true);
    expect(chromy.goto).toHaveBeenCalledWith('www.example.com');
    expect(chromy.screenshotDocument).toHaveBeenCalledTimes(1);
    expect(loggerCalls[0]).toEqual('goto -> www.example.com');
    expect(loggerCalls[1]).toEqual('capturing screenshot of whole DOM');
    expect(loggerCalls[2]).toEqual('screenshot saved in -> ./differencify_report/default.png');
    expect(writeFileSyncCalls).toEqual(['./differencify_report/default.png', 'png file']);
  });
  describe('Chromy runner', () => {
    it('Step runner: test action', async () => {
      testConfig.type = configTypes.test;
      testConfig.steps.push({ name: actions.test, value: globalConfig.testReportPath });
      const result = await run(chromy, globalConfig, testConfig);
      testConfig.steps.pop({ name: actions.test, value: globalConfig.testReportPath });
      expect(result).toEqual(true);
      expect(chromy.goto).toHaveBeenCalledWith('www.example.com');
      expect(chromy.screenshotDocument).toHaveBeenCalledTimes(1);
      expect(loggerCalls[0]).toEqual('goto -> www.example.com');
      expect(loggerCalls[1]).toEqual('capturing screenshot of whole DOM');
      expect(loggerCalls[2]).toEqual('screenshot saved in -> ./differencify_report/default.png');
      expect(writeFileSyncCalls).toEqual(['./differencify_report/default.png', 'png file']);
    });
    it('Step runner: update action', async () => {
      testConfig.type = configTypes.update;
      const result = await run(chromy, globalConfig, testConfig);
      expect(result).toEqual(true);
      expect(chromy.goto).toHaveBeenCalledWith('www.example.com');
      expect(chromy.screenshotDocument).toHaveBeenCalledTimes(1);
      expect(loggerCalls[0]).toEqual('goto -> www.example.com');
      expect(loggerCalls[1]).toEqual('capturing screenshot of whole DOM');
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
      const result = await run(chromy, globalConfig, newConfig);
      expect(result).toEqual(true);
      expect(chromy.goto).toHaveBeenCalledWith('www.example.com');
      expect(chromy.screenshot).toHaveBeenCalledTimes(1);
      expect(loggerCalls[0]).toEqual('goto -> www.example.com');
      expect(loggerCalls[1]).toEqual('capturing screenshot of chrome window');
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
      const result = await run(chromy, globalConfig, newConfig);
      expect(result).toEqual(true);
      expect(chromy.goto).toHaveBeenCalledWith('www.example.com');
      expect(chromy.screenshotDocument).toHaveBeenCalledTimes(1);
      expect(loggerCalls[0]).toEqual('goto -> www.example.com');
      expect(loggerCalls[1]).toEqual('capturing screenshot of whole DOM');
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
      const result = await run(chromy, globalConfig, newConfig);
      expect(result).toEqual(true);
      expect(chromy.goto).toHaveBeenCalledWith('www.example.com');
      expect(chromy.screenshotSelector).toHaveBeenCalledTimes(1);
      expect(loggerCalls[0]).toEqual('goto -> www.example.com');
      expect(loggerCalls[1]).toEqual('capturing screenshot of #form selector');
      expect(loggerCalls[2]).toEqual('screenshot saved in -> ./differencify_report/default.png');
      expect(writeFileSyncCalls).toEqual(['./differencify_report/default.png', 'png file']);
    });
  });
  describe('Chromy runner', () => {
    it('Wait: millisecond', async () => {
      const newConfig = {
        name: 'default',
        resolution: {
          width: 800,
          height: 600,
        },
        steps: [
          { name: 'goto', value: 'www.example.com' },
          { name: 'wait', value: 10 },
        ],
      };
      newConfig.type = configTypes.test;
      const result = await run(chromy, globalConfig, newConfig);
      expect(result).toEqual(true);
      expect(chromy.goto).toHaveBeenCalledWith('www.example.com');
      expect(chromy.wait).toHaveBeenCalledWith(10);
      expect(loggerCalls[0]).toEqual('goto -> www.example.com');
      expect(loggerCalls[1]).toEqual('waiting for 10 ms');
    });
    it('Wait: selector', async () => {
      const newConfig = {
        name: 'default',
        resolution: {
          width: 800,
          height: 600,
        },
        steps: [
          { name: 'goto', value: 'www.example.com' },
          { name: 'wait', value: 'selector name' },
        ],
      };
      newConfig.type = configTypes.test;
      const result = await run(chromy, globalConfig, newConfig);
      expect(result).toEqual(true);
      expect(chromy.goto).toHaveBeenCalledWith('www.example.com');
      expect(chromy.wait).toHaveBeenCalledWith('selector name');
      expect(loggerCalls[0]).toEqual('goto -> www.example.com');
      expect(loggerCalls[1]).toEqual('waiting for selector name selector');
    });
    it('Wait: function', async () => {
      const newConfig = {
        name: 'default',
        resolution: {
          width: 800,
          height: 600,
        },
        steps: [
          { name: 'goto', value: 'www.example.com' },
          { name: 'wait', value: () => {} },
        ],
      };
      newConfig.type = configTypes.test;
      const result = await run(chromy, globalConfig, newConfig);
      expect(result).toEqual(true);
      expect(chromy.goto).toHaveBeenCalledWith('www.example.com');
      expect(chromy.wait).toHaveBeenCalledTimes(1);
      expect(loggerCalls[0]).toEqual('goto -> www.example.com');
      expect(loggerCalls[1]).toEqual('waiting for function execution');
    });
    it('Wait: not valid', async () => {
      const newConfig = {
        name: 'default',
        resolution: {
          width: 800,
          height: 600,
        },
        steps: [
          { name: 'goto', value: 'www.example.com' },
          { name: 'wait', value: true },
        ],
      };
      newConfig.type = configTypes.test;
      const result = await run(chromy, globalConfig, newConfig);
      expect(result).toEqual(false);
      expect(chromy.goto).toHaveBeenCalledWith('www.example.com');
      expect(chromy.wait).toHaveBeenCalledTimes(0);
      expect(loggerCalls[0]).toEqual('goto -> www.example.com');
      expect(loggerCalls[1]).toEqual('failed to detect waiting mechanism');
    });
  });
  describe('Chromy runner', () => {
    it('Execute: function', async () => {
      const newConfig = {
        name: 'default',
        resolution: {
          width: 800,
          height: 600,
        },
        steps: [
          { name: 'execute', value: () => {} },
        ],
      };
      const result = await run(chromy, globalConfig, newConfig);
      expect(result).toEqual(true);
      expect(chromy.evaluate).toHaveBeenCalledTimes(1);
      expect(loggerCalls[0]).toEqual('waiting for to execute function in browser');
    });
    it('Execute: non-function', async () => {
      const newConfig = {
        name: 'default',
        resolution: {
          width: 800,
          height: 600,
        },
        steps: [
          { name: 'execute', value: 123 },
        ],
      };
      const result = await run(chromy, globalConfig, newConfig);
      expect(result).toEqual(false);
      expect(chromy.evaluate).toHaveBeenCalledTimes(0);
      expect(loggerCalls[0]).toEqual('failed to detect execute function');
    });
  });
  describe('Chromy runner', () => {
    it('FreezeImage: existing selector', async () => {
      chromy.evaluate.mockReturnValueOnce(true);
      functionToString.mockReturnValueOnce('return string function');
      const newConfig = {
        name: 'default',
        resolution: {
          width: 800,
          height: 600,
        },
        steps: [
          { name: 'freezeImage', value: 'selector' },
        ],
      };
      const result = await run(chromy, globalConfig, newConfig);
      expect(result).toEqual(true);
      expect(chromy.evaluate).toHaveBeenCalledWith('return string function');
      expect(functionToString).toHaveBeenCalledWith(freezeImage, 'selector');
      expect(loggerCalls[0]).toEqual('Freezing image selector in browser');
    });
    it('FreezeImage: non-existing selector', async () => {
      chromy.evaluate.mockReturnValueOnce(false);
      functionToString.mockReturnValueOnce('return string function');
      const newConfig = {
        name: 'default',
        resolution: {
          width: 800,
          height: 600,
        },
        steps: [
          { name: 'freezeImage', value: 'selector' },
        ],
      };
      const result = await run(chromy, globalConfig, newConfig);
      expect(result).toEqual(false);
      expect(chromy.evaluate).toHaveBeenCalledWith('return string function');
      expect(functionToString).toHaveBeenCalledWith(freezeImage, 'selector');
      expect(loggerCalls[0]).toEqual('Freezing image selector in browser');
      expect(loggerCalls[1]).toEqual('Tag with selector selector is not a valid image');
    });
  });
});
