import { pixelRect } from './environment'

const STORE_X = 315
const DISPLAY_X = STORE_X + 57
const GROUND_Y = 352

// A pure, edge-free dirt tile from the terrain sheet (no grass border baked
// in), plus a second warm tone so the ground reads as packed earth rather
// than one flat repeating swatch.
const DIRT_TILES = [
  [416, 1344],
  [512, 1344],
]

// Four hand-picked families cropped out of fruit-trees.png (each with 4 size
// tiers for depth) replace the old all-baobab treeline. Baobabs read as
// "savanna reserve"; palms and a slender conifer read as the warm
// Nile-neighborhood courtyard this game is actually set in.
const TREE_SPRITES = {
  // Bushy-top date palm.
  palmA: [
    { sx: 9, sy: 1021, sw: 83, sh: 132 },
    { sx: 21, sy: 1185, sw: 57, sh: 93 },
    { sx: 25, sy: 1339, sw: 44, sh: 62 },
    { sx: 26, sy: 1479, sw: 43, sh: 47 },
  ],
  // Fan-leafed palm, a second silhouette so the treeline doesn't repeat.
  palmB: [
    { sx: 100, sy: 1015, sw: 92, sh: 138 },
    { sx: 109, sy: 1187, sw: 80, sh: 92 },
    { sx: 113, sy: 1319, sw: 73, sh: 89 },
    { sx: 122, sy: 1478, sw: 55, sh: 57 },
  ],
  // Slender conical tree (reads as a cypress/conifer, the "triangle" tree).
  conical: [
    { sx: 399, sy: 18, sw: 66, sh: 109 },
    { sx: 405, sy: 152, sw: 56, sh: 104 },
    { sx: 409, sy: 285, sw: 47, sh: 99 },
    { sx: 415, sy: 441, sw: 34, sh: 71 },
  ],
  // Purple-flowering jacaranda-style tree, for a pop of color in the mix.
  jacaranda: [
    { sx: 686, sy: 27, sw: 65, sh: 100 },
    { sx: 686, sy: 164, sw: 65, sh: 92 },
    { sx: 688, sy: 299, sw: 63, sh: 85 },
    { sx: 696, sy: 444, sw: 45, sh: 68 },
  ],
  // Pink-blossom accent tree, used sparingly (fits a birthday scene nicely).
  flowerAccent: [{ sx: 302, sy: 548, sw: 59, sh: 92 }],
}

// Normalizes rendered height by tier index (0 = nearest/largest) instead of
// each family's raw sprite size, so a palm and a slender conifer sit at a
// believable relative scale next to each other instead of the taller raw
// crop always winning.
const TIER_HEIGHT = [128, 98, 74, 54]

const drawFruitTree = (ctx, image, family, tier, x, groundY, flip = false) => {
  if (!image?.complete || image.naturalWidth === 0) return
  const rect = TREE_SPRITES[family][tier] || TREE_SPRITES[family][0]
  const targetH = TIER_HEIGHT[tier] || TIER_HEIGHT[TIER_HEIGHT.length - 1]
  const scale = targetH / rect.sh
  const w = rect.sw * scale
  const h = rect.sh * scale
  ctx.save()
  if (flip) {
    ctx.translate(x, 0)
    ctx.scale(-1, 1)
    ctx.translate(-x, 0)
  }
  ctx.drawImage(image, rect.sx, rect.sy, rect.sw, rect.sh, x - w / 2, groundY - h, w, h)
  ctx.restore()
}

