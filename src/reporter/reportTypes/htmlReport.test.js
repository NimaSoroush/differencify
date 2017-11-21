import getHtmlReport from './htmlReport';

const results = [
  {
    testName: 'default',
    status: 'passed',
  },
  {
    testName: 'default2',
    snapshotPath: 'default2.png',
    diffPath: 'default2_differencified.png',
    status: 'failed',
  },
];

describe('HTML report', () => {
  it('generates a HTML report', () => {
    const report = getHtmlReport(results);
    expect(report).toMatchSnapshot();
  });
});
