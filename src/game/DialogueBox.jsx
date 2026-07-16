import { useEffect, useState } from 'react'
import { WORLD } from './constants'

// Keeps the bubble's anchor point (and therefore the whole bubble, which
// grows upward from it) from drifting past the frame edges when a character
// is standing close to the left/right border.
const clampPercent = (value, min, max) => Math.min(max, Math.max(min, value))

const anchorStyle = (pos) => {
  if (!pos) return undefined
  const x = clampPercent((pos.x / WORLD.width) * 100, 14, 86)
  // The same head-clearance offset the talk-bubble uses, so the bubble's
  // point sits just above the character's head instead of on top of it.
  const y = clampPercent(((pos.y - 96) / WORLD.height) * 100, 6, 92)
  return { left: `${x}%`, top: `${y}%` }
}

// Retro RPG-style speech bubble: pops up right above whichever character is
// currently speaking (player or NPC) instead of a full-width bar pinned to
// one edge of the frame. Tap/click it, or press Enter/Space, to advance.
// Calls onDone after the last line.
function DialogueBox({ lines, npcName, onDone, onAdvance, anchors }) {
  const [index, setIndex] = useState(0)
  const line = lines[index]
  const isLast = index === lines.length - 1

  const advance = () => {
    onAdvance?.()
    if (isLast) onDone()
    else setIndex((i) => i + 1)
  }

  useEffect(() => {
    const handler = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        advance()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  if (!line) return null
  const speakerLabel = line.speaker === 'npc' ? npcName : 'إنت'
  const speakerPos = line.speaker === 'npc' ? anchors?.npc : anchors?.player
  const style = anchorStyle(speakerPos)

  return (
    <button type="button" className={`dialogue-box speaker-${line.speaker}`} style={style} onClick={advance}>
      <span className="dialogue-name">{speakerLabel}</span>
      <p className="dialogue-text">{line.text}</p>
      <span className="dialogue-hint">{isLast ? 'تمام ✦' : 'التالي ←'}</span>
    </button>
  )
}

export default DialogueBox
