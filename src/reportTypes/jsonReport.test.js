import getJsonReport from './jsonReport';

const results = [
  {
    outcome: true,
    testName: 'default',
    result: 'no mismatch found',
  },
];

describe('JSON report', () => {
  it('generates a JSON report', () => {
    const report = getJsonReport(results);
    expect(report).toBe(JSON.stringify(results));
  });
});
