const globalConfig = {
  screenshots: './screenshots',
  debug: false,
  visible: true,
  timeout: 30000,
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

const testReportSteps = {
  name: 'test', value: 'differencify_report',
};

export { globalConfig, testConfig, testReportSteps };
