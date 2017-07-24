import Jimp from 'jimp';
import compareImage from './compareImage';

const mockConfig = {
  screenshots: './screenshots',
  testReportPath: './differencify_report',
  saveDifferencifiedImage: false,
  mismatchThreshold: 0.01,
};

jest.mock('jimp', () => ({
  read: jest.fn(),
  distance: jest.fn(),
  diff: jest.fn(),
}));


jest.mock('./logger', () => ({
  log: jest.fn(),
}));

describe('Compare Image', () => {
  beforeEach(() => {
    Jimp.distance.mockReturnValue(0);
    Jimp.diff.mockReturnValue({ percent: 0 });
  });

  it('calls Jimp with correct image names', async () => {
    expect.assertions(2);
    await compareImage(mockConfig, 'test');
    expect(Jimp.read).toHaveBeenCalledWith('./differencify_report/test.png');
    expect(Jimp.read).toHaveBeenCalledWith('./screenshots/test.png');
  });

  it('throws correct error if it cannot read image', async () => {
    expect.assertions(2);
    Jimp.read
      .mockReturnValueOnce(Promise.reject('error1'))
      .mockReturnValueOnce(Promise.resolve())
      .mockReturnValueOnce(Promise.reject('error2'));

    try {
      await compareImage(mockConfig, 'test1');
    } catch (err) {
      expect(err.message).toEqual('test1: failed to read reference image error1');
    }

    try {
      expect(await compareImage(mockConfig, 'test2')).toThrow();
    } catch (err) {
      expect(err.message).toEqual('test2: failed to read test image error2');
    }
  });

  it('returns correct value if difference below threshold', async () => {
    const result = await compareImage(mockConfig, 'test');
    expect(result).toEqual('test: no mismatch found ✅');
  });

  it('returns correct value if only difference above threshold', async () => {
    Jimp.diff.mockReturnValue({ percent: 0.02 });

    const result = await compareImage(mockConfig, 'test');
    expect(result).toEqual('test: no mismatch found ✅');
  });

  it('returns correct value if only distance above threshold', async () => {
    Jimp.distance.mockReturnValue(0.02);

    const result = await compareImage(mockConfig, 'test');
    expect(result).toEqual('test: no mismatch found ✅');
  });

  it('throws error if distance and difference are above threshold', async () => {
    expect.assertions(1);
    Jimp.distance.mockReturnValue(0.02);
    Jimp.diff.mockReturnValue({ percent: 0.02 });

    try {
      await compareImage(mockConfig, 'test');
    } catch (err) {
      expect(err.message).toEqual(`test: mismatch found❗
    Result:
      distance: 0.02
      diff: 0.02
      misMatchThreshold: 0.01
  `);
    }
  });

  it('writes to disk diff image if saveDifferencifiedImage is true', async () => {
    expect.assertions(1);
    Jimp.distance.mockReturnValue(0.02);
    const mockWrite = jest.fn();
    Jimp.diff.mockReturnValue({
      percent: 0.02,
      image: {
        write: mockWrite,
      },
    });
    try {
      // eslint-disable-next-line prefer-object-spread/prefer-object-spread
      await compareImage(Object.assign({}, mockConfig, { saveDifferencifiedImage: true }), 'test');
    } catch (err) {
      expect(mockWrite).toHaveBeenCalledWith('./differencify_report/test_differencified.png');
    }
  });
});