// Every scene gets its own mix of family/tier/side/facing so the street
// never looks like the same seven trees copy-pasted in front of each shop.
const TREE_LAYOUTS = {
  flower: [
    { family: 'palmA', tier: 0, x: 48, flip: false },
    { family: 'conical', tier: 1, x: 95, flip: true },
    { family: 'palmB', tier: 2, x: 160, flip: false },
    { family: 'jacaranda', tier: 0, x: 755, flip: true },
    { family: 'palmA', tier: 1, x: 815, flip: false },
    { family: 'conical', tier: 2, x: 875, flip: true },
    { family: 'flowerAccent', tier: 0, x: 912, flip: false },
  ],
  bakery: [
    { family: 'palmB', tier: 0, x: 50, flip: true },
    { family: 'jacaranda', tier: 2, x: 95, flip: false },
    { family: 'conical', tier: 0, x: 160, flip: false },
    { family: 'palmA', tier: 0, x: 755, flip: false },
    { family: 'palmB', tier: 1, x: 815, flip: true },
    { family: 'jacaranda', tier: 1, x: 875, flip: false },
    { family: 'conical', tier: 3, x: 935, flip: true },
  ],
  gift: [
    { family: 'conical', tier: 1, x: 40, flip: false },
    { family: 'palmA', tier: 2, x: 95, flip: true },
    { family: 'palmB', tier: 0, x: 160, flip: false },
    { family: 'jacaranda', tier: 0, x: 755, flip: false },
    { family: 'conical', tier: 3, x: 815, flip: true },
    { family: 'palmA', tier: 0, x: 875, flip: false },
    { family: 'palmB', tier: 3, x: 926, flip: true },
  ],
  courtyard: [
    { family: 'palmA', tier: 0, x: 50, flip: false },
    { family: 'palmB', tier: 1, x: 115, flip: true },
    { family: 'conical', tier: 0, x: 180, flip: false },
    { family: 'flowerAccent', tier: 0, x: 245, flip: false },
    { family: 'jacaranda', tier: 0, x: 770, flip: true },
    { family: 'conical', tier: 1, x: 835, flip: false },
    { family: 'palmB', tier: 0, x: 900, flip: true },
  ],
}

// Two rounded grass-clump tiles pulled from terrain-v7.png (a lighter olive
// tone and a darker green), scattered small and sparse across the dirt so it
// reads as scrubby ground cover rather than a wholesale grass swap.
const GRASS_CLUMP_RECTS = [
  { sx: 0, sy: 286, sw: 96, sh: 96 },
  { sx: 192, sy: 286, sw: 96, sh: 96 },
]

const drawGrassClump = (ctx, image, variant, x, y, scale) => {
  if (!image?.complete || image.naturalWidth === 0) return
  const rect = GRASS_CLUMP_RECTS[variant] || GRASS_CLUMP_RECTS[0]
  const w = rect.sw * scale
  const h = rect.sh * scale
  ctx.drawImage(image, rect.sx, rect.sy, rect.sw, rect.sh, x - w / 2, y - h / 2, w, h)
}

const GRASS_PATCH_LAYOUTS = {
  flower: [
    { x: 40, y: 372, variant: 0, scale: 0.22 },
    { x: 150, y: 402, variant: 1, scale: 0.18 },
    { x: 250, y: 382, variant: 0, scale: 0.2 },
    { x: 780, y: 392, variant: 0, scale: 0.2 },
    { x: 862, y: 412, variant: 1, scale: 0.24 },
  ],
  bakery: [
    { x: 60, y: 396, variant: 1, scale: 0.2 },
    { x: 205, y: 376, variant: 0, scale: 0.22 },
    { x: 742, y: 402, variant: 1, scale: 0.18 },
    { x: 832, y: 382, variant: 0, scale: 0.2 },
    { x: 912, y: 407, variant: 0, scale: 0.22 },
  ],
  gift: [
    { x: 25, y: 388, variant: 0, scale: 0.2 },
    { x: 122, y: 407, variant: 1, scale: 0.22 },
    { x: 232, y: 374, variant: 0, scale: 0.18 },
    { x: 772, y: 377, variant: 1, scale: 0.2 },
    { x: 902, y: 402, variant: 0, scale: 0.24 },
  ],
  courtyard: [
    { x: 15, y: 402, variant: 1, scale: 0.2 },
    { x: 112, y: 380, variant: 0, scale: 0.22 },
    { x: 252, y: 407, variant: 0, scale: 0.18 },
    { x: 792, y: 392, variant: 1, scale: 0.2 },
    { x: 882, y: 412, variant: 0, scale: 0.22 },
  ],
}

// Shrinks whatever gets drawn inside `draw` vertically around `groundY`, so
// a building gets shorter (freeing up sky above its roof) without its
// doorway lifting off the ground it's anchored to.
const withGroundShrink = (ctx, groundY, scaleY, draw) => {
  ctx.save()
  ctx.translate(0, groundY)
  ctx.scale(1, scaleY)
  ctx.translate(0, -groundY)
  draw()
  ctx.restore()
}

// Maps a y coordinate through the same math as withGroundShrink, for
// elements (like text) that are drawn outside the scaled block so they
// don't get vertically stretched.
const mapGroundShrinkY = (y, groundY, scaleY) => groundY + (y - groundY) * scaleY

