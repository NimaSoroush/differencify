import Jimp from 'jimp';
import compareImage from './compareImage';

const mockConfig = {
  screenshots: './screenshots',
  testReports: './differencify_report',
  saveDifferencifiedImage: false,
  mismatchThreshold: 0.01,
};

jest.mock('jimp', () => ({
  read: jest.fn(),
  distance: jest.fn(),
  diff: jest.fn(),
}));

const mockLog = jest.fn();
const mockError = jest.fn();
jest.mock('./utils/logger', () => ({
  prefix: jest.fn(() => ({
    log: mockLog,
    error: mockError,
  })),
}));

describe('Compare Image', () => {
  beforeEach(() => {
    Jimp.distance.mockReturnValue(0);
    Jimp.diff.mockReturnValue({ percent: 0 });
  });

  it('calls Jimp with correct image names', async () => {
    expect.assertions(3);
    const result = await compareImage(mockConfig, 'test');
    expect(result).toEqual(true);
    expect(Jimp.read).toHaveBeenCalledWith('./differencify_report/test.png');
    expect(Jimp.read).toHaveBeenCalledWith('./screenshots/test.png');
  });

  it('throws correct error if it cannot read image', async () => {
    expect.assertions(2);
    Jimp.read
      .mockReturnValueOnce(Promise.reject('error1'));
    const result = await compareImage(mockConfig, 'test');
    expect(result).toEqual(false);
    expect(mockError).toHaveBeenCalledWith('failed to read reference image error1');
  });

  it('returns correct value if difference below threshold', async () => {
    expect.assertions(2);
    const result = await compareImage(mockConfig, 'test');
    expect(result).toEqual(true);
    expect(mockLog).toHaveBeenCalledWith('no mismatch found ✅');
  });

  it('returns mismatch found❗ if only difference above threshold', async () => {
    expect.assertions(2);
    Jimp.diff.mockReturnValue({ percent: 0.02 });
    const result = await compareImage(mockConfig, 'test');
    expect(result).toEqual(false);
    expect(mockError).toHaveBeenCalledWith(`mismatch found❗
    Result:
      distance: 0
      diff: 0.02
      misMatchThreshold: 0.01
  `);
  });

  it('returns mismatch found❗ if only distance above threshold', async () => {
    expect.assertions(2);
    Jimp.distance.mockReturnValue(0.02);
    const result = await compareImage(mockConfig, 'test');
    expect(result).toEqual(false);
    expect(mockError).toHaveBeenCalledWith(`mismatch found❗
    Result:
      distance: 0
      diff: 0.02
      misMatchThreshold: 0.01
  `);
  });

  it('throws error if distance and difference are above threshold', async () => {
    expect.assertions(2);
    Jimp.distance.mockReturnValue(0.02);
    Jimp.diff.mockReturnValue({ percent: 0.02 });
    const result = await compareImage(mockConfig, 'test');
    expect(result).toEqual(false);
    expect(mockError).toHaveBeenCalledWith(`mismatch found❗
    Result:
      distance: 0
      diff: 0.02
      misMatchThreshold: 0.01
  `);
  });

  it('writes to disk diff image if saveDifferencifiedImage is true', async () => {
    expect.assertions(2);
    Jimp.distance.mockReturnValue(0.02);
    const mockWrite = jest.fn();
    Jimp.diff.mockReturnValue({
      percent: 0.02,
      image: {
        write: mockWrite,
      },
    });
    // eslint-disable-next-line prefer-object-spread/prefer-object-spread
    const result = await compareImage(Object.assign({}, mockConfig, { saveDifferencifiedImage: true }), 'test');
    expect(result).toEqual(false);
    expect(mockWrite).toHaveBeenCalledWith('./differencify_report/test_differencified.png');
  });
});
