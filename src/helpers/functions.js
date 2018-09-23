const isFunc = property => (typeof (property) === 'function');
const handleAsyncFunc = async (target, property, args) => (args ? target[property](...args) : target[property]());

export { isFunc, handleAsyncFunc };
