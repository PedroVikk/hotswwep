import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlarmClock, Pause, Play, RotateCcw } from 'lucide-react'
import { alarm, tick, unlockAudio } from '../lib/audio'
import { fmtTime } from '../lib/game'

/** cronômetro em anel; toca despertador e mostra "PAREM" no fim */
export function Timer({ seconds, autoStart = false }: { seconds: number; autoStart?: boolean }) {
  const [left, setLeft] = useState(seconds)
  const [run, setRun] = useState(autoStart)
  const [done, setDone] = useState(false)
  const ref = useRef<number | null>(null)

  useEffect(() => { setLeft(seconds); setRun(autoStart); setDone(false) }, [seconds, autoStart])

  useEffect(() => {
    if (!run) return
    ref.current = window.setInterval(() => {
      setLeft(l => {
        if (l <= 1) {
          window.clearInterval(ref.current!)
          setRun(false); setDone(true); alarm()
          return 0
        }
        if (l <= 6) tick()
        return l - 1
      })
    }, 1000)
    return () => window.clearInterval(ref.current!)
  }, [run])

  const R = 46, C = 2 * Math.PI * R, pct = left / seconds

  return (
    <div className="relative mt-5 flex items-center gap-4 rounded-3xl bg-black/25 p-3 ring-1 ring-white/8">
      <div className="relative size-[84px] shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <defs>
            <linearGradient id="tg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f5c06a" /><stop offset="1" stopColor="#ff3d7f" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="7" />
          <motion.circle cx="50" cy="50" r={R} fill="none" stroke="url(#tg)" strokeWidth="7" strokeLinecap="round"
            strokeDasharray={C} animate={{ strokeDashoffset: C * (1 - pct) }} transition={{ ease: 'linear', duration: 0.95 }} />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-display text-xl font-bold tabular-nums">
          {fmtTime(left)}
        </span>
      </div>
      <div className="flex flex-1 gap-2">
        <motion.button whileTap={{ scale: 0.94 }}
          onClick={() => { unlockAudio(); if (done || left === 0) { setLeft(seconds); setDone(false) } setRun(r => !r) }}
          className="btn-gold flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl font-semibold text-ink">
          {run ? <Pause className="size-4" /> : <Play className="size-4" />}{run ? 'Pausar' : left === seconds ? 'Valendo' : 'Continuar'}
        </motion.button>
        <motion.button whileTap={{ scale: 0.94 }} onClick={() => { setRun(false); setLeft(seconds); setDone(false) }}
          className="glass grid size-12 place-items-center rounded-2xl text-white/80" aria-label="Reiniciar">
          <RotateCcw className="size-4" />
        </motion.button>
      </div>
      <AnimatePresence>
        {done && (
          <motion.button initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDone(false)}
            className="fixed inset-0 z-50 grid place-items-center bg-rose/85 backdrop-blur-md">
            <motion.div animate={{ rotate: [-6, 6, -6] }} transition={{ repeat: Infinity, duration: 0.3 }} className="text-center">
              <AlarmClock className="mx-auto size-24 text-white" strokeWidth={1.6} />
              <p className="mt-4 font-display text-6xl font-black tracking-tight text-white">PAREM!</p>
              <p className="mt-2 text-white/80">O tempo acabou · toque pra fechar</p>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
