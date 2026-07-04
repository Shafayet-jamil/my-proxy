import sharp from 'sharp'
import { writeFileSync } from 'fs'

const sizes = [192, 512]
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a5b4fc"/>
      <stop offset="100%" stop-color="#4338ca"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="url(#g)"/>
  <text x="50" y="62" font-size="38" font-weight="800" fill="white" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" letter-spacing="-2" opacity="0.95">MP</text>
  <rect x="25" y="70" width="50" height="2.5" rx="1.25" fill="white" opacity="0.4"/>
</svg>`

for (const size of sizes) {
  const buf = await sharp(Buffer.from(svgIcon)).resize(size, size).png().toBuffer()
  writeFileSync(`public/icons/icon-${size}.png`, buf)
  console.log(`Created icon-${size}.png`)
}
