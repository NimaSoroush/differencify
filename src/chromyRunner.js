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

  _stepRunner(chromy, test) {
    test.steps.forEach(async (action) => {
      switch (action.name) {
        case actions.goto:
          await chromy.goto(action.value);
          logger.log(`goto -> ${action.value}`);
          break;
        case actions.capture:
          if (action.value === 'document') {
            const png = await chromy.screenshotDocument();
            fs.writeFileSync(`${test.name}.png`, png);
          } else {
            const png = await chromy.screenshotSelector(action.value);
            fs.writeFileSync(`${test.name}.png`, png);
          }
          logger.log(`screenshot saved in -> ${this.options.screenshots}/${test.name}`);
          break;
        default:
          break;
      }
    });
  }

  run(test) {
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
    return this._stepRunner(chromy, test);
  }
}

exports.ChromyRunner = ChromyRunner;
