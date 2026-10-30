import { motion } from 'framer-motion'
import clsx from 'clsx'
import { ChevronRight, Flame, Mars, ShieldCheck, Sparkles, Venus, VenusAndMars, Settings2 } from 'lucide-react'
import { useGame, usePlayers } from '../store'
import { LEVELS, type Combo, type Level } from '../lib/game'
import { unlockAudio } from '../lib/audio'
import { Avatar, Button, Card, Note, Segmented, Tag } from '../components/ui'
import { SECTIONS, type Mode } from '../modes'

export function Logo({ size = 72 }: { size?: number }) {
  return (
    <motion.svg viewBox="0 0 64 64" width={size} height={size} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 14 }}>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe3b0" /><stop offset=".45" stopColor="#f5c06a" /><stop offset="1" stopColor="#ff3d7f" /></linearGradient>
        <filter id="lgl"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      <motion.path d="M32 6c11 13 8 21 8 21s5-2 6-9c8 10 8 20 2 28-4 6-10 9-16 9s-12-3-16-9c-5-8-3-17 3-23 0 6 3 9 7 10-4-10 0-19 6-27z"
        fill="url(#lg)" filter="url(#lgl)" opacity=".6" animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ repeat: Infinity, duration: 2.4 }} />
      <path d="M32 6c11 13 8 21 8 21s5-2 6-9c8 10 8 20 2 28-4 6-10 9-16 9s-12-3-16-9c-5-8-3-17 3-23 0 6 3 9 7 10-4-10 0-19 6-27z" fill="url(#lg)" />
      <path d="M32 34c5 6 6 11 3 15-1 2-2 3-3 3s-2-1-3-3c-3-4-2-9 3-15z" fill="#0a0610" opacity=".55" />
    </motion.svg>
  )
}

export function AgeGate() {
  const set = useGame(s => s.set)
  return (
    <div className="flex min-h-[88vh] flex-col items-center justify-center text-center">
      <Logo size={96} />
      <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
        className="mt-6 font-display text-6xl font-black italic leading-none tracking-tight text-gradient">Jogo<br />Quente</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4 max-w-xs text-mist">
        Jogos adultos para casais. Tabuleiros, Kama Sutra, desafios e bebida.
      </motion.p>
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }} className="mt-10 w-full space-y-4">
        <Card className="text-left">
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-rose/15 font-display text-lg font-black text-blush ring-1 ring-rose/30">18+</span>
            <Note>Conteúdo sexual explícito. Tudo é sugestão: qualquer um pode recusar qualquer carta, a qualquer momento.</Note>
          </div>
        </Card>
        <Button variant="primary" size="lg" icon={Flame} onClick={() => { unlockAudio(); set({ ageOk: true }) }}>Tenho mais de 18 · entrar</Button>
      </motion.div>
    </div>
  )
}

export function Setup({ onDone }: { onDone: () => void }) {
  const s = useGame()
  return (
    <div className="space-y-7 pb-6">
      <div className="pt-4 text-center">
        <Logo size={56} />
        <h1 className="mt-3 font-display text-4xl font-bold italic text-gradient">Quem tá jogando?</h1>
      </div>
      <section className="space-y-3">
        <Label>O casal</Label>
        <Segmented<Combo> value={s.combo} onChange={combo => s.set({ combo })} options={[
          { v: 'mf', label: 'Ele & Ela', icon: VenusAndMars }, { v: 'mm', label: 'Ele & Ele', icon: Mars }, { v: 'ff', label: 'Ela & Ela', icon: Venus },
        ]} />
      </section>
      <section className="space-y-3">
        <Label>Nomes</Label>
        {(['n1', 'n2'] as const).map((k, i) => (
          <label key={k} className="glass flex items-center gap-3 rounded-2xl px-4 py-1 focus-within:ring-2 focus-within:ring-rose/50">
            <span className={clsx('size-2.5 rounded-full', i ? 'bg-gold' : 'bg-rose')} />
            <input value={s[k]} onChange={e => s.set({ [k]: e.target.value } as any)} maxLength={16}
              placeholder={`Jogador ${i + 1}`} className="h-12 w-full bg-transparent text-white outline-none placeholder:text-mist/60" />
          </label>
        ))}
      </section>
      <section className="space-y-3">
        <Label>Intensidade</Label>
        <Segmented<Level> value={s.lvl} onChange={lvl => s.set({ lvl })} options={([1, 2, 3] as Level[]).map(l => ({ v: l, label: LEVELS[l].name, sub: LEVELS[l].hint }))} />
      </section>
      <div className="flex gap-3 rounded-2xl border border-dashed border-rose/40 bg-rose/5 p-4">
        <ShieldCheck className="size-5 shrink-0 text-blush" />
        <Note>Combinem uma <b className="text-white">palavra de segurança</b> antes de começar. Falou, parou, sem discussão.</Note>
      </div>
      <Button variant="primary" size="lg" icon={Sparkles} onClick={() => { unlockAudio(); onDone() }}>Começar</Button>
    </div>
  )
}

