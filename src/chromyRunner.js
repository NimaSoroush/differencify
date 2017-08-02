import fs from 'fs';
import check from 'check-types';
import logger from './logger';
import compareImage from './compareImage';
import { chromyActions } from './actions';
import { configTypes } from './defaultConfig';

const run = async (chromy, options, test) => {
  const prefixedLogger = logger.prefix(test.name);
  test.steps.reduce(async (promise, action) => {
    await promise;
    try {
      return await chromyActions[action.name](chromy, options, test.name, test.type, action.value, prefixedLogger);
    } catch (error) {
      return false;
    }
  }, Promise.resolve());
  return true;
};

export default run;
