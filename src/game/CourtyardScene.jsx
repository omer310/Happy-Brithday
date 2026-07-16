import { useEffect, useRef, useState } from 'react'
import { WORLD } from './constants'
import { createCharacterState, stepWalk, updateRestAnimation, drawCharacterSprite, faceTarget, updateGreeting } from './character'
import { drawCarriedQuestItems, drawCourtyardScene } from './scenes'
import { COURTYARD, ITEM_META } from './content'
import ThoughtBubble from './ThoughtBubble'
import GiftCardReveal from './GiftCardReveal'
import TouchDpad from './TouchDpad'

// Aya never moves, so this radius is simply how close the player needs to
// be for the "deliver the gifts" prompt to appear.
const TALK_RADIUS = 100
const BOUNDS = { minX: 28, maxX: WORLD.width - 28, minY: 352, maxY: WORLD.height - 34 }

// The finale directly finishes the journey: bring the selected items to Aya,
// then arrange those exact items on the courtyard table.
function CourtyardScene({ images, collected, selections, sound }) {
  const canvasRef = useRef(null)
  const keysRef = useRef({})
  const phaseRef = useRef('walk')
  const placedRef = useRef([])
  const talkAvailableRef = useRef(false)
  const soundRef = useRef(sound)
  const playerRef = useRef(null)
  const thoughtShownRef = useRef(false)
  const livePosRef = useRef({ x: 150, y: 400 })
  const [phase, setPhase] = useState('walk')
  const [talkAvailable, setTalkAvailable] = useState(false)
  const [placedItems, setPlacedItems] = useState([])
  const [livePlayerPos, setLivePlayerPos] = useState(livePosRef.current)
  const [thought, setThought] = useState(null)
  soundRef.current = sound

  const goToPhase = (next) => { phaseRef.current = next; setPhase(next) }

  const startDelivery = () => {
    sound.playConfirm()
    setThought(null)
    goToPhase('arrange')
  }

  const placeItem = (id) => {
    if (phaseRef.current !== 'arrange' || placedRef.current.includes(id)) return
    const next = [...placedRef.current, id]
    placedRef.current = next
    setPlacedItems(next)
    sound.playConfirm()
    if (next.length === COURTYARD.deliverySlots.length) {
      // Straight into the gift reveal — no separate "happy birthday" line
      // here, since that's now the payoff of opening the gift itself.
      window.setTimeout(() => goToPhase('opening'), 450)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    const player = createCharacterState(150, 400, 2)
    const aya = createCharacterState(COURTYARD.npcPos.x, COURTYARD.npcPos.y, 2)
    playerRef.current = player
    livePosRef.current = { x: player.x, y: player.y }
    setLivePlayerPos(livePosRef.current)
    let lastTime = 0
    let lastFootstep = 0
    let animationFrame

    const pressed = (event) => {
      const key = event.key.toLowerCase()
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        event.preventDefault()
        keysRef.current[key] = true
      }
    }
    const released = (event) => { keysRef.current[event.key.toLowerCase()] = false }
    window.addEventListener('keydown', pressed)
    window.addEventListener('keyup', released)

    const tick = (time) => {
      const delta = Math.min((time - lastTime) / 1000 || 0, 0.04)
      lastTime = time
      const t = time / 1000

      // Only arranging items and the final gift reveal actually lock the
      // player in place; everything else stays walkable.
      if (phaseRef.current === 'walk') {
        const keys = keysRef.current
        let dx = 0
        let dy = 0
        if (keys.arrowleft || keys.a) dx -= 1
        if (keys.arrowright || keys.d) dx += 1
        if (keys.arrowup || keys.w) dy -= 1
        if (keys.arrowdown || keys.s) dy += 1
        stepWalk(player, dx, dy, 155, delta, BOUNDS)
        if ((dx || dy) && time - lastFootstep > 310) {
          soundRef.current.playStep()
          lastFootstep = time
        }
        if (!dx && !dy) updateRestAnimation(player, delta)

        const last = livePosRef.current
        if (Math.abs(last.x - player.x) > 0.4 || Math.abs(last.y - player.y) > 0.4) {
          livePosRef.current = { x: player.x, y: player.y }
          setLivePlayerPos(livePosRef.current)
        }

        const distance = Math.hypot(player.x - COURTYARD.npcPos.x, player.y - COURTYARD.npcPos.y)
        const inRange = distance < TALK_RADIUS

        if (talkAvailableRef.current !== inRange) {
          talkAvailableRef.current = inRange
          setTalkAvailable(inRange)
          if (inRange && !thoughtShownRef.current && COURTYARD.thought) {
            thoughtShownRef.current = true
            setThought(COURTYARD.thought)
            window.setTimeout(() => setThought(null), 3200)
          }
        }
      } else {
        updateRestAnimation(player, delta)
      }

      // Aya notices the player approaching and waves every few seconds
      // instead of just standing frozen the whole time.
      faceTarget(aya, player.x, player.y, 220, 2)
      updateGreeting(aya, delta)
      drawCourtyardScene(ctx, WORLD, t, { placedItems: placedRef.current, assets: images, selections })
      drawCharacterSprite(ctx, images.female, aya)
      drawCharacterSprite(ctx, images.male, player)
      if (phaseRef.current === 'walk') {
        drawCarriedQuestItems(ctx, images, player.x, player.y, collected, selections)
      }

      animationFrame = requestAnimationFrame(tick)
    }
    animationFrame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('keydown', pressed)
      window.removeEventListener('keyup', released)
    }
    // The player and canvas lifecycle is intentionally one scene instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const talkX = ((COURTYARD.npcPos.x / WORLD.width) * 100).toFixed(2)
  const talkY = (((COURTYARD.npcPos.y - 96) / WORLD.height) * 100).toFixed(2)

  return (
    <div className="game-frame">
      <canvas ref={canvasRef} width={WORLD.width} height={WORLD.height} aria-label={COURTYARD.title} />

      {phase === 'walk' && talkAvailable && (
        <button type="button" className="talk-bubble" style={{ left: `${talkX}%`, top: `${talkY}%` }} onClick={startDelivery}>
          سلّم الحاجات لآية ✦
        </button>
      )}
      {phase === 'walk' && <div className="game-tip">امشي لي اية و معاك الحاجات</div>}
 
      {phase === 'walk' && thought && <ThoughtBubble text={thought} anchor={livePlayerPos} />}

      {phase === 'arrange' && (
        <>
          <div className="game-tip">رتب الحاجات البتجبتها على الطاولة</div>
          {COURTYARD.deliverySlots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              className={`delivery-slot ${placedItems.includes(slot.id) ? 'placed' : ''}`}
              style={{ left: `${(slot.x / WORLD.width) * 100}%`, top: `${(slot.y / WORLD.height) * 100}%` }}
              onClick={() => placeItem(slot.id)}
              disabled={placedItems.includes(slot.id)}
              aria-label={`رتب ${ITEM_META[slot.id]?.label || slot.id}`}
            >
              <span className="delivery-slot-icon">{ITEM_META[slot.id]?.icon}</span>
            </button>
          ))}
        </>
      )}

      {phase === 'opening' && <GiftCardReveal />}

      {phase === 'walk' && <TouchDpad keysRef={keysRef} />}
    </div>
  )
}

export default CourtyardScene
