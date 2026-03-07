import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './about.css'

// ─── Real Texas Joe's content ─────────────────────────────────────────────────

const PILLARS = [
  {
    icon: '🔥',
    title: 'Real Hickory Wood',
    body: 'Every rack, every brisket, every rib is smoked over genuine hickory wood — never boiled, never dipped in liquid smoke. The smoke does the work.',
  },
  {
    icon: '🐷',
    title: 'USA Swift Premium',
    body: 'Only USA Swift Premium Pork meets our standards. We source the best cuts so that quality is locked in before the smoker door even closes.',
  },
  {
    icon: '⏱️',
    title: 'Low & Slow',
    body: 'We never rush the process. Our meats are smoked low and slow for hours, then char-broiled to order — giving you that perfect crust every time.',
  },
  {
    icon: '🤝',
    title: 'Texas Hospitality',
    body: 'We bring the spirit of the American South to Subic Bay. Generous portions, a warm atmosphere, and food made the way it was always meant to be.',
  },
]

const STATS = [
  { value: '1999', label: 'Est. in the Philippines' },
  { value: '100%', label: 'Real Hickory Smoked' },
  { value: '0',    label: 'Times We\'ve Boiled Ribs' },
  { value: '∞',    label: 'Smoke Rings Served' },
]

const MENU_HIGHLIGHTS = [
  { name: 'Hickory Smoked Spare Ribs',   cat: 'Spare Ribs',    img: 'https://texasjoes.com/wp-content/uploads/2018/09/hickory-smoked-ribs.jpg' },
  { name: 'Baby Back Ribs',              cat: 'Baby Back',     img: 'https://texasjoes.com/wp-content/uploads/2018/09/baby-back-ribs.jpg' },
  { name: 'Classic BBQ Platters',        cat: 'Platters',      img: 'https://texasjoes.com/wp-content/uploads/2018/09/classic-bbq.jpg' },
  { name: 'Real BBQ Sandwiches',         cat: 'Sandwiches',    img: 'https://texasjoes.com/wp-content/uploads/2018/09/real-bbq-sandwich.jpg' },
]

// ─── Shared Divider (matches Home.css) ───────────────────────────────────────
const Divider = ({ light = false }) => (
  <div className={`tj-divider${light ? ' tj-divider--light' : ''}`} aria-hidden="true">
    <span /><span className="tj-divider__icon">✦</span><span />
  </div>
)

