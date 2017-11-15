import puppeteer from 'puppeteer';
import Target from './target';
import { globalConfig, testConfig } from './config/defaultConfigs';
import functionToString from './helpers/functionToString';
import freezeImage from './freezeImage';
import { sanitiseGlobalConfiguration } from './sanitiser';
import jestMatchers from './utils/jestMatchers';
import compareImage from './compareImage';
import logger from './utils/logger';

const mockMatcher = jest.fn(() => ({
  message: 'message',
  pass: true,
}));

jestMatchers.toNotError = mockMatcher;
jestMatchers.toMatchImageSnapshot = mockMatcher;

jest.mock('./compareImage');

const mockKeyboard = {
  press: jest.fn(),
};

const pageMocks = {
  goto: jest.fn(),
  click: jest.fn(),
  screenshot: jest.fn(),
  waitFor: jest.fn(),
  evaluate: jest.fn(),
  setViewport: jest.fn(),
  keyboard: mockKeyboard,
};

const mockNewPage = jest.fn(() => (pageMocks));

jest.mock('puppeteer', () => ({
  launch: jest.fn(() => ({
    newPage: mockNewPage,
  })),
  connect: jest.fn(() => ({
    newPage: mockNewPage,
  })),
}));

jest.mock('path', () => ({
  join: jest.fn(() => '/'),
  resolve: jest.fn((a, b, c, d) => `root${b}${d}`),
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

const mockLog = jest.fn();
const mockTrace = jest.fn();
const mockErr = jest.fn();
jest.mock('./utils/logger', () => ({
  prefix: jest.fn(() => ({
    log: mockLog,
    error: mockErr,
    trace: mockTrace,
  })),
  warn: jest.fn(),
}));

const browser = puppeteer.launch();
const target = new Target(browser, testConfig, sanitiseGlobalConfiguration(globalConfig));

describe('Target', () => {
  afterEach(() => {
    puppeteer.launch.mockClear();
    mockLog.mockClear();
    mockTrace.mockClear();
    mockErr.mockClear();
    functionToString.mockClear();
    mockMatcher.mockClear();
    compareImage.mockClear();
    target.error = false;
    mockNewPage.mockClear();
    logger.warn.mockClear();
  });
  beforeEach(() => {
    target.tab = target.browser.newPage();
  });
  it('launch fn', async () => {
    target.browser = null;
    await target.launch({
      args: [],
      dumpio: false,
      executablePath: undefined,
      headless: true,
      ignoreHTTPSErrors: false,
      slowMo: 0,
      timeout: 30000,
    });
    expect(mockLog).toHaveBeenCalledWith('Launching browser...');
    expect(puppeteer.launch).toHaveBeenCalledWith({
      args: [],
      dumpio: false,
      executablePath: undefined,
      headless: true,
      ignoreHTTPSErrors: false,
      slowMo: 0,
      timeout: 30000,
    });
    expect(mockNewPage).toHaveBeenCalledTimes(1);
    expect(target.testConfig.newWindow).toEqual(true);
  });
  it('connect fn', async () => {
    target.browser = null;
    await target.connect({
      browserWSEndpoint: 'endpoint',
      ignoreHTTPSErrors: false,
    });
    expect(mockLog).toHaveBeenCalledWith('Launching browser...');
    expect(puppeteer.connect).toHaveBeenCalledWith({
      browserWSEndpoint: 'endpoint',
      ignoreHTTPSErrors: false,
    });
    expect(mockNewPage).toHaveBeenCalledTimes(1);
    expect(target.testConfig.newWindow).toEqual(true);
  });
  describe('_handleFunc', () => {
    beforeEach(() => {
      pageMocks.goto.mockClear();
    });
    it('Wont run if error happened', async () => {
      target.error = true;
      await target._handleFunc('url');
      expect(mockLog).toHaveBeenCalledTimes(0);
    });
    it('will return correct property', async () => {
      target.error = false;
      const result = await target._handleFunc('page', 'testConfig');
      expect(result).toEqual({ debug: false,
        chain: undefined,
        imageSnapshotPath: 'differencify_reports',
        saveDifferencifiedImage: true,
        mismatchThreshold: 0.001,
        newWindow: true });
      expect(mockLog).toHaveBeenCalledWith('Executing page.testConfig step');
    });
    it('will run goto on page', async () => {
      target.error = false;
      await target.newPage();
      const result = await target._handleFunc('page', 'goto', arguments);
      expect(pageMocks.goto).toHaveBeenCalledWith(...arguments);
      expect(result).toEqual();
      expect(mockLog).toHaveBeenCalledWith('Executing page.goto step');
    });
    it('will run press on keyboard', async () => {
      target.error = false;
      await target.newPage();
      const result = await target._handleFunc('keyboard', 'press', arguments);
      expect(mockKeyboard.press).toHaveBeenCalledWith(...arguments);
      expect(result).toEqual();
      expect(mockLog).toHaveBeenCalledWith('Executing keyboard.press step');
    });
  });
  describe('capture/screenshot', () => {
    beforeEach(() => {
      pageMocks.screenshot.mockClear();
    });
    it('Wont run if error happened', async () => {
      target.error = true;
      await target.capture();
      await target.screenshot();
      expect(mockLog).toHaveBeenCalledTimes(0);
    });
    it('Will run capture correctly', async () => {
      await target.newPage();
      await target.capture({});
      expect(pageMocks.screenshot).toHaveBeenCalledWith({});
      expect(logger.warn).toHaveBeenCalledWith(`capture() will be deprecated, use screenshot() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`);
    });
    it('Will run screenshot correctly', async () => {
      await target.newPage();
      await target.screenshot({});
      expect(pageMocks.screenshot).toHaveBeenCalledWith({});
    });
  });
  describe('wait', () => {
    beforeEach(() => {
      pageMocks.waitFor.mockClear();
    });
    it('Wont run if error happened', async () => {
      target.error = true;
      await target.newPage();
      await target.wait();
      expect(pageMocks.waitFor).not.toHaveBeenCalled();
    });
    it('Will run wait correctly', async () => {
      await target.newPage();
      await target.wait(10);
      expect(pageMocks.waitFor).toHaveBeenCalledWith(10);
      expect(logger.warn).toHaveBeenCalledWith(`wait() will be deprecated, use waitFor() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`);
    });
  });
  describe('execute', () => {
    beforeEach(() => {
      pageMocks.evaluate.mockClear();
    });
    it('Wont run if error happened', async () => {
      target.error = true;
      await target.execute();
      expect(pageMocks.evaluate).not.toHaveBeenCalled();
    });
    it('Will run correctly', async () => {
      await target.newPage();
      await target.execute('exp');
      expect(pageMocks.evaluate).toHaveBeenCalledWith('exp');
      expect(logger.warn).toHaveBeenCalledWith(`execute() will be deprecated, use evaluate() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`);
    });
  });
  describe('resize', () => {
    beforeEach(() => {
      pageMocks.setViewport.mockClear();
    });
    it('Wont run if error happened', async () => {
      target.error = true;
      await target.resize();
      expect(pageMocks.setViewport).not.toHaveBeenCalled();
    });
    it('Will run correctly', async () => {
      await target.resize('exp');
      expect(pageMocks.setViewport).toHaveBeenCalledWith('exp');
      expect(logger.warn).toHaveBeenCalledWith(`resize() will be deprecated, use setViewport() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`);
    });
  });
  describe('toMatchSnapshot', () => {
    it('will set test to jest mode', async () => {
      target.isJest();
      target.toMatchSnapshot();
      expect(target.testStats).not.toBeNull();
      expect(target.testConfig.testName).toEqual('Target toMatchSnapshot will set test to jest mode');
      expect(target.testId).toEqual(1);
      expect(mockTrace).toHaveBeenCalledTimes(0);
    });
    it('will test name with numbers if several times called', async () => {
      target.testId = 0;
      target.isJest();
      target.toMatchSnapshot();
      target.toMatchSnapshot();
      expect(target.testConfig.isJest).toEqual(true);
      expect(target.testStats).not.toBeNull();
      expect(target.testConfig.testName)
        .toEqual('Target toMatchSnapshot will test name with numbers if several times called 1');
      expect(target.testId).toEqual(2);
      expect(mockErr).toHaveBeenCalledTimes(0);
    });
  });
  describe('isJest', () => {
    it('will set test to jest mode', async () => {
      target.isJest();
      expect(target.testConfig.isJest).toEqual(true);
      expect(target.testStats).not.toBeNull();
    });
  });
  describe('_evaluateResult', () => {
    it('it calls toNotError if error happens in any steps when in jest mode', async () => {
      target.error = new Error('Error happened');
      const result = await target._evaluateResult();
      expect(jestMatchers.toNotError).toHaveBeenCalled();
      expect(result).toEqual(false);
    });
    it('it wont calls toMatchImageSnapshot when in jest mode and compareImage throws', async () => {
      const result = await target._evaluateResult();
      expect(compareImage).toHaveBeenCalled();
      expect(jestMatchers.toMatchImageSnapshot).not.toHaveBeenCalled();
      expect(result).toEqual(false);
    });
    it('it calls toMatchImageSnapshot when in jest mode', async () => {
      compareImage.mockReturnValueOnce({ matched: true });
      const result = await target._evaluateResult();
      expect(compareImage).toHaveBeenCalled();
      expect(jestMatchers.toMatchImageSnapshot).toHaveBeenCalled();
      expect(result).toEqual(true);
    });
  });
  describe('FreezeImage', () => {
    beforeEach(() => {
      pageMocks.evaluate.mockClear();
    });
    it('Wont run if error happened', async () => {
      target.error = true;
      await target.freezeImage();
      expect(mockLog).toHaveBeenCalledTimes(0);
    });
    it('Existing selector', async () => {
      pageMocks.evaluate.mockReturnValueOnce(true);
      functionToString.mockReturnValueOnce('return string function');
      await target.freezeImage('selector');
      expect(mockLog).toHaveBeenCalledWith('Freezing image selector in browser');
      expect(mockErr).toHaveBeenCalledTimes(0);
      expect(pageMocks.evaluate).toHaveBeenCalledWith('return string function');
      expect(functionToString).toHaveBeenCalledWith(freezeImage, 'selector');
    });
    it('FreezeImage: non-existing selector', async () => {
      pageMocks.evaluate.mockReturnValueOnce(false);
      functionToString.mockReturnValueOnce('return string function');
      await target.freezeImage('selector');
      expect(mockLog).toHaveBeenCalledWith('Freezing image selector in browser');
      expect(mockTrace).toHaveBeenCalledWith('Unable to freeze image with selector selector');
      expect(pageMocks.evaluate).toHaveBeenCalledWith('return string function');
      expect(functionToString).toHaveBeenCalledWith(freezeImage, 'selector');
    });
  });
});
