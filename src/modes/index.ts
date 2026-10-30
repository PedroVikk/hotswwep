import type { ComponentType } from 'react'
import { Bomb, BookOpen, Crown, Dices, Drama, Gamepad2, HeartHandshake, Hotel, Hourglass, Infinity as Inf, Martini, MessageCircleHeart, Shirt, Ticket, Wine, type LucideIcon } from 'lucide-react'
import { DoOrDrink, EroticDice, NeverHave, TruthDare } from './classic'
import { Catalog, KamaRoulette } from './kama'
import { BombGame, Edge, Master, Roleplay, Strip } from './spicy'
import { Coupons, Match } from './social'
import { PleasureBoard } from './board'
import { Motelpolio } from './motelpolio'

export interface Mode { id: string; title: string; sub: string; icon: LucideIcon; C: ComponentType; tone: string }

export const SECTIONS: { title: string; modes: Mode[] }[] = [
  {
    title: 'Tabuleiros',
    modes: [
      { id: 'mp', title: 'Motelpólio', sub: 'Banco Imobiliário safado: compra, cobra aluguel em bebida ou sacanagem', icon: Hotel, C: Motelpolio, tone: 'from-gold to-[#b5782a]' },
      { id: 'tb', title: 'Tabuleiro do Prazer', sub: 'Dado, casas surpresa e prêmio na chegada', icon: Gamepad2, C: PleasureBoard, tone: 'from-violet to-wine' },
    ],
  },
  {
    title: 'Clássicos, versão quente',
    modes: [
      { id: 'vd', title: 'Verdade ou Desafio', sub: 'Perguntas e desafios picantes', icon: MessageCircleHeart, C: TruthDare, tone: 'from-rose to-wine' },
      { id: 'bb', title: 'Faz ou Bebe', sub: 'Cumpre ou toma um gole', icon: Wine, C: DoOrDrink, tone: 'from-[#ff6a5c] to-wine' },
      { id: 'en', title: 'Eu Nunca', sub: 'Quem já fez, bebe', icon: Martini, C: NeverHave, tone: 'from-blush to-rose' },
      { id: 'dd', title: 'Dados Eróticos', sub: 'Ação × lugar × tempo', icon: Dices, C: EroticDice, tone: 'from-gold to-rose' },
    ],
  },
  {
    title: 'Kama Sutra',
    modes: [
      { id: 'ks', title: 'Roleta', sub: 'Posição + regra extra + tempo', icon: Inf, C: KamaRoulette, tone: 'from-rose to-violet' },
      { id: 'lt', title: 'Catálogo', sub: 'Todas as posições ilustradas', icon: BookOpen, C: Catalog, tone: 'from-violet to-[#3b2a7a]' },
    ],
  },
  {
    title: 'Pra ir além',
    modes: [
      { id: 'dm', title: 'Mestre & Escrav(a)', sub: 'Um manda, o outro obedece', icon: Crown, C: Master, tone: 'from-gold to-wine' },
      { id: 'rp', title: 'Roleplay', sub: 'Cena + regra secreta', icon: Drama, C: Roleplay, tone: 'from-violet to-rose' },
      { id: 'st', title: 'Strip Roleta', sub: 'Cada giro, menos roupa', icon: Shirt, C: Strip, tone: 'from-blush to-wine' },
      { id: 'ed', title: 'Quem Goza Perde', sub: 'Rodadas cada vez mais quentes', icon: Hourglass, C: Edge, tone: 'from-rose to-[#5a0e2c]' },
      { id: 'bo', title: 'Bomba Safada', sub: 'Batata quente com castigo', icon: Bomb, C: BombGame, tone: 'from-[#ff6a5c] to-[#5a0e2c]' },
    ],
  },
  {
    title: 'Só vocês dois',
    modes: [
      { id: 'mt', title: 'Match de Fantasias', sub: 'Votem em segredo, vejam o que combina', icon: HeartHandshake, C: Match, tone: 'from-rose to-gold' },
      { id: 'cp', title: 'Vales Safados', sub: 'Sorteie e guarde pra cobrar depois', icon: Ticket, C: Coupons, tone: 'from-gold to-[#c98a2e]' },
    ],
  },
]

export const MODES: Record<string, Mode> = Object.fromEntries(SECTIONS.flatMap(s => s.modes).map(m => [m.id, m]))
