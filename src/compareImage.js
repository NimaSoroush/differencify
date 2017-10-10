import Jimp from 'jimp';
import logger from './utils/logger';

const compareImage = async (options, testName) => {
  const prefixedLogger = logger.prefix(testName);
  const referenceFile = `${options.screenshots}/${testName}.png`;
  const testFile = `${options.testReports}/${testName}.png`;

  prefixedLogger.log(`comparing ${referenceFile} and ${testFile}`);

  let referenceImage;
  try {
    referenceImage = await Jimp.read(referenceFile);
  } catch (err) {
    prefixedLogger.error(`failed to read reference image ${err}`);
    return false;
  }

  let testImage;
  try {
    testImage = await Jimp.read(testFile);
  } catch (err) {
    prefixedLogger.error(`failed to read test image ${err}`);
    return false;
  }

  const distance = Jimp.distance(referenceImage, testImage);
  const diff = Jimp.diff(referenceImage, testImage, options.mismatchThreshold);
  if (distance < options.mismatchThreshold && diff.percent < options.mismatchThreshold) {
    prefixedLogger.log('no mismatch found ✅');
    return true;
  }

  if (options.saveDifferencifiedImage) {
    try {
      const diffPath = `${options.testReports}/${testName}_differencified.png`;
      diff.image.write(diffPath);
      prefixedLogger.log(`saved the diff image to disk at ${diffPath}`);
    } catch (err) {
      prefixedLogger.error(`failed to save the diff image: ${err}`);
    }
  }

  prefixedLogger.error(`mismatch found❗
    Result:
      distance: ${distance}
      diff: ${diff.percent}
      misMatchThreshold: ${options.mismatchThreshold}
  `);
  return false;
};

export default compareImage;
