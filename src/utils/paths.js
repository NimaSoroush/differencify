import path from 'path';
import pkgDir from 'pkg-dir';
import fs from 'fs';

const getTestRoot = (testConfig, globalConfig) => {
  let testRoot;
  if (testConfig.isJest) {
    testRoot = path.dirname(testConfig.testPath);
  } else {
    testRoot = path.resolve(pkgDir.sync(), globalConfig.imageSnapshotPath);
  }
  if (!fs.existsSync(testRoot)) {
    fs.mkdirSync(testRoot);
  }
  return testRoot;
};

export const getSnapshotsDir = (testConfig, globalConfig) => path.join(
  getTestRoot(testConfig, globalConfig),
  '__image_snapshots__',
);

export const getDiffDir = snapshotsDir => path.join(snapshotsDir, '__differencified_output__');

export const getSnapshotPath = (snapshotsDir, testConfig) => {
  if (!snapshotsDir || !testConfig) {
    throw new Error('Incorrect arguments passed to getSnapshotPath');
  }
  return path.join(snapshotsDir, `${testConfig.testName}.snap.${testConfig.imageType || 'png'}`);
};

export const getDiffPath = (diffDir, testConfig) => {
  if (!diffDir || !testConfig) {
    throw new Error('Incorrect arguments passed to getDiffPath');
  }
  return path.join(diffDir, `${testConfig.testName}.differencified.${testConfig.imageType || 'png'}`);
};

export const getCurrentImageDir = snapshotsDir => path.join(snapshotsDir, '__current_output__');

export const getCurrentImagePath = (currentImageDir, testConfig) => {
  if (!currentImageDir || !testConfig) {
    throw new Error('Incorrect arguments passed to getDiffPath');
  }
  return path.join(currentImageDir, `${testConfig.testName}.current.${testConfig.imageType || 'png'}`);
};
