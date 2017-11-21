import fs from 'fs';
import path from 'path';
import pkgDir from 'pkg-dir';
import logger from '../utils/logger';
import { getSnapshotPath, getDiffPath } from '../utils/paths';
import getReport from './reportTypes';

module.exports = class DifferencifyReporter {
  constructor(globalConfig = {}, options = {}) {
    this.globalConfig = globalConfig;
    // eslint-disable-next-line prefer-object-spread/prefer-object-spread
    this.options = Object.assign(
      {},
      {
        reportPath: 'differencify_reports',
        reportTypes: {
          html: 'index.html',
        },
        imageType: 'png',
        debug: true,
      },
      options,
    );
    this.resolvedReportPath = path.resolve(pkgDir.sync(), this.options.reportPath);
    if (this.options.debug === true) {
      logger.enable();
    }
  }

  getTestResults(testResults) {
    const testRootPath = path.dirname(testResults.testFilePath);
    return testResults.testResults
      .map((result) => {
        const { fullName: testName, status } = result;
        const snapshotPath = getSnapshotPath(testRootPath, testName, this.options.imageType);
        const diffPath = getDiffPath(testRootPath, testName, this.options.imageType);
        return {
          status,
          testName,
          snapshotPath: fs.existsSync(snapshotPath) && path.relative(this.resolvedReportPath, snapshotPath),
          diffPath: fs.existsSync(diffPath) && path.relative(this.resolvedReportPath, diffPath),
        };
      })
      .filter(result => result.snapshotPath);
  }

  generate(results) {
    Object.keys(this.options.reportTypes).forEach((type) => {
      const reportFilepath = path.join(this.resolvedReportPath, this.options.reportTypes[type]);
      try {
        const report = getReport(type, results);
        fs.writeFileSync(reportFilepath, report);
        logger.log(`Generated ${type} report at ${reportFilepath}`);
      } catch (err) {
        logger.error(`Unable to generate ${type} report at ${reportFilepath}: ${err}`);
      }
    });
  }

  onRunComplete(contexts, aggregatedResults) {
    if (!fs.existsSync(this.resolvedReportPath)) {
      fs.mkdirSync(this.resolvedReportPath);
    }
    const results = aggregatedResults.testResults.reduce(
      (flattedResults, testResults) => flattedResults.concat(this.getTestResults(testResults)),
      [],
    );
    this.generate(results);
  }
};
