import fs from 'fs';
import Reporter, { getHtmlReport, getJsonReport } from './Reporter';
import logger from './logger';
import { globalConfig } from './defaultConfig';

jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  readdirSync: jest.fn(() => []),
}));

jest.mock('./logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

const results = [
  {
    outcome: true,
    testName: 'default',
    result: 'no mismatch found',
  },
  {
    outcome: true,
    testName: 'default2',
    result: 'no mismatch found',
  },
  {
    outcome: false,
    testName: 'default3',
    result: 'mismatch found!',
  },
];

describe('Generate report index', () => {
  let reporter;

  beforeEach(() => {
    reporter = new Reporter(globalConfig);
    results.forEach(result =>
      reporter.addResult({
        outcome: result.outcome,
        testName: result.testName,
        result: result.result,
      }),
    );
  });

  afterEach(() => {
    fs.writeFileSync.mockClear();
    fs.readdirSync.mockClear();
    logger.log.mockClear();
  });

  it('generates a HTML report', () => {
    reporter.generate(
      {
        html: 'index.html',
      },
      './example/path',
    );
    expect(fs.readdirSync).toHaveBeenCalledWith(globalConfig.testReportPath);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'example/path/index.html',
      getHtmlReport(reporter.getResults()),
    );
  });

  it('generates a JSON report', () => {
    reporter.generate(
      {
        json: 'report.json',
      },
      './example/path',
    );
    expect(fs.readdirSync).toHaveBeenCalledWith(globalConfig.testReportPath);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'example/path/report.json',
      getJsonReport(reporter.getResults()),
    );
  });

  it('logs the report paths', () => {
    reporter.generate(
      {
        html: 'index.html',
        json: 'report.json',
      },
      './example/path',
    );
    expect(logger.log).toHaveBeenCalledWith(
      'Generated json report at example/path/report.json',
    );
    expect(logger.log).toHaveBeenCalledWith(
      'Generated html report at example/path/index.html',
    );
  });

  it('logs the error', () => {
    fs.writeFileSync.mockImplementation(() => {
      throw new Error('write file error');
    });
    reporter.generate(
      {
        html: 'index.html',
      },
      './example/path',
    );
    expect(logger.error).toHaveBeenCalledWith(
      'Unable to generate html report at example/path/index.html: Error: write file error',
    );
  });
});
