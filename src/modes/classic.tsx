import { useState } from 'react'
import { Check, Dices, Flame, MessageCircleHeart, SkipForward, Wine, X } from 'lucide-react'
import { ACTS, NEVER, PARTS, TIMES, TSEC } from '../data/content'
import { useGame } from '../store'
import { analWeight, dareList, draw, fmt, LEVELS, positionForText, rnd, truthList, type Dare, type Player } from '../lib/game'
import { pairFor, useTurn } from '../lib/useTurn'
import { Big, Button, Note, Prompt, Row, Score, Tag, Turn } from '../components/ui'
import { Timer } from '../components/Timer'
import { PositionArt, Legend } from '../components/Art'
import { WordDie } from '../components/Dice'

/** corpo de uma carta de desafio: texto + desenho da posição (se houver) + timer */
export function DareBody({ c, a, b }: { c: Dare; a: Player; b: Player }) {
  const combo = useGame(s => s.combo), lvl = useGame(s => s.lvl)
  const [pos] = useState(() => positionForText(c[1], combo, lvl))
  return (
    <>
      <Big>{fmt(c[1], a, b)}</Big>
      {pos && <div className="mt-5"><PositionArt p={pos} /><Legend np={pos.np} /></div>}
      {c[2] ? <Timer seconds={c[2]} /> : null}
    </>
  )
}

export function TruthDare() {
  const lvl = useGame(s => s.lvl)
  const { a, b, i, next, players } = useTurn()
  const [card, setCard] = useState<{ kind: 'v' | 'd'; c: Dare; id: number } | null>(null)
  const [score, setScore] = useState([0, 0])
  const pick = (kind: 'v' | 'd') => {
    const c = kind === 'v' ? draw('t' + a.g + b.g, truthList(a, lvl)) : draw('d' + a.g + b.g, dareList(a, b, lvl), analWeight(b))
    setCard({ kind, c, id: Date.now() })
  }
  const done = (ok: boolean) => { if (ok) setScore(s => s.map((v, k) => (k === i ? v + 1 : v))); setCard(null); next() }
  return (
    <div className="space-y-5">
      <Turn p={a} />
      {!card ? (
        <Prompt k={'ask' + a.n} tag={<Tag icon={Flame}>{LEVELS[lvl].name}</Tag>}>
          <Big className="text-center">{a.n}, verdade ou desafio?</Big>
          <Row>
            <Button icon={MessageCircleHeart} size="lg" onClick={() => pick('v')}>Verdade</Button>
            <Button icon={Flame} variant="primary" size="lg" onClick={() => pick('d')}>Desafio</Button>
          </Row>
        </Prompt>
      ) : (
        <Prompt k={card.id} glow={card.kind === 'v' ? 'gold' : 'rose'}
          tag={<Tag icon={card.kind === 'v' ? MessageCircleHeart : Flame} tone={card.kind === 'v' ? 'gold' : 'rose'}>{card.kind === 'v' ? 'Verdade' : 'Desafio'}</Tag>}>
          {card.kind === 'v' ? <Big>{fmt(card.c[1], a, b)}</Big> : <DareBody c={card.c} a={a} b={b} />}
          <Row>
            <Button icon={X} onClick={() => done(false)}>Passo</Button>
            <Button icon={Check} variant="primary" onClick={() => done(true)}>Feito</Button>
          </Row>
        </Prompt>
      )}
      <Score items={players.map(p => ({ p, v: <span className="text-gold">{score[p.i]} pts</span> }))} />
    </div>
  )
}

