// Shared on-screen movement pad for phones and tablets. Desktop players can
// ignore it entirely and use arrow keys / WASD instead.
function TouchDpad({ keysRef }) {
  const set = (key, active) => { keysRef.current[key] = active }
  const bind = (key) => ({
    onPointerDown: (event) => {
      event.preventDefault()
      event.stopPropagation()
      set(key, true)
    },
    onPointerUp: (event) => {
      event.preventDefault()
      set(key, false)
    },
    onPointerLeave: () => set(key, false),
    onPointerCancel: () => set(key, false),
    onContextMenu: (event) => event.preventDefault(),
  })

  return (
    <div className="touch-controls" aria-label="أزرار الحركة" onContextMenu={(event) => event.preventDefault()}>
      <button type="button" aria-label="فوق" {...bind('arrowup')}>
        <span className="dpad-glyph" aria-hidden="true">▲</span>
      </button>
      <div>
        <button type="button" aria-label="يمين" {...bind('arrowright')}>
          <span className="dpad-glyph" aria-hidden="true">▶</span>
        </button>
        <button type="button" aria-label="يسار" {...bind('arrowleft')}>
          <span className="dpad-glyph" aria-hidden="true">◀</span>
        </button>
      </div>
      <button type="button" aria-label="تحت" {...bind('arrowdown')}>
        <span className="dpad-glyph" aria-hidden="true">▼</span>
      </button>
    </div>
  )
}

export default TouchDpad
