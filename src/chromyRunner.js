import fs from 'fs';
import logger from './logger';
import compareImage from './compareImage';
import actions from './actions';
import { configTypes } from './defaultConfig';

const saveImage = (filename, image, testType, screenshotsPath, testReportPath) => {
  if (testType === configTypes.test) {
    logger.log(`screenshot saved in -> ${testReportPath}/${filename}.png`);
    return fs.writeFileSync(`${testReportPath}/${filename}.png`, image);
  }
  logger.log(`screenshot saved in -> ${screenshotsPath}/${filename}.png`);
  return fs.writeFileSync(`${screenshotsPath}/${filename}.png`, image);
};

class ChromyRunner {
  constructor(options) {
    this.options = options;
  }

  async run(chromy, test) {
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
            return false;
          }
          break;
        case actions.capture:
          switch (action.value) {
            case 'document':
              try {
                logger.log('Capturing screenshot of whole DOM');
                const png = await chromy.screenshotDocument();
                await saveImage(test.name, png, test.type, this.options.screenshots, this.options.testReportPath);
              } catch (error) {
                logger.error(error);
                return false;
              }
              break;
            case undefined:
              try {
                logger.log('Capturing screenshot of chrome window');
                const png = await chromy.screenshot();
                await saveImage(test.name, png, test.type, this.options.screenshots, this.options.testReportPath);
              } catch (error) {
                logger.error(error);
                return false;
              }
              break;
            default:
              try {
                logger.log(`Capturing screenshot of ${action.value} selector`);
                const png = await chromy.screenshotSelector(action.value);
                await saveImage(test.name, png, test.type, this.options.screenshots, this.options.testReportPath);
              } catch (error) {
                logger.error(error);
                return false;
              }
              break;
          }
          break;
        case actions.test:
          try {
            logger.log(`comparing -> ${this.options.testReportPath}/${test.name}.png
             and ${this.options.screenshots}/${test.name}.png`);
            const result = await compareImage(this.options, test.name);
            logger.log(result);
          } catch (error) {
            logger.error(error);
            return false;
          }
          break;
        default:
          break;
      }
    }
    return true;
  }
}

exports.ChromyRunner = ChromyRunner;
