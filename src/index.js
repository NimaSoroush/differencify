import puppeteer from 'puppeteer';
import chainProxy from './helpers/proxyChain';
import { sanitiseGlobalConfiguration, sanitiseTestConfiguration } from './sanitiser';
import Page from './page';
import logger from './utils/logger';

export default class Differencify {
  constructor(conf) {
    if (conf && conf.debug === true) {
      logger.enable();
    }
    this.configuration = sanitiseGlobalConfiguration(conf);
    this.browser = null;
    this.testId = 0;
  }

  async launchBrowser(options) {
    if (!this.browser) {
      logger.log('Launching browser...');
      try {
        this.browser = await puppeteer.launch(options);
      } catch (error) {
        logger.error(error);
      }
    } else {
      logger.log('Using existing browser instance');
    }
  }

  static executablePath() {
    return puppeteer.executablePath();
  }

  static chromeExecutablePath() {
    return puppeteer.executablePath();
  }

  async launch(options) {
    if (!this.browser) {
      logger.log('Launching browser...');
      try {
        this.browser = await puppeteer.launch(options);
      } catch (error) {
        logger.error(error);
      }
    } else {
      logger.log('Using existing browser instance');
    }
  }

  async connect(options) {
    if (!this.browser) {
      logger.log('Launching browser...');
      try {
        this.browser = await puppeteer.connect(options);
      } catch (error) {
        logger.error(error);
      }
    } else {
      logger.log('Using existing browser instance');
    }
  }

  init(config) {
    this.testId += 1;
    const testConfig = sanitiseTestConfiguration(config, this.testId);
    if (testConfig.isUpdate) {
      logger.warn('Your tests are running on update mode. Test screenshots will be updated');
    }
    return chainProxy(new Page(this.browser, testConfig, this.configuration), testConfig.chain);
  }

  async cleanup() {
    logger.log('Closing browser...');
    try {
      if (this.browser) {
        await this.browser.close();
      }
    } catch (error) {
      logger.error(error);
    }
  }
}
