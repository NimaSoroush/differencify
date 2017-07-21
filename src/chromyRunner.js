import fs from 'fs';
import logger from './logger';
import compareImage from './compareImage';
import actions from './actions';
import { configTypes } from './defaultConfig';

const saveImage = (filename, image, testType, screenshotsPath, testReportPath) => {
  const filePath = testType === configTypes.test ? testReportPath : screenshotsPath;
  logger.log(`screenshot saved in -> ${filePath}/${filename}.png`);
  return fs.writeFileSync(`${filePath}/${filename}.png`, image);
};

const run = async (chromy, options, test) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const action of test.steps) {
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
              await saveImage(test.name, png, test.type, options.screenshots, options.testReportPath);
            } catch (error) {
              logger.error(error);
              return false;
            }
            break;
          case undefined:
            try {
              logger.log('Capturing screenshot of chrome window');
              const png = await chromy.screenshot();
              await saveImage(test.name, png, test.type, options.screenshots, options.testReportPath);
            } catch (error) {
              logger.error(error);
              return false;
            }
            break;
          default:
            try {
              logger.log(`Capturing screenshot of ${action.value} selector`);
              const png = await chromy.screenshotSelector(action.value);
              await saveImage(test.name, png, test.type, options.screenshots, options.testReportPath);
            } catch (error) {
              logger.error(error);
              return false;
            }
            break;
        }
        break;
      case actions.test:
        try {
          logger.log(`comparing -> ${options.testReportPath}/${test.name}.png
            and ${options.screenshots}/${test.name}.png`);
          const result = await compareImage(options, test.name);
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
};

export default run;
