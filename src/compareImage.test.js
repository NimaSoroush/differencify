/* eslint-disable prefer-object-spread/prefer-object-spread */
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
  unlinkSync: jest.fn(),
}));

jest.mock('path', () => ({
  dirname: jest.fn(() => '/parent'),
  join: jest.fn((a, b) => `${a}/${b}`),
  resolve: jest.fn((a, b) => `${a}${b || ''}`),
}));

jest.mock('pkg-dir', () => ({
  sync: () => '',
}));

const mockLog = jest.fn();
const mockError = jest.fn();
const mockTrace = jest.fn();
jest.mock('./utils/logger', () => ({
  prefix: jest.fn(() => ({
    log: mockLog,
    error: mockError,
    trace: mockTrace,
  })),
}));

const mockConfig = {
  imageSnapshotPath: './differencify_report',
  imageSnapshotPathProvided: false,
  saveDifferencifiedImage: true,
  saveCurrentImage: true,
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
    fs.existsSync.mockClear();
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
      expect(fs.writeFileSync).toHaveBeenCalledWith('/parent/__image_snapshots__/test.snap.png', Object);
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
      expect(fs.writeFileSync).toHaveBeenCalledWith('/parent/__image_snapshots__/test.snap.png', Object);
    });
    it('respects to imageSnapshotPath when in jest mode', async () => {
      const newGlobalConfig = Object.assign({}, mockConfig,
        {
          imageSnapshotPath: './someImagePath',
          imageSnapshotPathProvided: true,
        });
      const result = await compareImage(Object, newGlobalConfig, {
        isUpdate: true,
        isJest: true,
        testName: 'test',
        testPath: '/src/test.js',
        imageType: 'png',
      });
      expect(result).toEqual({ updated: true });
      expect(fs.writeFileSync).toHaveBeenCalledWith('./someImagePath/test.snap.png', Object);
    });
  });

  describe('non-jest mode', () => {
    it('ًWill create image snapshot when there is no snapshot', async () => {
      const result = await compareImage(Object, mockConfig, {
        isUpdate: false,
        isJest: false,
        testName: 'test',
        imageType: 'png',
      });
      expect(result).toEqual({ added: true });
      expect(fs.writeFileSync)
        .toHaveBeenCalledWith(
          './differencify_report/__image_snapshots__/test.snap.png',
          Object,
        );
    });
    it('ًWill update snapshot when isUpdate=true', async () => {
      const result = await compareImage(Object, mockConfig, {
        isUpdate: true,
        isJest: false,
        testName: 'test',
        imageType: 'png',
      });
      expect(result).toEqual({ updated: true });
      expect(fs.writeFileSync)
        .toHaveBeenCalledWith(
          './differencify_report/__image_snapshots__/test.snap.png',
          Object,
        );
    });
  });

  it('throws correct error if it cannot read image', async () => {
    expect.assertions(3);
    Jimp.read.mockReturnValueOnce(Promise.reject(new Error('error1')));
    fs.existsSync.mockReturnValue(true);
    const result = await compareImage(Object, mockConfig, mockTestConfig);
    expect(result).toEqual({
      error: 'failed to read reference image',
      matched: false,
    });
    expect(mockTrace).toHaveBeenCalledWith(new Error('error1'));
    expect(mockError).toHaveBeenCalledWith('failed to read reference image: /parent/__image_snapshots__/test.snap.png');
  });

  it('returns correct value if difference below threshold', async () => {
    expect.assertions(2);
    fs.existsSync.mockReturnValueOnce(true);
    const result = await compareImage(Object, mockConfig, mockTestConfig);
    expect(result).toEqual({
      diffPercent: 0,
      distance: 0,
      matched: true,
      snapshotPath: '/parent/__image_snapshots__/test.snap.png',
    });
    expect(mockLog).toHaveBeenCalledWith('no mismatch found ✅');
  });

  it('returns mismatch found❗ if only difference above threshold', async () => {
    Jimp.diff.mockReturnValue({
      percent: 0.02,
      image: {
        write: jest.fn((path, cb) => {
          cb();
        }),
      },
    });
    fs.existsSync.mockReturnValueOnce(true);
    const result = await compareImage(Object, mockConfig, mockTestConfig);
    expect(result).toEqual({
      diffPath: '/parent/__image_snapshots__/__differencified_output__/test.differencified.png',
      matched: false,
      diffPercent: 0.02,
      distance: 0,
      snapshotPath: '/parent/__image_snapshots__/test.snap.png',
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
        write: jest.fn((path, cb) => {
          cb();
        }),
      },
    });
    fs.existsSync.mockReturnValueOnce(true);
    const result = await compareImage(Object, mockConfig, mockTestConfig);
    expect(result).toEqual({
      diffPath: '/parent/__image_snapshots__/__differencified_output__/test.differencified.png',
      matched: false,
      diffPercent: 0,
      distance: 0.02,
      snapshotPath: '/parent/__image_snapshots__/test.snap.png',
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
        write: jest.fn((path, cb) => {
          cb();
        }),
      },
    });
    fs.existsSync.mockReturnValueOnce(true);
    const result = await compareImage(Object, mockConfig, mockTestConfig);
    expect(result).toEqual({
      diffPath: '/parent/__image_snapshots__/__differencified_output__/test.differencified.png',
      matched: false,
      diffPercent: 0.02,
      distance: 0.02,
      snapshotPath: '/parent/__image_snapshots__/test.snap.png',
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
    fs.existsSync.mockReturnValue(true);
    const mockWrite = jest.fn((path, cb) => {
      cb();
    });
    Jimp.diff.mockReturnValue({
      percent: 0.02,
      image: {
        write: mockWrite,
      },
    });
    const result = await compareImage(
      Object,
      Object.assign({}, mockConfig, { saveDifferencifiedImage: true }),
      mockTestConfig,
    );
    expect(result).toEqual({
      diffPath: '/parent/__image_snapshots__/__differencified_output__/test.differencified.png',
      matched: false,
      diffPercent: 0.02,
      distance: 0.02,
      snapshotPath: '/parent/__image_snapshots__/test.snap.png',
    });
    expect(mockWrite)
      .toHaveBeenCalledWith('/parent/__image_snapshots__/__differencified_output__/test.differencified.png',
        expect.any(Function));
  });
});
