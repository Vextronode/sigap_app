import sharp from 'sharp'

const SRC = 'public/assets/image/lambang-kabupaten-pangandaran.webp'
const OUT = 'public/assets/icons'

const sizes = [
  { name: 'icon-192.png', size: 192, padding: 0 },
  { name: 'icon-512.png', size: 512, padding: 0 },
  { name: 'icon-512-maskable.png', size: 512, padding: 64 },
]

for (const { name, size, padding } of sizes) {
  const inner = size - padding * 2
  await sharp(SRC)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: padding, bottom: padding, left: padding, right: padding,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(`${OUT}/${name}`)
}

await sharp(SRC)
  .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile('public/favicon.png')