const drawTerrain = (ctx, world, assets, sceneKey) => {
  if (assets.nightSky?.complete && assets.nightSky.naturalWidth > 0) {
    // The full sky image is real art with no border to crop out, so a
    // "cover" fit just centers a target-aspect slice of the whole thing —
    // full moon and stars stay in frame either way.
    const targetAspect = world.width / GROUND_Y
    let x = 0
    let y = 0
    let w = assets.nightSky.naturalWidth
    let h = assets.nightSky.naturalHeight
    if (w / h > targetAspect) {
      const cropped = h * targetAspect
      x += (w - cropped) / 2
      w = cropped
    } else {
      const cropped = w / targetAspect
      y += (h - cropped) / 2
      h = cropped
    }
    ctx.drawImage(assets.nightSky, x, y, w, h, 0, 0, world.width, GROUND_Y)
  } else {
    ctx.fillStyle = '#17253b'
    ctx.fillRect(0, 0, world.width, world.height)
  }

  // Two packed-earth tones scattered by position (not random, so the pattern
  // stays stable across frames) read as real dirt ground instead of a single
  // repeating grass swatch.
  if (assets.terrain?.complete && assets.terrain.naturalWidth > 0) {
    for (let y = GROUND_Y; y < world.height; y += 32) {
      for (let x = 0; x < world.width; x += 32) {
        const variant = (Math.floor(x / 32) * 7 + Math.floor(y / 32) * 13) % 5 === 0 ? 1 : 0
        const [sx, sy] = DIRT_TILES[variant]
        ctx.drawImage(assets.terrain, sx, sy, 32, 32, x, y, 32, 32)
      }
    }
  } else {
    ctx.fillStyle = '#9a6d45'
    ctx.fillRect(0, GROUND_Y, world.width, world.height - GROUND_Y)
  }

  // A sparse scatter of grass clumps sits down first so tree shadows and
  // trunks can land on top of them, before the trees themselves frame the
  // street. The anchor sits well past the ground line (not just a couple of
  // pixels below it) so each trunk's own base lands on the dirt instead of
  // hovering above it.
  const grassPatches = GRASS_PATCH_LAYOUTS[sceneKey] || []
  grassPatches.forEach(({ x, y, variant, scale }) => drawGrassClump(ctx, assets.terrain, variant, x, y, scale))

  const trees = TREE_LAYOUTS[sceneKey] || []
  trees.forEach(({ family, tier, x, flip }) => drawFruitTree(ctx, assets.fruitTrees, family, tier, x, GROUND_Y + 28, flip))
}

// Shops read a little shorter than before (scaled down toward the ground
// line) so their roofs stop eating into the moon riding above them.
const SHOP_SCALE = 0.84

const drawAdobeShop = (ctx, label, accent = '#d59a76', kind = 'flower') => {
  const x = STORE_X
  const y = 88
  const width = 330
  const height = 300

  withGroundShrink(ctx, GROUND_Y, SHOP_SCALE, () => drawAdobeShopBody(ctx, x, y, width, height, accent, kind))

  ctx.font = '15px "Noto Naskh Arabic"'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fff8df'
  ctx.fillText(label, x + 165, mapGroundShrinkY(y + 63, GROUND_Y, SHOP_SCALE))
}

