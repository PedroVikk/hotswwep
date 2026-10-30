import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bomb, Crown, Drama, EyeOff, Flame, Lock, RefreshCw, Repeat, Shirt, Sparkles, Timer as TimerIcon, Trophy, Droplets } from 'lucide-react'
import { DARES, EDGE, ORDERS, PUNISH, QUICK, RP, RP_RULES, STRIP } from '../data/content'
import { useGame } from '../store'
import { analWeight, draw, fmt, rnd, wrnd, type Dare } from '../lib/game'
import { useTurn } from '../lib/useTurn'
import { boom, unlockAudio } from '../lib/audio'
import { Avatar, Big, Button, Card, Note, Prompt, Row, Tag, Turn } from '../components/ui'
import { Timer } from '../components/Timer'
import { DareBody } from './classic'

const oa = (g: string) => (g === 'm' ? 'o' : 'a')

export function Master() {
  const lvl = useGame(s => s.lvl)
  const { players } = useTurn()
  const [boss, setBoss] = useState<0 | 1>(() => (Math.random() < 0.5 ? 0 : 1))
  const mk = (bs: number) => ({ o: draw('o' + bs, (ORDERS as Dare[]).filter(x => x[0] <= lvl)), k: Date.now() })
  const [s, setS] = useState(() => ({ ...mk(boss), n: 1 }))
  const a = players[boss], b = players[1 - boss]
  return (
    <div className="space-y-5">
      <div className="glass flex items-center justify-between rounded-3xl p-3">
        <div className="flex items-center gap-2.5"><Avatar p={a} /><div><p className="text-[10px] uppercase tracking-widest text-gold">manda</p><p className="font-semibold">{a.n}</p></div><Crown className="size-5 text-gold" /></div>
        <div className="flex items-center gap-2.5 text-right"><Lock className="size-5 text-blush" /><div><p className="text-[10px] uppercase tracking-widest text-blush">obedece</p><p className="font-semibold">{b.n}</p></div><Avatar p={b} /></div>
      </div>
      <Prompt k={s.k} glow="gold" tag={<Tag icon={Crown}>Ordem {s.n}</Tag>}
        footer={<Note>{a.n} lê em voz alta. {b.n} só responde “sim, {a.g === 'm' ? 'senhor' : 'senhora'}”.</Note>}>
        <Big className="italic">“{s.o[1].replace(/@/g, oa(b.g))}”</Big>
      </Prompt>
      <Button variant="primary" size="lg" icon={Lock} onClick={() => setS(x => ({ ...mk(boss), n: x.n + 1 }))}>Próxima ordem</Button>
      <Button icon={Repeat} onClick={() => { const nb = (1 - boss) as 0 | 1; setBoss(nb); setS({ ...mk(nb), n: 1 }) }}>Trocar quem manda</Button>
    </div>
  )
}

export function Roleplay() {
  const { a, b, next } = useTurn()
  const mk = () => ({ r: draw('rp', RP as string[]), rule: rnd(RP_RULES as string[]), k: Date.now() })
  const [s, setS] = useState(mk)
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-5">
      <Prompt k={s.k} tag={<Tag icon={Drama} tone="rose">A cena</Tag>}>
        <Big>{fmt(s.r, a, b)}</Big>
        <button onClick={() => setShow(v => !v)} className="mt-5 w-full rounded-2xl bg-black/30 p-4 text-left ring-1 ring-gold/25">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-gold"><EyeOff className="size-3.5" />Regra secreta {show ? '' : '· toque para revelar'}</p>
          <p className={`mt-1 font-medium transition ${show ? '' : 'select-none blur-md'}`}>{fmt(s.rule, a, b)}</p>
        </button>
        <Timer seconds={600} />
      </Prompt>
      <Button variant="primary" size="lg" icon={Drama} onClick={() => { setShow(false); next(); setS(mk()) }}>Outra cena</Button>
    </div>
  )
}

export function Strip() {
  const { players, turn, setTurn } = useTurn()
  const [s, setS] = useState<{ c: [string, number?]; t: number; k: number } | null>(null)
  const spin = () => { const t = turn + 1; setTurn(t); setS({ c: rnd(STRIP as [string, number?][]), t, k: Date.now() }) }
  const a = players[(s?.t ?? turn) % 2], b = players[((s?.t ?? turn) + 1) % 2]
  return (
    <div className="space-y-5">
      <Prompt k={s?.k ?? 'idle'} tag={<Tag icon={Shirt} tone="rose">Strip roleta</Tag>}>
        {s ? <><Big className="text-center">{fmt(s.c[0], a, b)}</Big>{s.c[1] ? <Timer seconds={s.c[1]} /> : null}</>
          : <Note className="text-center">Girem a roleta. Cada giro deixa alguém com menos roupa.</Note>}
      </Prompt>
      <Button variant="primary" size="lg" icon={RefreshCw} onClick={spin}>Girar</Button>
    </div>
  )
}

