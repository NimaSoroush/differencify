/* eslint-disable no-console */
import chalk from 'chalk';

class PrefixedLogger {
  constructor(logger, prefix) {
    this.logger = logger;
    this.prefix = chalk.cyan(`${prefix}:`);
  }

  enable() {
    this.logger.enable();
  }

  log(...args) {
    this.logger.log(this.prefix, ...args);
  }

  warn(...args) {
    this.logger.warn(this.prefix, ...args);
  }

  trace(...args) {
    this.logger.trace(this.prefix, ...args);
  }

  error(...args) {
    this.logger.error(this.prefix, ...args);
  }
}

class Logger {
  constructor() {
    if (!Logger.instance) {
      Logger.instance = this;
      this.enabled = false;
    }
    return Logger.instance;
  }

  prefix(prefix) {
    return new PrefixedLogger(this, prefix);
  }

  enable() {
    this.enabled = true;
  }

  static getTime() {
    return chalk.inverse(new Date().toLocaleTimeString());
  }

  log(...args) {
    if (this.enabled) {
      console.log(Logger.getTime(), ...args);
    }
  }

  warn(...args) {
    if (this.enabled) {
      console.warn(Logger.getTime(), ...args);
    }
  }

  trace(...args) {
    if (this.enabled) {
      console.trace(Logger.getTime(), ...args);
    }
  }

  error(...args) {
    if (this.enabled) {
      console.error(Logger.getTime(), chalk.red(...args));
    }
  }
}

const instance = new Logger();

export default instance;
