import puppeteer from 'puppeteer';
import logger from './utils/logger';
import jestMatchers from './utils/jestMatchers';
import compareImage from './compareImage';
import functionToString from './helpers/functionToString';
import freezeImage from './freezeImage';

export default class Page {
  constructor(browser, testConfig, globalConfig) {
    this.globalConfig = globalConfig;
    this.testConfig = testConfig;
    this.browser = browser;
    this.tab = null;
    this.prefixedLogger = logger.prefix(this.testConfig.testName);
    this.error = null;
    this.image = null;
  }

  _logError(error) {
    this.error = error;
    this.prefixedLogger.error(error);
  }

  async _init() {
    if (!this.browser || this.testConfig.newWindow) {
      try {
        this.prefixedLogger.log('Launching browser...');
        this.browser = await puppeteer.launch(this.globalConfig.puppeteer);
        this.testConfig.newWindow = true;
      } catch (error) {
        this._logError(error);
      }
    }
    if (!this.tab) {
      this.prefixedLogger.log('Opening new tab...');
      this.tab = await this.browser.newPage();
    }
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
        this.image = await this.tab.screenshot(options);
        this.testConfig.imageType = (options && options.type) || 'png';
        this.prefixedLogger.log('capturing screenshot');
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

  toMatchSnapshot() {
    this.testConfig.isJest = true;
    this.testStats = (expect.getState && expect.getState()) || null;
    if (this.testStats) {
      this.testConfig.testName = this.testStats.currentTestName;
      this.prefixedLogger = logger.prefix(this.testConfig.testName);
      this.testConfig.testPath = this.testStats.testPath;
      this.testConfig.isUpdate = this.testStats.snapshotState._updateSnapshot === 'all' || false;
    } else {
      this._logError('Failed to get Jest test status.');
    }
  }

  async _evaluateResult() {
    if (!this.error) {
      let result;
      try {
        result = await compareImage(this.image, this.globalConfig, this.testConfig);
      } catch (error) {
        this._logError(error);
      }
      if (this.error) {
        return false;
      }
      if (this.testConfig.isJest === true) {
        const toMatchImageSnapshot = jestMatchers.toMatchImageSnapshot;
        expect.extend({ toMatchImageSnapshot });
        expect(result).toMatchImageSnapshot(this.testStats);
      }
      if (result.matched || result.updated || result.added) {
        return true;
      }
    }
    if (this.testConfig.isJest && this.error) {
      const toNotError = jestMatchers.toNotError;
      expect.extend({ toNotError });
      expect(this.error).toNotError(this.testStats);
    }
    return false;
  }

  async close() {
    if (!this.error) {
      try {
        await this.tab.close();
        if (this.testConfig.newWindow) {
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
