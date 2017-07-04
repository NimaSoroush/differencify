import { sanitiseGlobalConfiguration, sanitiseTestConfiguration } from './sanitiser';

describe('sanitiser', () => {
  describe('sanitise global configuration', () => {
    it('sanitise if no config provided', () => {
      const configuration = sanitiseGlobalConfiguration({});
      expect(configuration).toEqual({
        screenshots: './screenshots',
        debug: false,
        visible: true,
        timeout: 30000,
        mismatchThreshold: 0.1,
      });
    });
    it('sanitise if screenshots config provided', () => {
      const configuration = sanitiseGlobalConfiguration({ screenshots: './screenshots' });
      expect(configuration).toEqual({
        screenshots: './screenshots',
        debug: false,
        visible: true,
        timeout: 30000,
        mismatchThreshold: 0.1,
      });
    });
  });
  describe('sanitise test configuration', () => {
    it('sanitise if no config provided', () => {
      const configuration = sanitiseTestConfiguration({});
      expect(configuration).toEqual({
        name: 'default',
        resolution: {
          width: 800,
          height: 600,
        },
        steps: [
          { name: 'goto', value: 'www.example.com' },
          { name: 'capture', value: 'document' },
        ],
      });
    });
    it('sanitise if resolution config provided', () => {
      const configuration = sanitiseTestConfiguration({ resolution: {
        width: 1366,
        height: 768,
      } });
      expect(configuration).toEqual({
        name: 'default',
        resolution: {
          width: 1366,
          height: 768,
        },
        steps: [
          { name: 'goto', value: 'www.example.com' },
          { name: 'capture', value: 'document' },
        ],
      });
    });
  });
});
