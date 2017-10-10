import check from 'check-types';
import type from 'type-detect';
import logger from './utils/logger';
import { globalConfig, testConfig } from './config/config';

const error = (name, wrongType, correctType) =>
  logger.error(`Invalid argument ${name} with type ${wrongType} been passed. Argument should be ${correctType}`);

const checkProperty = (obj, property, checkType) => {
  if (obj) {
    const hasProperty = Object.prototype.hasOwnProperty.call(obj, property);
    if (!check[checkType](obj[property]) && hasProperty) {
      error(property, type(obj[property]), checkType);
      return false;
    }
    return hasProperty;
  }
  return false;
};

const sanitiseTestConfiguration = (conf, testId) => {
  const configuration = {};
  configuration.newWindow = checkProperty(conf, 'newWindow', 'boolean')
    ? conf.newWindow
    : testConfig.newWindow;
  configuration.chain = checkProperty(conf, 'chain', 'boolean')
    ? conf.chain
    : testConfig.chain;
  configuration.testName = checkProperty(conf, 'testName', 'string')
    ? conf.testName
    : testConfig.testName + testId;
  return configuration;
};

const sanitiseGlobalConfiguration = (conf) => {
  const configuration = {};
  configuration.isUpdate = (process.env.update && process.env.update === 'true')
    ? process.env.update
    : globalConfig.isUpdate;

  configuration.debug = checkProperty(conf, 'debug', 'boolean')
    ? conf.debug
    : globalConfig.debug;
  configuration.screenshots = checkProperty(conf, 'screenshots', 'string')
    ? conf.screenshots
    : globalConfig.screenshots;
  configuration.testReports = checkProperty(conf, 'testReports', 'string')
    ? conf.testReports
    : globalConfig.testReports;
  configuration.saveDifferencifiedImage = checkProperty(conf, 'saveDifferencifiedImage', 'boolean')
    ? conf.saveDifferencifiedImage
    : globalConfig.saveDifferencifiedImage;
  configuration.mismatchThreshold = checkProperty(conf, 'mismatchThreshold', 'number')
    ? conf.mismatchThreshold
    : globalConfig.mismatchThreshold;

  configuration.puppeteer = {};
  configuration.puppeteer.ignoreHTTPSErrors = checkProperty(conf, 'ignoreHTTPSErrors', 'boolean')
    ? conf.ignoreHTTPSErrors
    : globalConfig.ignoreHTTPSErrors;
  configuration.puppeteer.executablePath = checkProperty(conf, 'executablePath', 'string')
    ? conf.executablePath
    : undefined;
  configuration.puppeteer.slowMo = checkProperty(conf, 'slowMo', 'number')
    ? conf.slowMo
    : globalConfig.slowMo;
  configuration.puppeteer.args = checkProperty(conf, 'args', 'array')
    ? conf.args
    : globalConfig.browserArgs;
  configuration.puppeteer.dumpio = checkProperty(conf, 'dumpio', 'boolean')
    ? conf.dumpio
    : globalConfig.dumpio;
  configuration.puppeteer.headless = checkProperty(conf, 'headless', 'boolean')
    ? conf.headless
    : globalConfig.headless;
  configuration.puppeteer.timeout = checkProperty(conf, 'timeout', 'number')
    ? conf.timeout
    : globalConfig.timeout;

  return configuration;
};

export { sanitiseTestConfiguration, sanitiseGlobalConfiguration };
