import cheerio from 'cheerio';
import getHtmlReport from './htmlReport';

const results = [
  {
    outcome: true,
    testName: 'default',
    result: 'no mismatch found',
  },
  {
    outcome: false,
    testName: 'default2',
    referenceFileName: 'default2.png',
    diffFileName: 'default2_differencified.png',
    result: 'mismatch found!',
  },
];

describe('HTML report', () => {
  it('generates a HTML report', () => {
    const report = getHtmlReport(results);
    const $ = cheerio.load(report);
    expect($('tbody tr').length).toBe(2);
    expect($('tbody tr:first-child td:first-child').text().trim()).toBe(
      results[0].testName,
    );
    expect($('tbody tr:nth-child(2) td:first-child').text().trim()).toBe(
      results[1].testName,
    );
  });
});
