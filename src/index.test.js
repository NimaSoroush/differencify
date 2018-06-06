import puppeteer from 'puppeteer';
import chainProxy from './helpers/proxyChain';
import Differencify from './index';
import logger from './utils/logger';
import Target from './target';

jest.mock('./target');
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
    const browserOptions = {
      args: [],
      dumpio: false,
      executablePath: undefined,
      headless: true,
      ignoreHTTPSErrors: false,
      slowMo: 0,
      timeout: 30000,
    };
    await differencify.launchBrowser(browserOptions);
    expect(puppeteer.launch).toHaveBeenCalledWith(browserOptions);
    await differencify.launch(browserOptions);
    expect(puppeteer.launch).toHaveBeenCalledWith(browserOptions);
    expect(logger.log).toHaveBeenCalledWith('Launching browser...');
  });
  it('connect', async () => {
    const browserOptions = {
      browserWSEndpoint: 'endpoint',
      ignoreHTTPSErrors: false,
    };
    await differencify.launchBrowser(browserOptions);
    expect(puppeteer.launch).toHaveBeenCalledWith(browserOptions);
    await differencify.launch(browserOptions);
    expect(puppeteer.launch).toHaveBeenCalledWith(browserOptions);
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
    expect(Target).toHaveBeenCalledWith(null,
      {
        debug: false,
        mismatchThreshold: 0.001,
        saveDifferencifiedImage: true,
        imageSnapshotPath: 'differencify_reports',
        imageSnapshotPathProvided: false,
      },
      {
        chain: false,
        testName: 'test',
        testNameProvided: false,
        isUpdate: 'true',
        testId: 1,
      });
    expect(chainProxy).toHaveBeenCalledTimes(1);
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
