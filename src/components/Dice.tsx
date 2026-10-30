import { motion } from 'framer-motion'
import clsx from 'clsx'

const PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[26, 26], [50, 50], [74, 74]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]],
  6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]],
}

/** dado com pips; `rollKey` muda → anima a rolagem */
export function Die({ value, rollKey, tone = 'rose', size = 64 }: { value: number; rollKey?: number | string; tone?: 'rose' | 'gold'; size?: number }) {
  return (
    <motion.div key={rollKey} style={{ width: size, height: size }}
      initial={{ rotate: -200, scale: 0.4, y: -40, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 14 }}
      className={clsx('relative rounded-[22%] shadow-2xl ring-1 ring-white/30',
        tone === 'rose' ? 'bg-gradient-to-br from-blush via-rose to-wine' : 'bg-gradient-to-br from-champagne via-gold to-[#b5782a]')}>
      <span className="absolute inset-[6%] rounded-[18%] bg-gradient-to-br from-white/25 to-transparent" />
      {(PIPS[value] ?? []).map(([x, y], i) => (
        <span key={i} className="absolute size-[17%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/85 shadow-inner"
          style={{ left: `${x}%`, top: `${y}%` }} />
      ))}
    </motion.div>
  )
}

/** "dado" de texto (para os dados eróticos) */
export function WordDie({ label, rollKey, tone }: { label: string; rollKey: number; tone: 'rose' | 'gold' | 'mist' }) {
  return (
    <motion.div key={rollKey}
      initial={{ rotateY: 540, opacity: 0, scale: 0.6 }} animate={{ rotateY: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, type: 'spring', stiffness: 120, damping: 14 }}
      style={{ transformPerspective: 600 }}
      className={clsx('grid min-h-24 place-items-center rounded-3xl p-3 text-center text-[15px] font-semibold leading-tight shadow-xl ring-1 ring-white/20',
        tone === 'rose' && 'bg-gradient-to-br from-rose to-wine text-white',
        tone === 'gold' && 'bg-gradient-to-br from-champagne to-gold text-ink',
        tone === 'mist' && 'glass text-white')}>
      {label}
    </motion.div>
  )
}
