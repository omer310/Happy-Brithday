// Shared ambient scenery helpers reused across every location so the whole
// adventure feels like one continuous night rather than disconnected screens.

export const pixelRect = (ctx, x, y, width, height, color) => {
  ctx.fillStyle = color
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height))
}

export const drawSky = (ctx, world) => {
  const sky = ctx.createLinearGradient(0, 0, 0, world.height)
  sky.addColorStop(0, '#162438')
  sky.addColorStop(0.56, '#354764')
  sky.addColorStop(0.57, '#b06473')
  sky.addColorStop(1, '#2e2538')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, world.width, world.height)
}

export const drawStars = (ctx, world, t) => {
  for (let i = 0; i < 42; i += 1) {
    const x = (i * 83 + 23) % world.width
    const y = 24 + ((i * 47) % 224)
    const twinkle = 0.55 + Math.sin(t * 1.6 + i) * 0.3
    ctx.fillStyle = `rgba(255, 237, 179, ${Math.max(0.15, twinkle)})`
    const r = i % 5 === 0 ? 2 : 1
    ctx.fillRect(x - r, y, r * 2 + 1, 1)
    ctx.fillRect(x, y - r, 1, r * 2 + 1)
  }
}

export const drawMoon = (ctx) => {
  ctx.fillStyle = '#f7df9b'
  ctx.beginPath()
  ctx.arc(820, 92, 34, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1d2a41'
  ctx.beginPath()
  ctx.arc(836, 78, 34, 0, Math.PI * 2)
  ctx.fill()
}

export const drawSkyline = (ctx, world) => {
  ctx.fillStyle = '#26394d'
  ctx.fillRect(0, 238, world.width, 72)
  for (let x = 0; x < world.width; x += 52) {
    const height = 20 + ((x * 7) % 58)
    ctx.fillStyle = x % 3 === 0 ? '#223548' : '#2a4054'
    ctx.fillRect(x, 310 - height, 43, height)
    pixelRect(ctx, x + 8, 313 - height, 4, 5, '#e1b46d')
    pixelRect(ctx, x + 27, 320 - height, 4, 5, '#e1b46d')
  }
}

export const drawPalm = (ctx, x, y, scale, sway) => {
  pixelRect(ctx, x - 4 * scale, y - 88 * scale, 8 * scale, 90 * scale, '#542b39')
  pixelRect(ctx, x - 7 * scale, y - 62 * scale, 14 * scale, 7 * scale, '#6e3b42')
  ctx.fillStyle = '#1e3440'
  for (let i = 0; i < 7; i += 1) {
    const angle = (Math.PI * 2 * i) / 7 + sway
    ctx.save()
    ctx.translate(x, y - 88 * scale)
    ctx.rotate(angle)
    ctx.fillRect(0, -4 * scale, 43 * scale, 8 * scale)
    ctx.restore()
  }
  pixelRect(ctx, x - 6 * scale, y - 95 * scale, 12 * scale, 12 * scale, '#234452')
}

export const drawGround = (ctx, world) => {
  ctx.fillStyle = '#533c52'
  ctx.fillRect(0, 310, world.width, world.height - 310)
  for (let y = 324; y < world.height; y += 29) {
    for (let x = -20; x < world.width; x += 40) {
      const tileOn = (Math.floor((x + 20) / 40) + Math.floor((y - 324) / 29)) % 2 === 0
      ctx.fillStyle = tileOn ? '#68485b' : '#5c4054'
      ctx.fillRect(x + (Math.floor((y - 324) / 29) % 2 ? 20 : 0), y, 38, 27)
    }
  }
  ctx.fillStyle = '#7a5263'
  ctx.fillRect(0, 300, world.width, 12)
  for (let x = 0; x < world.width; x += 24) pixelRect(ctx, x + 4, 303, 9, 3, '#d49a7c')
}

export const drawLanternString = (ctx, world, t) => {
  ctx.strokeStyle = 'rgba(250, 206, 111, .85)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(28, 146)
  ctx.quadraticCurveTo(310, 208, 538, 148)
  ctx.quadraticCurveTo(738, 92, world.width - 26, 156)
  ctx.stroke()
  for (let i = 0; i < 11; i += 1) {
    const x = 58 + i * 84
    const y = 158 + Math.sin(i * 1.3) * 24
    const flicker = 0.14 + Math.abs(Math.sin(t * 3 + i * 2)) * 0.1
    ctx.fillStyle = i % 2 ? '#ed7f87' : '#f4ca75'
    ctx.fillRect(x - 5, y - 5, 10, 10)
    ctx.fillStyle = `rgba(255, 218, 126, ${flicker})`
    ctx.beginPath()
    ctx.arc(x, y, 15, 0, Math.PI * 2)
    ctx.fill()
  }
}

export const drawBackgroundWalkers = (ctx, world, t) => {
  for (let i = 0; i < 2; i += 1) {
    const speed = i === 0 ? 24 : -18
    const baseX = i === 0 ? -60 : world.width + 60
    const x = ((baseX + t * speed) % (world.width + 160) + world.width + 160) % (world.width + 160) - 80
    const y = 300
    const bob = Math.sin(t * 6 + i * 3) * 1.4
    ctx.fillStyle = 'rgba(20, 14, 26, .55)'
    pixelRect(ctx, x - 4, y - 20 + bob, 8, 14, 'rgba(20, 14, 26, .55)')
    pixelRect(ctx, x - 5, y - 24 + bob, 10, 6, 'rgba(20, 14, 26, .55)')
  }
}

export const drawAmbience = (ctx, world, t, options = {}) => {
  drawSky(ctx, world)
  drawStars(ctx, world, t)
  drawMoon(ctx)
  drawSkyline(ctx, world)
  drawPalm(ctx, 75, 344, 1.15, Math.sin(t * 0.6) * 0.02)
  drawPalm(ctx, world.width - 60, 335, 0.92, Math.sin(t * 0.6 + 1) * 0.02)
  drawGround(ctx, world)
  if (!options.skipLanterns) drawLanternString(ctx, world, t)
  drawBackgroundWalkers(ctx, world, t)
}
