import { sanitiseGlobalConfiguration, sanitiseTestConfiguration } from './sanitiser';
import { ChromyRunner } from './chromyRunner';
import logger from './logger';

export default class Differencify {
  constructor(conf) {
    this.configuration = sanitiseGlobalConfiguration(conf);
    this.ChromyRunner = new ChromyRunner(this.configuration);
    if (this.configuration.debug === true) {
      logger.enable();
    }
  }
  async update(config) {
    const testConfig = sanitiseTestConfiguration(config);
    await this.ChromyRunner.run(testConfig);
  }
}

exports.Differencify = Differencify;
