import getJsonReport from './jsonReport';

const results = [
  {
    outcome: true,
    fileName: 'image1.png',
    message: 'no mismatch found',
    diff: null,
  },
];

describe('JSON report', () => {
  it('generates a JSON report', () => {
    const report = getJsonReport(results);
    expect(report).toBe(JSON.stringify(results));
  });
});
