import fs from 'fs';
import Chromy from 'chromy';
import getPort from 'get-port';
import Differencify from './index';
import logger from './logger';
import run from './chromyRunner';
import Reporter from './Reporter';

jest.mock('get-port', () => jest.fn(() => 3000));
const mockClose = jest.fn();
jest.mock('chromy', () => () =>
  ({
    close: mockClose,
    options: { port: 3000 },
  }));
jest.mock('./chromyRunner', () => jest.fn(() => true));

jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
  existsSync: jest.fn(),
}));

const mockLog = jest.fn();
jest.mock('./logger', () => ({
  prefix: jest.fn(() => ({
    log: mockLog,
  })),
  log: jest.fn(),
  error: jest.fn(),
  enable: jest.fn(),
}));

jest.mock('./Reporter', () => () => ({
  generate: jest.fn(),
}));

const globalConfig = {
  screenshots: 'screenshots',
  debug: true,
  visible: true,
  timeout: 30000,
};

const testConfig = {
  name: 'default',
  resolution: {
    width: 800,
    height: 600,
  },
  steps: [
    { name: 'goto', value: 'www.example.com' },
    { name: 'capture', value: 'document' },
  ],
};

const mockReporter = new Reporter();
const differencify = new Differencify(globalConfig, mockReporter);

describe('Differencify', () => {
  afterEach(() => {
    mockLog.mockClear();
    logger.log.mockClear();
    run.mockClear();
    mockClose.mockClear();
  });
  it('constructor fn', async () => {
    expect(fs.mkdirSync).toHaveBeenCalledWith('screenshots');
    expect(fs.mkdirSync).toHaveBeenCalledWith('./differencify_report');
  });
  it('update fn', async () => {
    const result = await differencify.update(testConfig);
    expect(result).toEqual(true);
    expect(differencify.chromeInstances[3000]).toEqual(undefined);
    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(mockLog).toHaveBeenCalledWith('closing browser');
    expect(run).toHaveBeenCalledTimes(1);
  });
  it('test fn', async () => {
    const result = await differencify.test(testConfig);
    expect(result).toEqual(true);
    expect(differencify.chromeInstances[3000]).toEqual(undefined);
    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(mockLog).toHaveBeenCalledWith('closing browser');
    expect(run).toHaveBeenCalledTimes(1);
  });
  it('chromyRunner will fail test fn', async () => {
    run.mockReturnValueOnce(Promise.resolve(false));
    const result = await differencify.test(testConfig);
    expect(result).toEqual(false);
    expect(differencify.chromeInstances[3000]).toEqual(undefined);
    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(mockLog).toHaveBeenCalledWith('closing browser');
    expect(run).toHaveBeenCalledTimes(1);
  });
  it('generateReport fn', async () => {
    const config = {
      html: 'index.html',
      json: 'asset-manifest.json',
    };
    differencify.generateReport(config);
    expect(mockReporter.generate).toHaveBeenCalledWith(config, globalConfig.testReportPath);
  });
  it('cleanup fn', async () => {
    const chromy1 = new Chromy();
    const chromy2 = new Chromy();
    differencify.chromeInstances = [chromy1, chromy2];
    await differencify.cleanup();
    expect(mockClose).toHaveBeenCalledTimes(2);
    expect(differencify.chromeInstances).toEqual({});
    expect(logger.log).toHaveBeenCalledWith('All browsers been closed');
  });
  it('get-port fails test', async () => {
    getPort.mockReturnValueOnce(Promise.reject());
    const result = await differencify.test(testConfig);
    expect(result).toEqual(false);
    expect(logger.error).toHaveBeenCalledWith('Failed to get a free port', undefined);
  });
});
