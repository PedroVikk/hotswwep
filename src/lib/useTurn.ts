import { useState } from 'react'
import { usePlayers } from '../store'
import type { Player } from './game'

export const pairFor = (p: [Player, Player], t: number) => ({ a: p[t % 2], b: p[(t + 1) % 2], i: (t % 2) as 0 | 1 })

/** controla de quem é a vez (começa sorteado) */
export function useTurn() {
  const players = usePlayers()
  const [turn, setTurn] = useState(() => Math.floor(Math.random() * 2))
  return { players, turn, setTurn, ...pairFor(players, turn), next: () => setTurn(t => t + 1) }
}
