import Jimp from 'jimp';
import logger from './logger';

const compareImage = async (options, testName, reporter) => {
  const prefixedLogger = logger.prefix(testName);
  const referenceFile = `${options.screenshots}/${testName}.png`;
  const testFile = `${options.testReportPath}/${testName}.png`;

  prefixedLogger.log(`comparing ${referenceFile} and ${testFile}`);

  let referenceImage;
  try {
    referenceImage = await Jimp.read(referenceFile);
  } catch (err) {
    throw new Error(`failed to read reference image ${err}`);
  }

  let testImage;
  try {
    testImage = await Jimp.read(testFile);
  } catch (err) {
    throw new Error(`failed to read test image ${err}`);
  }

  const distance = Jimp.distance(referenceImage, testImage);
  const diff = Jimp.diff(referenceImage, testImage, options.mismatchThreshold);
  if (distance < options.mismatchThreshold && diff.percent < options.mismatchThreshold) {
    const result = 'no mismatch found ✅';
    reporter.addResult({
      outcome: true,
      testName,
      result,
    });
    return result;
  }

  if (options.saveDifferencifiedImage) {
    try {
      const diffPath = `${options.testReportPath}/${testName}_differencified.png`;
      diff.image.write(diffPath);
      prefixedLogger.log(`saved the diff image to disk at ${diffPath}`);
    } catch (err) {
      throw new Error(`failed to save the diff image ${err}`);
    }
  }

  throw new Error(`mismatch found❗
    Result:
      distance: ${distance}
      diff: ${diff.percent}
      misMatchThreshold: ${options.mismatchThreshold}
  `);
};

export default compareImage;
