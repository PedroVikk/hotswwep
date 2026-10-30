import { DARES, TRUTHS, POS } from '../data/content'

export type Gender = 'm' | 'f'
export type Combo = 'mf' | 'mm' | 'ff'
export type Level = 1 | 2 | 3
export interface Player { n: string; g: Gender; i: 0 | 1 }

export const LEVELS: Record<Level, { name: string; hint: string }> = {
  1: { name: 'Quente', hint: 'Provocação, beijo, strip' },
  2: { name: 'Pegando fogo', hint: 'Oral, toques, brinquedos' },
  3: { name: 'Sem limites', hint: 'Sexo, anal, dominação' },
}

/** peso das cartas anais quando quem recebe é ela */
export const ANAL_W = 5

export const rnd = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]
export const roll = () => 1 + Math.floor(Math.random() * 6)

export function wrnd<T>(a: T[], w: (x: T) => number): T {
  const ws = a.map(w)
  let r = Math.random() * ws.reduce((x, y) => x + y, 0)
  for (let i = 0; i < a.length; i++) { r -= ws[i]; if (r <= 0) return a[i] }
  return a[a.length - 1]
}

/** remove emojis do começo do texto (o visual usa ícones) */
export const clean = (t: string) => t.replace(/^[\p{Extended_Pictographic}‍️\s]+/u, '')

const oa = (g: Gender) => (g === 'm' ? 'o' : 'a')
export function fmt(t: string, a: Player, b: Player) {
  return clean(t)
    .replace(/\{A\}/g, a.n).replace(/\{B\}/g, b.n)
    .replace(/\{Ao\}/g, oa(a.g)).replace(/\{Bo\}/g, oa(b.g))
    .replace(/\{o\}/g, oa(a.g)).replace(/@/g, oa(a.g))
}

export const inLvl = (l: number, lvl: Level) => l >= lvl - 1 && l <= lvl

/** baralho sem repetição até esgotar (por chave) */
const used = new Map<string, Set<unknown>>()
export function resetDecks() { used.clear() }
export function draw<T>(key: string, list: T[], w?: (x: T) => number): T {
  if (!used.has(key)) used.set(key, new Set())
  const u = used.get(key)!
  let free = list.filter(x => !u.has(x))
  if (!free.length) { u.clear(); free = list }
  const c = w ? wrnd(free, w) : rnd(free)
  u.add(c)
  return c
}

// [nível, texto, segundos?, gênero de quem faz?, gênero de quem recebe?, anal?]
export type Dare = [number, string, number?, Gender?, Gender?, number?]
export const analWeight = (b: Player) => (c: Dare) => (c[5] && b.g === 'f' ? ANAL_W : 1)

export const dareList = (a: Player, b: Player, lvl: Level): Dare[] =>
  (DARES as Dare[]).filter(c => inLvl(c[0], lvl) && (!c[3] || c[3] === a.g) && (!c[4] || c[4] === b.g) && (!c[5] || lvl > 1))

export const truthList = (a: Player, lvl: Level): Dare[] =>
  (TRUTHS as Dare[]).filter(x => inLvl(x[0], lvl) && (!x[3] || x[3] === a.g))

export interface Position { n: string; d: number; c: string; t: string; np?: number }
export const positions = (combo: Combo, lvl: Level): Position[] =>
  (POS as Position[]).filter(p => p.c.split(' ').includes(combo) && (lvl > 1 || p.d < 3))
export const allPositions = (combo: Combo): Position[] => (POS as Position[]).filter(p => p.c.split(' ').includes(combo))
export const posName = (p: Position, g: Gender) => p.n.replace('{o}', oa(g))

const DARE_POS: [RegExp, string][] = [
  [/^69/, '69'], [/cavalgue/i, 'Amazona'], [/sente no rosto|sente na cara/i, 'Trono do Rei'], [/sente no colo/i, 'Cadeira'],
  [/Kama Sutra/i, '*'], [/boquete|sexo oral|garganta/i, 'Ajoelhad'], [/Rapidinha|contra a parede/i, 'Em Pé'],
  [/de quatro/i, 'Cachorrinho'], [/conchinha/i, 'Conchinha'], [/bruços/i, 'Elefante'],
]
export function positionForText(t: string, combo: Combo, lvl: Level): Position | null {
  const m = DARE_POS.find(([re]) => re.test(t))
  if (!m) return null
  if (m[1] === '*') return rnd(positions(combo, lvl))
  return (POS as Position[]).find(x => x.n.startsWith(m[1])) ?? null
}

export const fmtTime = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `0:${String(s).padStart(2, '0')}`)
