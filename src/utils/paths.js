import path from 'path';

export const getSnapshotsDir = rootPath =>
  path.join(rootPath, '__image_snapshots__');

export const getDiffDir = rootPath =>
  path.join(getSnapshotsDir(rootPath), '__differencified_output__');

export const getSnapshotPath = (rootPath, testName, imageType = 'png') => {
  if (!rootPath || !testName || !imageType) {
    throw new Error('Incorrect arguments passed to getSnapshotPath');
  }
  return path.join(getSnapshotsDir(rootPath), `${testName}.snap.${imageType}`);
}

export const getDiffPath = (rootPath, testName, imageType = 'png') => {
  if (!rootPath || !testName || !imageType) {
    throw new Error('Incorrect arguments passed to getDiffPath');
  }
  return path.join(getDiffDir(rootPath), `${testName}.differencified.${imageType}`);
}
