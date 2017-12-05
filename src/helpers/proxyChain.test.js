import { isFunc, handleAsyncFunc } from './functions';
import chain from './proxyChain';

class Keyboard {
  constructor() {
    this._value = 'keyboard';
  }
  value() {
    return this._value;
  }
}

class Mouse {
  constructor() {
    this._value = 'mouse';
  }
  async value() {
    return this._value;
  }
}

class Page {
  constructor() {
    this.keyboard = new Keyboard();
    this.mouse = new Mouse();
  }
}

class Fake {
  constructor(value) {
    this._value = value;
    this.page = new Page();
  }
  async bar() {
    const newValue = this._value += '4';
    return newValue;
  }
}

class ForTest {
  constructor() {
    this._value = '';
    this.page = new Page();
  }

  value() {
    return this._value;
  }

  _evaluateResult() { return this._value; }
  // eslint-disable-next-line class-methods-use-this
  async _handleContinueFunc(target, property, args) {
    return isFunc(target[property]) ? await target[property](...args) : await target[property];
  }

  _handleFunc(target, property, args) {
    if (target === 'page') {
      if (this[property]) {
        return isFunc(this[property]) ? handleAsyncFunc(this, property, args) : this[property];
      }
      return isFunc(this.page[property]) ? handleAsyncFunc(this.page, property, args) : this.page[property];
    }
    return isFunc(this.page[target][property])
      ? handleAsyncFunc(this.page[target], property, args)
      : this.page[target][property];
  }

  async echo(text) {
    this.dummy = null;
    return text;
  }

  getValue(number) { this._value += number; return this._value; }

  f1() {
    return this.getValue('1');
  }
  f2() {
    return this.getValue('2');
  }
  f3() {
    return this.getValue('3');
  }

  f4() {
    const fake = new Fake(this._value);
    return fake;
  }

  async throwError() {
    this.dummy = null;
    throw new Error('error');
  }
}

describe('chainProxy', () => {
  it('add chain interface', async () => {
    const obj = chain(new ForTest());
    await obj
      .f1()
      .f2()
      .f3()
      .value()
      .end()
      .then((value) => {
        expect(value).toEqual('123');
      });
  });
  it('add chain interface.(reverse)', async () => {
    const obj = chain(new ForTest());
    await obj
      .f3()
      .f2()
      .f1()
      .value()
      .end()
      .then((value) => {
        expect(value).toEqual('321');
      });
  });
  it('removes all actions if occurred an exception.', async () => {
    const obj = chain(new ForTest());
    await obj
      .f1()
      .throwError()
      .f2()
      .end()
      .then(() => {
        throw (new Error('error'));
      })
      .catch(() => {
        obj
        .f3()
        .end()
        .then((result) => {
          expect(result).toEqual('13');
        })
        .catch((e) => {
          throw (e);
        });
      });
  });
  describe('#result', () => {
    it('receive last return value', async () => {
      const obj = chain(new ForTest());
      let result = null;
      await obj
        .echo('AAA')
        .result((v) => { result = v; })
        .end()
        .then(() => {
          expect(result).toEqual('AAA');
        });
    });
    it('result function', async () => {
      const obj = chain(new ForTest());
      let result = null;
      await obj
        .echo('AAA')
        .result((v) => { result = v; })
        .end()
        .then(() => {
          expect(result).toEqual('AAA');
        });
    });
  });
  describe('#then', () => {
    it('continues to current target.', async () => {
      const obj = chain(new ForTest());
      await obj
        .f1()
        .f4()
          .then
          .bar()
        .end()
        .then((result) => {
          expect(result).toEqual('14');
        });
    });
    it('will switch to main target after continues to current target.', async () => {
      const obj = chain(new ForTest());
      await obj
        .f1()
        .f4()
          .then
          .bar()
        .f2()
        .end()
        .then((result) => {
          expect(result).toEqual('12');
        });
    });
  });
  describe('subModules', () => {
    it('continues to current target.', async () => {
      const obj = chain(new ForTest());
      await obj
        .f1()
        .f4()
        .keyboard
          .value()
        .end()
        .then((result) => {
          expect(result).toEqual('keyboard');
        });
    });
    it('continues to another target.', async () => {
      const obj = chain(new ForTest());
      await obj
        .f1()
        .keyboard
          .value()
        .page
          .f4()
            .then
            .bar()
          .mouse
            .value()
        .end()
        .then((result) => {
          expect(result).toEqual('mouse');
        });
    });
    it('continues to another target and get result.', async () => {
      const obj = chain(new ForTest());
      await obj
        .f1()
        .keyboard
          .value()
        .page
          .f4()
            .then
            .bar()
            .result((result) => { expect(result).toEqual('14'); })
          .mouse
            .value()
        .end()
        .then((result) => {
          expect(result).toEqual('mouse');
        });
    });
  });
  describe('unchained', () => {
    it('will work unchained', async () => {
      const obj = chain(new ForTest(), true);
      const value = await obj.f1();
      expect(value).toEqual('1');
    });
    it('will work with complex scenarios', async () => {
      const obj = chain(new ForTest(), true);
      const value = await obj.f1();
      const keyboardValue = await obj.keyboard.value();
      expect(value).toEqual('1');
      expect(keyboardValue).toEqual('keyboard');
    });
  });
});
