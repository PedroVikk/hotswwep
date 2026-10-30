import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Flame, HelpCircle, RefreshCw, Save, Smartphone, Target, Ticket, Trash2, X } from 'lucide-react'
import { COUPONS, KINKS } from '../data/content'
import { useGame } from '../store'
import { rnd, wrnd, ANAL_W, type Dare } from '../lib/game'
import { useTurn } from '../lib/useTurn'
import { Avatar, Big, Button, Card, Note, Prompt, Tag, Turn } from '../components/ui'

const g = (t: string) => t.replace(/@/g, '(a)')

export function Match() {
  const lvl = useGame(s => s.lvl)
  const { players } = useTurn()
  const L = (KINKS as Dare[]).filter(k => k[0] <= lvl && (!k[3] || players.some(p => p.g === k[3])))
  const [step, setStep] = useState(0) // 0 = jogador 1 vota, 1 = passa, 2 = jogador 2 vota, 3 = resultado
  const [idx, setIdx] = useState(0)
  const [ans, setAns] = useState<number[][]>([[], []])
  const [pick, setPick] = useState<string | null>(null)
  const who = step === 0 ? 0 : 1
  const vote = (v: number) => {
    setAns(a => { const n = a.map(x => [...x]); n[who][idx] = v; return n })
    if (idx + 1 < L.length) setIdx(idx + 1)
    else { setIdx(0); setStep(step + 1) }
  }
  if (step === 1) return (
    <Prompt k="pass" glow="gold" tag={<Tag icon={Smartphone}>Troca</Tag>}>
      <Big className="text-center">Passa o celular pra {players[1].n}</Big>
      <Note className="mt-2 text-center">{players[0].n}, nada de espiar.</Note>
      <Button className="mt-5" variant="primary" size="lg" onClick={() => setStep(2)}>Sou {players[1].n}, bora</Button>
    </Prompt>
  )
  if (step === 3) {
    const both = L.filter((_, i) => ans[0][i] === 2 && ans[1][i] === 2)
    const maybe = L.filter((_, i) => ans[0][i] && ans[1][i] && !(ans[0][i] === 2 && ans[1][i] === 2))
    return (
      <div className="space-y-4">
        <Card glow="rose">
          <Tag icon={Flame} tone="rose">Os dois querem · {both.length}</Tag>
          <ul className="mt-3 space-y-2">{both.map(k => <li key={k[1]} className="flex items-center gap-2 rounded-xl bg-rose/10 px-3 py-2 ring-1 ring-rose/20"><Check className="size-4 text-blush" />{g(k[1])}</li>)}</ul>
          {!both.length && <Note className="mt-3">Nenhum… ainda.</Note>}
        </Card>
        <Card>
          <Tag icon={HelpCircle} tone="mist">Talvez rola · {maybe.length}</Tag>
          <ul className="mt-3 space-y-1.5 text-white/80">{maybe.map(k => <li key={k[1]}>· {g(k[1])}</li>)}</ul>
        </Card>
        <Note className="text-center">Os “não” de cada um ficam em segredo.</Note>
        <AnimatePresence>{pick && <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="btn-gold rounded-3xl p-5 text-center text-ink"><p className="text-xs font-bold uppercase tracking-widest">Hoje é</p><p className="font-display text-2xl font-bold">{pick}</p></motion.div>}</AnimatePresence>
        {both.length > 0 && <Button variant="primary" size="lg" icon={Target} onClick={() => setPick(g(rnd(both)[1]))}>Sortear um pra hoje</Button>}
        <Button icon={RefreshCw} onClick={() => { setStep(0); setIdx(0); setAns([[], []]); setPick(null) }}>Votar de novo</Button>
      </div>
    )
  }
  const k = L[idx]
  return (
    <div className="space-y-5">
      <Turn p={players[who]} label="Vota em segredo:" />
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full bg-gradient-to-r from-gold to-rose" animate={{ width: `${((idx + 1) / L.length) * 100}%` }} /></div>
      <Prompt k={who + '-' + idx} tag={<Tag tone="mist">{idx + 1} de {L.length}</Tag>}>
        <Big className="min-h-[70px] text-center">{g(k[1])}</Big>
        <div className="mt-6 grid grid-cols-3 gap-2">
          <Button icon={X} onClick={() => vote(0)}>Não</Button>
          <Button icon={HelpCircle} onClick={() => vote(1)}>Talvez</Button>
          <Button icon={Flame} variant="primary" onClick={() => vote(2)}>Quero</Button>
        </div>
      </Prompt>
    </div>
  )
}

