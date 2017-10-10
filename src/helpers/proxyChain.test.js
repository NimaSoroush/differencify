const chainProxy = require('./proxyChain');

class ForTest {
  constructor() {
    this._value = '';
  }
  value() {
    return this._value;
  }

  _compareImage() { return this._value; }

  async echo(text) {
    this.dummy = null;
    return text;
  }
  async f1() {
    this._value += '1';
  }
  async f2() {
    this._value += '2';
  }
  async f3() {
    this._value += '3';
  }
  async throwError() {
    this.dummy = null;
    throw new Error('error');
  }
}

describe('chainProxy', () => {
  it('add chain interface', async () => {
    const obj = chainProxy(new ForTest());
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
    const obj = chainProxy(new ForTest());
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
  describe('#result', () => {
    it('receive last return value', async () => {
      const obj = chainProxy(new ForTest());
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
  it('result function', async () => {
    const obj = chainProxy(new ForTest());
    let result = null;
    await obj
      .echo('AAA')
      .result((v) => { result = v; })
      .end()
      .then(() => {
        expect(result).toEqual('AAA');
      });
  });
  it('returns target', () => {
    const target = new ForTest();
    target.v = 100;
    const obj = chainProxy(target);
    expect(obj.target.v).toEqual(100);
  });
  it('removes all actions if occurred an exception.', async () => {
    const obj = chainProxy(new ForTest());
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
        .end()
        .then(() => {
          expect(obj.target.value()).toEqual('1');
        })
        .catch((e) => {
          throw (e);
        });
      });
  });
});
