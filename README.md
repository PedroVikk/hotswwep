# Jogo Quente 🔥

Jogo adulto (+18) para casais — Ele & Ela, Ele & Ele ou Ela & Ela — com 3 níveis de intensidade.

**Jogos:** Motelpólio (Banco Imobiliário safado, versões Leve/Pesado/Sem limites), Tabuleiro do Prazer, Verdade ou Desafio, Faz ou Bebe, Eu Nunca, Dados Eróticos, Roleta e Catálogo Kama Sutra (ilustrados), Mestre & Escrav(a), Roleplay, Strip Roleta, Quem Goza Perde, Bomba Safada, Match de Fantasias e Vales Safados.

## Stack
React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · Zustand · Lucide

## Rodar
```bash
npm install
npm run dev      # desenvolvimento
npm run build    # produção (dist/)
```

## Estrutura
- `src/data/content.ts` — todas as cartas, posições, tabuleiros
- `src/lib/` — regras (sorteio sem repetição, pesos), áudio (alarme do timer)
- `src/components/` — UI (cartas, timer em anel, dados, ilustrações)
- `src/modes/` — cada jogo
- `legacy/` — versão 1 (HTML único)

Deploy na Vercel (`vercel.json`). Conteúdo é sugestão: combinem uma palavra de segurança.
