/* eslint-disable prefer-rest-params */
import logger from '../utils/logger';
import moduleList from './moduleList';

class ChainObject {
  constructor(target, options) {
    this.target = target;
    this.options = options;
    this.currentTarget = 'page';
    this.actions = [];
  }

  setCurrentTarget(currentTarget) {
    this.currentTarget = currentTarget;
  }

  addAction({
      property = undefined,
      args = undefined,
    } = {}) {
    this.actions.push({ property, args });
  }

  async end() {
    let result = null;
    let continueChain = false;
    const actions = this.actions;
    this.actions = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const action of actions) {
      if (continueChain) {
        result = await this.target.handleContinueFunc(result, action.property, action.args);
        continueChain = false;
      } else if (action.property === this.options.continueFunc) {
        continueChain = true;
      } else if (action.property === this.options.resultFunc) {
        result = await action.args.apply(null, [result]);
      } else {
        result = await this.target[this.options.funcHandler](this.currentTarget, action.property, action.args);
      }
    }
    return result;
  }
}

const makeHandler = (target, options) =>
  ({
    get: (chainObj, property) => {
      if (options.unchained) {
        return () =>
          this.target[this.options.funcHandler](this.currentTarget, property, arguments);
      }
      if (property === options.endFunc) {
        return () =>
          chainObj.end()
            .then(result => result)
            .catch((e) => {
              logger.error(e);
              throw e;
            });
      }
      if (property in moduleList) {
        return chainObj.setCurrentTarget(property);
      }
      return function handle() {
        chainObj.addAction({ property, args: arguments });
        return this;
      };
    },
    set: (chainObj, name, value) => {
      throw new Error(`You cannot set a ${value} to Proxy object.`);
    },
  });

const chainProxy = (target, unchained) => {
  const defaultParams = {
    resultFunc: 'result',
    endFunc: 'end',
    continueFunc: 'then',
    funcHandler: 'handleFunc',
    unchained,
  };
  const chainObject = new ChainObject(target, defaultParams);
  return new Proxy(
    chainObject,
    makeHandler(target, defaultParams),
  );
};

module.exports = chainProxy;
