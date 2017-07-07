
import Jimp from 'jimp';
import logger from './logger';

const compareImage = (options, testName) =>
  new Promise((resolve, reject) => {
    const referenceFile = `${options.screenshots}/${testName}.png`;
    const testFile = `${options.testReportPath}/${testName}.png`;
    Jimp.read(referenceFile).then((referenceImage) => {
      Jimp.read(testFile).then((testImage) => {
        const distance = Jimp.distance(referenceImage, testImage);
        const diff = Jimp.diff(referenceImage, testImage, options.mismatchThreshold);
        if (distance < options.mismatchThreshold || diff.percent < options.mismatchThreshold) {
          return resolve('No mismatch found!');
        }
        if (options.saveDifferencifiedImage) {
          logger.log('Writting the diff image to disk');
          diff.image.write(`${options.testPath}/${testName}_differencified.png`);
        }
        logger.error(`Result ->  distance:${distance} diff:${diff.percent} 
          misMatchThreshold:${options.mismatchThreshold}`);
        return reject('Mismatch found!');
      }).catch((err) => {
        logger.error(err);
        return reject('Failed to read test image!');
      });
    }).catch((err) => {
      logger.error(err);
      return reject('Failed to read reference image!');
    });
  });

export default compareImage;
