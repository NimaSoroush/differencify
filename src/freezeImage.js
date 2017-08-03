const freezeImage = (selector) => {
  const image = document.querySelector(selector);
  if (image.tagName !== 'IMG') {
    return false;
  }
  const className = image.className;
  const canvas = document.createElement('canvas');
  canvas.className = className;
  const context = canvas.getContext('2d');
  image.parentNode.replaceChild(canvas, image);

  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0);
  return true;
};

export default freezeImage;
