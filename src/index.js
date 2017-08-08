import 'babel-polyfill';
import fs from 'fs';
import Chromy from 'chromy';
import getPort from 'get-port';
import { sanitiseGlobalConfiguration, sanitiseTestConfiguration } from './sanitiser';
import run from './chromyRunner';
import logger from './logger';
import { configTypes } from './defaultConfig';
import actions from './actions';
import Reporter from './Reporter';

const CHROME_WIDTH = 800;
const CHROME_HEIGHT = 600;

const createDir = (path) => {
  const screentshotsPath = `${path}`;
  if (!fs.existsSync(screentshotsPath)) {
    fs.mkdirSync(screentshotsPath);
  }
};

const getFreePort = async () => {
  try {
    return await getPort();
  } catch (error) {
    logger.error('Failed to get a free port', error);
    return null;
  }
};

export default class Differencify {
  constructor(conf, reporter = new Reporter()) {
    this.configuration = sanitiseGlobalConfiguration(conf);
    this.chromeInstances = {};
    this.reporter = reporter;
    if (this.configuration.debug === true) {
      logger.enable();
    }
    createDir(this.configuration.screenshots);
    createDir(this.configuration.testReportPath);
  }

  async _createChromeInstance(testConfig) {
    const width = testConfig.resolution.width || CHROME_WIDTH;
    const height = testConfig.resolution.height || CHROME_HEIGHT;
    const flags = [`--window-size=${width},${height}`];
    const port = await getFreePort();
    if (!port) {
      return null;
    }
    const chromy = new Chromy({
      port,
      chromeFlags: flags,
      waitTimeout: this.configuration.timeout,
      visible: this.configuration.visible,
    });
    return chromy;
  }

  _updateChromeInstances(chromy) {
    this.chromeInstances[chromy.options.port] = chromy;
  }

  async _closeChrome(chromy, testName) {
    try {
      logger.prefix(testName).log('closing browser');
      await chromy.close();
      delete this.chromeInstances[chromy.options.port];
    } catch (error) {
      logger.prefix(testName).log(error);
    }
  }

  async _run(config, type) {
    const testConfig = sanitiseTestConfiguration(config);
    const chromy = await this._createChromeInstance(testConfig);
    if (!chromy) {
      return false;
    }
    this._updateChromeInstances(chromy);
    testConfig.type = type;
    const result = await run(chromy, this.configuration, testConfig, this.reporter);
    await this._closeChrome(chromy, testConfig.name);
    return result;
  }

  async update(config) {
    return await this._run(config, configTypes.update);
  }

  async test(config) {
    config.steps.push({ name: actions.test, value: this.configuration.testReportPath });
    return await this._run(config, configTypes.test);
  }

  async generateReport(config) {
    return await this.reporter.generate(config, this.configuration.testReportPath);
  }

  async cleanup() {
    await Promise.all(
      Object.values(this.chromeInstances).map(chromeInstance => chromeInstance.close()),
    );
    this.chromeInstances = {};
    logger.log('All browsers been closed');
  }
}

module.exports = Differencify;
