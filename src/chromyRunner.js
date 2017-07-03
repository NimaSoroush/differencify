import fs from 'fs';
import Chromy from 'chromy';
import logger from './logger';
import actions from './actions';

const CHROME_PORT = 9222;
const CHROME_WIDTH = 800;
const CHROME_HEIGHT = 600;

class ChromyRunner {
  constructor(options) {
    this.options = options;
    this.currentTestId = 0;
  }

  async _stepRunner(chromy, test) {
    /* eslint-disable no-restricted-syntax */
    for (const action of test.steps) {
    /* eslint-enable no-restricted-syntax */
      switch (action.name) {
        case actions.goto:
          try {
            await chromy.goto(action.value);
            logger.log(`goto -> ${action.value}`);
          } catch (error) {
            logger.error(error);
          }
          break;
        case actions.capture:
          if (action.value === 'document') {
            try {
              const png = await chromy.screenshotDocument();
              fs.writeFileSync(`${this.options.screenshots}/${test.name}.png`, png);
            } catch (error) {
              logger.error(error);
            }
          } else {
            try {
              const png = await chromy.screenshotSelector(action.value);
              fs.writeFileSync(`${this.options.screenshots}/${test.name}.png`, png);
            } catch (error) {
              logger.error(error);
            }
          }
          logger.log(`screenshot saved in -> ${this.options.screenshots}/${test.name}`);
          break;
        case actions.test:
          try {
            await chromy.goto(action.value);
            logger.log(`goto -> ${action.value}`);
          } catch (error) {
            logger.error(error);
          }
          break;
        default:
          break;
      }
    }
  }

  async run(test) {
    const width = test.resolution.width || CHROME_WIDTH;
    const height = test.resolution.height || CHROME_HEIGHT;
    const flags = [`--window-size=${width},${height}`];
    const chromy = new Chromy({
      chromeFlags: flags,
      port: CHROME_PORT + this.currentTestId,
      waitTimeout: this.options.timeout,
      visible: this.options.visible || false,
    });
    this.currentTestId += 1;
    await this._stepRunner(chromy, test);
    // try {
    //   return chromy.close();
    // } catch (error) {
    //   throw new Error('close failed');
    // }
  }
}

exports.ChromyRunner = ChromyRunner;
