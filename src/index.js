import 'babel-polyfill';
import fs from 'fs';
import Chromy from 'chromy';
import { sanitiseGlobalConfiguration, sanitiseTestConfiguration } from './sanitiser';
import { ChromyRunner } from './chromyRunner';
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
    this.ChromyRunner = new ChromyRunner(this.configuration);
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
      visible: this.configuration.visible || false,
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
      chromy.close();
      delete this.chromeInstances[id];
    } catch (error) {
      logger.error(error);
    }
  }
  async update(config) {
    const testConfig = sanitiseTestConfiguration(config);
    const chromy = this._createChromeInstance(testConfig);
    const testId = this.chromeInstancesId;
    this._updateChromeInstances(testId, chromy);
    testConfig.type = configTypes.update;
    const result = await this.ChromyRunner.run(chromy, testConfig);
    await this._closeChrome(testId, chromy);
    return result;
  }
  async test(config) {
    const testConfig = sanitiseTestConfiguration(config);
    const chromy = this._createChromeInstance(testConfig);
    const testId = this.chromeInstancesId;
    this._updateChromeInstances(testId, chromy);
    testConfig.type = configTypes.test;
    testConfig.steps.push({ name: actions.test, value: this.configuration.testReportPath });
    const result = await this.ChromyRunner.run(chromy, testConfig);
    await this._closeChrome(testId, chromy);
    return result;
  }
  async cleanup() {
    Object.keys(this.chromeInstances)
      .forEach((key) => {
        this.chromeInstances[key].close();
      });
    logger.log('All browsers been closed');
  }
}

module.exports = Differencify;
