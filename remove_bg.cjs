const { Jimp } = require('jimp');

(async () => {
  const img = await Jimp.read('./public/logo.jpeg');
  const { width, height } = img.bitmap;

  // The silhouette is on the left ~35% of the image
  const cropWidth = Math.floor(width * 0.35);
  img.crop({ x: 0, y: 0, w: cropWidth, h: height });

  // Remove purple background
  const { data } = img.bitmap;
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      if ((r - g) > 30 && (b - g) > 30 && r < 190 && b < 230 && g < 90) {
        data[idx + 3] = 0;
      }
    }
  }

  await img.write('./public/logo.png');
  console.log('Done - logo.png saved (silhouette only)');
})();
