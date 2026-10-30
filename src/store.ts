import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Combo, Level, Player } from './lib/game'

export interface Coupon { de: string; para: string; t: string; at: number }

interface State {
  ageOk: boolean
  combo: Combo
  lvl: Level
  n1: string
  n2: string
  wallet: Coupon[]
  set: (p: Partial<Omit<State, 'set' | 'addCoupon' | 'useCoupon'>>) => void
  addCoupon: (c: Coupon) => void
  useCoupon: (i: number) => void
}

export const useGame = create<State>()(
  persist(
    set => ({
      ageOk: false,
      combo: 'mf',
      lvl: 1,
      n1: '',
      n2: '',
      wallet: [],
      set: p => set(p),
      addCoupon: c => set(s => ({ wallet: [...s.wallet, c] })),
      useCoupon: i => set(s => ({ wallet: s.wallet.filter((_, k) => k !== i) })),
    }),
    { name: 'jogo-quente-v2' },
  ),
)

export function getPlayers(s: { combo: Combo; n1: string; n2: string }): [Player, Player] {
  const g = s.combo === 'mf' ? (['m', 'f'] as const) : s.combo === 'mm' ? (['m', 'm'] as const) : (['f', 'f'] as const)
  const def = s.combo === 'mf' ? ['Ele', 'Ela'] : s.combo === 'mm' ? ['Ele 1', 'Ele 2'] : ['Ela 1', 'Ela 2']
  return [
    { n: s.n1.trim() || def[0], g: g[0], i: 0 },
    { n: s.n2.trim() || def[1], g: g[1], i: 1 },
  ]
}

export function usePlayers() {
  const combo = useGame(s => s.combo), n1 = useGame(s => s.n1), n2 = useGame(s => s.n2)
  return getPlayers({ combo, n1, n2 })
}
