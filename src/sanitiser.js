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
  configuration.name = hasProperty(configuration, 'name')
    ? configuration.name
    : defaultConfig.name;
  return configuration;
};

const sanitiseGlobalConfiguration = (conf) => {
  const configuration = conf || {};
  configuration.debug = hasProperty(configuration, 'debug')
    ? configuration.debug
    : defaultConfig.debug;
  configuration.visible = hasProperty(configuration, 'visible')
    ? configuration.visible
    : defaultConfig.visible;
  configuration.timeout = hasProperty(configuration, 'timeout')
    ? configuration.timeout
    : defaultConfig.timeout;
  configuration.screenshots = hasProperty(configuration, 'screenshots')
    ? configuration.screenshots
    : defaultConfig.screenshots;
  return configuration;
};

export { sanitiseTestConfiguration, sanitiseGlobalConfiguration };
