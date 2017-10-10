const globalConfig = {
  screenshots: './screenshots',
  testReports: './differencify_report',
  saveDifferencifiedImage: true,
  debug: false,
  isUpdate: false,
  headless: true,
  timeout: 30000,
  mismatchThreshold: 0.01,
  ignoreHTTPSErrors: false,
  slowMo: 0,
  browserArgs: [],
  dumpio: false,
};

const testConfig = {
  testName: 'test',
  newWindow: false,
  chain: true,
};

export { globalConfig, testConfig };
