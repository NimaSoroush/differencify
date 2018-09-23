import check from 'check-types';

const functionToString = (func, ...args) => {
  if (!check.function(func)) {
    return null;
  }
  const funcArguments = [];
  args.forEach((value) => {
    if (check.string(value)) {
      funcArguments.push(`"${value}"`);
    } else {
      funcArguments.push(value);
    }
  });
  const functionSource = func.toString();
  return `(${functionSource})(${funcArguments.join()})`;
};

export default functionToString;
