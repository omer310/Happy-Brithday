import { useEffect, useState } from 'react'
import './App.css'
import { SAVE_KEY } from './game/constants'
import { LOCATIONS } from './game/content'
import { useGameImages } from './game/useGameImages'
import { useGameAudio } from './game/useGameAudio'
import LocationScene from './game/LocationScene'
import CourtyardScene from './game/CourtyardScene'

function TravelOverlay({ destination }) {
  return (
    <div className="travel-overlay" aria-live="polite">
      <span className="travel-overlay-runner" aria-hidden="true" />
      <span>في الطريق لـ {destination}</span>
    </div>
  )
}

function App() {
  const images = useGameImages()
  const sound = useGameAudio()
  const [phase, setPhase] = useState('intro')
  const [stepIndex, setStepIndex] = useState(0)
  const [collected, setCollected] = useState([])
  const [selections, setSelections] = useState({})
  const [traveling, setTraveling] = useState(false)

  // Never resume mid-journey — every open starts at the intro so nothing
  // gets spoiled by a leftover save from a previous visit.
  useEffect(() => {
    try { window.localStorage.removeItem(SAVE_KEY) } catch { /* ignore */ }
  }, [])

  const restart = () => {
    if (window.confirm('تبدأ المشوار من الأول تاني؟')) {
      setCollected([])
      setSelections({})
      setStepIndex(0)
      setPhase('intro')
    }
  }

  const currentLocation = stepIndex < LOCATIONS.length ? LOCATIONS[stepIndex] : null

  return (
    <main className="game-page" dir="rtl">
      <div className="rotate-hint" role="status">
        <span aria-hidden="true">↻</span>
        <p>لفّي الجهاز بالعرض عشان تلعبى أحسن</p>
      </div>

      <header className="game-header">
        <span className="brand-spacer" aria-hidden="true" />
        <p className="game-title">{phase === 'intro' ? 'عيد ميلاد آية' : 'مشوار التعويض 🤣'}</p>
        <div className="header-links">
          <button type="button" className="audio-toggle" onClick={sound.toggle} aria-pressed={sound.enabled}>
            <span className="audio-label-short">{sound.enabled ? '🔊' : '🔈'}</span>
            <span className="audio-label-full">{sound.enabled ? 'الصوت: شغال' : 'شغّل الصوت'}</span>
          </button>
          {phase !== 'intro' && (
            <button type="button" className="reset-link" onClick={restart}>
              <span className="reset-label-short">من جديد</span>
              <span className="reset-label-full">ابدأ من جديد</span>
            </button>
          )}
        </div>
      </header>

      <section className="game-shell">
        {phase === 'intro' && (
          <div className="game-frame intro-frame">
            <div className="intro-sky" aria-hidden="true" />
            <div className="intro-card">
              <span className="intro-runner" aria-hidden="true" />
              <p className="eyebrow">مشوار كدا عشان نسيت</p>
              <h1>عيد ميلاد آية</h1>
              <p>يلا نجهز ليها حاجة قبل ما الصبح اجي</p>
              <button type="button" onClick={() => { sound.start(); setPhase('playing') }}>ابدأ المشوار ←</button>
            </div>
          </div>
        )}

        {phase === 'playing' && currentLocation && (
          <LocationScene
            key={currentLocation.id}
            location={currentLocation}
            images={images}
            collected={collected}
            selections={selections}
            sound={sound}
            onComplete={(itemsAwarded, chosenOptions) => {
              sound.playConfirm()
              setCollected((prev) => [...prev, ...itemsAwarded])
              setSelections((prev) => ({ ...prev, [currentLocation.id]: chosenOptions }))
              setStepIndex((prev) => prev + 1)
              setTraveling(true)
              window.setTimeout(() => setTraveling(false), 1150)
            }}
          />
        )}

        {phase === 'playing' && !currentLocation && (
          <CourtyardScene
            images={images}
            collected={collected}
            selections={selections}
            sound={sound}
          />
        )}

        {traveling && <TravelOverlay destination={currentLocation?.title || 'آية'} />}
      </section>
    </main>
  )
}

export default App
