import puppeteer from 'puppeteer';
import chainProxy from './helpers/proxyChain';
import Differencify from './index';
import logger from './utils/logger';
import Page from './page';

jest.mock('./page');
jest.mock('./helpers/proxyChain');

jest.mock('puppeteer', () => ({
  launch: jest.fn(),
}));

const mockLog = jest.fn();
jest.mock('./utils/logger', () => ({
  prefix: jest.fn(() => ({
    log: mockLog,
  })),
  log: jest.fn(),
  error: jest.fn(),
  enable: jest.fn(),
  warn: jest.fn(),
}));

const differencify = new Differencify();

describe('Differencify', () => {
  afterEach(() => {
    mockLog.mockClear();
    logger.log.mockClear();
    differencify.browser = null;
    differencify.testId = 0;
    puppeteer.launch.mockClear();
    chainProxy.mockClear();
  });
  it('launchBrowser', async () => {
    await differencify.launchBrowser();
    expect(puppeteer.launch).toHaveBeenCalledWith({
      args: [],
      dumpio: false,
      executablePath: undefined,
      headless: true,
      ignoreHTTPSErrors: false,
      slowMo: 0,
      timeout: 30000,
    });
    expect(logger.log).toHaveBeenCalledWith('Launching browser...');
  });
  it('does not relaunch browser if one browser instance exists', async () => {
    differencify.browser = true;
    await differencify.launchBrowser();
    expect(puppeteer.launch).toHaveBeenCalledTimes(0);
    expect(logger.log).toHaveBeenCalledWith('Using existing browser instance');
  });
  it('init', async () => {
    await differencify.init();
    expect(chainProxy).toHaveBeenCalledTimes(1);
  });
  it('init without chaining', async () => {
    process.env.update = true;
    await differencify.init({ chain: false });
    expect(Page).toHaveBeenCalledWith(null,
      {
        chain: false,
        newWindow: false,
        testName: 'test1',
        isUpdate: 'true',
      },
      {
        debug: false,
        mismatchThreshold: 0.001,
        puppeteer: {
          args: [],
          dumpio: false,
          executablePath: undefined,
          headless: true,
          ignoreHTTPSErrors: false,
          slowMo: 0,
          timeout: 30000,
        },
        saveDifferencifiedImage: true,
        imageSnapshotPath: 'differencify_reports',
      });
    expect(chainProxy).toHaveBeenCalledTimes(0);
    expect(logger.warn).toHaveBeenCalledWith('Your tests are running on update mode. Test screenshots will be updated');
    delete process.env.update;
  });
  describe('Cleanup fn', () => {
    it('closes browser instance', async () => {
      const close = jest.fn();
      differencify.browser = {
        close,
      };
      await differencify.cleanup();
      expect(close).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('Closing browser...');
    });
    it('will not close if there is no browser instance', async () => {
      differencify.init();
      await differencify.cleanup();
      expect(differencify.browser).toBeNull();
      expect(logger.log).toHaveBeenCalledWith('Closing browser...');
    });
  });
});
