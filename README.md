# Afterglow Club — Project 002

A cinematic, photo-led sangeet-night experience built with React + Vite + GSAP.

## Art direction
- **Category:** Sangeet Night / Celebration Experience
- **Visual language:** after-dark editorial, flash photography, contact sheets, marquee tape, kinetic oversized type
- **Palette:** ink black, cream, marigold, electric orchid and rose
- **Entry:** “Enter the night” club-door interaction
- **Story:** 12 scenes with varied pacing rather than repeated landing-page sections
- **Motion:** GSAP reveal motion + restrained parallax, with reduced-motion fallback

## Customize
Edit `src/data.js` for names, date, location, photographs, palette references and scene copy.

## Commands
```bash
npm install
npm run dev
npm run build
```

Production QA is defined in `qa/production-qa.mjs` and `.github/workflows/production-qa.yml`. During the temporary manual-Vercel phase, the workflow records a waiting state until `tasksk002.vercel.app` is live, then runs full QA on retry.
