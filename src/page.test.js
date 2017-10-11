import fs from 'fs';
import puppeteer from 'puppeteer';
import Page from './page';
import { globalConfig, testConfig } from './config/defaultConfigs';
import functionToString from './helpers/functionToString';
import freezeImage from './freezeImage';
import { sanitiseGlobalConfiguration } from './sanitiser';

const tabMocks = {
  goto: jest.fn(),
  screenshot: jest.fn(),
  waitFor: jest.fn(),
  evaluate: jest.fn(),
  setViewport: jest.fn(),
};

const mockNewPage = jest.fn(() => (tabMocks));

jest.mock('puppeteer', () => ({
  launch: jest.fn(() => ({
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
}));

jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
}));

const browser = puppeteer.launch();
const page = new Page(browser, testConfig, sanitiseGlobalConfiguration(globalConfig));

describe('Page', () => {
  afterEach(() => {
    puppeteer.launch.mockClear();
    mockLog.mockClear();
    functionToString.mockClear();
    page.error = false;
  });
  beforeEach(() => {
    page.tab = page.browser.newPage();
  });
  it('_init fn', async () => {
    page.browser = null;
    await page._init();
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
    expect(page.config.newWindow).toEqual(true);
  });
  describe('save image', () => {
    it('saves with default type', async () => {
      page._saveImage('image');
      expect(mockLog)
        .toHaveBeenCalledWith(
          'screenshot saved in -> root/test.png',
        );
      expect(fs.writeFileSync)
        .toHaveBeenCalledWith('root/test.png',
        'image');
    });
    it('saves with with different type', async () => {
      page._saveImage('image', { type: 'jpeg' });
      expect(mockLog)
        .toHaveBeenCalledWith(
          'screenshot saved in -> root/test.jpeg',
        );
      expect(fs.writeFileSync)
        .toHaveBeenCalledWith('root/test.jpeg',
        'image');
    });
  });
  describe('goto', () => {
    beforeEach(() => {
      tabMocks.goto.mockClear();
    });
    it('Wont run if error happened', async () => {
      page.error = true;
      await page.goto('url');
      expect(mockLog).toHaveBeenCalledTimes(0);
    });
    it('Will run correctly', async () => {
      await page.goto('url');
      expect(tabMocks.goto).toHaveBeenCalledWith('url');
      expect(mockLog).toHaveBeenCalledWith('goto -> url');
    });
  });
  describe('capture', () => {
    beforeEach(() => {
      tabMocks.screenshot.mockClear();
    });
    it('Wont run if error happened', async () => {
      page.error = true;
      await page.capture();
      expect(mockLog).toHaveBeenCalledTimes(0);
    });
    it('Will run correctly', async () => {
      await page.capture({});
      expect(tabMocks.screenshot).toHaveBeenCalledWith({});
      expect(mockLog).toHaveBeenCalledWith('capturing screenshot');
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
    it('Will run correctly', async () => {
      await page.wait(10);
      expect(tabMocks.waitFor).toHaveBeenCalledWith(10);
      expect(mockLog).toHaveBeenCalledWith('waiting...');
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
      expect(mockLog).toHaveBeenCalledWith('waiting for expression to be executed in browser');
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
      expect(mockLog).toHaveBeenCalledWith('Resizing window');
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
