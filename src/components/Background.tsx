import { motion } from 'framer-motion'

/** fundo: manchas de luz em movimento lento + granulado */
export function Background() {
  const blob = (cls: string, x: number[], y: number[], d: number) => (
    <motion.div className={`absolute rounded-full blur-[90px] ${cls}`}
      animate={{ x, y }} transition={{ duration: d, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }} />
  )
  return (
    <div className="grain pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      {blob('left-[-20%] top-[-10%] size-[70vmax] bg-wine/45', [0, 80, -40], [0, 60, 20], 18)}
      {blob('right-[-25%] top-[20%] size-[55vmax] bg-violet/18', [0, -60, 30], [0, 40, -50], 22)}
      {blob('bottom-[-25%] left-[10%] size-[60vmax] bg-rose/20', [0, 50, -30], [0, -40, 10], 20)}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,#0a0610_75%)]" />
    </div>
  )
}
