import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useGame } from './store'
import { LEVELS, resetDecks } from './lib/game'
import { Background } from './components/Background'
import { AgeGate, Menu, Setup } from './screens/screens'
import { MODES, type Mode } from './modes'

type View = { k: 'setup' } | { k: 'menu' } | { k: 'game'; id: string; run: number }

export default function App() {
  const ageOk = useGame(s => s.ageOk)
  const lvl = useGame(s => s.lvl)
  const [view, setView] = useState<View>(() => ({ k: localStorage.getItem('jogo-quente-v2') ? 'menu' : 'setup' }))
  const open = (m: Mode) => { resetDecks(); setView({ k: 'game', id: m.id, run: Date.now() }) }
  const mode = view.k === 'game' ? MODES[view.id] : null

  return (
    <>
      <Background />
      <main className="relative z-10 mx-auto min-h-dvh w-full max-w-[480px] px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]">
        <AnimatePresence mode="wait">
          <motion.div key={!ageOk ? 'age' : view.k === 'game' ? `g-${view.run}` : view.k}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28 }}>
            {!ageOk ? <AgeGate />
              : view.k === 'setup' ? <Setup onDone={() => setView({ k: 'menu' })} />
              : view.k === 'menu' ? <Menu onOpen={open} onSettings={() => setView({ k: 'setup' })} />
              : mode && (
                <div className="pb-8">
                  <header className="sticky top-0 z-20 -mx-5 mb-5 flex items-center gap-3 bg-gradient-to-b from-ink via-ink/90 to-transparent px-5 pb-4 pt-2">
                    <button onClick={() => setView({ k: 'menu' })} className="glass grid size-11 place-items-center rounded-2xl" aria-label="Voltar"><ChevronLeft className="size-5" /></button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-xl font-semibold leading-tight">{mode.title}</p>
                      <p className="text-[11px] uppercase tracking-[.18em] text-mist">{LEVELS[lvl].name}</p>
                    </div>
                    <span className={`grid size-11 place-items-center rounded-2xl bg-gradient-to-br ${mode.tone}`}><mode.icon className="size-5" /></span>
                  </header>
                  {/* key = run → ao abrir de novo, o jogo começa do zero (ex.: Motelpólio) */}
                  <mode.C key={view.run} />
                </div>
              )}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  )
}
