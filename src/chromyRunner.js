import fs from 'fs';
import check from 'check-types';
import logger from './logger';
import compareImage from './compareImage';
import freezeImage from './freezeImage';
import functionToString from './helpers/functionToString';
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
      case actions.wait:
        try {
          if (check.number(action.value)) {
            prefixedLogger.log(`waiting for ${action.value} ms`);
          } else if (check.function(action.value)) {
            prefixedLogger.log('waiting for function execution');
          } else if (check.string(action.value)) {
            prefixedLogger.log(`waiting for ${action.value} selector`);
          } else {
            prefixedLogger.log('failed to detect waiting mechanism');
            return false;
          }
          await chromy.wait(action.value);
        } catch (error) {
          prefixedLogger.error(error);
          return false;
        }
        break;
      case actions.execute:
        try {
          if (check.function(action.value)) {
            prefixedLogger.log('waiting for to execute function in browser');
            await chromy.evaluate(action.value);
          } else {
            prefixedLogger.log('failed to detect execute function');
            return false;
          }
        } catch (error) {
          prefixedLogger.error(error);
          return false;
        }
        break;
      case actions.freezeImage:
        try {
          prefixedLogger.log(`Freezing image ${action.value} in browser`);
          const strFunc = functionToString(freezeImage, action.value);
          const result = await chromy.evaluate(strFunc);
          if (!result) {
            prefixedLogger.log(`Tag with selector ${action.value} is not a valid image`);
            return false;
          }
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
