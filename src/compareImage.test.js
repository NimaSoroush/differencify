import Jimp from 'jimp';
import fs from 'fs';
import compareImage from './compareImage';

jest.mock('jimp', () => ({
  read: jest.fn(),
  distance: jest.fn(),
  diff: jest.fn(),
}));

jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
  existsSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

const mockLog = jest.fn();
const mockError = jest.fn();
jest.mock('./utils/logger', () => ({
  prefix: jest.fn(() => ({
    log: mockLog,
    error: mockError,
  })),
}));

const mockConfig = {
  imageSnapshotPath: './differencify_report',
  saveDifferencifiedImage: true,
  mismatchThreshold: 0.01,
};

const mockTestConfig = {
  isUpdate: false,
  isJest: true,
  testName: 'test',
  testPath: '/src/test.js',
  imageType: 'png',
};

describe('Compare Image', () => {
  beforeEach(() => {
    fs.writeFileSync.mockClear();
    Jimp.distance.mockReturnValue(0);
    Jimp.diff.mockReturnValue({ percent: 0 });
  });
  describe('Jest mode', () => {
    it('ًWill create image snapshot when there is no snapshot', async () => {
      const result = await compareImage(Object, mockConfig, {
        isUpdate: false,
        isJest: true,
        testName: 'test',
        testPath: '/src/test.js',
        imageType: 'png',
      });
      expect(result).toEqual({ added: true });
      expect(fs.writeFileSync).toHaveBeenCalledWith('/src/__image_snapshots__/test.snap.png', Object);
    });
    it('ًWill update snapshot when isUpdate=true', async () => {
      const result = await compareImage(Object, mockConfig, {
        isUpdate: true,
        isJest: true,
        testName: 'test',
        testPath: '/src/test.js',
        imageType: 'png',
      });
      expect(result).toEqual({ updated: true });
      expect(fs.writeFileSync).toHaveBeenCalledWith('/src/__image_snapshots__/test.snap.png', Object);
    });
  });

  describe('non-jest mode', () => {
    it('ًWill create image snapshot when there is no snapshot', async () => {
      const result = await compareImage(Object, mockConfig, {
        isUpdate: false,
        isJest: false,
        testName: 'test',
        testPath: '/src/test.js',
        imageType: 'png',
      });
      expect(result).toEqual({ added: true });
      expect(fs.writeFileSync)
      .toHaveBeenCalledWith(
        '/Users/nimasoroushhaddadi/Documents/projects/differencify/differencify_report/' +
        '__image_snapshots__/test.snap.png',
        Object,
      );
    });
    it('ًWill update snapshot when isUpdate=true', async () => {
      const result = await compareImage(Object, mockConfig, {
        isUpdate: true,
        isJest: false,
        testName: 'test',
        testPath: '/src/test.js',
        imageType: 'png',
      });
      expect(result).toEqual({ updated: true });
      expect(fs.writeFileSync)
      .toHaveBeenCalledWith(
        '/Users/nimasoroushhaddadi/Documents/projects/differencify/differencify_report/' +
        '__image_snapshots__/test.snap.png',
        Object,
      );
    });
  });

  it('throws correct error if it cannot read image', async () => {
    expect.assertions(2);
    Jimp.read.mockReturnValueOnce(Promise.reject('error1'));
    fs.existsSync.mockReturnValueOnce(true);
    const result = await compareImage(Object, mockConfig, mockTestConfig);
    expect(result).toEqual({ matched: false });
    expect(mockError).toHaveBeenCalledWith('failed to read reference image error1');
  });

  it('returns correct value if difference below threshold', async () => {
    expect.assertions(2);
    fs.existsSync.mockReturnValueOnce(true);
    const result = await compareImage(Object, mockConfig, mockTestConfig);
    expect(result).toEqual({ matched: true });
    expect(mockLog).toHaveBeenCalledWith('no mismatch found ✅');
  });

  it('returns mismatch found❗ if only difference above threshold', async () => {
    Jimp.diff.mockReturnValue({
      percent: 0.02,
      image: {
        write: jest.fn(),
      },
    });
    fs.existsSync.mockReturnValueOnce(true);
    const result = await compareImage(Object, mockConfig, mockTestConfig);
    expect(result).toEqual({
      diffPath: '/src/__image_snapshots__/__differencified_output__/test.differencified.png',
      matched: false,
    });
    expect(mockError).toHaveBeenCalledWith(`mismatch found❗
      Result:
        distance: 0
        diff: 0.02
        misMatchThreshold: 0.01
    `);
  });

  it('returns mismatch found❗ if only distance above threshold', async () => {
    Jimp.distance.mockReturnValue(0.02);
    Jimp.diff.mockReturnValue({
      percent: 0,
      image: {
        write: jest.fn(),
      },
    });
    fs.existsSync.mockReturnValueOnce(true);
    const result = await compareImage(Object, mockConfig, mockTestConfig);
    expect(result).toEqual({
      diffPath: '/src/__image_snapshots__/__differencified_output__/test.differencified.png',
      matched: false,
    });
    expect(mockError).toHaveBeenCalledWith(`mismatch found❗
      Result:
        distance: 0.02
        diff: 0
        misMatchThreshold: 0.01
    `);
  });

  it('throws error if distance and difference are above threshold', async () => {
    Jimp.distance.mockReturnValue(0.02);
    Jimp.diff.mockReturnValue({
      percent: 0.02,
      image: {
        write: jest.fn(),
      },
    });
    fs.existsSync.mockReturnValueOnce(true);
    const result = await compareImage(Object, mockConfig, mockTestConfig);
    expect(result).toEqual({
      diffPath: '/src/__image_snapshots__/__differencified_output__/test.differencified.png',
      matched: false,
    });
    expect(mockError).toHaveBeenCalledWith(`mismatch found❗
      Result:
        distance: 0.02
        diff: 0.02
        misMatchThreshold: 0.01
    `);
  });

  it('writes to disk diff image if saveDifferencifiedImage is true', async () => {
    Jimp.distance.mockReturnValue(0.02);
    fs.existsSync.mockReturnValueOnce(true);
    const mockWrite = jest.fn();
    Jimp.diff.mockReturnValue({
      percent: 0.02,
      image: {
        write: mockWrite,
      },
    });
    // eslint-disable-next-line prefer-object-spread/prefer-object-spread
    const result = await compareImage(
      Object,
      // eslint-disable-next-line prefer-object-spread/prefer-object-spread
      Object.assign({}, mockConfig, { saveDifferencifiedImage: true }),
      mockTestConfig,
    );
    expect(result).toEqual({
      diffPath: '/src/__image_snapshots__/__differencified_output__/test.differencified.png',
      matched: false,
    });
    expect(mockWrite)
      .toHaveBeenCalledWith('/src/__image_snapshots__/__differencified_output__/test.differencified.png');
  });
});
