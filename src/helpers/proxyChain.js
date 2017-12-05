/* eslint-disable prefer-rest-params */
import logger from '../utils/logger';
import moduleList from './moduleList';

let chainedObject;

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
      target = this.currentTarget,
      property = undefined,
      args = undefined,
    } = {}) {
    this.actions.push({ target, property, args });
  }

  async end() {
    let result = null;
    let continueChain = false;
    const actions = this.actions;
    this.actions = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const action of actions) {
      if (continueChain) {
        result = await this.target._handleContinueFunc(result, action.property, action.args);
        continueChain = false;
      } else if (action.property === this.options.continueFunc) {
        continueChain = true;
      } else if (action.property === this.options.resultFunc) {
        result = await action.args[0].apply(null, [result]);
      } else {
        result = await this.target[this.options.funcHandler](action.target, action.property, action.args);
      }
    }
    return result;
  }
}

// const handleUnchained = (target, property, args) => {
//   const result = target[options.funcHandler]('page', property, args);
//   console.log(result);
// }

const makeHandler = (target, options) =>
  ({
    get: (chainObj, property) => {
      if (options.unchained) {
        const result = target[options.funcHandler]('page', property, arguments);
        return moduleList.includes(property)
          ? result
          : () => result;
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
      if (moduleList.includes(property)) {
        chainObj.setCurrentTarget(property);
        return chainedObject;
      }
      if (property === options.continueFunc) {
        chainObj.addAction({ property });
        return chainedObject;
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

const chainProxy = (target, params) => {
  const chainObject = new ChainObject(target, params);
  return new Proxy(
    chainObject,
    makeHandler(target, params),
  );
};

const chain = (target, unchained) => {
  const defaultParams = {
    resultFunc: 'result',
    endFunc: 'end',
    continueFunc: 'then',
    funcHandler: '_handleFunc',
    unchained,
  };
  chainedObject = chainProxy(target, defaultParams);
  return chainedObject;
};

module.exports = chain;
