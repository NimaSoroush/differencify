import { sanitiseGlobalConfiguration, sanitiseTestConfiguration } from './sanitiser';

describe('sanitiser', () => {
  describe('sanitise global configuration', () => {
    it('sanitise if no config provided', () => {
      const configuration = sanitiseGlobalConfiguration({});
      expect(configuration).toMatchSnapshot();
    });
    it('sanitise if screenshots config provided', () => {
      const configuration = sanitiseGlobalConfiguration({ screenshots: './somewhere' });
      expect(configuration).toMatchSnapshot();
    });
    it('sanitise if puppeteer specific configuration provided', () => {
      const configuration = sanitiseGlobalConfiguration({ browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'] });
      expect(configuration).toMatchSnapshot();
    });
  });
  describe('sanitise test configuration', () => {
    it('sanitise if no config provided', () => {
      const configuration = sanitiseTestConfiguration({}, 1);
      expect(configuration).toMatchSnapshot();
    });
    it('sanitise if some config provided', () => {
      const configuration = sanitiseTestConfiguration({ newWindow: true }, 1);
      expect(configuration).toMatchSnapshot();
    });
  });
});
