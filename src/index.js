import 'babel-polyfill';
import fs from 'fs';
import Chromy from 'chromy';
import { sanitiseGlobalConfiguration, sanitiseTestConfiguration } from './sanitiser';
import run from './chromyRunner';
import logger from './logger';
import { configTypes } from './defaultConfig';
import actions from './actions';

const CHROME_PORT = 9222;
const CHROME_WIDTH = 800;
const CHROME_HEIGHT = 600;

const createDir = (path) => {
  const screentshotsPath = `${path}`;
  if (!fs.existsSync(screentshotsPath)) {
    fs.mkdirSync(screentshotsPath);
  }
};

export default class Differencify {
  constructor(conf) {
    this.configuration = sanitiseGlobalConfiguration(conf);
    this.chromeInstances = {};
    this.chromeInstancesId = CHROME_PORT;
    if (this.configuration.debug === true) {
      logger.enable();
    }
    createDir(this.configuration.screenshots);
    createDir(this.configuration.testReportPath);
  }

  _createChromeInstance(testConfig) {
    const width = testConfig.resolution.width || CHROME_WIDTH;
    const height = testConfig.resolution.height || CHROME_HEIGHT;
    const flags = [`--window-size=${width},${height}`];
    const chromy = new Chromy({
      chromeFlags: flags,
      port: this.chromeInstancesId,
      waitTimeout: this.configuration.timeout,
      visible: this.configuration.visible,
    });
    return chromy;
  }

  _updateChromeInstances(id, chromy) {
    this.chromeInstances[id] = chromy;
    this.chromeInstancesId += 1;
  }

  async _closeChrome(id, chromy) {
    try {
      logger.log('closing browser');
      await chromy.close();
      delete this.chromeInstances[id];
    } catch (error) {
      logger.error(error);
    }
  }

  async _run(config, type, step) {
    const testConfig = sanitiseTestConfiguration(config);
    const chromy = this._createChromeInstance(testConfig);
    const testId = this.chromeInstancesId;
    this._updateChromeInstances(testId, chromy);
    testConfig.type = type;
    if (step) {
      testConfig.steps.push(step);
    }
    const result = await run(chromy, this.configuration, testConfig);
    await this._closeChrome(testId, chromy);
    return result;
  }

  async update(config) {
    return await this._run(config, configTypes.update, null);
  }

  async test(config) {
    const testStep = { name: actions.test, value: this.configuration.testReportPath };
    return await this._run(config, configTypes.test, testStep);
  }

  async cleanup() {
    await Promise.all(
      Object.values(this.chromeInstances).map(chromeInstance => chromeInstance.close()),
    );
    logger.log('All browsers been closed');
  }
}

module.exports = Differencify;