const drawAdobeShopBody = (ctx, x, y, width, height, accent, kind) => {
  // Construct one clean storefront on the pixel grid instead of scaling
  // unrelated sprite-sheet regions on top of one another.
  pixelRect(ctx, x + 10, y + 12, width, height, 'rgba(22, 15, 27, .32)')
  pixelRect(ctx, x, y, width, height, '#c7aa83')
  pixelRect(ctx, x + 8, y + 8, width - 16, height - 16, '#d5bd96')

  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 10; col += 1) {
      if ((row + col) % 3 === 0) pixelRect(ctx, x + 18 + col * 28, y + 28 + row * 18, 11, 3, '#c3a27e')
    }
  }

  // Roof, sign, awning, open shop window, and counter stay aligned.
  pixelRect(ctx, x - 8, y - 12, width + 16, 20, '#684334')
  pixelRect(ctx, x - 14, y + 8, width + 28, 9, '#8a5b42')
  pixelRect(ctx, x + 55, y + 42, 220, 32, '#f2dfb4')
  pixelRect(ctx, x + 60, y + 47, 210, 22, '#6a4235')
  pixelRect(ctx, x + 62, y + 49, 206, 18, accent)

  const windowX = x + 46
  const windowY = y + 103
  const windowW = 238
  const windowH = 116
  pixelRect(ctx, windowX - 8, windowY - 8, windowW + 16, windowH + 16, '#714c3c')
  pixelRect(ctx, windowX, windowY, windowW, windowH, '#252332')
  pixelRect(ctx, windowX + 10, windowY + 10, windowW - 20, 4, 'rgba(246, 218, 160, .35)')
  pixelRect(ctx, windowX - 18, windowY + windowH + 4, windowW + 36, 24, '#6d4835')
  pixelRect(ctx, windowX - 24, windowY + windowH + 22, windowW + 48, 8, '#432d29')

  if (kind === 'flower') {
    // Open flower stall: fabric curtains make more sense than a detached door.
    pixelRect(ctx, x + 24, y + 96, 22, 128, '#3d795e')
    pixelRect(ctx, x + 26, y + 96, 5, 128, '#86b780')
    pixelRect(ctx, x + width - 46, y + 96, 22, 128, '#3d795e')
    pixelRect(ctx, x + width - 31, y + 96, 5, 128, '#86b780')
  } else if (kind === 'bakery') {
    // A single narrow door sits in the margin to the right of the display
    // window's own frame (which ends at x+292), instead of overlapping it.
    const doorX = x + 300
    pixelRect(ctx, doorX - 8, y + 168, 38, 8, '#8f5c3b')
    pixelRect(ctx, doorX - 4, y + 176, 30, 118, '#3f281f')
    pixelRect(ctx, doorX, y + 184, 22, 102, '#6a4433')
    pixelRect(ctx, doorX, y + 184, 22, 5, '#8f5c3b')
    pixelRect(ctx, doorX + 2, y + 199, 18, 2, '#54362a')
    pixelRect(ctx, doorX + 2, y + 226, 18, 2, '#54362a')
    pixelRect(ctx, doorX + 15, y + 235, 3, 5, '#f0ca72')
  } else {
    // Gift shop: a colored door and compact display niche distinguish it.
    pixelRect(ctx, x + 276, y + 184, 42, 108, '#49334d')
    pixelRect(ctx, x + 281, y + 191, 32, 96, '#70445f')
    pixelRect(ctx, x + 287, y + 204, 20, 27, '#2e2938')
    pixelRect(ctx, x + 297, y + 244, 3, 5, '#f0ca72')
    pixelRect(ctx, x + 272, y + 170, 50, 8, '#90576d')
  }
}

const drawDisplayShelf = (ctx, x, y, width = 210) => {
  pixelRect(ctx, x, y, width, 7, '#ae7b4f')
  pixelRect(ctx, x + 8, y + 7, width - 16, 26, '#51372f')
  pixelRect(ctx, x + 13, y + 11, width - 26, 18, '#2a2731')
  pixelRect(ctx, x + 16, y + 33, 7, 26, '#5d3c32')
  pixelRect(ctx, x + width - 23, y + 33, 7, 26, '#5d3c32')
}

// Every purple/white/yellow flower shown anywhere in the game (the shelf,
// the minigame preview, the carried satchel, and the courtyard table) reads
// from this single set of real plants.png blooms, so the same choice always
// looks like the same flower.
export const FLOWER_VARIANTS = {
  purple: { sx: 0, sy: 0, sw: 32, sh: 32 },
  white: { sx: 32, sy: 0, sw: 32, sh: 32 },
  // A 32x32 crop (not 64) — the wider crop used to bleed into the next
  // sprite on the sheet (an unrelated rose bush), which is why the yellow
  // choice used to look like a completely different, oversized flower.
  yellow: { sx: 128, sy: 160, sw: 32, sh: 32 },
}

// The three wrap colors read straight off Presents.png's own matched
// recolor pairs, so the swatch you tap in the minigame is the exact box
// that shows up on the table (previously gold/teal pointed at the wrong
// cells and produced a green box and a cream box instead).
export const GIFT_VARIANTS = {
  gold: { sx: 96, sy: 0 },
  rose: { sx: 0, sy: 32 },
  teal: { sx: 96, sy: 32 },
}

