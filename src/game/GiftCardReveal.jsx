import { useEffect, useState } from 'react'

// Tenor's official embed for the "sorry, I'm late" sticker. Tenor doesn't
// expose a plain .gif URL without an API key, so this loads their small
// embed script once and lets it turn the div below into the actual sticker.
const SORRY_TENOR_POST_ID = '13227667366227704453'
const SORRY_TENOR_URL = 'https://tenor.com/view/late-time-so-late-run-procrastination-gif-13227667366227704453'

const STAGES = ['closed', 'gif', 'confetti', 'text']
const STAGE_DURATION = { gif: 3200, confetti: 1300 }

// The final beat of the whole journey: one card that opens on a hinge (like
// a book) and then plays a short, one-way reveal — sorry-I'm-late GIF, then
// a confetti burst, then the happy-birthday wording — settling there for
// good. There is no message/letter after this; it's the ending.
function GiftCardReveal() {
  const [stageIndex, setStageIndex] = useState(0)
  const stage = STAGES[stageIndex]

  const advance = () => setStageIndex((index) => Math.min(index + 1, STAGES.length - 1))

  useEffect(() => {
    const duration = STAGE_DURATION[stage]
    if (!duration) return undefined
    const timer = window.setTimeout(advance, duration)
    return () => window.clearTimeout(timer)
  }, [stage])

  // Tenor's widget rewrites the div's contents itself once its script runs,
  // so it's loaded imperatively here rather than rendered as normal JSX.
  useEffect(() => {
    if (stage !== 'gif') return undefined
    const script = document.createElement('script')
    script.src = 'https://tenor.com/embed.js'
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [stage])

  return (
    <div className="gift-reveal">
      {stage === 'closed' && <p className="gift-reveal-heading">افتح الهدية</p>}
      <div
        className={`gift-card ${stage !== 'closed' ? 'open' : ''}`}
        role="button"
        tabIndex={0}
        onClick={advance}
        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') advance() }}
        aria-label="افتح الهدية"
      >
        <div className={`gift-card-inside gift-card-stage-${stage}`}>
          {stage === 'gif' && (
            <div
              className="tenor-gif-embed"
              data-postid={SORRY_TENOR_POST_ID}
              data-share-method="host"
              data-aspect-ratio="1"
              data-width="50%"
            >
              <a href={SORRY_TENOR_URL}>Late Time Sticker</a>
            </div>
          )}
          {stage === 'confetti' && <span className="gift-card-confetti" aria-hidden="true">🎉</span>}
          {stage === 'text' && <p className="gift-card-final">كل سنة وإنتِ طيبة!!</p>}
     
        </div>
        <div className="gift-card-cover">
          <span aria-hidden="true">✦</span>
          <p>هدية لآية</p>
          {stage === 'closed' && <p className="gift-card-hint">دوسي هنا عشان تفتحيها</p>}
     
        </div>
      </div>
    </div>
  )
}

export default GiftCardReveal
