import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { experience } from './data.js'

gsap.registerPlugin(ScrollTrigger)

function Photo({ src, alt, priority = false, className = '' }) {
  return <img className={className} src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} />
}

function App() {
  const [entered, setEntered] = useState(false)
  const root = useRef(null)

  useEffect(() => {
    document.body.style.overflow = entered ? '' : 'hidden'
    if (!entered) window.scrollTo(0, 0)
    return () => { document.body.style.overflow = '' }
  }, [entered])

  useEffect(() => {
    if (!entered) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const context = gsap.context(() => {
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.fromTo(el, { y: 42, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 84%', once: true } })
      })
      gsap.utils.toArray('.drift').forEach((el) => {
        gsap.to(el, { yPercent: -7, ease: 'none', scrollTrigger: { trigger: el, scrub: 0.8, start: 'top bottom', end: 'bottom top' } })
      })
    }, root)
    return () => context.revert()
  }, [entered])

  const s = experience.scenes
  const p = experience.photos
  return (
    <main ref={root} className="site-shell">
      {!entered && (
        <section className="entry" role="dialog" aria-modal="true" aria-label="Enter Afterglow Club">
          <div className="entry-noise" aria-hidden="true" />
          <p>RHEA + KABIR PRESENT</p>
          <h1>AFTERGLOW<br/>CLUB</h1>
          <button onClick={() => setEntered(true)}>Enter the night <span aria-hidden="true">↗</span></button>
          <small>18 · 12 · 2026 — JAIPUR</small>
        </section>
      )}
      <div aria-hidden={!entered} className={entered ? 'story is-live' : 'story'}>
        <section className="hero scene"><Photo src={p[0]} alt="Couple celebrating under warm evening lights" priority className="hero-photo drift"/><div className="hero-scrim"/><div className="hero-copy reveal"><p>{s[0].label}</p><h2>{s[0].title}</h2><span>{s[0].note}</span></div><div className="marquee" aria-hidden="true"><span>AFTERGLOW · SANGEET · AFTERGLOW · SANGEET · </span></div></section>
        <section className="scene split dark"><div className="copy reveal"><p>{s[1].label}</p><h2>{s[1].title}</h2><span>{s[1].note}</span></div><Photo src={p[1]} alt="Wedding celebration detail before the dance night" className="portrait drift"/></section>
        <section className="scene poster-grid"><Photo src={p[2]} alt="Candid portrait during a wedding celebration" className="poster-a drift"/><div className="poster-type reveal"><p>{s[2].label}</p><h2>{s[2].title}</h2><span>{s[2].note}</span></div><div className="stamp" aria-hidden="true">FLASH / 002</div></section>
        <section className="scene family-cut"><div className="frame reveal"><Photo src={p[3]} alt="Family celebrating together"/></div><div className="frame offset reveal"><Photo src={p[4]} alt="Guests sharing a joyful celebration moment"/></div><div className="caption reveal"><p>{s[3].label}</p><h2>{s[3].title}</h2></div></section>
        <section className="scene beat-scene"><Photo src={p[5]} alt="Dance-floor celebration" className="beat-photo drift"/><div className="beat-copy reveal"><p>{s[4].label}</p><h2>{s[4].title}</h2><span>{s[4].note}</span></div></section>
        <section className="scene intermission"><p>{s[5].label}</p><h2 className="reveal">{s[5].title}</h2><span>{s[5].note}</span></section>
        <section className="scene contact-sheet">{[p[1],p[3],p[6],p[2],p[5],p[7]].map((src,i)=><Photo key={src+i} src={src} alt={`Celebration contact sheet frame ${i+1}`} className="contact reveal"/>)}<div className="contact-title reveal"><p>{s[6].label}</p><h2>{s[6].title}</h2></div></section>
        <section className="scene spotlight"><Photo src={p[7]} alt="Couple framed in cinematic event lighting" className="spot-photo drift"/><div className="spot-copy reveal"><p>{s[7].label}</p><h2>{s[7].title}</h2><span>{s[7].note}</span></div></section>
        <section className="scene detail-reel"><div className="reel-track">{[p[4],p[6],p[1],p[3]].map((src,i)=><Photo key={src+i} src={src} alt={`Celebration detail ${i+1}`}/>)}</div><div className="reel-copy reveal"><p>{s[8].label}</p><h2>{s[8].title}</h2></div></section>
        <section className="scene midnight"><div className="midnight-number" aria-hidden="true">00:37</div><div className="copy reveal"><p>{s[9].label}</p><h2>{s[9].title}</h2><span>{s[9].note}</span></div></section>
        <section className="scene last-dance"><Photo src={p[0]} alt="Final dance moment of the celebration" className="last-photo drift"/><div className="last-copy reveal"><p>{s[10].label}</p><h2>{s[10].title}</h2><span>{s[10].note}</span></div></section>
        <footer className="scene finale"><p>{s[11].label}</p><h2 className="reveal">{s[11].title}</h2><div className="final-meta"><span>{experience.couple.first} + {experience.couple.second}</span><span>{experience.couple.date}</span><span>{experience.couple.location}</span></div></footer>
      </div>
    </main>
  )
}

export default App
