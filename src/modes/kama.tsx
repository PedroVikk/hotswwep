import { useState } from 'react'
import { motion } from 'framer-motion'
import { Infinity as Inf, Lightbulb, Shuffle, Sparkles, Star, Target } from 'lucide-react'
import { ANAL_MODS, MODS, TIPS } from '../data/content'
import { useGame } from '../store'
import { allPositions, clean, draw, positions, posName, rnd, type Position } from '../lib/game'
import { usePlayers } from '../store'
import { Big, Button, Card, Note, Prompt, Tag } from '../components/ui'
import { Legend, PositionArt } from '../components/Art'
import { Timer } from '../components/Timer'

const Stars = ({ d }: { d: number }) => (
  <span className="flex items-center gap-0.5">
    {[1, 2, 3].map(i => <Star key={i} className={`size-3.5 ${i <= d ? 'fill-gold text-gold' : 'text-white/20'}`} />)}
  </span>
)

function PositionInfo({ p, tip = true }: { p: Position; tip?: boolean }) {
  const combo = useGame(s => s.combo)
  const a = usePlayers()[0]
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <Big className="text-[24px]">{posName(p, a.g)}</Big>
        <div className="mt-2 flex flex-col items-end gap-1">
          <Stars d={p.d} />
          {p.np ? <span className="text-[10px] uppercase tracking-widest text-mist">sem penetração</span> : null}
        </div>
      </div>
      <div className="mt-4"><PositionArt p={p} /><Legend np={p.np} /></div>
      <Note className="mt-4 text-[15px] text-white/85">{p.t}</Note>
      {tip && !p.np && (
        <p className="mt-3 flex gap-2 rounded-2xl bg-white/5 p-3 text-[13px] text-mist ring-1 ring-white/8">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-gold" />{TIPS[combo]}
        </p>
      )}
    </>
  )
}

export function KamaRoulette() {
  const combo = useGame(s => s.combo), lvl = useGame(s => s.lvl)
  const mk = () => {
    const p = draw('k' + combo, positions(combo, lvl))
    let m: string = draw('m', (MODS as [number, string][]).filter(x => x[0] <= lvl))[1]
    let anal = false
    if (!p.np && lvl > 1 && combo !== 'mm' && Math.random() < 0.45) { m = rnd(ANAL_MODS as string[]); anal = true }
    const secs = [60, 120, 180, 300][Math.min(lvl + Math.floor(Math.random() * 2), 3)]
    return { p, m: clean(m), anal, secs, k: Date.now() }
  }
  const [s, setS] = useState(mk)
  return (
    <div className="space-y-5">
      <Prompt k={s.k} tag={<Tag icon={Inf} tone="rose">Roleta Kama Sutra</Tag>}>
        <PositionInfo p={s.p} />
        <div className={`mt-4 flex gap-3 rounded-2xl p-3.5 ring-1 ${s.anal ? 'bg-rose/12 ring-rose/30' : 'bg-gold/8 ring-gold/20'}`}>
          <Target className={`mt-0.5 size-5 shrink-0 ${s.anal ? 'text-blush' : 'text-gold'}`} />
          <div><p className="text-[11px] font-semibold uppercase tracking-widest text-mist">Regra extra</p><p className="font-medium text-white">{s.m}</p></div>
        </div>
        <Timer seconds={s.secs} />
      </Prompt>
      <Button variant="primary" size="lg" icon={Shuffle} onClick={() => setS(mk())}>Sortear outra</Button>
    </div>
  )
}

export function Catalog() {
  const combo = useGame(s => s.combo)
  const list = allPositions(combo)
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-3">
      <Note className="text-center">{list.length} posições para o casal de vocês · toque para ver</Note>
      <div className="grid grid-cols-2 gap-3">
        {list.map((p, i) => (
          <motion.button key={p.n} layout onClick={() => setOpen(open === i ? null : i)}
            className={`text-left ${open === i ? 'col-span-2' : ''}`}>
            {open === i ? (
              <Card glow="rose"><PositionInfo p={p} tip /></Card>
            ) : (
              <div className="glass rounded-3xl p-2.5">
                <PositionArt p={p} />
                <p className="mt-2 line-clamp-1 px-1 text-[13px] font-semibold">{posName(p, 'm').replace(/\(.*\)/, '')}</p>
                <div className="flex items-center justify-between px-1 pb-0.5"><Stars d={p.d} />{p.np ? <Sparkles className="size-3.5 text-blush" /> : null}</div>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
