import Jimp from 'jimp';
import logger from './logger';

const compareImage = async (options, testName) => {
  const referenceFile = `${options.screenshots}/${testName}.png`;
  const testFile = `${options.testReportPath}/${testName}.png`;

  let referenceImage;
  try {
    referenceImage = await Jimp.read(referenceFile);
  } catch (err) {
    throw new Error(`${testName}: failed to read reference image ${err}`);
  }

  let testImage;
  try {
    testImage = await Jimp.read(testFile);
  } catch (err) {
    throw new Error(`${testName}: failed to read test image ${err}`);
  }

  const distance = Jimp.distance(referenceImage, testImage);
  const diff = Jimp.diff(referenceImage, testImage, options.mismatchThreshold);
  if (distance < options.mismatchThreshold || diff.percent < options.mismatchThreshold) {
    return `${testName}: no mismatch found ✅`;
  }
  if (options.saveDifferencifiedImage) {
    const diffPath = `${options.testReportPath}/${testName}_differencified.png`;
    logger.log(`${testName}: Saving the diff image to disk at ${diffPath}`);
    diff.image.write(diffPath);
  }
  throw new Error(`${testName}: mismatch found❗
    Result:
      distance: ${distance}
      diff: ${diff.percent}
      misMatchThreshold: ${options.mismatchThreshold}
  `);
};

export default compareImage;
