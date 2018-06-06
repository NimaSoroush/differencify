import check from 'check-types';
import type from 'type-detect';
import logger from './utils/logger';
import { globalConfig, testConfig } from './config/defaultConfigs';

const logError = (name, wrongType, correctType) =>
  logger.error(`Invalid argument ${name} with type ${wrongType} been passed. Argument should be ${correctType}`);

const checkProperty = (obj, property, checkType) => {
  if (!obj) {
    return false;
  }
  const hasProperty = Object.prototype.hasOwnProperty.call(obj, property);
  if (!check[checkType](obj[property]) && hasProperty) {
    logError(property, type(obj[property]), checkType);
    return false;
  }
  return hasProperty;
};

const sanitiseTestConfiguration = (conf, testId) => {
  const configuration = {};
  configuration.chain = checkProperty(conf, 'chain', 'boolean')
    ? conf.chain
    : testConfig.chain;
  configuration.testNameProvided = checkProperty(conf, 'testName', 'string');
  configuration.testName = configuration.testNameProvided
    ? conf.testName
    : testConfig.testName;
  configuration.testId = testId;
  configuration.isUpdate = (process.env.update && process.env.update === 'true')
    ? process.env.update
    : testConfig.isUpdate;
  return configuration;
};

const sanitiseGlobalConfiguration = (conf) => {
  const configuration = {};
  configuration.debug = checkProperty(conf, 'debug', 'boolean')
    ? conf.debug
    : globalConfig.debug;

  configuration.imageSnapshotPathProvided = checkProperty(conf, 'imageSnapshotPath', 'string');
  configuration.imageSnapshotPath = configuration.imageSnapshotPathProvided
    ? conf.imageSnapshotPath
    : globalConfig.imageSnapshotPath;
  configuration.saveDifferencifiedImage = checkProperty(conf, 'saveDifferencifiedImage', 'boolean')
    ? conf.saveDifferencifiedImage
    : globalConfig.saveDifferencifiedImage;
  configuration.mismatchThreshold = checkProperty(conf, 'mismatchThreshold', 'number')
    ? conf.mismatchThreshold
    : globalConfig.mismatchThreshold;

  return configuration;
};

export { sanitiseTestConfiguration, sanitiseGlobalConfiguration };
