import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';
import { getSnapshotPath, getDiffPath } from '../utils/paths';
import getReport from './reportTypes';

import Reporter from './';

jest.mock('fs');
jest.mock('path');
jest.mock('pkg-dir', () => ({
  sync: jest.fn(() => './'),
}));
jest.mock('../utils/logger');
jest.mock('../utils/paths');
jest.mock('./reportTypes');

const globalConfig = {};

describe('Reporter', () => {
  afterEach(() => {
    logger.enable.mockClear();
    fs.existsSync.mockClear();
    fs.mkdirSync.mockClear();
    getSnapshotPath.mockClear();
    getDiffPath.mockClear();
    path.relative.mockClear();
    path.join.mockClear();
    getReport.mockClear();
  });
  it('sets default options', () => {
    const reporter = new Reporter(globalConfig);
    expect('reportPath' in reporter.options).toBe(true);
    expect('reportTypes' in reporter.options).toBe(true);
    expect('imageType' in reporter.options).toBe(true);
    expect('debug' in reporter.options).toBe(true);
  });
  it('overrides default options', () => {
    const options = {
      reportPath: 'custom_report_path',
      reportTypes: {
        html: 'custom-file-name.html',
      },
      imageType: 'jpg',
      debug: true,
    };
    const reporter = new Reporter(globalConfig, options);
    expect(reporter.options.reportPath).toBe(options.reportPath);
    expect(reporter.options.reportTypes).toBe(options.reportTypes);
    expect(reporter.options.imageType).toBe(options.imageType);
    expect(reporter.options.debug).toBe(options.debug);
  });
  it('enables the logger if debug is true', () => {
    // eslint-disable-next-line no-new
    new Reporter(globalConfig, {
      debug: false,
    });
    expect(logger.enable).not.toHaveBeenCalled();
    // eslint-disable-next-line no-new
    new Reporter(globalConfig, {
      debug: true,
    });
    expect(logger.enable).toHaveBeenCalled();
  });
  describe('getTestResults', () => {
    const testResults = {
      testFilePath: '/some/path/test.js',
      testResults: [
        {
          fullName: 'Differencify test',
          status: 'passed',
        },
      ],
    };
    it('includes item in results if snapshot file exists', () => {
      fs.existsSync.mockImplementation(() => true);
      path.relative.mockImplementation(() => '../__image_snapshots__/a relative path.png');
      const reporter = new Reporter(globalConfig);
      const reporterTestResults = reporter.getTestResults(testResults);
      expect(reporterTestResults).toEqual([
        {
          diffPath: '../__image_snapshots__/a relative path.png',
          snapshotPath: '../__image_snapshots__/a relative path.png',
          status: 'passed',
          testName: 'Differencify test',
        },
      ]);
    });
    it('does not include item in results if snapshot file does not exist', () => {
      fs.existsSync.mockImplementation(() => false);
      const reporter = new Reporter(globalConfig);
      const reporterTestResults = reporter.getTestResults(testResults);
      expect(reporterTestResults).toEqual([]);
    });
  });
  describe('onRunComplete', () => {
    it("creates the resolved reportPath directory if it doesn't exist", () => {
      path.resolve.mockImplementation(() => '/some/dir');
      fs.existsSync.mockImplementation(() => false);
      const reporter = new Reporter(globalConfig);
      reporter.generate = jest.fn();
      reporter.onRunComplete(
        {},
        {
          testResults: [],
        },
      );
      expect(fs.mkdirSync).toHaveBeenCalledWith('/some/dir');
    });
    it('calls generate with aggregated reporter test results', () => {
      const contexts = {};
      const aggregatedResults = {
        testResults: [
          {
            testResults: [
              {
                fullName: 'Differencify fail',
                status: 'failed',
              },
              {
                fullName: 'Differencify pass',
                status: 'passed',
              },
            ],
          },
          {
            testResults: [
              {
                fullName: 'Differencify pass 2',
                status: 'passed',
              },
            ],
          },
        ],
      };
      const reporter = new Reporter(globalConfig);
      reporter.generate = jest.fn();
      reporter.getTestResults = jest.fn(testResults =>
        testResults.testResults.map(testResult => ({
          diffPath: '../__image_snapshots__/a relative path.png',
          snapshotPath: '../__image_snapshots__/a relative path.png',
          status: testResult.status,
          testName: testResult.fullName,
        })),
      );
      reporter.onRunComplete(contexts, aggregatedResults);
      expect(reporter.generate).toHaveBeenCalledWith([
        {
          diffPath: '../__image_snapshots__/a relative path.png',
          snapshotPath: '../__image_snapshots__/a relative path.png',
          status: 'failed',
          testName: 'Differencify fail',
        },
        {
          diffPath: '../__image_snapshots__/a relative path.png',
          snapshotPath: '../__image_snapshots__/a relative path.png',
          status: 'passed',
          testName: 'Differencify pass',
        },
        {
          diffPath: '../__image_snapshots__/a relative path.png',
          snapshotPath: '../__image_snapshots__/a relative path.png',
          status: 'passed',
          testName: 'Differencify pass 2',
        },
      ]);
    });
  });
  it('generates the report', () => {
    const flattenedResults = [
      {
        diffPath: '../__image_snapshots__/a relative path.png',
        snapshotPath: '../__image_snapshots__/a relative path.png',
        status: 'failed',
        testName: 'Differencify fail',
      },
    ];
    path.join.mockImplementation(() => '/a/path/foo.ext');
    getReport.mockImplementation(() => 'a report');
    const reporter = new Reporter(globalConfig);
    reporter.generate(flattenedResults);
    expect(fs.writeFileSync).toHaveBeenCalledWith('/a/path/foo.ext', 'a report');
  });
});
