import Jimp from 'jimp';
import compareImage from './compareImage';
import logger from './logger';
import { globalConfig } from './defaultConfig';

Jimp.read = path =>
  new Promise((resolve, reject) => {
    if (path === './screenshots/test1.png' || path === './differencify_report/test1.png') {
      return resolve('image');
    }
    return reject('error');
  });

Jimp.distance = (referenceImage, testImage) => {
  if (referenceImage === 'image' && testImage === 'image') {
    return 0;
  }
  return 1;
};

Jimp.diff = () => jest.fn();

let loggerCalls = [];
logger.log = (...args) => {
  loggerCalls.push(...args);
};

describe('Compare Image', () => {
  afterEach(() => {
    loggerCalls = [];
  });
  it('returns correct values', async () =>
    compareImage(globalConfig, 'test1')
    .catch((result) => {
      expect(result).toEqual('Failed to read test image!');
      expect(loggerCalls[0]).toEqual('Writting the diff image to disk');
    }));
});
