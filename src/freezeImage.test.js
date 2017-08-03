import freezeImage from './freezeImage';

const replaceChild = jest.fn();
document.querySelector = jest.fn(() => ({
  tagName: 'IMG',
  parentNode: {
    replaceChild,
  },
}));

const drawImage = jest.fn();
const getContext = jest.fn(() => ({
  drawImage,
}));
document.createElement = jest.fn(() => ({
  className: 'class',
  getContext,
}));

describe('Freeze Image', () => {
  beforeEach(() => {
    document.querySelector.mockClear();
    document.createElement.mockClear();
  });

  it('calls document with correct value', () => {
    freezeImage('test');
    expect(document.querySelector).toHaveBeenCalledWith('test');
    expect(document.createElement).toHaveBeenCalledWith('canvas');
    expect(getContext).toHaveBeenCalledWith('2d');
    expect(drawImage).toHaveBeenCalledTimes(1);
    expect(replaceChild).toHaveBeenCalledTimes(1);
  });
});
