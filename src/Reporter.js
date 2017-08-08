import fs from 'fs';
import path from 'path';
import logger from './logger';
import getHtmlReport from './reportTypes/htmlReport';
import getJsonReport from './reportTypes/jsonReport';

const saveReport = (filepath, contents) => {
  fs.writeFileSync(filepath, contents);
};

const getReport = (key, results) => {
  switch (key) {
    case 'json':
      return getJsonReport(results);
    case 'html':
    default:
      return getHtmlReport(results);
  }
};

class Reporter {

  constructor() {
    this.results = [];
  }

  addResult(outcome, fileName, message, diff) {
    this.results.push({
      outcome,
      fileName: path.basename(fileName),
      message,
      diff: diff ? path.basename(diff) : null,
    });
  }

  getResults() {
    return this.results;
  }

  generate(types, testReportPath) {
    Object.keys(types).forEach((type) => {
      const filepath = path.join(testReportPath, types[type]);
      try {
        const template = getReport(type, this.getResults());
        saveReport(filepath, template);
        logger.log(`Generated ${type} report at ${filepath}`);
      } catch (err) {
        logger.error(`Unable to generate ${type} report at ${filepath}: ${err}`);
      }
    });
    return true;
  }
}

export { getHtmlReport, getJsonReport };

export default Reporter;
