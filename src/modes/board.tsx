import { useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { Cherry, Dices, FastForward, Flag, Flame, Infinity as Inf, MessageCircleHeart, Rewind, Shirt, Skull, Trophy, Wine, ArrowRight, RefreshCw, type LucideIcon } from 'lucide-react'
import { DARES, ORDERS, STRIP } from '../data/content'
import { useGame } from '../store'
import { analWeight, dareList, draw, fmt, positions, posName, rnd, roll, truthList, type Dare, type Player } from '../lib/game'
import { pairFor, useTurn } from '../lib/useTurn'
import { Avatar, Big, Button, Note, Prompt, Tag, Turn } from '../components/ui'
import { Die } from '../components/Dice'
import { PositionArt } from '../components/Art'

const SQ: Record<string, [LucideIcon, string, string]> = {
  '0': [Flag, 'Saída', 'text-white'], f: [Trophy, 'Chegada', 'text-gold'],
  d: [Flame, 'Desafio', 'text-rose'], v: [MessageCircleHeart, 'Verdade', 'text-gold'], b: [Wine, 'Bebe', 'text-blush'],
  k: [Inf, 'Posição', 'text-violet'], t: [Shirt, 'Strip', 'text-blush'], a: [Cherry, 'Anal', 'text-rose'],
  s: [FastForward, '+2', 'text-emerald-400'], r: [Rewind, '−3', 'text-orange-400'], x: [Skull, 'Castigo', 'text-white'],
}
const BOARD = ('0' + 'dvbtkdsvarxdbktvadsrkbx'.slice(1) + 'f').split('')

/** token animado: o layoutId faz ele “andar” de uma casa para outra */
export function Token({ p, id }: { p: Player; id: string }) {
  return <motion.span layoutId={id} transition={{ type: 'spring', stiffness: 300, damping: 26 }} className="relative z-10"><Avatar p={p} size={20} /></motion.span>
}

type Res = { d: number; extra: string; kind: string; body: React.ReactNode } | null

export function PleasureBoard() {
  const lvl = useGame(s => s.lvl), combo = useGame(s => s.combo)
  const { players, turn, setTurn } = useTurn()
  const [pos, setPos] = useState([0, 0])
  const [res, setRes] = useState<Res>(null)
  const [win, setWin] = useState<Player | null>(null)
  const { a, b, i } = pairFor(players, turn)

  const cardFor = (t: string, a: Player, b: Player): React.ReactNode => {
    if (t === 'd') return <Big>{fmt(draw('tbd', dareList(a, b, lvl), analWeight(b))[1], a, b)}</Big>
    if (t === 'v') return <Big>{fmt(draw('tbv', truthList(a, lvl))[1], a, b)}</Big>
    if (t === 'b') return <><Big>{a.n} bebe 2 goles</Big><Note className="mt-2">ou faz: {fmt(draw('tbd', dareList(a, b, lvl), analWeight(b))[1], a, b)}</Note></>
    if (t === 'k') { const p = draw('tbk', positions(combo, lvl)); return <><Big>{posName(p, a.g)} · 1 minuto</Big><div className="mt-4"><PositionArt p={p} /></div></> }
    if (t === 't') return <Big>{fmt(rnd(STRIP as [string][])[0], a, b)}</Big>
    if (t === 'a') {
      if (a.g === 'f' && b.g !== 'f') [a, b] = [b, a] // a casa anal é sempre pra ela receber
      const L = (DARES as Dare[]).filter(c => c[5] && (!c[3] || c[3] === a.g) && (!c[4] || c[4] === b.g) && c[0] <= Math.max(lvl, 2))
      return <Big>{fmt((L.length ? rnd(L) : draw('tbd', dareList(a, b, lvl)))[1], a, b)}</Big>
    }
    if (t === 'x') return <><Big>{fmt(rnd((ORDERS as Dare[]).filter(x => x[0] <= lvl))[1], b, a).replace(/@/g, a.g === 'm' ? 'o' : 'a')}</Big><Note className="mt-2">{b.n} manda, {a.n} obedece.</Note></>
    return null
  }

  const play = () => {
    const d = roll()
    let np = Math.min(pos[i] + d, BOARD.length - 1), extra = ''
    if (BOARD[np] === 's') { np = Math.min(np + 2, BOARD.length - 1); extra = 'Sorte! +2 casas' }
    else if (BOARD[np] === 'r') { np = Math.max(np - 3, 0); extra = 'Azar! Volta 3 casas' }
    const n = [...pos]; n[i] = np; setPos(n)
    const t = BOARD[np]
    if (t === 'f') { setWin(a); return }
    setRes({ d, extra, kind: t, body: cardFor(t, a, b) })
  }

  return (
    <div className="space-y-5">
      <div className="glass grid grid-cols-5 gap-1.5 rounded-[28px] p-2.5">
        {BOARD.map((t, k) => {
          const r = Math.floor(k / 5), c = r % 2 ? 4 - (k % 5) : k % 5
          const [Icon, label, color] = SQ[t]
          return (
            <div key={k} style={{ gridRow: r + 1, gridColumn: c + 1 }}
              className={clsx('relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-2xl bg-white/[.04] ring-1 ring-white/8', pos[i] === k && 'ring-2 ring-gold/70 bg-gold/10')}>
              <Icon className={clsx('size-5', color)} strokeWidth={1.8} />
              <span className="text-[8.5px] font-medium uppercase tracking-wide text-mist">{label}</span>
              <div className="absolute -bottom-1 flex -space-x-1.5">
                {pos[0] === k && <Token p={players[0]} id="tb0" />}
                {pos[1] === k && <Token p={players[1]} id="tb1" />}
              </div>
            </div>
          )
        })}
      </div>

      {win ? (
        <Prompt k="win" glow="gold" tag={<Tag icon={Trophy}>Chegada</Tag>}>
          <Big>{win.n} venceu!</Big>
          <Note className="mt-2 text-[15px]">{win.n} escolhe qualquer fantasia e o outro realiza agora — dentro dos limites.</Note>
          <Button className="mt-5" variant="primary" icon={RefreshCw} onClick={() => { setPos([0, 0]); setWin(null); setRes(null) }}>Nova partida</Button>
        </Prompt>
      ) : res ? (
        <Prompt k={turn + res.kind} tag={<div className="flex items-center gap-3"><Die value={res.d} rollKey={turn} size={34} /><Tag icon={SQ[res.kind][0]} tone="rose">{SQ[res.kind][1]}</Tag></div>}>
          {res.extra && <p className="mb-2 text-sm font-semibold text-gold">{res.extra}</p>}
          {res.body}
          <Button className="mt-5" variant="primary" icon={ArrowRight} onClick={() => { setRes(null); setTurn(turn + 1) }}>Vez de {b.n}</Button>
        </Prompt>
      ) : (
        <>
          <Turn p={a} />
          <Button variant="primary" size="lg" icon={Dices} onClick={play}>Rolar o dado</Button>
        </>
      )}
    </div>
  )
}
