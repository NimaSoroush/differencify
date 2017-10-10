/* eslint-disable prefer-rest-params */
import logger from '../utils/logger';

const RESULT_FUNCTION_NAME = '___RESULT_FUNCTION';

class ChainObject {
  constructor(target, options) {
    this.target = target;
    this.options = options;
    this.actions = [];
  }

  addAction(name, args) {
    this.actions.push({ name, args });
  }

  async end() {
    let result = null;
    const actions = this.actions;
    this.actions = [];
    try {
      // eslint-disable-next-line no-restricted-syntax
      for (const action of actions) {
        if (RESULT_FUNCTION_NAME === action.name) {
          result = await action.args[0].apply(null, [result]);
        } else {
          result = await this.target[action.name](...action.args);
        }
      }
    } catch (e) {
      logger.error(e);
      throw e;
    }
    return result;
  }
}

const makeHandler = (target, options) =>
  ({
    get: (chainObj, name) => {
      if (name === options.endFuncName) {
        return () => {
          if (!options.isUpdate) {
            chainObj.addAction(options.updateFunctionName, arguments);
          }
          return chainObj.end(chainObj, arguments)
            .then(result => result)
            .catch((e) => {
              logger.error(e);
              throw e;
            });
        };
      } else if (name === options.resultFuncName) {
        return function handle() {
          chainObj.addAction(RESULT_FUNCTION_NAME, arguments);
          return this;
        };
      } else if (name === 'target') {
        return target;
      } else if (typeof (target[name]) === 'function') {
        return function handle() {
          chainObj.addAction(name, arguments);
          return this;
        };
      } else if (name in target) {
        return target[name];
      }
      throw new Error(`'${name}' is not defined on a target object.`);
    },
    set: (chainObj, name, value) => {
      throw new Error(`You cannot set a ${value} to Proxy object.`);
    },
  });

const chainProxy = (target, isUpdate = false) => {
  const defaultParams = {
    resultFuncName: 'result',
    endFuncName: 'end',
    isUpdate,
    updateFunctionName: '_compareImage',
  };
  const chainObject = new ChainObject(target, defaultParams);
  return new Proxy(
    chainObject,
    makeHandler(target, defaultParams),
  );
};

module.exports = chainProxy;
