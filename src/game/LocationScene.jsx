import { useEffect, useRef, useState } from 'react'
import { WORLD } from './constants'
import { createCharacterState, stepWalk, updateRestAnimation, drawCharacterSprite } from './character'
import { drawNpc } from './npc'
import { drawCarriedQuestItems, drawFlowerStallScene, drawBakeryScene, drawGiftStallScene } from './scenes'
import DialogueBox from './DialogueBox'
import ThoughtBubble from './ThoughtBubble'
import MinigamePanel from './MinigamePanel'
import TouchDpad from './TouchDpad'

const SCENE_DRAWERS = {
  flowers: drawFlowerStallScene,
  bakery: drawBakeryScene,
  giftstall: drawGiftStallScene,
}

// The NPC never moves, so this one radius does double duty: it's how close
// you need to be to strike up a conversation, and — since a conversation
// stays open while you keep walking around — how far you can wander before
// it naturally ends, like stepping out of earshot.
const TALK_RADIUS = 92
const BOUNDS = { minX: 28, maxX: WORLD.width - 28, minY: 352, maxY: WORLD.height - 34 }

// Renders one shopping-stall chapter: a walkable pixel scene with a living
// NPC, a dialogue exchange, and a tap-to-choose minigame. The render loop is
// created once per location so approaching the NPC never resets the player.
function LocationScene({ location, images, collected, selections, sound, onComplete }) {
  const canvasRef = useRef(null)
  const keysRef = useRef({})
  const phaseRef = useRef('walk')
  const talkAvailableRef = useRef(false)
  const choicesRef = useRef([])
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  const soundRef = useRef(sound)
  const playerRef = useRef(null)
  const thoughtShownRef = useRef(false)
  const livePosRef = useRef({ x: 150, y: 400 })
  const [phase, setPhase] = useState('walk')
  const [talkAvailable, setTalkAvailable] = useState(false)
  const [livePlayerPos, setLivePlayerPos] = useState(livePosRef.current)
  const [thought, setThought] = useState(null)
  onCompleteRef.current = onComplete
  soundRef.current = sound

  const goToPhase = (next) => { phaseRef.current = next; setPhase(next) }

  const enterDialogue = () => {
    setThought(null)
    goToPhase('dialogue')
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    const drawBackground = SCENE_DRAWERS[location.id]
    const player = createCharacterState(150, 400, 2)
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
      if ((event.key === 'Enter' || event.key === ' ') && phaseRef.current === 'walk' && talkAvailableRef.current) {
        enterDialogue()
      }
    }
    const released = (event) => { keysRef.current[event.key.toLowerCase()] = false }
    window.addEventListener('keydown', pressed)
    window.addEventListener('keyup', released)

    const tick = (time) => {
      const delta = Math.min((time - lastTime) / 1000 || 0, 0.04)
      lastTime = time
      const t = time / 1000

      // Walking stays live through a conversation too — a chat is an
      // overworld state, not a cutscene, so you can keep wandering while
      // it's open. Only "leaving" (walking off-screen) and the minigame
      // overlay actually take the controls away from you.
      if (phaseRef.current === 'walk' || phaseRef.current === 'dialogue') {
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

        // Bubbles that are anchored to the player (the thought bubble, and
        // any line the player speaks) need to track them live instead of a
        // frozen snapshot. Only push a re-render when the position actually
        // moved, so idle standing doesn't spam React with updates.
        const last = livePosRef.current
        if (Math.abs(last.x - player.x) > 0.4 || Math.abs(last.y - player.y) > 0.4) {
          livePosRef.current = { x: player.x, y: player.y }
          setLivePlayerPos(livePosRef.current)
        }

        const distance = Math.hypot(player.x - location.npcPos.x, player.y - location.npcPos.y)
        const inRange = distance < TALK_RADIUS

        if (phaseRef.current === 'walk') {
          if (talkAvailableRef.current !== inRange) {
            talkAvailableRef.current = inRange
            setTalkAvailable(inRange)
            // The first time the player wanders close enough, let their
            // thought bubble surface once, before they actually strike up
            // the conversation.
            if (inRange && !thoughtShownRef.current && location.thought) {
              thoughtShownRef.current = true
              setThought(location.thought)
              window.setTimeout(() => setThought(null), 3200)
            }
          }
        } else if (!inRange) {
          // Wandered out of earshot mid-conversation — the chat naturally
          // ends instead of holding the player hostage in a modal.
          talkAvailableRef.current = false
          setTalkAvailable(false)
          goToPhase('walk')
        }
      } else if (phaseRef.current === 'leaving') {
        stepWalk(player, 1, 0, 225, delta, { ...BOUNDS, maxX: WORLD.width + 72 })
        if (player.x >= WORLD.width + 34 && !completedRef.current) {
          completedRef.current = true
          onCompleteRef.current(location.itemsAwarded, choicesRef.current)
        }
      } else {
        updateRestAnimation(player, delta)
      }

      drawBackground(ctx, WORLD, t, images)
      drawNpc(ctx, images[location.imageKey], location.npcPos, t)
      drawCharacterSprite(ctx, images.male, player)
      const carriedItems = phaseRef.current === 'leaving'
        ? [...collected, ...location.itemsAwarded]
        : collected
      const activeSelections = { ...selections, [location.id]: choicesRef.current }
      drawCarriedQuestItems(ctx, images, player.x, player.y, carriedItems, activeSelections)

      animationFrame = requestAnimationFrame(tick)
    }
    animationFrame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('keydown', pressed)
      window.removeEventListener('keyup', released)
    }
    // Intentionally created once: this scene is remounted (fresh key) per location.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const talkX = ((location.npcPos.x / WORLD.width) * 100).toFixed(2)
  const talkY = (((location.npcPos.y - 96) / WORLD.height) * 100).toFixed(2)
  const dialogueAnchors = { player: livePlayerPos, npc: location.npcPos }

  return (
    <div className="game-frame">
      <canvas ref={canvasRef} width={WORLD.width} height={WORLD.height} aria-label={location.title} />

      {phase === 'walk' && talkAvailable && (
        <button
          type="button"
          className="talk-bubble"
          style={{ left: `${talkX}%`, top: `${talkY}%` }}
          onClick={() => { sound.playConfirm(); enterDialogue() }}
        >
          تكلم مع {location.npcName} ✦
        </button>
      )}

      {phase === 'walk' && (
        <div className="game-tip">امشي جوّه المحل وتكلم مع {location.npcName}</div>
      )}

      {/* Thoughts float well above head height on purpose: the talk prompt
          and the tip below it are the important, actionable prompts, so the
          silent thought never competes with or covers them. */}
      {phase === 'walk' && thought && <ThoughtBubble text={thought} anchor={livePlayerPos} />}

      {phase === 'dialogue' && (
        <DialogueBox
          lines={location.dialogue}
          npcName={location.npcName}
          anchors={dialogueAnchors}
          onAdvance={sound.playDialogue}
          onDone={() => goToPhase('minigame')}
        />
      )}

      {phase === 'minigame' && (
        <MinigamePanel
          config={location.minigame}
          images={images}
          onComplete={(nextChoices) => {
            sound.playConfirm()
            choicesRef.current = nextChoices
            goToPhase('leaving')
          }}
        />
      )}

      {phase === 'leaving' && <div className="game-tip">تمام، نمشي للمكان الجاي</div>}

      {(phase === 'walk' || phase === 'dialogue') && <TouchDpad keysRef={keysRef} />}
    </div>
  )
}

export default LocationScene
