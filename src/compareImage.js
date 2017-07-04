
import Jimp from 'jimp';
import logger from './logger';
import { testReportStep } from './defaultConfig';

const compareImage = (referencePath, testPath, misMatchThreshold) =>
  new Promise((resolve, reject) => {
    Jimp.read(referencePath).then((referenceImage) => {
      Jimp.read(testPath).then((testImage) => {
        const distance = Jimp.distance(referenceImage, testImage);
        const diff = Jimp.diff(referenceImage, testImage, misMatchThreshold);
        logger.log('Writting the diff image to disk');
        diff.image.write(`${testReportStep.value}/differencified.png`);
        if (distance < misMatchThreshold || diff.percent < misMatchThreshold) {
          return resolve('No mismatch found!');
        }
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
