import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion'
import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Player } from '../lib/game'
import { pop } from '../lib/audio'

type Variant = 'primary' | 'gold' | 'glass' | 'ghost'

export function Button({ variant = 'glass', icon: Icon, children, className, size = 'md', onClick, ...rest }:
  { variant?: Variant; icon?: LucideIcon; size?: 'sm' | 'md' | 'lg' } & HTMLMotionProps<'button'>) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -1 }}
      onClick={e => { pop(); onClick?.(e) }}
      className={clsx(
        'inline-flex w-full items-center justify-center gap-2 rounded-2xl font-semibold tracking-tight transition-colors disabled:opacity-40 disabled:pointer-events-none',
        size === 'sm' && 'h-10 px-3 text-sm',
        size === 'md' && 'h-13 px-4 text-[15px]',
        size === 'lg' && 'h-15 px-5 text-base',
        variant === 'primary' && 'btn-primary shine text-white',
        variant === 'gold' && 'btn-gold shine text-ink',
        variant === 'glass' && 'glass text-white/90 hover:bg-white/10',
        variant === 'ghost' && 'text-white/60 hover:text-white',
        className,
      )}
      {...rest}
    >
      {Icon && <Icon className="size-[18px] shrink-0" strokeWidth={2.2} />}
      {children as ReactNode}
    </motion.button>
  )
}

export function Card({ children, className, glow }: { children: ReactNode; className?: string; glow?: 'rose' | 'gold' }) {
  return (
    <div className={clsx('glass relative rounded-[28px] p-6', className)}>
      {glow && (
        <div className={clsx('pointer-events-none absolute -inset-px -z-10 rounded-[28px] opacity-60 blur-2xl',
          glow === 'rose' ? 'bg-rose/25' : 'bg-gold/20')} />
      )}
      {children}
    </div>
  )
}

export function Tag({ children, icon: Icon, tone = 'gold' }: { children: ReactNode; icon?: LucideIcon; tone?: 'gold' | 'rose' | 'mist' }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[.14em]',
      tone === 'gold' && 'bg-gold/12 text-gold ring-1 ring-gold/25',
      tone === 'rose' && 'bg-rose/12 text-blush ring-1 ring-rose/30',
      tone === 'mist' && 'bg-white/6 text-mist ring-1 ring-white/10')}>
      {Icon && <Icon className="size-3.5" strokeWidth={2.4} />}
      {children}
    </span>
  )
}

export const playerColor = (i: 0 | 1) => (i === 0 ? 'from-rose to-wine' : 'from-gold to-[#c98a2e]')

export function Avatar({ p, size = 36 }: { p: Player; size?: number }) {
  return (
    <span style={{ width: size, height: size, fontSize: size * 0.42 }}
      className={clsx('inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-display font-bold text-white shadow-lg ring-2 ring-white/15', playerColor(p.i))}>
      {p.n.slice(0, 1).toUpperCase()}
    </span>
  )
}

export function Turn({ p, label = 'Vez de' }: { p: Player; label?: string }) {
  return (
    <motion.div key={p.n + label} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex w-fit items-center gap-2.5 rounded-full bg-white/5 py-1.5 pl-1.5 pr-4 ring-1 ring-white/10">
      <Avatar p={p} size={30} />
      <span className="text-sm text-mist">{label} <b className="font-semibold text-white">{p.n}</b></span>
    </motion.div>
  )
}

/** carta com animação de entrada; muda quando `k` muda */
export function Prompt({ k, tag, children, footer, glow = 'rose' }:
  { k: string | number; tag?: ReactNode; children: ReactNode; footer?: ReactNode; glow?: 'rose' | 'gold' }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={k}
        initial={{ opacity: 0, rotateX: -18, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        style={{ transformPerspective: 900 }}>
        <Card glow={glow} className="overflow-hidden">
          <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-rose/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-gold/10 blur-3xl" />
          {tag && <div className="mb-4">{tag}</div>}
          <div className="relative">{children}</div>
          {footer && <div className="relative mt-5">{footer}</div>}
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

export const Big = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={clsx('font-display text-[26px] leading-[1.25] font-semibold text-white text-balance', className)}>{children}</p>
)

export const Note = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={clsx('text-sm leading-relaxed text-mist', className)}>{children}</p>
)

export function Segmented<T extends string | number>({ value, onChange, options }:
  { value: T; onChange: (v: T) => void; options: { v: T; label: string; sub?: string; icon?: LucideIcon }[] }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map(o => {
        const on = o.v === value
        return (
          <motion.button key={String(o.v)} whileTap={{ scale: 0.96 }} onClick={() => { pop(); onChange(o.v) }}
            className={clsx('relative flex flex-col items-center gap-1 rounded-2xl px-2 py-3.5 text-center transition',
              on ? 'text-white' : 'glass text-white/70')}>
            {on && <motion.span layoutId={`seg-${options.map(x => x.v).join('')}`} className="btn-primary absolute inset-0 rounded-2xl" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            {o.icon && <o.icon className="relative size-5" strokeWidth={2} />}
            <span className="relative text-[13px] font-semibold leading-tight">{o.label}</span>
            {o.sub && <span className={clsx('relative text-[10.5px] leading-tight', on ? 'text-white/80' : 'text-mist/80')}>{o.sub}</span>}
          </motion.button>
        )
      })}
    </div>
  )
}

export function Score({ items }: { items: { p: Player; v: ReactNode }[] }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-2">
      {items.map(({ p, v }) => (
        <div key={p.i} className="glass flex items-center gap-2 rounded-2xl px-3 py-2">
          <Avatar p={p} size={26} />
          <span className="truncate text-sm text-mist">{p.n}</span>
          <span className="ml-auto font-semibold tabular-nums text-white">{v}</span>
        </div>
      ))}
    </div>
  )
}

export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('mt-4 grid grid-cols-2 gap-2.5', className)}>{children}</div>
}
