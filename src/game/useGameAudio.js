import { useCallback, useEffect, useRef, useState } from 'react'

const playTone = (context, destination, frequency, duration, volume, type = 'sine', endFrequency = frequency) => {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const now = context.currentTime
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, now)
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), now + duration)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  oscillator.connect(gain)
  gain.connect(destination)
  oscillator.start(now)
  oscillator.stop(now + duration + 0.02)
}

// The generated triangle-wave phrase remains as the built-in soundscape
// (no autoplay, licensing, or download problems) and now also doubles as a
// safety net if the real track below can't load or play.
export const useGameAudio = () => {
  const engineRef = useRef(null)
  const [enabled, setEnabled] = useState(false)

  const startMusic = useCallback((engine) => {
    window.clearTimeout(engine.musicTimer)
    const notes = [293.66, 349.23, 392, 440, 392, 349.23, 293.66, 261.63]
    let index = 0
    const playPhrase = () => {
      if (!engine.active) return
      const note = notes[index % notes.length]
      playTone(engine.context, engine.master, note, 0.4, 0.018, 'triangle', note * 0.995)
      if (index % 4 === 0) playTone(engine.context, engine.master, note / 2, 0.36, 0.01, 'sine', note / 2)
      index += 1
      engine.musicTimer = window.setTimeout(playPhrase, 520)
    }
    engine.musicTimer = window.setTimeout(playPhrase, 260)
  }, [])

  // The real "Happy Birthday" recording loops softly as the main ambient
  // background track. It's routed through the same master gain as every
  // other sound (so the mute toggle and volume stay consistent), and if it
  // can't load or the browser blocks it, the generated melody above still
  // plays instead of leaving the world silent.
  const startBackgroundTrack = useCallback(
    (engine) => {
      if (!engine.trackElement) {
        const audio = new Audio('/nastelbom-happy-birthday-469282.mp3')
        audio.loop = true
        audio.preload = 'auto'
        try {
          const source = engine.context.createMediaElementSource(audio)
          const trackGain = engine.context.createGain()
          trackGain.gain.value = 0.16
          source.connect(trackGain)
          trackGain.connect(engine.master)
        } catch {
          audio.volume = 0.16
        }
        engine.trackElement = audio
      }
      engine.trackElement.play().catch(() => startMusic(engine))
    },
    [startMusic],
  )

  const start = useCallback(async () => {
    let engine = engineRef.current
    if (!engine) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      const context = new AudioContext()
      const master = context.createGain()
      master.gain.value = 0.55
      master.connect(context.destination)
      engine = { context, master, active: false }
      engineRef.current = engine
    }
    if (engine.active && engine.context.state === 'running') {
      setEnabled(true)
      return
    }
    await engine.context.resume()
    engine.active = true
    startBackgroundTrack(engine)
    setEnabled(true)
  }, [startBackgroundTrack])

  const stop = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return
    engine.active = false
    window.clearTimeout(engine.musicTimer)
    engine.trackElement?.pause()
    setEnabled(false)
  }, [])

  const toggle = useCallback(() => {
    if (enabled) stop()
    else start()
  }, [enabled, start, stop])

  const playStep = useCallback(() => {
    const engine = engineRef.current
    if (!engine?.active) return
    playTone(engine.context, engine.master, 130, 0.045, 0.018, 'triangle', 95)
  }, [])

  const playConfirm = useCallback(() => {
    const engine = engineRef.current
    if (!engine?.active) return
    playTone(engine.context, engine.master, 660, 0.11, 0.035, 'triangle', 830)
    window.setTimeout(() => {
      if (engine.active) playTone(engine.context, engine.master, 880, 0.16, 0.03, 'triangle', 1050)
    }, 85)
  }, [])

  const playDialogue = useCallback(() => {
    const engine = engineRef.current
    if (!engine?.active) return
    playTone(engine.context, engine.master, 520, 0.045, 0.018, 'square', 485)
  }, [])

  useEffect(() => {
    // Prefer sound on from the first moment. Desktop browsers often allow
    // this; iOS Safari may block until the first tap, so we also unlock on
    // that first gesture without requiring the mute button.
    let cancelled = false
    const tryStart = () => { if (!cancelled) start() }
    tryStart()

    const unlock = () => {
      tryStart()
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('keydown', unlock)
    }
    window.addEventListener('pointerdown', unlock, { passive: true })
    window.addEventListener('touchstart', unlock, { passive: true })
    window.addEventListener('keydown', unlock)

    return () => {
      cancelled = true
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('keydown', unlock)
      const engine = engineRef.current
      if (!engine) return
      engine.active = false
      window.clearTimeout(engine.musicTimer)
      engine.trackElement?.pause()
      engine.context.close()
    }
  }, [start])

  return { enabled, start, toggle, playStep, playConfirm, playDialogue }
}
