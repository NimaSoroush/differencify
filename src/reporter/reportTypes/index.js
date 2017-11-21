import getHtmlReport from './htmlReport';
import getJsonReport from './jsonReport';

export default (key, results) => {
  switch (key) {
    case 'json':
      return getJsonReport(results);
    case 'html':
    default:
      return getHtmlReport(results);
  }
};
