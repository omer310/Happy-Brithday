// Shared on-screen movement pad for phones and tablets. Desktop players can
// ignore it entirely and use arrow keys / WASD instead.
function TouchDpad({ keysRef }) {
  const set = (key, active) => { keysRef.current[key] = active }
  const bind = (key) => ({
    onPointerDown: (event) => { event.preventDefault(); set(key, true) },
    onPointerUp: () => set(key, false),
    onPointerLeave: () => set(key, false),
    onPointerCancel: () => set(key, false),
  })

  return (
    <div className="touch-controls" aria-label="أزرار الحركة">
      <button type="button" {...bind('arrowup')}>↑</button>
      <div>
        <button type="button" {...bind('arrowright')}>→</button>
        <button type="button" {...bind('arrowleft')}>←</button>
      </div>
      <button type="button" {...bind('arrowdown')}>↓</button>
    </div>
  )
}

export default TouchDpad
