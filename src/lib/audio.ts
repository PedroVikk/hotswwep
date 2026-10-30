let ctx: AudioContext | null = null

/** precisa ser chamado num toque do usuário (iOS/Android bloqueiam áudio automático) */
export function unlockAudio() {
  try {
    ctx = ctx ?? new (window.AudioContext || (window as any).webkitAudioContext)()
    ctx.resume()
  } catch { /* sem áudio */ }
}

function beep(t: number, freq: number, dur: number, vol = 0.35, type: OscillatorType = 'square') {
  if (!ctx) return
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = type; o.frequency.value = freq
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(ctx.destination)
  o.start(t); o.stop(t + dur + 0.02)
}

/** despertador: 3 rajadas de bipes */
export function alarm() {
  if (!ctx) return
  const t0 = ctx.currentTime
  for (let i = 0; i < 12; i++) beep(t0 + i * 0.2 + Math.floor(i / 4) * 0.35, i % 2 ? 880 : 1320, 0.16)
  navigator.vibrate?.([400, 150, 400, 150, 400])
}

export function tick() {
  if (!ctx) return
  beep(ctx.currentTime, 1600, 0.05, 0.08, 'sine')
}

export function boom() {
  if (!ctx) return
  const t = ctx.currentTime
  beep(t, 90, 0.6, 0.6, 'sawtooth')
  beep(t + 0.05, 60, 0.8, 0.5, 'square')
  navigator.vibrate?.([600, 100, 600])
}

export function pop() {
  if (!ctx) return
  beep(ctx.currentTime, 660, 0.08, 0.12, 'triangle')
}
