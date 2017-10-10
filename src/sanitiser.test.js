import { sanitiseGlobalConfiguration, sanitiseTestConfiguration } from './sanitiser';

describe('sanitiser', () => {
  describe('sanitise global configuration', () => {
    it('sanitise if no config provided', () => {
      const configuration = sanitiseGlobalConfiguration({});
      expect(configuration).toEqual({
        screenshots: './screenshots',
        testReports: './differencify_report',
        saveDifferencifiedImage: true,
        debug: false,
        mismatchThreshold: 0.01,
        isUpdate: false,
        puppeteer: {
          args: [],
          dumpio: false,
          executablePath: undefined,
          headless: true,
          ignoreHTTPSErrors: false,
          slowMo: 0,
          timeout: 30000,
        },
      });
    });
    it('sanitise if screenshots config provided', () => {
      const configuration = sanitiseGlobalConfiguration({ screenshots: './somewhere' });
      expect(configuration).toEqual({
        screenshots: './somewhere',
        testReports: './differencify_report',
        saveDifferencifiedImage: true,
        debug: false,
        mismatchThreshold: 0.01,
        isUpdate: false,
        puppeteer: {
          args: [],
          dumpio: false,
          executablePath: undefined,
          headless: true,
          ignoreHTTPSErrors: false,
          slowMo: 0,
          timeout: 30000,
        },
      });
    });
  });
  describe('sanitise test configuration', () => {
    it('sanitise if no config provided', () => {
      const configuration = sanitiseTestConfiguration({}, 1);
      expect(configuration).toEqual({
        chain: true,
        newWindow: false,
        testName: 'test1',
      });
    });
    it('sanitise if some config provided', () => {
      const configuration = sanitiseTestConfiguration({ newWindow: true }, 1);
      expect(configuration).toEqual({
        chain: true,
        newWindow: true,
        testName: 'test1',
      });
    });
  });
});
