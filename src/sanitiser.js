import defaultConfig from './defaultConfig';

const hasProperty = (obj, property) =>
  Object.prototype.hasOwnProperty.call(obj, property);

const sanitiseTestConfiguration = (conf) => {
  const configuration = conf || {};
  configuration.resolution = hasProperty(configuration, 'resolution')
    ? configuration.resolution
    : defaultConfig.resolution;
  configuration.steps = hasProperty(configuration, 'steps')
    ? configuration.steps
    : defaultConfig.steps;
  return configuration;
};

const sanitiseGlobalConfiguration = (conf) => {
  const configuration = conf || {};
  configuration.screenshots = hasProperty(configuration, 'screenshots')
    ? configuration.screenshots
    : defaultConfig.screenshots;
  configuration.debug = hasProperty(configuration, 'debug')
    ? configuration.debug
    : defaultConfig.debug;
  configuration.visible = hasProperty(configuration, 'visible')
    ? configuration.visible
    : defaultConfig.visible;
  configuration.timeout = hasProperty(configuration, 'timeout')
    ? configuration.timeout
    : defaultConfig.timeout;
  return configuration;
};

export { sanitiseTestConfiguration, sanitiseGlobalConfiguration };
