# cSpell:ignore fromarray
from PIL import Image
import numpy as np

img = Image.open('logo.jpeg').convert('RGBA')
data = np.array(img)

r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

# Mask purple-ish pixels (high R and B, low G)
mask = (r.astype(int) - g.astype(int) > 30) & (b.astype(int) - g.astype(int) > 30) & (r < 180) & (b < 220) & (g < 80)

data[mask, 3] = 0  # make transparent

Image.fromarray(data).save('logo.png', 'PNG')
print('Done - logo.png saved')
