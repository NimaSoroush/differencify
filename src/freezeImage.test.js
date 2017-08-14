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
    drawImage.mockClear();
    replaceChild.mockClear();
  });

  it('calls document with correct value', () => {
    const result = freezeImage('selector');
    expect(result).toEqual(true);
    expect(document.querySelector).toHaveBeenCalledWith('selector');
    expect(document.createElement).toHaveBeenCalledWith('canvas');
    expect(getContext).toHaveBeenCalledWith('2d');
    expect(drawImage).toHaveBeenCalledTimes(1);
    expect(replaceChild).toHaveBeenCalledTimes(1);
  });

  it('returns false with non IMG tags', () => {
    document.querySelector.mockReturnValueOnce({ tagName: 'DIV' });
    const result = freezeImage('selector');
    expect(result).toEqual(false);
  });
});
