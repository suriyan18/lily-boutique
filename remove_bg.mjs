import Jimp from 'jimp';

const img = await Jimp.read('./public/logo.jpeg');
img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
  const r = this.bitmap.data[idx + 0];
  const g = this.bitmap.data[idx + 1];
  const b = this.bitmap.data[idx + 2];
  // Detect purple-ish pixels: high R and B, low G
  if ((r - g) > 30 && (b - g) > 30 && r < 180 && b < 220 && g < 80) {
    this.bitmap.data[idx + 3] = 0; // make transparent
  }
});
await img.write('./public/logo.png');
console.log('Done - logo.png saved');
