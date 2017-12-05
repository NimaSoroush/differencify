import puppeteer from 'puppeteer';
import Page from './page';
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

const tabMocks = {
  goto: jest.fn(),
  screenshot: jest.fn(),
  waitFor: jest.fn(),
  evaluate: jest.fn(),
  setViewport: jest.fn(),
  keyboard: mockKeyboard,
};

const mockNewPage = jest.fn(() => (tabMocks));

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
const mockErr = jest.fn();
jest.mock('./utils/logger', () => ({
  prefix: jest.fn(() => ({
    log: mockLog,
    error: mockErr,
  })),
  warn: jest.fn(),
}));

const browser = puppeteer.launch();
const page = new Page(browser, testConfig, sanitiseGlobalConfiguration(globalConfig));

describe('Page', () => {
  afterEach(() => {
    puppeteer.launch.mockClear();
    mockLog.mockClear();
    mockErr.mockClear();
    functionToString.mockClear();
    mockMatcher.mockClear();
    compareImage.mockClear();
    page.error = false;
    mockNewPage.mockClear();
    logger.warn.mockClear();
  });
  beforeEach(() => {
    page.tab = page.browser.newPage();
  });
  it('launch fn', async () => {
    page.browser = null;
    await page.launch({
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
    expect(page.testConfig.newWindow).toEqual(true);
  });
  it('connect fn', async () => {
    page.browser = null;
    await page.connect({
      browserWSEndpoint: 'endpoint',
      ignoreHTTPSErrors: false,
    });
    expect(mockLog).toHaveBeenCalledWith('Launching browser...');
    expect(puppeteer.connect).toHaveBeenCalledWith({
      browserWSEndpoint: 'endpoint',
      ignoreHTTPSErrors: false,
    });
    expect(mockNewPage).toHaveBeenCalledTimes(1);
    expect(page.testConfig.newWindow).toEqual(true);
  });
  describe('_handleFunc', () => {
    beforeEach(() => {
      tabMocks.goto.mockClear();
    });
    it('Wont run if error happened', async () => {
      page.error = true;
      await page._handleFunc('url');
      expect(mockLog).toHaveBeenCalledTimes(0);
    });
    it('will return correct property', async () => {
      page.error = false;
      const result = await page._handleFunc('page', 'testConfig');
      expect(result).toEqual({ debug: false,
        chain: undefined,
        imageSnapshotPath: 'differencify_reports',
        saveDifferencifiedImage: true,
        mismatchThreshold: 0.001,
        newWindow: true });
      expect(mockLog).toHaveBeenCalledWith('Executing page.testConfig step');
    });
    it('will run goto on page', async () => {
      page.error = false;
      await page.newPage();
      const result = await page._handleFunc('page', 'goto', arguments);
      expect(tabMocks.goto).toHaveBeenCalledWith(...arguments);
      expect(result).toEqual();
      expect(mockLog).toHaveBeenCalledWith('Executing page.goto step');
    });
    it('will run press on keyboard', async () => {
      page.error = false;
      await page.newPage();
      const result = await page._handleFunc('keyboard', 'press', arguments);
      expect(mockKeyboard.press).toHaveBeenCalledWith(...arguments);
      expect(result).toEqual();
      expect(mockLog).toHaveBeenCalledWith('Executing keyboard.press step');
    });
  });
  describe('capture/screenshot', () => {
    beforeEach(() => {
      tabMocks.screenshot.mockClear();
    });
    it('Wont run if error happened', async () => {
      page.error = true;
      await page.capture();
      await page.screenshot();
      expect(mockLog).toHaveBeenCalledTimes(0);
    });
    it('Will run capture correctly', async () => {
      await page.newPage();
      await page.capture({});
      expect(tabMocks.screenshot).toHaveBeenCalledWith({});
      expect(mockLog).toHaveBeenCalledWith('Executing capture step');
      expect(logger.warn).toHaveBeenCalledWith(`capture() will be deprecated, use screenshot() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`);
    });
    it('Will run screenshot correctly', async () => {
      await page.newPage();
      await page.screenshot({});
      expect(tabMocks.screenshot).toHaveBeenCalledWith({});
      expect(mockLog).toHaveBeenCalledWith('Executing screenshot step');
    });
  });
  describe('wait', () => {
    beforeEach(() => {
      tabMocks.waitFor.mockClear();
    });
    it('Wont run if error happened', async () => {
      page.error = true;
      await page.wait();
      expect(mockLog).toHaveBeenCalledTimes(0);
    });
    it('Will run wait correctly', async () => {
      await page.wait(10);
      expect(tabMocks.waitFor).toHaveBeenCalledWith(10);
      expect(mockLog).toHaveBeenCalledWith('Executing wait step');
      expect(logger.warn).toHaveBeenCalledWith(`wait() will be deprecated, use waitFor() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`);
    });
  });
  describe('execute', () => {
    beforeEach(() => {
      tabMocks.evaluate.mockClear();
    });
    it('Wont run if error happened', async () => {
      page.error = true;
      await page.execute();
      expect(mockLog).toHaveBeenCalledTimes(0);
    });
    it('Will run correctly', async () => {
      await page.execute('exp');
      expect(tabMocks.evaluate).toHaveBeenCalledWith('exp');
      expect(mockLog).toHaveBeenCalledWith('Executing execute step');
      expect(logger.warn).toHaveBeenCalledWith(`execute() will be deprecated, use evaluate() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`);
    });
  });
  describe('resize', () => {
    beforeEach(() => {
      tabMocks.setViewport.mockClear();
    });
    it('Wont run if error happened', async () => {
      page.error = true;
      await page.resize();
      expect(mockLog).toHaveBeenCalledTimes(0);
    });
    it('Will run correctly', async () => {
      await page.resize('exp');
      expect(tabMocks.setViewport).toHaveBeenCalledWith('exp');
      expect(mockLog).toHaveBeenCalledWith('Executing resize step');
      expect(logger.warn).toHaveBeenCalledWith(`resize() will be deprecated, use setViewport() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`);
    });
  });
  describe('toMatchSnapshot', () => {
    it('will set test to jest mode', async () => {
      page.toMatchSnapshot();
      expect(page.testConfig.isJest).toEqual(true);
      expect(page.testStats).not.toBeNull();
      expect(page.testConfig.testName).toEqual('Page toMatchSnapshot will set test to jest mode');
      expect(page.jestTestId).toEqual(1);
      expect(mockErr).toHaveBeenCalledTimes(0);
    });
    it('will test name with numbers if several times called', async () => {
      page.jestTestId = 0;
      page.toMatchSnapshot();
      page.toMatchSnapshot();
      expect(page.testConfig.isJest).toEqual(true);
      expect(page.testStats).not.toBeNull();
      expect(page.testConfig.testName)
        .toEqual('Page toMatchSnapshot will test name with numbers if several times called 1');
      expect(page.jestTestId).toEqual(2);
      expect(mockErr).toHaveBeenCalledTimes(0);
    });
  });
  describe('_evaluateResult', () => {
    it('it calls toNotError if error happens in any steps when in jest mode', async () => {
      page.error = new Error('Error happened');
      const result = await page._evaluateResult();
      expect(jestMatchers.toNotError).toHaveBeenCalled();
      expect(result).toEqual(false);
    });
    it('it wont calls toMatchImageSnapshot when in jest mode and compareImage throws', async () => {
      const result = await page._evaluateResult();
      expect(compareImage).toHaveBeenCalled();
      expect(jestMatchers.toMatchImageSnapshot).not.toHaveBeenCalled();
      expect(result).toEqual(false);
    });
    it('it calls toMatchImageSnapshot when in jest mode', async () => {
      compareImage.mockReturnValueOnce({ matched: true });
      const result = await page._evaluateResult();
      expect(compareImage).toHaveBeenCalled();
      expect(jestMatchers.toMatchImageSnapshot).toHaveBeenCalled();
      expect(result).toEqual(true);
    });
  });
  describe('FreezeImage', () => {
    beforeEach(() => {
      tabMocks.evaluate.mockClear();
    });
    it('Wont run if error happened', async () => {
      page.error = true;
      await page.freezeImage();
      expect(mockLog).toHaveBeenCalledTimes(0);
    });
    it('Existing selector', async () => {
      tabMocks.evaluate.mockReturnValueOnce(true);
      functionToString.mockReturnValueOnce('return string function');
      await page.freezeImage('selector');
      expect(mockLog).toHaveBeenCalledWith('Freezing image selector in browser');
      expect(mockErr).toHaveBeenCalledTimes(0);
      expect(tabMocks.evaluate).toHaveBeenCalledWith('return string function');
      expect(functionToString).toHaveBeenCalledWith(freezeImage, 'selector');
    });
    it('FreezeImage: non-existing selector', async () => {
      tabMocks.evaluate.mockReturnValueOnce(false);
      functionToString.mockReturnValueOnce('return string function');
      await page.freezeImage('selector');
      expect(mockLog).toHaveBeenCalledWith('Freezing image selector in browser');
      expect(mockErr).toHaveBeenCalledWith('Unable to freeze image with selector selector');
      expect(tabMocks.evaluate).toHaveBeenCalledWith('return string function');
      expect(functionToString).toHaveBeenCalledWith(freezeImage, 'selector');
    });
  });
});
