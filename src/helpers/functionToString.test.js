import functionToString from './functionToString';

const foo = function foo(a, b, c) { return a + b + c; };

describe('functionToString', () => {
  it('Convert function to string with right arguments', () => {
    const strFunc = functionToString(foo, 1, 2, '3');
    expect(strFunc).toEqual(`(function foo(a, b, c) {
  return a + b + c;
})(1,2,"3")`);
    expect(eval(strFunc)).toEqual('33'); // eslint-disable-line no-eval
  });
  it('Convert function to string with no arguments', () => {
    const strFunc = functionToString(foo);
    expect(strFunc).toEqual(`(function foo(a, b, c) {
  return a + b + c;
})()`);
    expect(eval(strFunc)).toEqual(NaN); // eslint-disable-line no-eval
  });
  it('Return null if non function passed', () => {
    const strFunc = functionToString('function');
    expect(strFunc).toEqual(null);
  });
});
