import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import {
  Bath, Beer, Car, Clover, Coins, CookingPot, Crown, Dices, Droplets, Flag, Flame, Footprints, Hotel, Infinity as Inf, Lock, Martini,
  Moon, RefreshCw, Ship, Shirt, ShoppingBag, Siren, Sofa, Star, Sun, Sunrise, Waves, WashingMachine, Warehouse, Wine, Zap, Ticket,
  Flag as FlagEnd, BatteryCharging, Wallet, type LucideIcon,
} from 'lucide-react'
import { DRINK, GC, MPB, MP_LOSE, REVES, SORTE } from '../data/content'
import { usePlayers } from '../store'
import { fmt, rnd, roll, wrnd, ANAL_W, type Player } from '../lib/game'
import { Big, Button, Card, Note, Tag, Turn } from '../components/ui'
import { Die } from '../components/Dice'
import { Token } from './board'

type V = 1 | 2 | 3
type Phase =
  | { k: 'turn' }
  | { k: 'land'; at: number; card?: any[]; deck?: 's' | 'r' }
  | { k: 'msg'; tag: string; text: string }
  | { k: 'over'; loser: number }
interface G {
  v: V; turn: number; pos: number[]; cash: number[]; own: Record<number, number>; su: Record<number, number>
  jail: number[]; wild: number[]; pot: number; dice: [number, number] | null; dbl: number; noExtra: boolean; phase: Phase
}

const ICONS: LucideIcon[] = [Flag, Sofa, Clover, CookingPot, Beer, Bath, Footprints, Lock, Sunrise, Zap, WashingMachine, Shirt, Car, Warehouse,
  Waves, Sun, Clover, Droplets, ShoppingBag, Hotel, Inf, Siren, Crown, Martini, Ship, Zap, Flame, Moon]
const VERS: Record<V, { name: string; sub: string; icon: LucideIcon }> = {
  1: { name: 'Leve', sub: 'beijos, strip, goles', icon: Wine },
  2: { name: 'Pesado', sub: 'oral, body shot, 2 goles', icon: Martini },
  3: { name: 'Sem limites', sub: 'sexo, anal, shots', icon: Flame },
}
const TOK = ['mp0', 'mp1']

const newGame = (v: V): G => ({
  v, turn: Math.floor(Math.random() * 2), pos: [0, 0], cash: [1000, 1000], own: {}, su: {}, jail: [0, 0], wild: [0, 0],
  pot: 0, dice: null, dbl: 0, noExtra: false, phase: { k: 'turn' },
})
const cellOf = (i: number): [number, number] => (i <= 7 ? [1, i + 1] : i <= 14 ? [i - 6, 8] : i <= 21 ? [8, 8 - (i - 14)] : [8 - (i - 21), 1])
const group = (grp: number) => MPB.map((_: any, i: number) => i).filter((i: number) => MPB[i][3] === grp)
const hasSet = (g: G, o: number, grp: number) => group(grp).every((i: number) => g.own[i] === o)
const rent = (g: G, k: number) => Math.round(MPB[k][4] / 4 * (hasSet(g, g.own[k], MPB[k][3]) ? 2 : 1) * (1 + (g.su[k] || 0)))
function drinks(g: G, k: number) {
  const n = 1 + (g.su[k] || 0) + (hasSet(g, g.own[k], MPB[k][3]) ? 1 : 0)
  if (g.v === 3) { const s = Math.min(n, 2); return `${s} shot${s > 1 ? 's' : ''}` } // limite: 2 shots / 4 goles
  const q = Math.min(n * g.v, 4); return `${q} gole${q > 1 ? 's' : ''}`
}

