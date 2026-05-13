// Generates PWA icon PNGs using only Node.js built-ins (no external deps).
// Run with: node client/scripts/gen-icons.js
const zlib = require('zlib')
const fs = require('fs')
const path = require('path')

function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (const byte of buf) {
    crc ^= byte
    for (let j = 0; j < 8; j++) crc = (crc & 1) ? (crc >>> 1) ^ 0xEDB88320 : (crc >>> 1)
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const len = Buffer.allocUnsafe(4)
  len.writeUInt32BE(data.length, 0)
  const crc = Buffer.allocUnsafe(4)
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0)
  return Buffer.concat([len, t, data, crc])
}

function toPNG(pixels, w, h) {
  const raw = Buffer.allocUnsafe(h * (1 + w * 4))
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0
    for (let x = 0; x < w; x++) {
      const s = (y * w + x) * 4
      const d = y * (1 + w * 4) + 1 + x * 4
      raw[d] = pixels[s]; raw[d+1] = pixels[s+1]; raw[d+2] = pixels[s+2]; raw[d+3] = pixels[s+3]
    }
  }
  const ihdr = Buffer.allocUnsafe(13)
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ])
}

function fillRect(px, w, h, x1, y1, x2, y2, r, g, b, a = 255) {
  for (let y = Math.max(0,y1); y < Math.min(h,y2); y++) {
    for (let x = Math.max(0,x1); x < Math.min(w,x2); x++) {
      const i = (y*w+x)*4
      px[i]=r; px[i+1]=g; px[i+2]=b; px[i+3]=a
    }
  }
}

function fillRoundRect(px, w, h, x1, y1, x2, y2, rx, r, g, b) {
  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      if (x < 0 || x >= w || y < 0 || y >= h) continue
      // corner test
      const inCorner =
        (x < x1+rx && y < y1+rx && (x-x1-rx)**2+(y-y1-rx)**2 > rx**2) ||
        (x > x2-rx-1 && y < y1+rx && (x-x2+rx+1)**2+(y-y1-rx)**2 > rx**2) ||
        (x < x1+rx && y > y2-rx-1 && (x-x1-rx)**2+(y-y2+rx+1)**2 > rx**2) ||
        (x > x2-rx-1 && y > y2-rx-1 && (x-x2+rx+1)**2+(y-y2+rx+1)**2 > rx**2)
      if (!inCorner) {
        const i = (y*w+x)*4
        px[i]=r; px[i+1]=g; px[i+2]=b; px[i+3]=255
      }
    }
  }
}

function drawIcon(size) {
  const px = new Uint8Array(size * size * 4)
  const s = size / 512

  // Background: dark #111111
  fillRoundRect(px, size, size, 0, 0, size, size, Math.round(60*s), 0x11, 0x11, 0x11)

  // Pot body fill #2e2e2e
  fillRoundRect(px, size, size,
    Math.round(116*s), Math.round(195*s),
    Math.round(396*s), Math.round(410*s),
    Math.round(18*s), 0x2e, 0x2e, 0x2e)

  // Pot body border: orange top edge
  fillRect(px, size, size,
    Math.round(116*s), Math.round(195*s),
    Math.round(396*s), Math.round(205*s),
    0xe0, 0xa0, 0x20)

  // Pot body border: orange left/right thin lines
  fillRect(px, size, size,
    Math.round(116*s), Math.round(195*s),
    Math.round(126*s), Math.round(410*s),
    0xe0, 0xa0, 0x20)
  fillRect(px, size, size,
    Math.round(386*s), Math.round(195*s),
    Math.round(396*s), Math.round(410*s),
    0xe0, 0xa0, 0x20)

  // Pot body border: orange bottom edge
  fillRect(px, size, size,
    Math.round(116*s), Math.round(400*s),
    Math.round(396*s), Math.round(410*s),
    0xe0, 0xa0, 0x20)

  // Left handle
  fillRoundRect(px, size, size,
    Math.round(68*s), Math.round(218*s),
    Math.round(120*s), Math.round(262*s),
    Math.round(10*s), 0x2e, 0x2e, 0x2e)
  fillRect(px, size, size,
    Math.round(68*s), Math.round(218*s),
    Math.round(120*s), Math.round(228*s),
    0xe0, 0xa0, 0x20)

  // Right handle
  fillRoundRect(px, size, size,
    Math.round(392*s), Math.round(218*s),
    Math.round(444*s), Math.round(262*s),
    Math.round(10*s), 0x2e, 0x2e, 0x2e)
  fillRect(px, size, size,
    Math.round(392*s), Math.round(218*s),
    Math.round(444*s), Math.round(228*s),
    0xe0, 0xa0, 0x20)

  // Lid
  fillRoundRect(px, size, size,
    Math.round(100*s), Math.round(160*s),
    Math.round(412*s), Math.round(200*s),
    Math.round(10*s), 0x3a, 0x3a, 0x3a)
  fillRect(px, size, size,
    Math.round(100*s), Math.round(160*s),
    Math.round(412*s), Math.round(170*s),
    0xe0, 0xa0, 0x20)

  // Lid knob
  fillRoundRect(px, size, size,
    Math.round(226*s), Math.round(130*s),
    Math.round(286*s), Math.round(163*s),
    Math.round(8*s), 0x3a, 0x3a, 0x3a)
  fillRect(px, size, size,
    Math.round(226*s), Math.round(130*s),
    Math.round(286*s), Math.round(138*s),
    0xe0, 0xa0, 0x20)

  // Steam dots above knob
  const steamXs = [180, 256, 332].map(x => Math.round(x*s))
  const steamR = Math.max(3, Math.round(6*s))
  for (const cx of steamXs) {
    for (let cy of [Math.round(90*s), Math.round(70*s)]) {
      for (let y = cy-steamR; y <= cy+steamR; y++) {
        for (let x = cx-steamR; x <= cx+steamR; x++) {
          if ((x-cx)**2+(y-cy)**2 <= steamR**2 && x>=0 && x<size && y>=0 && y<size) {
            const i=(y*size+x)*4
            px[i]=0xe0; px[i+1]=0xa0; px[i+2]=0x20; px[i+3]=180
          }
        }
      }
    }
  }

  return px
}

const publicDir = path.join(__dirname, '../public')
for (const size of [192, 512]) {
  const buf = toPNG(drawIcon(size), size, size)
  fs.writeFileSync(path.join(publicDir, `pwa-${size}x${size}.png`), buf)
  console.log(`✓ pwa-${size}x${size}.png`)
}
const apple = toPNG(drawIcon(180), 180, 180)
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), apple)
console.log('✓ apple-touch-icon.png')
