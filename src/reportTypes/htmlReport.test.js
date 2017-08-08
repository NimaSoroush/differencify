import cheerio from 'cheerio';
import getHtmlReport from './htmlReport';

const results = [
  {
    outcome: true,
    fileName: 'image1.png',
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

describe('HTML report', () => {
  it('generates a HTML report', () => {
    const report = getHtmlReport(results);
    const $ = cheerio.load(report);
    expect($('tbody tr').length).toBe(2);
    expect($('tbody tr:first-child td:first-child').text().trim()).toBe(
      results[0].fileName,
    );
    expect($('tbody tr:nth-child(2) td:first-child').text().trim()).toBe(
      results[1].fileName,
    );
  });
});
