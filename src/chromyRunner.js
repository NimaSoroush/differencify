import fs from 'fs';
import logger from './logger';
import compareImage from './compareImage';
import actions from './actions';
import { configTypes } from './defaultConfig';

const saveImage = (testName, image, testType, screenshotsPath, testReportPath) => {
  const directory = testType === configTypes.test ? testReportPath : screenshotsPath;
  const filePath = `${directory}/${testName}.png`;
  logger.prefix(testName).log(`screenshot saved in -> ${filePath}`);
  return fs.writeFileSync(filePath, image);
};

const run = async (chromy, options, test) => {
  const prefixedLogger = logger.prefix(test.name);
  // eslint-disable-next-line no-restricted-syntax
  for (const action of test.steps) {
    switch (action.name) {
      case actions.goto:
        try {
          await chromy.goto(action.value);
          prefixedLogger.log(`goto -> ${action.value}`);
        } catch (error) {
          prefixedLogger.error(error);
          return false;
        }
        break;
      case actions.capture:
        switch (action.value) {
          case 'document':
            try {
              prefixedLogger.log('capturing screenshot of whole DOM');
              const png = await chromy.screenshotDocument();
              saveImage(test.name, png, test.type, options.screenshots, options.testReportPath);
            } catch (error) {
              prefixedLogger.error(error);
              return false;
            }
            break;
          case undefined:
            try {
              prefixedLogger.log('capturing screenshot of chrome window');
              const png = await chromy.screenshot();
              saveImage(test.name, png, test.type, options.screenshots, options.testReportPath);
            } catch (error) {
              prefixedLogger.error(error);
              return false;
            }
            break;
          default:
            try {
              prefixedLogger.log(`capturing screenshot of ${action.value} selector`);
              const png = await chromy.screenshotSelector(action.value);
              saveImage(test.name, png, test.type, options.screenshots, options.testReportPath);
            } catch (error) {
              prefixedLogger.error(error);
              return false;
            }
            break;
        }
        break;
      case actions.test:
        try {
          const result = await compareImage(options, test.name);
          prefixedLogger.log(result);
        } catch (error) {
          prefixedLogger.error(error);
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
