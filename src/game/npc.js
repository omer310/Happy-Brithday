import { ROWS, FRAME_COUNTS } from './constants'
import { drawShadow } from './character'

const IDLE_FRAME_SECONDS = 0.55

// Shopkeepers now use the sheet's own idle frames (a subtle two-pose
// breathing loop) and a grounded shadow shared with the player, instead of
// a vertical sine bob that left the shadow behind on every beat.
export const drawNpc = (ctx, image, pos, t, direction = 2) => {
  if (!image?.complete || image.naturalWidth === 0) return
  const cell = 64
  const idleFrame = Math.floor((t + pos.x * 0.013) / IDLE_FRAME_SECONDS) % FRAME_COUNTS.IDLE
  const row = ROWS.IDLE + direction

  drawShadow(ctx, pos.x, pos.y + 6, { width: 34, opacity: 0.22 })

  ctx.save()
  ctx.translate(Math.round(pos.x - 24), Math.round(pos.y - 54))
  ctx.drawImage(image, idleFrame * cell, row * cell, cell, cell, 0, 0, cell, cell)
  ctx.restore()
}
