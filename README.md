# Desert Afterglow — Project 002

A cinematic, photo-led destination wedding experience built with React, Vite, GSAP and ScrollTrigger.

## Concept
Jaisalmer desert editorial: sandstone, copper sunset, tactile ceremony details, expansive photography and restrained copy. Twelve scenes move from invitation and arrival through vows, feast, portraits, night and forever.

## Run
`npm install` then `npm run dev`. Production build: `npm run build`.

## Production
Expected Vercel project: `tasksk002`; canonical URL: `https://tasksk002.vercel.app`.

## QA
`npm run qa` runs Playwright + axe against the canonical URL across mobile, tablet, laptop and desktop viewports, checking runtime errors, broken images, overflow and serious accessibility violations. GitHub Actions captures screenshots and `qa-report.json` after production becomes reachable.

## Accessibility
Semantic headings, image alt text, keyboard-native entry control and `prefers-reduced-motion` fallback are included.