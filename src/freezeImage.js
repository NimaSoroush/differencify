const freezeImage = (selector) => {
  const image = document.querySelector(selector);
  if (image.tagName !== 'IMG') {
    return false;
  }
  const { className } = image;
  const canvas = document.createElement('canvas');
  canvas.className = className;
  const ctx = canvas.getContext('2d');
  image.parentNode.replaceChild(canvas, image);

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  if (image.attributes) {
    [...image.attributes].forEach(({ name, value }) => canvas.setAttribute(name, value));
  }
  return true;
};

export default freezeImage;