export function Edge() {
  const lvl = useGame(s => s.lvl)
  const { a, b, next } = useTurn()
  const L = (EDGE as Dare[]).filter(x => x[0] <= lvl)
  const [n, setN] = useState(0)
  const [lost, setLost] = useState<string | null>(null)
  const r = L[Math.min(n, L.length - 1)]
  if (lost) return (
    <div className="space-y-5">
      <Prompt k="lost" glow="gold" tag={<Tag icon={Droplets} tone="rose">Alguém gozou</Tag>}>
        <Note>Castigo do perdedor</Note>
        <Big className="mt-2 text-gold">{lost}</Big>
      </Prompt>
      <Button variant="primary" size="lg" icon={RefreshCw} onClick={() => { setLost(null); setN(0) }}>Jogar de novo</Button>
    </div>
  )
  return (
    <div className="space-y-5">
      <div className="flex gap-1.5">{L.map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= n ? 'bg-gradient-to-r from-gold to-rose' : 'bg-white/10'}`} />)}</div>
      <Prompt k={n} tag={<Tag icon={TimerIcon} tone="rose">Rodada {n + 1} de {L.length}</Tag>} footer={<Note>Quem gozar primeiro perde. Segura!</Note>}>
        <Big>{fmt(r[1], a, b)}</Big>
        <Timer seconds={r[2] as number} />
      </Prompt>
      <Row>
        <Button icon={Droplets} onClick={() => setLost(rnd(PUNISH as string[]).replace(/@/g, '(a)'))}>Alguém gozou</Button>
        <Button variant="primary" icon={Flame} onClick={() => { next(); setN(x => Math.min(x + 1, L.length - 1)) }}>Próxima</Button>
      </Row>
    </div>
  )
}

export function BombGame() {
  const lvl = useGame(s => s.lvl)
  const { players } = useTurn()
  const [st, setSt] = useState<'idle' | 'run' | 'boom'>('idle')
  const [hold, setHold] = useState<0 | 1>(0)
  const [act, setAct] = useState('')
  const [dare, setDare] = useState<Dare | null>(null)
  const t = useRef<number | null>(null)
  useEffect(() => () => { if (t.current) window.clearTimeout(t.current) }, [])
  const holdRef = useRef(hold); holdRef.current = hold
  const start = () => {
    unlockAudio()
    const h = (Math.random() < 0.5 ? 0 : 1) as 0 | 1
    setHold(h); setAct(rnd(QUICK as string[])); setSt('run')
    t.current = window.setTimeout(() => {
      const a = players[holdRef.current], b = players[1 - holdRef.current]
      const lv = Math.max(lvl, 2)
      const L = (DARES as Dare[]).filter(c => (c[0] === lv || c[0] === lvl) && (!c[3] || c[3] === a.g) && (!c[4] || c[4] === b.g) && (!c[5] || lvl > 1))
      setDare(wrnd(L, analWeight(b))); setSt('boom'); boom()
    }, (15 + Math.random() * 45) * 1000)
  }
  const a = players[hold], b = players[1 - hold]
  if (st === 'idle') return (
    <div className="space-y-5">
      <Prompt k="bomb-rules" tag={<Tag icon={Bomb} tone="rose">Bomba safada</Tag>}>
        <Big>O pavio tem um tempo secreto.</Big>
        <Note className="mt-3 text-[15px]">Entre 15 e 60 segundos. Quem estiver com o celular faz a ação rápida no outro e passa. Quem estiver segurando quando explodir paga o desafio pesado.</Note>
      </Prompt>
      <Button variant="primary" size="lg" icon={Flame} onClick={start}>Acender o pavio</Button>
    </div>
  )
  if (st === 'run') return (
    <div className="space-y-6 text-center">
      <motion.div animate={{ scale: [1, 1.12, 1], rotate: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 0.7 }}
        className="mx-auto grid size-36 place-items-center rounded-full bg-gradient-to-br from-rose/40 to-wine/30 ring-1 ring-rose/40 shadow-[0_0_80px_-10px_#ff3d7f]">
        <Bomb className="size-20 text-white" strokeWidth={1.5} />
      </motion.div>
      <Turn p={a} label="Segura:" />
      <AnimatePresence mode="wait">
        <motion.p key={hold + act} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-2xl font-semibold">
          {a.n} {act} de {b.n}
        </motion.p>
      </AnimatePresence>
      <motion.button whileTap={{ scale: 0.92 }} onClick={() => { setHold(h => (1 - h) as 0 | 1); setAct(rnd(QUICK as string[])) }}
        className="btn-primary shine h-24 w-full rounded-[28px] font-display text-3xl font-black tracking-wide">PASSAR</motion.button>
    </div>
  )
  return (
    <div className="space-y-5">
      <motion.div initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center font-display text-6xl font-black text-gradient">BOOM!</motion.div>
      {dare && <Prompt k="boom" tag={<Tag icon={Bomb} tone="rose">{a.n} paga</Tag>}><DareBody c={dare} a={a} b={b} /></Prompt>}
      <Button variant="primary" size="lg" icon={RefreshCw} onClick={() => setSt('idle')}>De novo</Button>
    </div>
  )
}

export function ResultCard({ title, text }: { title: string; text: string }) {
  return <Card glow="gold"><Tag icon={Trophy}>{title}</Tag><Big className="mt-3">{text}</Big><Sparkles className="absolute right-5 top-5 size-5 text-gold" /></Card>
}
