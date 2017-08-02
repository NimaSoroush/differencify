import fs from 'fs';
import compareImage from './compareImage';
import { configTypes } from './defaultConfig';

const differencifyActions = {
  goto: 'goto',
  capture: 'capture',
  test: 'test',
  wait: 'wait',
};

const saveImage = (testName, image, testType, screenshotsPath, testReportPath, prefixedLogger) => {
  const directory = testType === configTypes.test ? testReportPath : screenshotsPath;
  const filePath = `${directory}/${testName}.png`;
  prefixedLogger.log(`screenshot saved in -> ${filePath}`);
  return fs.writeFileSync(filePath, image);
};

const goto = async (chromy, options, testName, value, prefixedLogger) => {
  try {
    await chromy.goto(value);
    prefixedLogger.log(`goto -> ${value}`);
  } catch (error) {
    prefixedLogger.error(error);
    return false;
  }
  return true;
};

const capture = async (chromy, options, testName, value, prefixedLogger) => {
  switch (value) {
    case 'document':
      try {
        prefixedLogger.log('capturing screenshot of whole DOM');
        const png = await chromy.screenshotDocument();
        saveImage(testName, png, test.type, options.screenshots, options.testReportPath, prefixedLogger);
      } catch (error) {
        prefixedLogger.error(error);
        return false;
      }
      break;
    case undefined:
      try {
        prefixedLogger.log('capturing screenshot of chrome window');
        const png = await chromy.screenshot();
        saveImage(testName, png, test.type, options.screenshots, options.testReportPath);
      } catch (error) {
        prefixedLogger.error(error);
        return false;
      }
      break;
    default:
      try {
        prefixedLogger.log(`capturing screenshot of ${value} selector`);
        const png = await chromy.screenshotSelector(value);
        saveImage(testName, png, test.type, options.screenshots, options.testReportPath);
      } catch (error) {
        prefixedLogger.error(error);
        return false;
      }
      break;
  }
  return true;
};

const wait = async (chromy, options, testName, value, prefixedLogger) => {
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
};

const test = async (chromy, options, testName, value, prefixedLogger) => {
  try {
    const result = await compareImage(options, test.name);
    prefixedLogger.log(result);
  } catch (error) {
    prefixedLogger.error(error);
    return false;
  }
  return true;
};

const chromyActions = {
  goto,
  capture,
  test,
  wait,
};

export { chromyActions, differencifyActions };
