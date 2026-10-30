import { motion } from 'framer-motion'
import clsx from 'clsx'
import { IMG, POS } from '../data/content'
import type { Position } from '../lib/game'

/** desenho estilizado da posição (dois corpos em traço) */
export function PositionArt({ p, className }: { p: Position; className?: string }) {
  const im = IMG[(POS as Position[]).indexOf(p)]
  if (!im) return null
  const body = (str: string, grad: string, glow: string) => {
    const q = str.split(' ').map(s => s.split(',').map(Number))
    const seg = [[1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [1, 7], [7, 8], [1, 9], [9, 10], [0, 1]]
    return (
      <g filter={`url(#${glow})`}>
        <g stroke={`url(#${grad})`} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {seg.map(([a, b], i) => <line key={i} x1={q[a][0]} y1={q[a][1]} x2={q[b][0]} y2={q[b][1]} />)}
        </g>
        <circle cx={q[0][0]} cy={q[0][1]} r="8.5" fill={`url(#${grad})`} />
      </g>
    )
  }
  return (
    <motion.svg viewBox="0 0 200 118" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
      className={clsx('w-full rounded-2xl bg-gradient-to-b from-black/40 to-plum/60 ring-1 ring-white/8', className)}>
      <defs>
        <linearGradient id="gr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffb3cd" /><stop offset="1" stopColor="#ff3d7f" /></linearGradient>
        <linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe3b0" /><stop offset="1" stopColor="#e0a040" /></linearGradient>
        <filter id="fr" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="0" stdDeviation="2.2" floodColor="#ff3d7f" floodOpacity=".55" /></filter>
        <filter id="fg" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="0" stdDeviation="2.2" floodColor="#f5c06a" floodOpacity=".5" /></filter>
        <radialGradient id="spot" cx=".5" cy=".9" r=".7"><stop offset="0" stopColor="#ff3d7f" stopOpacity=".22" /><stop offset="1" stopColor="#ff3d7f" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="200" height="118" fill="url(#spot)" />
      <line x1="6" y1="112" x2="194" y2="112" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" />
      <g dangerouslySetInnerHTML={{ __html: String(im[0]).replace(/#3a1a28/g, 'rgba(255,255,255,.07)') }} />
      {body(im[1], 'gr', 'fr')}
      {body(im[2], 'gg', 'fg')}
    </motion.svg>
  )
}

export function Legend({ np }: { np?: number }) {
  return (
    <div className="mt-2 flex justify-center gap-4 text-[11px] text-mist">
      <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-gradient-to-br from-champagne to-gold" />{np ? 'quem conduz' : 'quem penetra'}</span>
      <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-gradient-to-br from-blush to-rose" />{np ? 'parceiro(a)' : 'quem recebe'}</span>
    </div>
  )
}