const Label = ({ children }: { children: React.ReactNode }) => <p className="px-1 text-xs font-semibold uppercase tracking-[.2em] text-mist">{children}</p>

export function Menu({ onOpen, onSettings }: { onOpen: (m: Mode) => void; onSettings: () => void }) {
  const lvl = useGame(s => s.lvl)
  const players = usePlayers()
  const featured = SECTIONS[0].modes[0]
  return (
    <div className="space-y-8 pb-10">
      <header className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">{players.map(p => <Avatar key={p.i} p={p} size={34} />)}</div>
          <Tag icon={Flame} tone="rose">{LEVELS[lvl].name}</Tag>
        </div>
        <button onClick={onSettings} className="glass grid size-11 place-items-center rounded-2xl text-white/80" aria-label="Ajustes"><Settings2 className="size-5" /></button>
      </header>

      <h1 className="font-display text-[40px] font-bold leading-[1.05] tracking-tight">
        Bora jogar,<br /><span className="italic text-gradient">{players[0].n} & {players[1].n}</span>
      </h1>

      <motion.button whileTap={{ scale: 0.98 }} onClick={() => onOpen(featured)}
        className="relative block w-full overflow-hidden rounded-[30px] p-[1.5px] text-left">
        <span className="absolute inset-0 bg-gradient-to-br from-gold via-rose to-violet" />
        <span className="relative flex flex-col gap-4 rounded-[29px] bg-gradient-to-br from-[#2a1424] to-ink p-5">
          <span className="flex items-center justify-between">
            <Tag icon={Sparkles}>Novo</Tag>
            <featured.icon className="size-9 text-gold" strokeWidth={1.4} />
          </span>
          <span>
            <span className="block font-display text-3xl font-bold italic text-gradient">{featured.title}</span>
            <span className="mt-1 block text-sm text-mist">{featured.sub}</span>
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-gold">Jogar agora <ChevronRight className="size-4" /></span>
        </span>
      </motion.button>

      {SECTIONS.map((sec, si) => (
        <section key={sec.title}>
          <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-[.2em] text-mist">{sec.title}</h2>
          <div className="grid grid-cols-2 gap-3">
            {sec.modes.filter(m => m !== featured).map((m, k, arr) => (
              <motion.button key={m.id} onClick={() => onOpen(m)} whileTap={{ scale: 0.96 }}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * (si * 3 + k) }}
                className={clsx('glass group flex rounded-[26px] p-4 text-left',
                  arr.length % 2 && k === arr.length - 1 ? 'col-span-2 items-center gap-4' : 'min-h-[148px] flex-col justify-between')}>
                <span className={clsx('grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br shadow-lg', m.tone)}>
                  <m.icon className="size-5 text-white" strokeWidth={2} />
                </span>
                <span>
                  <span className="block font-display text-[19px] font-semibold leading-tight">{m.title}</span>
                  <span className="mt-1 line-clamp-2 block text-[12px] leading-snug text-mist">{m.sub}</span>
                </span>
              </motion.button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
