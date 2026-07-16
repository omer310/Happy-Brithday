import { WORLD } from './constants'

// Keeps the bubble from drifting past the frame edges, same idea as the
// dialogue box's anchoring.
const clampPercent = (value, min, max) => Math.min(max, Math.max(min, value))

// A silent internal thought — a cloud-shaped bubble with small dots trailing
// down to the character's head, distinct from the spoken message-style
// dialogue box. Shown once, briefly, before a conversation actually starts.
// `anchor` is expected to track the character's live position, so the
// bubble moves with them instead of staying pinned where it first appeared.
function ThoughtBubble({ text, anchor }) {
  if (!text || !anchor) return null
  const x = clampPercent((anchor.x / WORLD.width) * 100, 14, 86)
  const y = clampPercent(((anchor.y - 96) / WORLD.height) * 100, 6, 92)

  return (
    <div className="thought-bubble" style={{ left: `${x}%`, top: `${y}%` }} aria-live="polite">
      <p>{text}</p>
      <span className="thought-dot thought-dot-3" aria-hidden="true" />
      <span className="thought-dot thought-dot-2" aria-hidden="true" />
      <span className="thought-dot thought-dot-1" aria-hidden="true" />
    </div>
  )
}

export default ThoughtBubble
