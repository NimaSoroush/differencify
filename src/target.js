import puppeteer from 'puppeteer';
import logger from './utils/logger';
import jestMatchers from './utils/jestMatchers';
import compareImage from './compareImage';
import functionToString from './helpers/functionToString';
import freezeImage from './freezeImage';
import { isFunc, handleAsyncFunc } from './helpers/functions';

export default class Target {
  constructor(browser, globalConfig, testConfig) {
    this.globalConfig = globalConfig;
    this.testConfig = testConfig;
    this.browser = browser;
    this.chainedTarget = null;
    this.page = null;
    this.prefixedLogger = logger.prefix(this.testConfig.testName);
    this.testConfig.imageType = globalConfig.imageType;
    this.error = null;
    this.image = null;
    this.testId = 0;
    this.result = null;
  }

  _logError(error) {
    this.error = error;
    this.prefixedLogger.trace(error);
  }

  _logStep(functionName) {
    this.prefixedLogger.log(`Executing ${functionName} step`);
  }

  async launch(options) {
    try {
      this.prefixedLogger.log('Launching browser...');
      this.browser = await puppeteer.launch(options);
      this.testConfig.newWindow = true;
    } catch (error) {
      this._logError(error);
      throw new Error('Failed to launch the browser');
    }
    return this.browser;
  }

  async connect(options) {
    try {
      this.prefixedLogger.log('Launching browser...');
      this.browser = await puppeteer.connect(options);
      this.testConfig.newWindow = true;
    } catch (error) {
      this._logError(error);
      throw new Error('Failed to launch the browser');
    }
    return this.browser;
  }

  async newPage() {
    try {
      this.page = await this.browser.newPage();
    } catch (error) {
      this._logError(error);
    }
    return this.page;
  }

  async _handleContinueFunc(target, property, args) {
    if (!this.error) {
      try {
        this._logStep(property);
        return isFunc(target[property]) ? await target[property](...args) : await target[property];
      } catch (error) {
        this._logError(error);
      }
    }
    return null;
  }

  _handleFunc(target, property, args) {
    if (!this.error) {
      try {
        this._logStep(`${target}.${property}`);
        if (target === 'page') {
          if (this[property]) {
            return isFunc(this[property]) ? handleAsyncFunc(this, property, args) : this[property];
          }
          return isFunc(this.page[property]) ? handleAsyncFunc(this.page, property, args) : this.page[property];
        }
        return isFunc(this.page[target][property])
          ? handleAsyncFunc(this.page[target], property, args)
          : this.page[target][property];
      } catch (error) {
        this._logError(error);
      }
    }
    return null;
  }

  async screenshot(options) {
    if (!this.error) {
      try {
        this.image = await this.page.screenshot(options);
        this.testConfig.imageType = (options && options.type) || 'png';
        return this.image;
      } catch (error) {
        this._logError(error);
      }
    }
    return null;
  }

  async capture(options) {
    if (!this.error) {
      try {
        logger.warn(
          `capture() will be deprecated, use screenshot() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`,
        );
        this.image = await this.page.screenshot(options);
        this.testConfig.imageType = (options && options.type) || 'png';
        return this.image;
      } catch (error) {
        this._logError(error);
      }
    }
    return null;
  }

  async wait(value) {
    if (!this.error) {
      try {
        logger.warn(
          `wait() will be deprecated, use waitFor() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`,
        );
        return await this.page.waitFor(value);
      } catch (error) {
        this._logError(error);
      }
    }
    return null;
  }

  async execute(expression) {
    if (!this.error) {
      try {
        logger.warn(
          `execute() will be deprecated, use evaluate() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`,
        );
        return await this.page.evaluate(expression);
      } catch (error) {
        this._logError(error);
      }
    }
    return null;
  }

  async resize(viewport) {
    if (!this.error) {
      try {
        logger.warn(
          `resize() will be deprecated, use setViewport() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`,
        );
        return await this.page.setViewport(viewport);
      } catch (error) {
        this._logError(error);
      }
    }
    return null;
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
        return result;
      } catch (error) {
        this._logError(error);
      }
    }
    return null;
  }

  isJest() {
    try {
      this.testConfig.isJest = (expect && isFunc(expect.getState));
      if (this.testConfig.isJest) {
        this.testStats = expect.getState() || null;
        this.prefixedLogger = logger.prefix(this.testStats.currentTestName);
        this.testConfig.testPath = this.testStats.testPath;
        this.testConfig.isUpdate = this.testStats.snapshotState._updateSnapshot === 'all' || false;
      } else {
        this.testId = this.testConfig.testId;
      }
    } catch (error) {
      this.testConfig.isJest = false;
      this.testId = this.testConfig.testId;
    }
  }

  async toMatchSnapshot(image, callback) {
    let resultCallback;
    if (image && !isFunc(image)) {
      this.image = image;
    } else if (isFunc(image)) {
      resultCallback = image;
    }
    if (callback && isFunc(callback)) {
      resultCallback = callback;
    }
    if (this.testConfig.isJest && !this.testConfig.testNameProvided) {
      this.testConfig.testName = this.testId
        ? `${this.testStats.currentTestName} ${this.testId}`
        : this.testStats.currentTestName;
    } else {
      let previousTestSuffix = `.${(this.testId - 1)}`;
      var re = new RegExp(previousTestSuffix, "g");
      this.testConfig.testName = this.testId ? `${this.testConfig.testName.replace(re, '')}.${this.testId}` : this.testConfig.testName;
    }
    this.testId += 1;
    const result = await this._evaluateResult();
    if (resultCallback) {
      resultCallback({
        testConfig: this.testConfig,
        testResult: this.result,
      });
    }
    return result;
  }

  async _evaluateResult() {
    if (!this.error) {
      try {
        this.result = await compareImage(this.image, this.globalConfig, this.testConfig);
      } catch (error) {
        this._logError(error);
      }
      if (this.error) {
        return false;
      }
      if (this.testConfig.isJest === true) {
        const { toMatchImageSnapshot } = jestMatchers;
        expect.extend({ toMatchImageSnapshot });
        expect(this.result).toMatchImageSnapshot(this.testStats);
      }
      if (this.result.matched || this.result.updated || this.result.added) {
        return true;
      }
    }
    if (this.testConfig.isJest && this.error) {
      const { toNotError } = jestMatchers;
      expect.extend({ toNotError });
      expect(this.error).toNotError(this.testStats);
    }
    return false;
  }

  async close() {
    if (!this.error) {
      try {
        if (this.testConfig.newWindow) {
          await this.browser.close();
        } else {
          await this.page.close();
        }
      } catch (error) {
        this._logError(error);
        return false;
      }
    }
    return true;
  }
}

module.exports = Target;
