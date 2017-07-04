import 'babel-polyfill';
import fs from 'fs';
import { sanitiseGlobalConfiguration, sanitiseTestConfiguration } from './sanitiser';
import { ChromyRunner } from './chromyRunner';
import logger from './logger';
import { configTypes, testReportStep } from './defaultConfig';

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
    if (this.configuration.debug === true) {
      logger.enable();
    }
    createDir(this.configuration.screenshots);
    createDir(testReportStep.value);
  }
  async update(config) {
    const testConfig = sanitiseTestConfiguration(config);
    testConfig.type = configTypes.update;
    const result = await this.ChromyRunner.run(testConfig);
    return result;
  }
  async test(config) {
    const testConfig = sanitiseTestConfiguration(config);
    testConfig.type = configTypes.test;
    testConfig.steps.push(testReportStep);
    const result = await this.ChromyRunner.run(testConfig);
    return result;
  }
}

module.exports = Differencify;