export function DoOrDrink() {
  const lvl = useGame(s => s.lvl)
  const { players, turn, setTurn } = useTurn()
  const mk = (t: number) => { const { a, b } = pairFor(players, t); return { c: draw('b' + a.g + b.g, dareList(a, b, lvl), analWeight(b)), id: Date.now() } }
  const [card, setCard] = useState(() => mk(turn))
  const [drinks, setDrinks] = useState([0, 0])
  const { a, b, i } = pairFor(players, turn)
  const go = (drank: boolean) => {
    if (drank) setDrinks(d => d.map((v, k) => (k === i ? v + 1 : v)))
    setTurn(turn + 1); setCard(mk(turn + 1))
  }
  return (
    <div className="space-y-5">
      <Turn p={a} />
      <Prompt k={card.id} tag={<Tag icon={Wine} tone="rose">Faz ou bebe</Tag>}>
        <DareBody c={card.c} a={a} b={b} />
        <Row>
          <Button icon={Wine} onClick={() => go(true)}>Bebo</Button>
          <Button icon={Check} variant="primary" onClick={() => go(false)}>Fiz</Button>
        </Row>
      </Prompt>
      <Score items={players.map(p => ({ p, v: <span className="flex items-center gap-1"><Wine className="size-3.5 text-blush" />{drinks[p.i]}</span> }))} />
    </div>
  )
}

export function NeverHave() {
  const lvl = useGame(s => s.lvl)
  const { players } = useTurn()
  const mk = () => ({ c: draw('n', (NEVER as Dare[]).filter(x => x[0] >= lvl - 1 && x[0] <= lvl)), id: Date.now() })
  const [card, setCard] = useState(mk)
  const [drinks, setDrinks] = useState([0, 0])
  return (
    <div className="space-y-5">
      <Prompt k={card.id} glow="gold" tag={<Tag icon={Wine}>Eu nunca</Tag>}
        footer={<Note>Quem já fez, bebe — e conta a história.</Note>}>
        <Big>{card.c[1].replace(/@/g, '(a)')}</Big>
      </Prompt>
      <Row>
        {players.map(p => (
          <Button key={p.i} icon={Wine} onClick={() => setDrinks(d => d.map((v, k) => (k === p.i ? v + 1 : v)))}>{p.n} bebeu</Button>
        ))}
      </Row>
      <Button variant="primary" size="lg" icon={SkipForward} onClick={() => setCard(mk())}>Próxima</Button>
      <Score items={players.map(p => ({ p, v: <span className="flex items-center gap-1"><Wine className="size-3.5 text-blush" />{drinks[p.i]}</span> }))} />
    </div>
  )
}

export function EroticDice() {
  const lvl = useGame(s => s.lvl)
  const { a, b, next } = useTurn()
  const [res, setRes] = useState<{ ac: string; pa: string; ti: number; k: number } | null>(null)
  const rollIt = () => {
    const acts = (ACTS as Dare[]).filter(x => x[0] <= lvl)
    let parts = (PARTS as Dare[]).filter(x => x[0] <= lvl)
    if (b.g === 'f' && lvl === 3) parts = parts.concat([[3, 'Cuzinho'], [3, 'Cuzinho'], [3, 'Cuzinho']])
    setRes({ ac: fmt(rnd(acts)[1], a, b), pa: fmt(rnd(parts)[1], a, b), ti: Math.floor(Math.random() * TIMES.length), k: Date.now() })
  }
  return (
    <div className="space-y-5">
      <Turn p={a} />
      <Prompt k={res?.k ?? 'idle'} tag={<Tag icon={Dices}>{res ? `${a.n} faz em ${b.n}` : 'Dados eróticos'}</Tag>}>
        {res ? (
          <>
            <div className="grid grid-cols-3 gap-2.5">
              <WordDie label={res.ac} rollKey={res.k} tone="rose" />
              <WordDie label={res.pa} rollKey={res.k + 1} tone="gold" />
              <WordDie label={TIMES[res.ti]} rollKey={res.k + 2} tone="mist" />
            </div>
            <Timer seconds={TSEC[res.ti]} />
            <Button className="mt-4" variant="primary" icon={SkipForward} onClick={() => { setRes(null); next() }}>Passar a vez</Button>
          </>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2.5 opacity-60">
              {['Ação', 'Onde', 'Tempo'].map(l => <div key={l} className="glass grid min-h-24 place-items-center rounded-3xl text-mist">{l}</div>)}
            </div>
            <Button className="mt-5" variant="primary" size="lg" icon={Dices} onClick={rollIt}>Rolar os dados</Button>
          </>
        )}
      </Prompt>
    </div>
  )
}
