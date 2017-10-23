import Jimp from 'jimp';
import path from 'path';
import fs from 'fs';
import logger from './utils/logger';

const compareImage = async (capturedImage, globalConfig, testConfig) => {
  const prefixedLogger = logger.prefix(testConfig.testName);
  let testRoot;
  if (testConfig.isJest) {
    testRoot = path.dirname(testConfig.testPath);
  } else {
    const rootPath = path.join(__dirname, '../');
    testRoot = path.resolve(__dirname, rootPath, globalConfig.imageSnapshotPath);
    if (!fs.existsSync(testRoot)) {
      fs.mkdirSync(testRoot);
    }
  }

  const snapshotsDir = path.join(testRoot, '__image_snapshots__');
  const snapshotPath = path.join(snapshotsDir, `${testConfig.testName}.snap.${testConfig.imageType}`);

  const diffDir = path.join(snapshotsDir, '__differencified_output__');
  const diffPath = path.join(diffDir, `${testConfig.testName}.differencified.${testConfig.imageType}`);
  if (fs.existsSync(snapshotPath) && !testConfig.isUpdate) {
    let snapshotImage;
    try {
      snapshotImage = await Jimp.read(snapshotPath);
    } catch (err) {
      prefixedLogger.error(`failed to read reference image ${err}`);
      return { matched: false };
    }
    let testImage;
    try {
      testImage = await Jimp.read(capturedImage);
    } catch (err) {
      prefixedLogger.error(`failed to read test image ${err}`);
      return { matched: false };
    }
    prefixedLogger.log('comparing...');
    const distance = Jimp.distance(snapshotImage, testImage);
    const diff = Jimp.diff(snapshotImage, testImage, globalConfig.mismatchThreshold);
    if (distance < globalConfig.mismatchThreshold && diff.percent < globalConfig.mismatchThreshold) {
      prefixedLogger.log('no mismatch found ✅');
      return { matched: true };
    }
    if (globalConfig.saveDifferencifiedImage) {
      try {
        if (!fs.existsSync(diffDir)) {
          fs.mkdirSync(diffDir);
        }
        if (fs.existsSync(diffPath)) {
          fs.unlinkSync(diffPath);
        }
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
        misMatchThreshold: ${globalConfig.mismatchThreshold}
    `);
    return { diffPath, matched: false };
  }
  prefixedLogger.log(`screenshot saved in -> ${snapshotPath}`);
  if (fs.existsSync(diffPath)) {
    fs.unlinkSync(diffPath);
  }
  if (!fs.existsSync(snapshotsDir)) {
    fs.mkdirSync(snapshotsDir);
  }
  fs.writeFileSync(snapshotPath, capturedImage);
  return testConfig.isUpdate ? { updated: true } : { added: true };
};

export default compareImage;
