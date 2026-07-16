import { ROWS, FRAME_COUNTS } from './constants'

export const createCharacterState = (x, y, direction = 2) => ({
  x,
  y,
  direction,
  mode: 'idle',
  frame: 0,
  timer: 0,
  idleFrame: 0,
  idleTimer: 0,
})

// Moves a character by (dx, dy) at `speed` px/sec, updating its walk frame.
// Returns whether it actually moved this tick.
export const stepWalk = (state, dx, dy, speed, delta, bounds) => {
  const moving = Boolean(dx || dy)
  if (moving) {
    const length = Math.hypot(dx, dy)
    if (dx < 0) state.direction = 1
    else if (dx > 0) state.direction = 3
    if (dy < 0) state.direction = 0
    else if (dy > 0) state.direction = 2
    state.x = Math.max(bounds.minX, Math.min(bounds.maxX, state.x + (dx / length) * speed * delta))
    state.y = Math.max(bounds.minY, Math.min(bounds.maxY, state.y + (dy / length) * speed * delta))
    state.mode = 'walk'
    state.timer += delta
    if (state.timer > 0.13) {
      state.frame = (state.frame + 1) % FRAME_COUNTS.WALK
      state.timer = 0
    }
  } else if (state.mode !== 'emote') {
    if (state.mode !== 'idle') { state.frame = 0; state.timer = 0 }
    state.mode = 'idle'
  }
  return moving
}

const IDLE_FRAME_SECONDS = 0.55

// A real two-frame breathing loop from the sheet's own idle row, swapped on
// a slow cadence. Nothing is translated vertically, so standing still no
// longer reads as bobbing up and down.
export const updateRestAnimation = (state, delta) => {
  if (state.mode === 'walk') return
  state.mode = 'idle'
  state.idleTimer += delta
  if (state.idleTimer >= IDLE_FRAME_SECONDS) {
    state.idleTimer = 0
    state.idleFrame = (state.idleFrame + 1) % FRAME_COUNTS.IDLE
  }
}

const EMOTE_STEPS = [0, 1, 2, 1, 0]

// Cycles a short "arms up" wave from the sheet's own emote row every
// `period` seconds, for `duration` seconds, then returns to idle breathing.
// Gives a stationary NPC (e.g. Aya waiting in the courtyard) occasional
// life instead of only ever standing still.
export const updateGreeting = (state, delta, period = 5, duration = 1.35) => {
  state.greetTimer = (state.greetTimer ?? 0) + delta
  if (state.greetTimer >= period) state.greetTimer = 0
  if (state.greetTimer < duration) {
    state.mode = 'emote'
    const step = Math.min(EMOTE_STEPS.length - 1, Math.floor((state.greetTimer / duration) * EMOTE_STEPS.length))
    state.idleFrame = EMOTE_STEPS[step]
  } else {
    if (state.mode !== 'idle') { state.mode = 'idle'; state.idleTimer = 0 }
    updateRestAnimation(state, delta)
  }
}

// Turns a stationary character toward another point once it's within
// `range`, otherwise keeps its resting direction — small, but it reads as
// actually noticing the player approach instead of staring at nothing.
export const faceTarget = (state, targetX, targetY, range, restingDirection = 2) => {
  const dx = targetX - state.x
  const dy = targetY - state.y
  if (Math.hypot(dx, dy) > range) {
    state.direction = restingDirection
    return
  }
  state.direction = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 3) : (dy < 0 ? 0 : 2)
}

// A soft ellipse instead of a flat bar, always anchored to the character's
// own feet — shared by the player and every NPC so shadows read the same way.
export const drawShadow = (ctx, x, footY, { width = 38, opacity = 0.24 } = {}) => {
  ctx.save()
  ctx.fillStyle = `rgba(15, 10, 20, ${opacity})`
  ctx.beginPath()
  ctx.ellipse(x, footY, width / 2, Math.max(3, width / 9), 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export const drawCharacterSprite = (ctx, image, state, offset = { x: 24, y: 54 }) => {
  if (!image.complete || image.naturalWidth === 0) return
  const cell = 64
  const walking = state.mode === 'walk'
  const stepping = walking ? Math.sin(state.frame * (Math.PI / 2)) : 0
  const shadowWidth = walking ? 36 + Math.abs(stepping) * 5 : 34
  const shadowOpacity = walking ? 0.26 - Math.abs(stepping) * 0.05 : 0.22

  drawShadow(ctx, state.x, state.y + 6, { width: shadowWidth, opacity: shadowOpacity })

  const row = (walking ? ROWS.WALK : state.mode === 'emote' ? ROWS.EMOTE : ROWS.IDLE) + state.direction
  const frame = walking ? state.frame : state.idleFrame

  ctx.save()
  ctx.translate(Math.round(state.x - offset.x), Math.round(state.y - offset.y))
  ctx.drawImage(image, frame * cell, row * cell, cell, cell, 0, 0, cell, cell)
  ctx.restore()
}