export function Coupons() {
  const lvl = useGame(s => s.lvl)
  const wallet = useGame(s => s.wallet), add = useGame(s => s.addCoupon), use = useGame(s => s.useCoupon)
  const { a, b, next } = useTurn()
  const [c, setC] = useState<{ t: string; k: number } | null>(null)
  const drawIt = () => {
    const L = (COUPONS as Dare[]).filter(x => x[0] <= lvl && (!x[3] || x[3] === b.g))
    const x = wrnd(L, y => (y[3] === 'f' ? ANAL_W : 1))
    setC({ t: x[1].replace(/@/g, b.g === 'm' ? 'o' : 'a'), k: Date.now() })
  }
  return (
    <div className="space-y-5">
      <Turn p={a} label="Quem ganha:" />
      <AnimatePresence mode="wait">
        {c ? (
          <motion.div key={c.k} initial={{ rotate: -8, y: 30, opacity: 0 }} animate={{ rotate: 0, y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}
            className="btn-gold relative overflow-hidden rounded-[28px] p-6 text-ink">
            <span className="absolute -left-4 top-1/2 size-8 -translate-y-1/2 rounded-full bg-ink" />
            <span className="absolute -right-4 top-1/2 size-8 -translate-y-1/2 rounded-full bg-ink" />
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.2em]"><Ticket className="size-4" />Vale · {b.n} deve a {a.n}</p>
            <p className="mt-3 border-t border-dashed border-ink/30 pt-3 font-display text-[28px] font-bold leading-tight">{c.t}</p>
            <p className="mt-3 text-xs font-medium opacity-70">Válido por 7 dias. Intransferível.</p>
          </motion.div>
        ) : (
          <Prompt k="idle" glow="gold" tag={<Tag icon={Ticket}>Vales safados</Tag>}>
            <Big>{a.n} sorteia um vale que {b.n} vai ter que pagar.</Big>
          </Prompt>
        )}
      </AnimatePresence>
      {c ? (
        <div className="grid grid-cols-2 gap-2.5">
          <Button icon={Trash2} onClick={() => setC(null)}>Descartar</Button>
          <Button variant="primary" icon={Save} onClick={() => { add({ de: b.n, para: a.n, t: c.t, at: Date.now() }); setC(null); next() }}>Guardar</Button>
        </div>
      ) : <Button variant="primary" size="lg" icon={Ticket} onClick={drawIt}>Sortear vale</Button>}

      <div className="pt-2">
        <h3 className="mb-3 font-display text-xl font-semibold">Carteira <span className="text-mist">· {wallet.length}</span></h3>
        {!wallet.length && <Note>Vazia. Os vales ficam salvos neste celular.</Note>}
        <div className="space-y-2">
          <AnimatePresence>
            {wallet.map((v, i) => (
              <motion.div key={v.at} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
                className="glass flex items-center gap-3 rounded-2xl p-3">
                <Avatar p={{ n: v.para, g: 'm', i: 1 }} size={32} />
                <div className="min-w-0 flex-1"><p className="text-[11px] text-mist">{v.para} cobra de {v.de}</p><p className="font-medium leading-snug">{v.t}</p></div>
                <Button size="sm" className="w-auto" variant="gold" icon={Check} onClick={() => use(i)}>Usar</Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
