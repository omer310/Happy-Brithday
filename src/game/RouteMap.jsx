const STOPS = [
  { id: 'flowers', label: 'الوردة', icon: '✿' },
  { id: 'bakery', label: 'الكيكة', icon: '♨' },
  { id: 'giftstall', label: 'الهدية', icon: '♡' },
  { id: 'courtyard', label: 'آية', icon: '☾' },
]

function RouteMap({ activeIndex, collected, heading, subheading, buttonLabel, onContinue }) {
  return (
    <div className="route-map">
      <p className="eyebrow">{heading}</p>
      <h1>{subheading}</h1>

      <div className="map-path">
        {STOPS.map((stop, index) => {
          const state = index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'upcoming'
          return (
            <div className={`map-node ${state}`} key={stop.id}>
              <span className="map-node-icon">{state === 'done' ? '✓' : stop.icon}</span>
              <small>{stop.label}</small>
            </div>
          )
        })}
      </div>

      <div className="route-travel" aria-hidden="true">
        <span className="route-dots" />
        <span className="travel-runner" />
        <span className="travel-moon">☾</span>
      </div>

      {collected.length > 0 && (
        <div className="map-satchel" aria-label="الحاجات اللي جمعتها">
          {collected.map((id) => <span key={id} className="satchel-chip" />)}
        </div>
      )}

      <button type="button" className="map-continue" onClick={onContinue}>
        {buttonLabel} <span aria-hidden="true">←</span>
      </button>
    </div>
  )
}

export default RouteMap
