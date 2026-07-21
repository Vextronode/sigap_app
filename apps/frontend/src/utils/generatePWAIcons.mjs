// scripts/generate-pwa-icons.mjs
import sharp from 'sharp'

const SRC = 'public/assets/image/Logo-SIGAP.png'
const OUT = 'public/assets/icons'

const sizes = [
  { name: 'icon-192.png', size: 192, padding: 0 },
  { name: 'icon-512.png', size: 512, padding: 0 },
  { name: 'icon-512-maskable.png', size: 512, padding: 64 }, // safe zone ~10-12%
]

for (const { name, size, padding } of sizes) {
  const inner = size - padding * 2
  await sharp(SRC)
    .resize(inner, inner, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .extend({
      top: padding, bottom: padding, left: padding, right: padding,
      background: { r: 15, g: 23, b: 42, alpha: 1 } // samakan dengan theme_color
    })
    .png()
    .toFile(`${OUT}/${name}`)
  console.log(`✓ ${name}`)
}