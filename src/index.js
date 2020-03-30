import puppeteer from 'puppeteer';
import chain from './helpers/proxyChain';
import { sanitiseGlobalConfiguration, sanitiseTestConfiguration } from './sanitiser';
import Target from './target';
import logger from './utils/logger';

export default class Differencify {
  constructor(conf) {
    if (conf && conf.debug === true) {
      logger.enable();
    }
    this.configuration = sanitiseGlobalConfiguration(conf);
    this.browser = null;
    conf.removePostFix === true ? this.testId = undefined : this.testId = 0
  }

  async launchBrowser(options) {
    if (!this.browser) {
      logger.log('Launching browser...');
      try {
        this.browser = await puppeteer.launch(options);
      } catch (error) {
        logger.trace(error);
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
    this.launchBrowser(options);
  }

  async connectBrowser(options) {
    if (!this.browser) {
      logger.log('Launching browser...');
      try {
        this.browser = await puppeteer.connect(options);
      } catch (error) {
        logger.trace(error);
      }
    } else {
      logger.log('Using existing browser instance');
    }
  }

  async connect(options) {
    this.connectBrowser(options);
  }

  init(config) {
    this.testId += 1;
    const testConfig = sanitiseTestConfiguration(config, this.testId);
    if (testConfig.isUpdate) {
      logger.warn('Your tests are running on update mode. Test screenshots will be updated');
    }
    const target = new Target(this.browser, this.configuration, testConfig);
    target.isJest();
    const chainedTarget = chain(target, testConfig.chain);
    target.chainedTarget = chainedTarget;
    return chainedTarget;
  }

  async cleanup() {
    logger.log('Closing browser...');
    try {
      if (this.browser) {
        await this.browser.close();
      }
    } catch (error) {
      logger.trace(error);
    }
  }
}

module.exports = Differencify;
