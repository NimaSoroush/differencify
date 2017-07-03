import 'babel-polyfill';
import fs from 'fs';
import { sanitiseGlobalConfiguration, sanitiseTestConfiguration } from './sanitiser';
import { ChromyRunner } from './chromyRunner';
import logger from './logger';
import { testReportSteps } from './defaultConfig';

const createScreenshotFolder = (path) => {
  const screentshotsPath = `${process.env.PWD}/${path}`;
  if (!fs.existsSync(screentshotsPath)) {
    fs.mkdirSync(screentshotsPath);
  }
};

export default class Differencify {
  constructor(conf) {
    this.configuration = sanitiseGlobalConfiguration(conf);
    this.ChromyRunner = new ChromyRunner(this.configuration);
    if (this.configuration.debug === true) {
      logger.enable();
    }
    createScreenshotFolder(this.configuration.screenshots);
  }
  async update(config) {
    const testConfig = sanitiseTestConfiguration(config);
    await this.ChromyRunner.run(testConfig);
  }
  async test(config) {
    const testConfig = sanitiseTestConfiguration(config);
    testConfig.steps.push(testReportSteps);
    await this.ChromyRunner.run(testConfig);
  }
}

module.exports = Differencify;
