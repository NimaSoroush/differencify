import fs from 'fs';
import Reporter, { getHtmlReport, getJsonReport } from './Reporter';
import logger from './logger';

jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
}));

jest.mock('./logger', () => ({
  log: jest.fn(),
}));

const results = [
  {
    outcome: true,
    fileName: 'image1.png',
    message: 'no mismatch found',
    diff: null,
  },
  {
    outcome: true,
    fileName: 'image2.png',
    message: 'no mismatch found',
    diff: null,
  },
  {
    outcome: false,
    fileName: 'image2.png',
    message: 'mismatch found!',
    diff: 'image2_diff.png',
  },
];

describe('Generate report index', () => {
  let reporter;

  beforeEach(() => {
    reporter = new Reporter();
    results.forEach(result =>
      reporter.addResult(
        result.outcome,
        result.fileName,
        result.message,
        result.diff,
      ),
    );
  });

  afterEach(() => {
    fs.writeFileSync.mockClear();
    logger.log.mockClear();
  });

  it('generates a HTML report', () => {
    reporter.generate(
      {
        html: 'index.html',
      },
      './example/path',
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'example/path/index.html',
      getHtmlReport(results),
    );
  });

  it('generates a JSON report', () => {
    reporter.generate(
      {
        json: 'report.json',
      },
      './example/path',
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'example/path/report.json',
      getJsonReport(results),
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
});
