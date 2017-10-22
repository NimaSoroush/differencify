const globalConfig = {
  imageSnapshotPath: 'differencify_reports',
  saveDifferencifiedImage: true,
  imageType: 'png',
  debug: false,
  headless: true,
  timeout: 30000,
  mismatchThreshold: 0.001,
  ignoreHTTPSErrors: false,
  slowMo: 0,
  browserArgs: [],
  dumpio: false,
};

const testConfig = {
  testName: 'test',
  newWindow: false,
  chain: true,
  isUpdate: false,
};

export { globalConfig, testConfig };