export const drawFlowerSprite = (ctx, assets, variant, x, y, scale = 1) => {
  if (!assets.plants?.complete || !variant) return
  const { sx, sy, sw = 32, sh = 32 } = variant
  ctx.drawImage(assets.plants, sx, sy, sw, sh, x, y, sw * scale, sh * scale)
}

const CAKE_STYLES = {
  vanilla: { sponge: '#e7c88c', icing: '#fff1d6', accent: '#e47786' },
  chocolate: { sponge: '#744337', icing: '#c68a61', accent: '#f1cf73' },
  dates: { sponge: '#6b3f28', icing: '#c98a4b', accent: '#f0c66d' },
}

// The decoration choice (candles / fruit / nuts) now actually changes what's
// on top of the cake, instead of always drawing the same three candles.
export const drawBirthdayCake = (ctx, x, y, flavor = 'vanilla', decoration = 'candles') => {
  const style = CAKE_STYLES[flavor] || CAKE_STYLES.vanilla
  pixelRect(ctx, x + 2, y + 25, 28, 4, '#b98757')
  pixelRect(ctx, x + 5, y + 15, 22, 11, style.sponge)
  pixelRect(ctx, x + 4, y + 12, 24, 5, style.icing)
  pixelRect(ctx, x + 7, y + 8, 18, 5, style.icing)

  if (decoration === 'fruit') {
    const berries = ['#d5384f', '#e6c25c', '#4f9e4f', '#d5384f', '#e6c25c']
    berries.forEach((color, index) => pixelRect(ctx, x + 6 + index * 4, y + 6 + (index % 2), 3, 3, color))
  } else if (decoration === 'nuts') {
    const nuts = ['#8a5a34', '#c79a5b', '#8a5a34', '#c79a5b', '#8a5a34']
    nuts.forEach((color, index) => pixelRect(ctx, x + 7 + index * 4, y + 9 - (index % 2), 2, 2, color))
  } else {
    pixelRect(ctx, x + 10, y + 3, 2, 6, style.accent)
    pixelRect(ctx, x + 16, y + 2, 2, 7, style.accent)
    pixelRect(ctx, x + 22, y + 3, 2, 6, style.accent)
    pixelRect(ctx, x + 11, y + 1, 1, 2, '#fff3ab')
    pixelRect(ctx, x + 17, y, 1, 2, '#fff3ab')
    pixelRect(ctx, x + 23, y + 1, 1, 2, '#fff3ab')
  }
}

// Quest items are carried as actual sprites, not abstract colour chips.
// They sit in a little stack above the player in the final walk to Aya.
export const drawCarriedQuestItems = (ctx, assets, x, y, collected, selections = {}) => {
  const flowerVariant = FLOWER_VARIANTS[selections.flowers?.[0]] || FLOWER_VARIANTS.purple
  const cakeFlavor = selections.bakery?.[0] || 'vanilla'
  const cakeDecoration = selections.bakery?.[1] || 'candles'
  const giftVariant = GIFT_VARIANTS[selections.giftstall?.[0]] || GIFT_VARIANTS.gold

  if (!collected.length) return

  // One small leather satchel reads clearly at sprite scale. Only the newest
  // quest item peeks out, instead of every item becoming a floating pile.
  const bagX = x + 19
  const bagY = y - 24
  const newestItem = collected[collected.length - 1]
  if (newestItem === 'flowers') {
    const scale = 0.6
    const w = flowerVariant.sw * scale
    drawFlowerSprite(ctx, assets, flowerVariant, bagX + 12 - w / 2, bagY - 13, scale)
  }
  if (newestItem === 'cake') {
    ctx.save()
    ctx.translate(bagX + 2, bagY - 13)
    ctx.scale(0.66, 0.66)
    drawBirthdayCake(ctx, 0, 0, cakeFlavor, cakeDecoration)
    ctx.restore()
  }
  if (newestItem === 'gift' && assets.presents?.complete) {
    ctx.drawImage(assets.presents, giftVariant.sx, giftVariant.sy, 32, 32, bagX + 2, bagY - 13, 22, 22)
  }

  pixelRect(ctx, bagX - 2, bagY + 2, 28, 25, '#4c3028')
  pixelRect(ctx, bagX + 1, bagY + 5, 22, 19, '#8c5a39')
  pixelRect(ctx, bagX + 1, bagY + 5, 22, 5, '#bb8050')
  pixelRect(ctx, bagX + 4, bagY + 14, 16, 2, '#6a432f')
  pixelRect(ctx, bagX + 11, bagY + 10, 3, 5, '#e3bd70')
  ctx.strokeStyle = '#4c3028'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(bagX, bagY + 7)
  ctx.lineTo(bagX - 9, bagY - 6)
  ctx.lineTo(bagX - 4, bagY - 10)
  ctx.stroke()
}