export function Motelpolio() {
  const players = usePlayers()
  // o estado nasce vazio a cada vez que o modo abre → partida sempre nova
  const [g, setG] = useState<G | null>(null)
  const up = (fn: (d: G) => void) => setG(prev => { const d = structuredClone(prev!) as G; fn(d); return d })

  if (!g) return <VersionPicker onPick={v => setG(newGame(v))} />

  const i = g.turn % 2, a = players[i], b = players[1 - i]

  // ---------- regras ----------
  const endTurn = (d: G) => {
    if (d.cash.some(c => c < 0)) { d.phase = { k: 'over', loser: d.cash[0] < 0 ? 0 : 1 }; return }
    const dbl = d.dice && d.dice[0] === d.dice[1]
    if (dbl && !d.noExtra && d.dbl < 3 && !d.jail[d.turn % 2]) { d.phase = { k: 'turn' }; return }
    d.dbl = 0; d.noExtra = false; d.turn++; d.phase = { k: 'turn' }
  }
  const landOn = (d: G, at: number) => {
    const t = MPB[at][0], me = players[d.turn % 2]
    if (t === 's' || t === 'r') {
      const L = (t === 's' ? SORTE : REVES).filter((x: any[]) => x[0] <= d.v && (!x[4] || x[4] === me.g))
      d.phase = { k: 'land', at, deck: t, card: t === 'r' ? wrnd(L, (y: any[]) => (y[4] ? ANAL_W : 1)) : rnd(L) }
    } else d.phase = { k: 'land', at }
  }
  const move = (d: G, steps: number) => {
    const me = d.turn % 2, np = d.pos[me] + steps
    if (np >= 28) d.cash[me] += 200
    d.pos[me] = np % 28
    landOn(d, d.pos[me])
  }
  const rollDice = () => up(d => {
    const r: [number, number] = [roll(), roll()]; d.dice = r
    d.dbl = r[0] === r[1] ? d.dbl + 1 : 0
    if (d.dbl >= 3) { const me = d.turn % 2; d.pos[me] = 7; d.jail[me] = 1; d.noExtra = true; d.phase = { k: 'msg', tag: '3 duplas seguidas', text: 'Apressadinho(a)! Direto pro Algemado.' }; return }
    move(d, r[0] + r[1])
  })
  const toJail = (d: G) => { const me = d.turn % 2; d.pos[me] = 7; d.jail[me] = 1; d.noExtra = true; endTurn(d) }
  const pay = (d: G, who: number, amt: number, to?: number) => { d.cash[who] -= amt; if (to === undefined) d.pot += Math.max(0, amt); else d.cash[to] += amt }
  const jailTry = () => up(d => {
    const me = d.turn % 2, r: [number, number] = [roll(), roll()]; d.dice = r
    if (r[0] === r[1]) { d.jail[me] = 0; d.dbl = 0; d.noExtra = true; move(d, r[0] + r[1]); return }
    d.jail[me]++
    if (d.jail[me] > 3) { pay(d, me, 100); d.jail[me] = 0 }
    d.noExtra = true
    d.phase = { k: 'msg', tag: `${r[0]} · ${r[1]}`, text: `Não saiu dupla. Continua algemad${players[me].g === 'm' ? 'o' : 'a'}.` }
  })
  const jailOut = (paid: boolean) => up(d => {
    const me = d.turn % 2; if (paid) pay(d, me, 100); d.jail[me] = 0
    const r: [number, number] = [roll(), roll()]; d.dice = r; d.noExtra = true; move(d, r[0] + r[1])
  })

  // ---------- painel ----------
  type Btn = { label: string; icon?: LucideIcon; main?: boolean; off?: boolean; run: (d: G) => void }
  let tag: ReactNode = null, body: ReactNode = null, btns: Btn[] = []
  const ph = g.phase
  const okEnd: Btn = { label: 'Ok', main: true, run: endTurn }

  if (ph.k === 'over') {
    const l = players[ph.loser], w = players[1 - ph.loser]
    tag = <Tag icon={Coins} tone="rose">Falência</Tag>
    body = <><Big>{l.n} faliu! {w.n} é dono(a) da noite.</Big><Note className="mt-3 text-[15px] text-white/85">{MP_LOSE[g.v].replace(/@/g, l.g === 'm' ? 'o' : 'a')}</Note></>
  } else if (ph.k === 'msg') {
    tag = <Tag icon={Dices} tone="mist">{ph.tag}</Tag>; body = <Big>{ph.text}</Big>; btns = [okEnd]
  } else if (ph.k === 'turn') {
    if (g.jail[i]) {
      tag = <Tag icon={Lock} tone="rose">Algemado · tentativa {g.jail[i]}/3</Tag>
      body = <><Big className="text-[22px]">Mãos amarradas de verdade.</Big><Note className="mt-2">Pra sair: tire dupla, pague 100 fichas ou {['', `beije ${b.n} por 1 minuto`, `faça oral em ${b.n} por 1 minuto`, `faça ${b.n} gozar`][g.v]}.</Note></>
    }
  } else if (ph.k === 'land') {
    const k = ph.at, c = MPB[k], t = c[0], Icon = ICONS[k]
    tag = <Tag icon={Icon} tone={t === 'p' ? 'gold' : 'rose'}>{c[2]}</Tag>
    if (t === 'go') { body = <Big>Caiu no Início: +200 e os dois brindam.</Big>; btns = [okEnd] }
    else if (t === 'p') {
      const o = g.own[k], txt = (x: Player, y: Player) => fmt(c[5][g.v - 1], x, y)
      if (o === undefined) {
        body = <><Big>Comprar {c[2]} por {c[4]} fichas?</Big><Note className="mt-3">Aluguel safado daqui: <span className="text-white/90">“{txt(b, a)}”</span></Note></>
        btns = [{ label: `Comprar · ${c[4]}`, icon: Coins, main: true, off: g.cash[i] < c[4], run: d => { d.cash[i] -= c[4]; d.own[k] = i; endTurn(d) } }, { label: 'Passar', run: endTurn }]
      } else if (o === i) {
        const su = g.su[k] || 0, set = hasSet(g, i, c[3]), cost = c[4] / 2
        body = <Big className="text-[22px]">{set ? (su < 3 ? `Você tem o par! Construir suíte por ${cost} fichas? Aluguel e bebida sobem.` : 'Já tem 3 suítes. Rainha/rei do pedaço.') : 'Seu imóvel. Junte o par da mesma cor pra dobrar o aluguel.'}</Big>
        btns = set && su < 3 ? [{ label: `Suíte · ${cost}`, icon: Star, main: true, off: g.cash[i] < cost, run: d => { d.cash[i] -= cost; d.su[k] = su + 1; endTurn(d) } }, { label: 'Agora não', run: endTurn }] : [okEnd]
      } else {
        const r = rent(g, k)
        body = <><Big>Aluguel pra {b.n}!</Big><div className="mt-3 rounded-2xl bg-rose/10 p-3.5 ring-1 ring-rose/25"><p className="text-[11px] font-semibold uppercase tracking-widest text-blush">aluguel safado</p><p className="mt-1 font-medium">{txt(a, b)}</p></div></>
        btns = [
          { label: 'Pagar safado', icon: Flame, main: true, run: endTurn },
          { label: `Beber ${drinks(g, k)}`, icon: Beer, run: endTurn },
          { label: `Pagar ${r}`, icon: Coins, run: d => { pay(d, i, r, 1 - i); endTurn(d) } },
          ...(g.wild[i] ? [{ label: 'Usar vale-escape', icon: Ticket, run: (d: G) => { d.wild[i]--; endTurn(d) } }] : []),
        ]
      }
    } else if (t === 's' || t === 'r') {
      const x = ph.card!, e = x[3] || {}
      tag = <Tag icon={t === 's' ? Clover : Zap} tone={t === 's' ? 'gold' : 'rose'}>{t === 's' ? 'Sorte safada' : 'Revés'}</Tag>
      body = <Big>{fmt(x[1], a, b)}{x[2] && !e.or ? <span className={x[2] > 0 ? 'text-emerald-300' : 'text-blush'}> {x[2] > 0 ? '+' : ''}{x[2]}</span> : null}</Big>
      if (e.or) btns = [{ label: e.or.replace(/[^\p{L}\s]/gu, '').trim() || 'Topo', icon: Flame, main: true, run: endTurn }, { label: `Pagar ${-x[2]}`, icon: Coins, run: d => { pay(d, i, -x[2]); endTurn(d) } }]
      else if (e.go !== undefined) btns = [{ label: 'Ir', main: true, run: d => { if (e.go < d.pos[i]) d.cash[i] += 200; d.pos[i] = e.go; landOn(d, e.go) } }]
      else if (e.back) btns = [{ label: 'Voltar 3', main: true, run: d => { d.pos[i] = (d.pos[i] + 25) % 28; landOn(d, d.pos[i]) } }]
      else if (e.jail) btns = [{ label: 'Ir pro Algemado', icon: Lock, main: true, run: toJail }]
      else if (e.wild) btns = [{ label: 'Guardar vale', icon: Ticket, main: true, run: d => { d.wild[i]++; endTurn(d) } }]
      else btns = [{ label: 'Ok', main: true, run: d => { if (x[2] < 0) pay(d, i, -x[2]); else d.cash[i] += x[2] || 0; endTurn(d) } }]
    } else if (t === 'bar') { body = <Big>{a.n} bebe {DRINK[g.v]}.{g.v > 1 ? ` Ou faz body shot no corpo de ${b.n}.` : ''}</Big>; btns = [{ label: 'Bebi', icon: Beer, main: true, run: endTurn }] }
    else if (t === 'tax') {
      const amt = [0, 100, 150, 200][g.v], oa = a.g === 'm' ? 'o' : 'a', alt = ['', 'Tiro uma peça', `Fico pelad${oa} da cintura pra baixo`, `Fico pelad${oa} até o fim`][g.v]
      body = <Big>Pague {amt} fichas (vai pro pote da Hidro) ou: {alt.toLowerCase()}.</Big>
      btns = [{ label: alt, icon: Shirt, main: true, run: endTurn }, { label: `Pagar ${amt}`, icon: Coins, run: d => { pay(d, i, amt); endTurn(d) } }]
    } else if (t === 'hot') {
      body = <><Big>{a.n} leva o pote: {g.pot} fichas!</Big><Note className="mt-2">{['', 'Os dois: beijo de 30 segundos.', 'Os dois: banho juntos agora (ou 2 min de amasso pelados).', 'Os dois: 69 por 1 minuto.'][g.v]}</Note></>
      btns = [{ label: 'Pegar o pote', icon: Waves, main: true, run: d => { d.cash[i] += d.pot; d.pot = 0; endTurn(d) } }]
    } else if (t === 'shop') {
      body = <Big>Vale-escape por 150 fichas (pula um aluguel safado).{g.v > 1 ? ` Ou use um brinquedo em ${b.n} por 1 min e ganhe 100 fichas.` : ''}</Big>
      btns = [{ label: 'Comprar · 150', icon: Ticket, main: true, off: g.cash[i] < 150, run: d => { d.cash[i] -= 150; d.wild[i]++; endTurn(d) } },
        ...(g.v > 1 ? [{ label: 'Brinquedo +100', icon: BatteryCharging, run: (d: G) => { d.cash[i] += 100; endTurn(d) } }] : []), { label: 'Sair', run: endTurn }]
    } else if (t === 'gojail') { body = <Big>{a.n} vai pro Algemado. Mãos amarradas até sair.</Big>; btns = [{ label: 'Ir', icon: Lock, main: true, run: toJail }] }
    else if (t === 'jail') { body = <Big>Só visitando… aproveita e dá um beijo.</Big>; btns = [okEnd] }
  }

  return (
    <div className="space-y-4">
      {/* tabuleiro */}
      <div className="glass grid aspect-square grid-cols-8 grid-rows-8 gap-[3px] rounded-[24px] p-1.5">
        {MPB.map((c: any[], k: number) => {
          const [r, col] = cellOf(k), o = g.own[k], Icon = ICONS[k], here = g.pos[i] === k
          return (
            <div key={k} style={{ gridRow: r, gridColumn: col }}
              className={clsx('relative flex flex-col items-center justify-center overflow-hidden rounded-[9px] bg-white/[.045] ring-1',
                o === undefined ? 'ring-white/6' : o === 0 ? 'ring-rose/80' : 'ring-gold/80', here && 'bg-white/12')}>
              {c[3] && <span className="absolute inset-x-0 top-0 h-[4px]" style={{ background: GC[c[3]] }} />}
              <Icon className="size-[15px] text-white/85" strokeWidth={1.8} />
              <span className="mt-0.5 w-full truncate px-0.5 text-center text-[6.5px] font-medium leading-none text-mist">{c[2]}</span>
              {g.su[k] ? <span className="absolute right-0.5 top-1 text-[7px] text-gold">{'★'.repeat(g.su[k])}</span> : null}
              <div className="absolute bottom-0 flex -space-x-2">
                {g.pos[0] === k && <Token p={players[0]} id={TOK[0]} />}
                {g.pos[1] === k && <Token p={players[1]} id={TOK[1]} />}
              </div>
            </div>
          )
        })}
        <div className="col-[2/8] row-[2/8] flex flex-col items-center justify-center gap-3 p-2 text-center">
          <p className="font-display text-xl font-bold italic text-gradient">Motelpólio</p>
          <Tag icon={VERS[g.v].icon} tone="rose">{VERS[g.v].name}</Tag>
          <div className="grid w-full grid-cols-2 gap-2">
            {players.map(p => (
              <div key={p.i} className={clsx('rounded-2xl bg-black/30 p-2 ring-1', p.i === i ? (p.i ? 'ring-gold/60' : 'ring-rose/60') : 'ring-white/8')}>
                <p className="truncate text-[11px] text-mist">{p.n}</p>
                <motion.p key={g.cash[p.i]} initial={{ scale: 1.3, color: '#f5c06a' }} animate={{ scale: 1, color: '#fff' }} className="font-display text-lg font-bold tabular-nums">{g.cash[p.i]}</motion.p>
                {g.wild[p.i] > 0 && <p className="text-[10px] text-gold">vales: {g.wild[p.i]}</p>}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {g.dice && <><Die value={g.dice[0]} rollKey={'a' + g.turn + g.pos.join() + g.dice.join()} size={30} /><Die value={g.dice[1]} tone="gold" rollKey={'b' + g.turn + g.pos.join() + g.dice.join()} size={30} /></>}
            <span className="flex items-center gap-1 text-[11px] text-mist"><Wallet className="size-3.5" />pote {g.pot}</span>
          </div>
        </div>
      </div>

      {/* painel */}
      {ph.k === 'turn' && <Turn p={a} />}
      {(tag || body) && (
        <Card glow={ph.k === 'over' ? 'gold' : 'rose'}>
          {tag && <div className="mb-3">{tag}</div>}
          {body}
        </Card>
      )}
      {ph.k === 'turn' && !g.jail[i] && <Button variant="primary" size="lg" icon={Dices} onClick={rollDice}>Rolar dados</Button>}
      {ph.k === 'turn' && g.jail[i] > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <Button variant="primary" icon={Dices} onClick={jailTry}>Dupla</Button>
          <Button icon={Coins} onClick={() => jailOut(true)}>100</Button>
          <Button icon={Flame} onClick={() => jailOut(false)}>Faço</Button>
        </div>
      )}
      {btns.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {btns.map((x, k) => (
            <Button key={x.label + k} icon={x.icon} variant={x.main ? 'primary' : 'glass'} disabled={x.off}
              className={btns.length % 2 && k === 0 ? 'col-span-2' : ''} onClick={() => up(x.run)}>{x.label}</Button>
          ))}
        </div>
      )}
      {ph.k === 'over'
        ? <Button variant="gold" size="lg" icon={RefreshCw} onClick={() => setG(null)}>Nova partida</Button>
        : <Button variant="ghost" size="sm" icon={FlagEnd} onClick={() => { if (confirm('Encerrar? Quem tiver mais fichas vence.')) up(d => { d.phase = { k: 'over', loser: d.cash[0] >= d.cash[1] ? 1 : 0 } }) }}>Encerrar partida</Button>}
    </div>
  )
}

function VersionPicker({ onPick }: { onPick: (v: V) => void }) {
  return (
    <div className="space-y-4">
      <Card glow="gold" className="overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gold/20 blur-3xl" />
        <Hotel className="size-10 text-gold" strokeWidth={1.5} />
        <h2 className="mt-3 font-display text-3xl font-bold italic text-gradient">Motelpólio</h2>
        <Note className="mt-2 text-[15px] text-white/80">
          Banco Imobiliário safado. Cada um começa com 100 fichas0. Compre cômodos e motéis; quem cair no seu paga aluguel em fichas,
          bebendo ou cumprindo o <b className="text-white">aluguel safado</b> do lugar. Junte o par da mesma cor pra dobrar e construa suítes.
          Quem falir perde a noite.
        </Note>
      </Card>
      <p className="px-1 text-xs font-semibold uppercase tracking-[.2em] text-mist">Escolha a versão</p>
      {([1, 2, 3] as V[]).map(v => {
        const x = VERS[v]
        return (
          <motion.button key={v} whileTap={{ scale: 0.97 }} onClick={() => onPick(v)}
            className={clsx('flex w-full items-center gap-4 rounded-3xl p-4 text-left', v === 3 ? 'btn-primary shine' : 'glass')}>
            <span className={clsx('grid size-12 place-items-center rounded-2xl', v === 3 ? 'bg-white/20' : 'bg-white/8')}><x.icon className="size-6" /></span>
            <span><span className="block font-display text-xl font-semibold">{x.name}</span><span className="text-sm text-white/70">{x.sub}</span></span>
          </motion.button>
        )
      })}
    </div>
  )
}
