import sharp from 'sharp'
import { readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

const svgPath = join(publicDir, 'favicon.svg')
const svg = await readFile(svgPath)

const targets = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon.png', size: 32 },
  { name: 'favicon-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
]

for (const { name, size } of targets) {
  const out = join(publicDir, name)
  await sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out)
  console.log(`✓ ${name} (${size}x${size})`)
}

// Build favicon.ico from 16, 32, 48 layers
const icoSizes = [16, 32, 48]
const icoBuffers = await Promise.all(
  icoSizes.map((size) =>
    sharp(svg, { density: 384 })
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()
  )
)

// Minimal multi-image ICO encoder
function buildIco(pngBuffers) {
  const sizes = [16, 32, 48]
  const count = pngBuffers.length
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(count, 4)

  const dirEntries = []
  const imageData = []
  let offset = 6 + count * 16

  for (let i = 0; i < count; i++) {
    const png = pngBuffers[i]
    const size = sizes[i]
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size === 256 ? 0 : size, 0)
    entry.writeUInt8(size === 256 ? 0 : size, 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(png.length, 8)
    entry.writeUInt32LE(offset, 12)
    dirEntries.push(entry)
    imageData.push(png)
    offset += png.length
  }

  return Buffer.concat([header, ...dirEntries, ...imageData])
}

const ico = buildIco(icoBuffers)
await writeFile(join(publicDir, 'favicon.ico'), ico)
console.log(`✓ favicon.ico (multi-size: ${icoSizes.join(', ')})`)
