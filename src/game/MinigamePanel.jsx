import { useEffect, useRef, useState } from 'react'
import { FLOWER_VARIANTS, GIFT_VARIANTS, drawFlowerSprite, drawBirthdayCake } from './scenes'

// Draws the actual in-game sprite for an option (a real flower, or a real
// cake with its flavour/decoration) instead of a flat colour chip, so
// choosing a color is really choosing the thing you'll see in the world.
function OptionPreview({ preview, images }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !preview || !images) return
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (preview.kind === 'flower') {
      const variant = FLOWER_VARIANTS[preview.variant]
      if (!variant) return
      const scale = Math.min((canvas.width - 6) / variant.sw, (canvas.height - 6) / variant.sh)
      const w = variant.sw * scale
      const h = variant.sh * scale
      drawFlowerSprite(ctx, images, variant, (canvas.width - w) / 2, canvas.height - h - 3, scale)
    } else if (preview.kind === 'cake') {
      drawBirthdayCake(ctx, (canvas.width - 30) / 2, canvas.height - 33, preview.flavor || 'vanilla', preview.decoration || 'candles')
    } else if (preview.kind === 'gift') {
      const variant = GIFT_VARIANTS[preview.variant]
      if (!variant || !images.presents?.complete) return
      const size = canvas.width - 8
      ctx.drawImage(images.presents, variant.sx, variant.sy, 32, 32, (canvas.width - size) / 2, (canvas.height - size) / 2, size, size)
    }
  }, [preview, images])

  return <canvas ref={canvasRef} width={44} height={44} className="option-preview" aria-hidden="true" />
}

// Touch-first "tap to choose" minigame. Works identically with a mouse,
// a finger, or a keyboard (buttons are natively focusable/activatable).
function MinigamePanel({ config, images, onComplete }) {
  const isTwoStep = config.type === 'twoStep'
  const [step, setStep] = useState(0)
  const [firstChoice, setFirstChoice] = useState(null)
  const [picked, setPicked] = useState(null)

  const current = isTwoStep ? (step === 0 ? config.stepA : config.stepB) : config

  // The decoration step's cake preview reflects the flavour picked in step
  // one, so the live preview always matches the cake you're actually building.
  const previewFor = (option) => {
    if (option.preview?.kind === 'cake' && option.preview.decoration && !option.preview.flavor) {
      return { ...option.preview, flavor: firstChoice || 'vanilla' }
    }
    return option.preview
  }

  const choose = (option) => {
    if (picked) return
    setPicked(option.id)
    window.setTimeout(() => {
      if (isTwoStep && step === 0) {
        setFirstChoice(option.id)
        setStep(1)
        setPicked(null)
      } else {
        onComplete(isTwoStep ? [firstChoice, option.id] : [option.id])
      }
    }, 320)
  }

  return (
    <div className="minigame-panel">
      {isTwoStep && (
        <div className="minigame-steps" aria-hidden="true">
          <span className={step >= 0 ? 'done' : ''} />
          <span className={step >= 1 ? 'done' : ''} />
        </div>
      )}
      <p className="minigame-prompt">{current.prompt}</p>
      <div className="minigame-options">
        {current.options.map((option) => (
          <button
            type="button"
            key={option.id}
            className={picked === option.id ? 'picked' : ''}
            onClick={() => choose(option)}
          >
            {option.preview ? (
              <OptionPreview preview={previewFor(option)} images={images} />
            ) : (
              <span className="swatch" style={{ background: option.color }} />
            )}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default MinigamePanel
