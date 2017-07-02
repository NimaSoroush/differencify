/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
class Logger {
  constructor() {
    if (!Logger.instance) {
      Logger.instance = this;
      this.enabled = false;
    }
    return Logger.instance;
  }

  enable() {
    this.enabled = true;
  }

  log(...args) {
    if (this.enabled) {
      console.log(...args);
    }
  }

  warn(...args) {
    if (this.enabled) {
      console.warn(...args);
    }
  }

  error(...args) {
    if (this.enabled) {
      console.error(...args);
    }
  }
}

const instance = new Logger();

export default instance;
