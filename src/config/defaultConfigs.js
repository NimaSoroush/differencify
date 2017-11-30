const globalConfig = {
  imageSnapshotPath: 'differencify_reports',
  saveDifferencifiedImage: true,
  imageType: 'png',
  debug: false,
  mismatchThreshold: 0.001,
};

const testConfig = {
  testName: 'test',
  chain: true,
  isUpdate: false,
};

export { globalConfig, testConfig };