// ─── Simple scroll-reveal hook ────────────────────────────────────────────────
const useReveal = () => {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

// ─── Pillar card ──────────────────────────────────────────────────────────────
const PillarCard = ({ item, delay }) => {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      className={`ab-pillar${visible ? ' ab-pillar--visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span className="ab-pillar__icon" aria-hidden="true">{item.icon}</span>
      <h3 className="ab-pillar__title">{item.title}</h3>
      <p  className="ab-pillar__body">{item.body}</p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
const About = () => {
  const navigate = useNavigate()
  const [storyRef,    storyVisible]    = useReveal()
  const [statsRef,    statsVisible]    = useReveal()
  const [menuRef,     menuVisible]     = useReveal()
  const [locationRef, locationVisible] = useReveal()

  return (
    <div className="about">

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="ab-hero" aria-label="About Texas Joe's">
        <div className="ab-hero__bg"      aria-hidden="true" />
        <div className="ab-hero__overlay" aria-hidden="true" />
        <div className="ab-hero__body">
          <p  className="ab-hero__eyebrow">Texas Joe's — Est. 1999</p>
          <h1 className="ab-hero__title">The Story Behind<br />the Smoke</h1>
          <Divider light />
          <p className="ab-hero__sub">
            The Original Real American Smokehouse — In the Philippines
          </p>
        </div>
        <div className="ab-hero__scroll" aria-hidden="true">
          <span className="ab-hero__scroll-line" />
          <span className="ab-hero__scroll-text">Scroll</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          OUR STORY
      ══════════════════════════════════════════════════════ */}
      <section
        ref={storyRef}
        className={`ab-story${storyVisible ? ' ab-story--visible' : ''}`}
        aria-label="Our story"
      >
        <div className="ab-story__image-col">
          <div className="ab-story__img-wrap">
            <img
              src="https://texasjoes.com/wp-content/uploads/2018/09/8.jpg"
              alt="Texas Joe's smoker"
              loading="lazy"
            />
            <div className="ab-story__img-badge">
              <span className="ab-story__img-badge-year">1999</span>
              <span className="ab-story__img-badge-label">Est. Philippines</span>
            </div>
          </div>
        </div>

        <div className="ab-story__text-col">
          <p className="section-label">Who We Are</p>
          <h2 className="section-title">In the Beginning.<br />Let There Be BBQ.</h2>
          <Divider />
          <p className="ab-story__lead">
            Texas Joe's House of Ribs is the original real American smokehouse in the Philippines —
            born from one unwavering belief: great BBQ takes time, the right wood, and an
            absolute refusal to cut corners.
          </p>
          <p className="ab-story__body">
            Since 1999, we have been bringing authentic Texas pit barbecue to Subic Bay Freeport
            Zone. Every morning, our pitmasters fire up the smoker with genuine hickory wood and
            begin the slow, patient process that separates real BBQ from everything else.
          </p>
          <p className="ab-story__body">
            Our meats are never boiled. Never dipped in liquid smoke. Only USA Swift Premium Pork
            ribs meet our standards — slow smoked over hickory, then char-broiled to order for
            that signature crust and smoke ring that keeps our guests coming back.
          </p>
          <p className="ab-story__body ab-story__body--emphasis">
            "Never Boiled. Never Dipped in Liquid Smoke."
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS BAND
      ══════════════════════════════════════════════════════ */}
      <section
        ref={statsRef}
        className={`ab-stats${statsVisible ? ' ab-stats--visible' : ''}`}
        aria-label="By the numbers"
      >
        {STATS.map((s, i) => (
          <div
            className="ab-stat"
            key={i}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <span className="ab-stat__value">{s.value}</span>
            <span className="ab-stat__label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ══════════════════════════════════════════════════════
          OUR PILLARS (philosophy)
      ══════════════════════════════════════════════════════ */}
      <section className="ab-pillars" aria-label="Our philosophy">
        <div className="ab-pillars__header section-header">
          <p className="section-label">What We Stand For</p>
          <h2 className="section-title">The Texas Joe's Way</h2>
          <Divider />
          <p className="section-sub">
            Four principles we have never compromised on — not once in over two decades.
          </p>
        </div>
        <div className="ab-pillars__grid">
          {PILLARS.map((p, i) => (
            <PillarCard key={i} item={p} delay={i * 100} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          MENU HIGHLIGHTS
      ══════════════════════════════════════════════════════ */}
      <section
        ref={menuRef}
        className={`ab-menu${menuVisible ? ' ab-menu--visible' : ''}`}
        aria-label="Menu highlights"
      >
        <div className="ab-menu__overlay" aria-hidden="true" />
        <div className="ab-menu__inner">
          <div className="ab-menu__header">
            <p className="section-label section-label--gold">From the Pit</p>
            <h2 className="section-title section-title--light">What We're Known For</h2>
            <Divider light />
          </div>
          <div className="ab-menu__grid">
            {MENU_HIGHLIGHTS.map((item, i) => (
              <div
                className="ab-menu__card"
                key={i}
                style={{ transitionDelay: `${i * 80}ms` }}
                onClick={() => navigate('/menu')}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate('/menu')}
                aria-label={`View ${item.name} on menu`}
              >
                <div className="ab-menu__card-img">
                  <img src={item.img} alt={item.name} loading="lazy" />
                  <div className="ab-menu__card-overlay" aria-hidden="true" />
                </div>
                <div className="ab-menu__card-body">
                  <span className="ab-menu__card-cat">{item.cat}</span>
                  <h3  className="ab-menu__card-name">{item.name}</h3>
                </div>
              </div>
            ))}
          </div>
          <div className="ab-menu__cta">
            <button className="btn-primary" onClick={() => navigate('/menu')}>
              See Full Menu
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          EXPERIENCE STRIP
      ══════════════════════════════════════════════════════ */}
      <section className="ab-experience" aria-label="The experience">
        <div className="ab-experience__inner">
          <Divider />
          <blockquote className="ab-experience__quote">
            "We bring the spirit of the American South straight to Subic Bay —
            generous portions, warm service, and BBQ that's smoked the real way."
          </blockquote>
          <p className="ab-experience__attribution">— Texas Joe's, since 1999</p>
          <Divider />
          <div className="ab-experience__facts">
            <div className="ab-experience__fact">
              <span aria-hidden="true">📍</span>
              <span>Subic Bay Freeport Zone</span>
            </div>
            <div className="ab-experience__fact">
              <span aria-hidden="true">🕐</span>
              <span>Open Daily · 10:30 AM – 10:00 PM</span>
            </div>
            <div className="ab-experience__fact">
              <span aria-hidden="true">📞</span>
              <a href="tel:+639175123461">0917-512-3461</a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          LOCATION
      ══════════════════════════════════════════════════════ */}
      <section
        ref={locationRef}
        className={`ab-location${locationVisible ? ' ab-location--visible' : ''}`}
        aria-label="Location"
      >
        <div className="ab-location__info">
          <p className="section-label">Visit Us</p>
          <h2 className="section-title">Come Find Us</h2>
          <Divider />
          <p className="ab-location__address">
            Corner of Waterfront Rd. and McKinley St.,<br />
            Subic Bay Freeport Zone, Zambales
          </p>
          <ul className="ab-location__hours">
            <li><strong>Monday – Sunday</strong><span>10:30 AM – 10:00 PM</span></li>
          </ul>
          <div className="ab-location__actions">
            <a
              className="btn-primary"
              href="https://www.google.com/maps/dir/?api=1&destination=Corner+Waterfront+Rd+McKinley+St+Subic+Bay+Freeport+Zone+Zambales"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions
            </a>
            <button className="btn-ghost-dark" onClick={() => navigate('/reservations')}>
              Reserve a Table
            </button>
          </div>
        </div>
        <div className="ab-location__map">
          <iframe
            title="Texas Joe's Location"
            src="https://www.google.com/maps?q=R7CG%2B7F9%2C+Mc+Kinley+St%2C+Subic+Bay+Freeport+Zone%2C+Zambales&output=embed"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA CLOSING BAND
      ══════════════════════════════════════════════════════ */}
      <section className="ab-cta" aria-label="Call to action">
        <div className="ab-cta__overlay" aria-hidden="true" />
        <div className="ab-cta__body">
          <p className="section-label section-label--gold">Don't Wait</p>
          <h2 className="ab-cta__title">Ready to Taste the Real Thing?</h2>
          <Divider light />
          <p className="ab-cta__sub">
            Dine in, take out, or order online — the smoke's been going since sunrise.
          </p>
          <div className="ab-cta__actions">
            <button className="btn-primary" onClick={() => navigate('/menu')}>
              Order Online
            </button>
            <button className="btn-ghost" onClick={() => navigate('/reservations')}>
              Make a Reservation
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}

export default About