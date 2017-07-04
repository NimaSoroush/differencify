export default {
  name: 'default',
  resolution: {
    width: 1366,
    height: 768,
  },
  steps: [
    { name: 'goto', value: 'http://www.google.com' },
    { name: 'capture', value: 'document' },
  ],
};
