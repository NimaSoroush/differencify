import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import logger from './utils/logger';
import compareImage from './compareImage';
import functionToString from './helpers/functionToString';
import freezeImage from './freezeImage';

export default class Page {
  constructor(browser, config, globalConfig) {
    this.globalConfig = globalConfig;
    this.config = config;
    this.browser = browser;
    this.tab = null;
    this.prefixedLogger = logger.prefix(this.config.testName);
    this.error = false;
  }

  async _logError(error) {
    this.error = true;
    this.prefixedLogger.error(error);
  }

  async _init() {
    if (!this.browser || this.config.newWindow) {
      try {
        this.prefixedLogger.log('Launching browser...');
        this.browser = await puppeteer.launch(this.globalConfig.puppeteer);
        this.config.newWindow = true;
      } catch (error) {
        this._logError(error);
      }
    }
    if (!this.tab) {
      this.tab = await this.browser.newPage();
    }
  }

  _saveImage(image, options) {
    const directory = this.globalConfig.isUpdate ?
      this.globalConfig.screenshots :
      this.globalConfig.testReports;
    const fileExtension = (options && options.type) || 'png';
    const rootPath = path.join(__dirname, '../');
    const filePath = path.resolve(__dirname, rootPath, directory, `${this.config.testName}.${fileExtension}`);
    this.prefixedLogger.log(`screenshot saved in -> ${filePath}`);
    return fs.writeFileSync(filePath, image);
  }

  async goto(url) {
    if (!this.error) {
      try {
        await this._init();
        await this.tab.goto(url);
        this.prefixedLogger.log(`goto -> ${url}`);
      } catch (error) {
        this._logError(error);
      }
    }
  }

  async capture(options) {
    if (!this.error) {
      try {
        const image = await this.tab.screenshot(options);
        this.prefixedLogger.log('capturing screenshot');
        this._saveImage(image);
      } catch (error) {
        this._logError(error);
      }
    }
  }

  async wait(value) {
    if (!this.error) {
      try {
        await this.tab.waitFor(value);
        this.prefixedLogger.log('waiting...');
      } catch (error) {
        this._logError(error);
      }
    }
  }

  async execute(expression) {
    if (!this.error) {
      try {
        await this.tab.evaluate(expression);
        this.prefixedLogger.log('waiting for expression to be executed in browser');
      } catch (error) {
        this._logError(error);
      }
    }
  }

  async resize(viewport) {
    if (!this.error) {
      try {
        await this._init();
        await this.tab.setViewport(viewport);
        this.prefixedLogger.log('Resizing window');
      } catch (error) {
        this._logError(error);
      }
    }
  }

  async freezeImage(selector) {
    if (!this.error) {
      try {
        const strFunc = functionToString(freezeImage, selector);
        const result = await this.tab.evaluate(strFunc);
        this.prefixedLogger.log(`Freezing image ${selector} in browser`);
        if (!result) {
          this._logError(`Unable to freeze image with selector ${selector}`);
        }
      } catch (error) {
        this._logError(error);
      }
    }
  }

  async _compareImage() {
    if (!this.error) {
      try {
        return await compareImage(this.globalConfig, this.config.testName);
      } catch (error) {
        this._logError(error);
      }
    }
    return false;
  }

  async close() {
    if (!this.error) {
      try {
        await this.tab.close();
        if (this.config.newWindow) {
          await this.browser.close();
        }
        this.prefixedLogger.log('closing tab');
      } catch (error) {
        this._logError(error);
        return false;
      }
    }
    return true;
  }
}

module.exports = Page;
