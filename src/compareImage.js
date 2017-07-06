
import Jimp from 'jimp';
import logger from './logger';

const compareImage = (referencePath, testPath, misMatchThreshold, testName) =>
  new Promise((resolve, reject) => {
    const referenceFile = `${referencePath}/${testName}.png`;
    const testFile = `${testPath}/${testName}.png`;
    Jimp.read(referenceFile).then((referenceImage) => {
      Jimp.read(testFile).then((testImage) => {
        const distance = Jimp.distance(referenceImage, testImage);
        const diff = Jimp.diff(referenceImage, testImage, misMatchThreshold);
        logger.log('Writting the diff image to disk');
        if (distance < misMatchThreshold || diff.percent < misMatchThreshold) {
          return resolve('No mismatch found!');
        }
        diff.image.write(`${testPath}/${testName}_differencified.png`);
        logger.error(`Result ->  distance:${distance} diff:${diff.diff} misMatchThreshold:${misMatchThreshold}`);
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
