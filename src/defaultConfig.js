const globalConfig = {
  screenshots: './screenshots',
  testReportPath: './differencify_report',
  debug: false,
  visible: true,
  timeout: 30000,
  mismatchThreshold: 0.1,
};

const testConfig = {
  name: 'default',
  resolution: {
    width: 800,
    height: 600,
  },
  steps: [
    { name: 'goto', value: 'www.example.com' },
    { name: 'capture', value: 'document' },
  ],
};

const configTypes = {
  test: 'test',
  update: 'update',
};

export { globalConfig, testConfig, configTypes };