export const drawFlowerStallScene = (ctx, world, t, assets) => {
  drawTerrain(ctx, world, assets, 'flower')
  drawAdobeShop(ctx, 'محل الورد', '#4b8064', 'flower')
  drawDisplayShelf(ctx, DISPLAY_X, 304)

  // The shelf shows exactly the three real choices (purple, white, yellow)
  // instead of six mismatched sprites, so what you pick is what you see.
  const shelf = [
    ['purple', DISPLAY_X + 14],
    ['white', DISPLAY_X + 74],
    ['yellow', DISPLAY_X + 130],
  ]
  shelf.forEach(([variant, x], index) => {
    drawFlowerSprite(ctx, assets, FLOWER_VARIANTS[variant], x, 274 + Math.sin(t * 1.7 + index) * 1.1, 1.1)
  })
}

export const drawBakeryScene = (ctx, world, t, assets) => {
  drawTerrain(ctx, world, assets, 'bakery')
  drawAdobeShop(ctx, 'الفرن', '#c48558', 'bakery')
  drawDisplayShelf(ctx, DISPLAY_X, 304)

  // Three genuinely different cakes — one per flavour, each wearing a
  // different decoration — instead of the same slice repeated with a
  // reshuffled colour.
  const showcase = [
    ['vanilla', 'candles'],
    ['chocolate', 'fruit'],
    ['dates', 'nuts'],
  ]
  showcase.forEach(([flavor, decoration], index) => {
    drawBirthdayCake(ctx, DISPLAY_X + 28 + index * 60, 268 + Math.sin(t * 1.4 + index), flavor, decoration)
  })
}

export const drawGiftStallScene = (ctx, world, t, assets) => {
  drawTerrain(ctx, world, assets, 'gift')
  drawAdobeShop(ctx, 'هدايا', '#744b66', 'gift')
  drawDisplayShelf(ctx, DISPLAY_X, 304)
  if (assets.presents?.complete) {
    for (let index = 0; index < 6; index += 1) {
      const sx = (index % 6) * 32
      const sy = index % 2 ? 32 : 0
      ctx.drawImage(assets.presents, sx, sy, 32, 32, DISPLAY_X + 6 + index * 35, 274 + Math.sin(t * 1.7 + index) * 1, 32, 32)
    }
  }
}

// The house also reads shorter now (scaled toward the ground a bit more
// than the shops, since it used to eat further into the moon above it).
const HOUSE_SCALE = 0.8

