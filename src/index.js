import puppeteer from 'puppeteer';
import fs from 'fs';
import chainProxy from './helpers/proxyChain';
import { sanitiseGlobalConfiguration, sanitiseTestConfiguration } from './sanitiser';
import Page from './page';
import logger from './utils/logger';

const createDirs = (paths) => {
  paths.forEach((path) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  });
};

export default class Differencify {
  constructor(conf) {
    this.configuration = sanitiseGlobalConfiguration(conf);
    this.browser = null;
    this.testId = 0;
    if (this.configuration.debug === true) {
      logger.enable();
    }
    if (this.configuration.isUpdate) {
      logger.warn('Your tests are running on update mode. Your screenshots will be updated');
    }
    createDirs([this.configuration.screenshots, this.configuration.testReports]);
  }

  async launchBrowser() {
    if (!this.browser) {
      logger.log('Launching browser...');
      try {
        this.browser = await puppeteer.launch(this.configuration.puppeteer);
      } catch (error) {
        logger.error(error);
      }
    } else {
      logger.log('Using existing browser instance');
    }
  }

  init(testConfig) {
    this.testId += 1;
    const config = sanitiseTestConfiguration(testConfig, this.testId);
    logger.prefix(config.testName).log('Opening new tab...');
    const page = new Page(this.browser, config, this.configuration);
    if (config.chain) {
      return chainProxy(page, this.configuration.isUpdate);
    }
    return page;
  }

  async cleanup() {
    logger.log('Closing browser...');
    try {
      await this.browser.close();
    } catch (error) {
      logger.error(error);
    }
  }
}

module.exports = Differencify;
