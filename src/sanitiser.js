import { globalConfig, testConfig } from './defaultConfig';

const hasProperty = (obj, property) =>
  Object.prototype.hasOwnProperty.call(obj, property);

const sanitiseTestConfiguration = (conf) => {
  const configuration = conf || {};
  configuration.resolution = hasProperty(configuration, 'resolution')
    ? configuration.resolution
    : testConfig.resolution;
  configuration.steps = hasProperty(configuration, 'steps')
    ? configuration.steps
    : testConfig.steps;
  configuration.name = hasProperty(configuration, 'name')
    ? configuration.name
    : testConfig.name;
  return configuration;
};

const sanitiseGlobalConfiguration = (conf) => {
  const configuration = conf || {};
  configuration.debug = hasProperty(configuration, 'debug')
    ? configuration.debug
    : globalConfig.debug;
  configuration.visible = hasProperty(configuration, 'visible')
    ? configuration.visible
    : globalConfig.visible;
  configuration.timeout = hasProperty(configuration, 'timeout')
    ? configuration.timeout
    : globalConfig.timeout;
  configuration.screenshots = hasProperty(configuration, 'screenshots')
    ? configuration.screenshots
    : globalConfig.screenshots;
  configuration.mismatchThreshold = hasProperty(configuration, 'mismatchThreshold')
    ? configuration.mismatchThreshold
    : globalConfig.mismatchThreshold;

  return configuration;
};

export { sanitiseTestConfiguration, sanitiseGlobalConfiguration };
