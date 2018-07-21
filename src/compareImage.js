import Jimp from 'jimp';
import path from 'path';
import fs from 'fs';
import logger from './utils/logger';

const saveDiff = (diff, diffPath) => new Promise((resolve, reject) => {
  const cb = (error, obj) => {
    if (error) {
      reject(error);
    }
    resolve(obj);
  };
  diff.image.write(diffPath, cb);
});

const getSnapshotsDir = (testConfig, globalConfig) => {
  let testRoot;
  if (testConfig.isJest) {
    testRoot = path.dirname(testConfig.testPath);
  } else {
    testRoot = path.resolve(globalConfig.imageSnapshotPath);
    if (!fs.existsSync(testRoot)) {
      fs.mkdirSync(testRoot);
    }
  }
  return path.join(testRoot, '__image_snapshots__');
};

const compareImage = async (capturedImage, globalConfig, testConfig) => {
  const prefixedLogger = logger.prefix(testConfig.testName);

  const snapshotsDir = globalConfig.imageSnapshotPathProvided
    ? path.resolve(globalConfig.imageSnapshotPath)
    : getSnapshotsDir(testConfig, globalConfig);

  const snapshotPath = path.join(snapshotsDir, `${testConfig.testName}.snap.${testConfig.imageType || 'png'}`);

  const diffDir = path.join(snapshotsDir, '__differencified_output__');
  const diffPath = path.join(diffDir, `${testConfig.testName}.differencified.${testConfig.imageType || 'png'}`);
  if (fs.existsSync(snapshotPath) && !testConfig.isUpdate) {
    let snapshotImage;
    try {
      snapshotImage = await Jimp.read(snapshotPath);
    } catch (error) {
      prefixedLogger.error(`failed to read reference image: ${snapshotPath}`);
      prefixedLogger.trace(error);
      return { error: 'Failed to read reference image', matched: false };
    }
    let testImage;
    try {
      testImage = await Jimp.read(capturedImage);
    } catch (error) {
      prefixedLogger.error('failed to read current screenshot image');
      prefixedLogger.trace(error);
      return { error: 'Failed to read current screenshot image', matched: false };
    }
    prefixedLogger.log('comparing...');
    const distance = Jimp.distance(snapshotImage, testImage);
    const diff = Jimp.diff(snapshotImage, testImage, globalConfig.mismatchThreshold);
    if (distance < globalConfig.mismatchThreshold && diff.percent < globalConfig.mismatchThreshold) {
      prefixedLogger.log('no mismatch found ✅');
      return {
        snapshotPath, distance, diffPercent: diff.percent, matched: true,
      };
    }
    if (globalConfig.saveDifferencifiedImage) {
      try {
        if (!fs.existsSync(diffDir)) {
          fs.mkdirSync(diffDir);
        }
        if (fs.existsSync(diffPath)) {
          fs.unlinkSync(diffPath);
        }
        await saveDiff(diff, diffPath);
        prefixedLogger.log(`saved the diff image to disk at ${diffPath}`);
      } catch (error) {
        prefixedLogger.error(`failed to save the diff image: ${diffPath}`);
        prefixedLogger.trace(error);
      }
    }

    prefixedLogger.error(`mismatch found❗
      Result:
        distance: ${distance}
        diff: ${diff.percent}
        misMatchThreshold: ${globalConfig.mismatchThreshold}
    `);
    return {
      snapshotPath, distance, diffPercent: diff.percent, diffPath, matched: false,
    };
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