export const drawCourtyardScene = (ctx, world, t, { placedItems = [], assets, selections = {} }) => {
  drawTerrain(ctx, world, assets, 'courtyard')

  const houseX = 300
  const houseY = 70
  const houseW = 430
  // Reaches well past GROUND_Y (like the market stalls do) so the wall's
  // base is planted in the dirt instead of floating above the ground line.
  const houseH = GROUND_Y + 36 - houseY

  withGroundShrink(ctx, GROUND_Y, HOUSE_SCALE, () => drawHouseBody(ctx, houseX, houseY, houseW, houseH, t))

  ctx.font = '13px "Noto Naskh Arabic"'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fff2d3'
  ctx.fillText('بيت آية', 514, mapGroundShrinkY(116, GROUND_Y, HOUSE_SCALE))

  // The final table has three actual item places — the last interaction is
  // arranging the items picked on the journey, not an unrelated light puzzle.
  // Kept compact (it used to run the full width of the scene) and drawn
  // outside the house's ground-shrink so its own proportions and the
  // interactive slot positions stay exactly where they've always been.
  const tableX = 410
  const tableY = 334
  pixelRect(ctx, tableX, tableY - 6, 210, 12, '#a9784e')
  pixelRect(ctx, tableX + 3, tableY + 6, 204, 22, '#684634')
  pixelRect(ctx, tableX + 26, tableY + 7, 158, 16, '#b26b69')
  pixelRect(ctx, tableX + 30, tableY + 9, 150, 12, '#d58a82')
  pixelRect(ctx, tableX + 12, tableY + 28, 7, 22, '#5b3d32')
  pixelRect(ctx, tableX + 191, tableY + 28, 7, 22, '#5b3d32')
  pixelRect(ctx, tableX - 6, tableY + 52, 222, 6, '#3c2b2a')

  // Small woven place mats make the three interactive spots part of the
  // party table itself; the transparent buttons sit over these positions.
  ;[465, 527, 589].forEach((x, index) => {
    pixelRect(ctx, x - 4, 324, 34, 5, index % 2 ? '#f2d59a' : '#c88a71')
    pixelRect(ctx, x - 1, 328, 28, 3, '#7e4e45')
  })

  const flowerVariant = FLOWER_VARIANTS[selections.flowers?.[0]] || FLOWER_VARIANTS.purple
  const cakeFlavor = selections.bakery?.[0] || 'vanilla'
  const cakeDecoration = selections.bakery?.[1] || 'candles'
  const giftVariant = GIFT_VARIANTS[selections.giftstall?.[0]] || GIFT_VARIANTS.gold

  if (placedItems.includes('flowers')) {
    const scale = 0.85
    const w = flowerVariant.sw * scale
    drawFlowerSprite(ctx, assets, flowerVariant, 465 - w / 2, 296, scale)
  }
  if (placedItems.includes('cake')) drawBirthdayCake(ctx, 517, 302, cakeFlavor, cakeDecoration)
  if (placedItems.includes('gift') && assets.presents?.complete) ctx.drawImage(assets.presents, giftVariant.sx, giftVariant.sy, 32, 32, 577, 298, 32, 32)
}

const drawHouseBody = (ctx, houseX, houseY, houseW, houseH, t) => {
  // A real home courtyard: one coherent house, doorway, windows, warm lights.
  // It intentionally does not reuse market-stall art.
  pixelRect(ctx, houseX + 10, houseY + 12, houseW, houseH, 'rgba(22, 15, 27, .3)')
  pixelRect(ctx, houseX, houseY, houseW, houseH, '#c8ad87')
  pixelRect(ctx, houseX + 8, houseY + 8, houseW - 16, houseH - 16, '#d7bd94')
  pixelRect(ctx, houseX - 10, houseY - 14, houseW + 20, 22, '#684334')
  pixelRect(ctx, houseX - 16, houseY + 8, houseW + 32, 8, '#8a5b42')

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 14; col += 1) {
      if ((row * 2 + col) % 4 === 0) pixelRect(ctx, houseX + 18 + col * 28, houseY + 34 + row * 18, 11, 3, '#c29f7b')
    }
  }

  // Home door and two windows are symmetrical and clearly read as a
  // residence. The doorway itself extends down to the ground line so it
  // reads as a walkable threshold instead of stopping mid-wall.
  pixelRect(ctx, 490, 185, 64, GROUND_Y - 185, '#51342f')
  pixelRect(ctx, 498, 194, 48, GROUND_Y - 194 - 4, '#764c3a')
  pixelRect(ctx, 536, 268, 4, 6, '#f0ca72')
  ;[360, 620].forEach((windowX) => {
    pixelRect(ctx, windowX, 154, 62, 66, '#684837')
    pixelRect(ctx, windowX + 6, 160, 50, 54, '#263142')
    pixelRect(ctx, windowX + 29, 160, 4, 54, '#d8b370')
    pixelRect(ctx, windowX + 6, 185, 50, 4, '#d8b370')
  })

  ctx.strokeStyle = 'rgba(230, 195, 133, .8)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(330, 126)
  ctx.quadraticCurveTo(510, 86, 698, 126)
  ctx.stroke()
  for (let index = 0; index < 6; index += 1) {
    const x = 354 + index * 64
    const y = 118 + Math.sin(index * 1.2) * 8
    const glow = 0.12 + Math.abs(Math.sin(t * 3 + index)) * 0.12
    ctx.fillStyle = `rgba(255, 220, 128, ${glow})`
    ctx.beginPath()
    ctx.arc(x, y, 15, 0, Math.PI * 2)
    ctx.fill()
    pixelRect(ctx, x - 4, y - 4, 8, 8, index % 2 ? '#df7e89' : '#f4ca75')
  }
}
