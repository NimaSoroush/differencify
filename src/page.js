import puppeteer from 'puppeteer';
import logger from './utils/logger';
import jestMatchers from './utils/jestMatchers';
import compareImage from './compareImage';
import functionToString from './helpers/functionToString';
import freezeImage from './freezeImage';
import { sanitiseTestConfiguration } from './sanitiser';

export default class Page {
  constructor(browser, globalConfig, testId) {
    this.globalConfig = globalConfig;
    this.testConfig = null;
    this.testId = testId;
    this.browser = browser;
    this.page = null;
    this.prefixedLogger = logger.prefix(this.testConfig.testName);
    this.error = null;
    this.image = null;
    this.jestTestId = 0;
  }

  _logError(error) {
    this.error = error;
    this.prefixedLogger.error(error);
  }

  _logStep(functionName) {
    this.prefixedLogger.log(`Executing ${functionName} step`);
  }

  async launch(options) {
    try {
      this.prefixedLogger.log('Launching browser...');
      this.browser = await puppeteer.launch(options);
    } catch (error) {
      this._logError(error);
      throw new Error('Failed to launch the browser');
    }
    return this;
  }

  async connect(options) {
    try {
      this.prefixedLogger.log('Launching browser...');
      this.browser = await puppeteer.connect(options);
    } catch (error) {
      this._logError(error);
      throw new Error('Failed to launch the browser');
    }
    return this;
  }

  async newPage(options) {
    try {
      this.testConfig = sanitiseTestConfiguration(options, this.testId);
      if (this.testConfig.isUpdate) {
        logger.warn('Your tests are running on update mode. Test screenshots will be updated');
      }
      this._logStep('newPage');
      this.page = await this.browser.newPage();
    } catch (error) {
      this._logError(error);
    }
  }

  async handleContinueFunc(target, property, args) {
    if (!this.error) {
      try {
        this._logStep(property);
        const isFunc = typeof (property) === 'function';
        return isFunc ? await target[property](...args) : await target[property];
      } catch (error) {
        this._logError(error);
      }
    }
    return this;
  }

  async handleFunc(currentTarget, property, args) {
    if (!this.error) {
      try {
        this._logStep(`${currentTarget}.${property}`);
        const isFunc = typeof (property) === 'function';
        if (currentTarget === 'page') {
          return isFunc ? await this.page[property](...args) : await this.page[property];
        }
        return isFunc ? await this.page[currentTarget][property](...args) : await this.page[currentTarget][property];
      } catch (error) {
        this._logError(error);
      }
    }
    return this;
  }

  async screenshot(options) {
    if (!this.error) {
      try {
        this.image = await this.page.screenshot(options);
        this.testConfig.imageType = (options && options.type) || 'png';
        this._logStep('screenshot');
      } catch (error) {
        this._logError(error);
      }
    }
  }

  async capture(options) {
    if (!this.error) {
      try {
        logger.warn(
          `capture() will be deprecated, use screenshot() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify'`);
        this.image = await this.page.screenshot(options);
        this.testConfig.imageType = (options && options.type) || 'png';
        this._logStep('capture');
      } catch (error) {
        this._logError(error);
      }
    }
  }

  async wait(value) {
    if (!this.error) {
      try {
        logger.warn(
          `wait() will be deprecated, use waitFor() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify'`);
        await this.page.waitFor(value);
        this._logStep('wait');
      } catch (error) {
        this._logError(error);
      }
    }
  }

  async execute(expression) {
    if (!this.error) {
      try {
        logger.warn(
          `execute() will be deprecated, use evaluate() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify'`);
        await this.page.evaluate(expression);
        this._logStep('execute');
      } catch (error) {
        this._logError(error);
      }
    }
  }

  async resize(viewport) {
    if (!this.error) {
      try {
        logger.warn(
          `resize() will be deprecated, use setViewport() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify'`);
        await this.page.setViewport(viewport);
        this._logStep('resize');
      } catch (error) {
        this._logError(error);
      }
    }
  }

  async freezeImage(selector) {
    if (!this.error) {
      try {
        const strFunc = functionToString(freezeImage, selector);
        const result = await this.page.evaluate(strFunc);
        this.prefixedLogger.log(`Freezing image ${selector} in browser`);
        if (!result) {
          this._logError(`Unable to freeze image with selector ${selector}`);
        }
      } catch (error) {
        this._logError(error);
      }
    }
  }

  async toMatchSnapshot() {
    this.testConfig.isJest = true;
    if (!this.jestTestId) {
      this.testStats = (expect.getState && expect.getState()) || null;
      this.prefixedLogger = logger.prefix(this.testStats.currentTestName);
      this.testConfig.testPath = this.testStats.testPath;
      this.testConfig.isUpdate = this.testStats.snapshotState._updateSnapshot === 'all' || false;
    }
    if (this.testStats) {
      this.testConfig.testName = this.jestTestId
        ? this.testStats.currentTestName
        : this.testStats.currentTestName + this.jestTestId;
      this.jestTestId += 1;
      await this._evaluateResult();
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
        await this.page.close();
        if (this.testConfig.newWindow) {
          await this.browser.close();
        }
        this._logStep('resize');
      } catch (error) {
        this._logError(error);
        return false;
      }
    }
    return true;
  }
}

module.exports = Page;
