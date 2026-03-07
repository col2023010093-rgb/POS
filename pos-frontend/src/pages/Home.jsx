import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'
import { useMenu } from '../context/MenuContext'
import { getImageSrc } from '../utils/image'

// ─── Decorative divider component ────────────────────────────────────────────
const WesternDivider = ({ light = false }) => (
  <div className={`western-divider ${light ? 'western-divider--light' : ''}`} aria-hidden="true">
    <span className="divider-line" />
    <span className="divider-icon">✦</span>
    <span className="divider-line" />
  </div>
)

// ─── Stat badge for hero ──────────────────────────────────────────────────────
const StatBadge = ({ value, label }) => (
  <div className="stat-badge">
    <span className="stat-value">{value}</span>
    <span className="stat-label">{label}</span>
  </div>
)

// ─── Featured item card ───────────────────────────────────────────────────────
const FeaturedCard = ({ item, onNavigate }) => (
  <div className="featured-card" role="article">
    <div className="featured-card__image">
      {item.image ? (
        <img
          src={getImageSrc(item.image)}
          alt={item.name}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      ) : (
        <span className="featured-card__emoji">🍖</span>
      )}
      <div className="featured-card__image-overlay" />
      {item.popular && (
        <span className="featured-card__badge">★ Best Seller</span>
      )}
    </div>
    <div className="featured-card__body">
      <span className="featured-card__category">{item.category}</span>
      <h3 className="featured-card__name">{item.name}</h3>
      <p className="featured-card__desc">{item.description}</p>
      <div className="featured-card__footer">
        <span className="featured-card__price">
          <sup>₱</sup>{Number(item.price).toLocaleString()}
        </span>
        {/* QA FIX: removed broken addToCart call; navigates to menu for ordering */}
        <button
          className="btn-order"
          onClick={() => onNavigate('/menu')}
          aria-label={`Order ${item.name}`}
        >
          Order Now
        </button>
      </div>
    </div>
  </div>
)

// ─── Main component ───────────────────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate()
  const { products, loading } = useMenu()

  // Safe featured items filter
  const featuredItems = (!loading && Array.isArray(products))
    ? products.filter(item => item.popular || item.featured).slice(0, 6)
    : []

  return (
    <div className="home">

      {/* ══════════════════════════════════════════════════════
          HERO — Cinematic campfire night
      ══════════════════════════════════════════════════════ */}
      <section className="hero" aria-label="Welcome to Texas Joe's">
        {/* layered atmospheric backgrounds */}
        <div className="hero__bg"         aria-hidden="true" />
        <div className="hero__smoke"      aria-hidden="true" />
        <div className="hero__gradient"   aria-hidden="true" />
        <div className="hero__vignette"   aria-hidden="true" />

        <div className="hero__content">
          {/* Eyebrow */}
          <p className="hero__eyebrow">
            <span className="eyebrow-ornament">─── ✦ ───</span>
            &nbsp;&nbsp;Est. 1999 · Subic Bay, Philippines&nbsp;&nbsp;
            <span className="eyebrow-ornament">─── ✦ ───</span>
          </p>

          {/* Main headline */}
          <h1 className="hero__headline">
            <span className="headline-sub">Texas Joe's</span>
            <span className="headline-main">Real American</span>
            <span className="headline-accent">Smokehouse</span>
          </h1>

          <p className="hero__tagline">
            Slow-smoked over real hickory wood.&nbsp; Never boiled. Never dipped in liquid smoke.
          </p>

          {/* CTAs */}
          <div className="hero__actions">
            <button
              className="btn-primary"
              onClick={() => navigate('/menu')}
              aria-label="View our menu"
            >
              View Menu
            </button>
            <button
              className="btn-ghost"
              onClick={() => navigate('/reservations')}
              aria-label="Make a reservation"
            >
              Reserve a Table
            </button>
          </div>

          {/* Stats row */}
          <div className="hero__stats" aria-label="Restaurant highlights">
            <StatBadge value="25+" label="Years Serving" />
            <span className="stats-divider" aria-hidden="true">|</span>
            <StatBadge value="100%" label="Hickory Smoked" />
            <span className="stats-divider" aria-hidden="true">|</span>
            <StatBadge value="USA" label="Swift Premium Pork" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero__scroll-hint" aria-hidden="true">
          <span className="scroll-label">Scroll</span>
          <span className="scroll-arrow">↓</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BRAND STATEMENT — Parchment strip
      ══════════════════════════════════════════════════════ */}
      <section className="brand-strip" aria-label="Our promise">
        <div className="brand-strip__inner">
          <blockquote className="brand-strip__quote">
            <p>"In the beginning — let there be BBQ. And it was good!!!"</p>
          </blockquote>
          <p className="brand-strip__sub">
            Our meat is smoked with real hickory wood &nbsp;·&nbsp; Never Boiled &nbsp;·&nbsp; Never Dipped in Liquid Smoke
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PILLARS — Three brand values
      ══════════════════════════════════════════════════════ */}
      <section className="pillars" aria-label="Why Texas Joe's">
        <div className="pillars__inner">
          <div className="pillar">
            <span className="pillar__icon" aria-hidden="true">🔥</span>
            <h3 className="pillar__title">Real Hickory Smoke</h3>
            <p className="pillar__text">Every cut slow-smoked over genuine hickory wood for hours — never shortcuts, never liquid smoke.</p>
          </div>
          <div className="pillar pillar--accent">
            <span className="pillar__icon" aria-hidden="true">🐄</span>
            <h3 className="pillar__title">USA Premium Cuts</h3>
            <p className="pillar__text">We use only Swift Premium USA Pork ribs and Certified Angus Beef — quality you can taste in every bite.</p>
          </div>
          <div className="pillar">
            <span className="pillar__icon" aria-hidden="true">🤠</span>
            <h3 className="pillar__title">Texas Tradition</h3>
            <p className="pillar__text">Over 25 years of authentic Texas BBQ tradition, brought straight to Subic Bay, Philippines.</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURED MENU
      ══════════════════════════════════════════════════════ */}
      <section className="featured" aria-label="Featured menu items">
        <div className="featured__header">
          <span className="section-eyebrow">From the Pit</span>
          <h2 className="section-title">Crowd Favourites</h2>
          <WesternDivider />
          <p className="section-subtitle">
            Hand-picked by our pitmaster — the dishes that keep our regulars coming back
          </p>
        </div>

        {loading ? (
          <div className="featured__loading" role="status" aria-live="polite">
            <span className="loading-ember">🔥</span>
            <p>Firing up the smoker…</p>
          </div>
        ) : featuredItems.length === 0 ? (
          <div className="featured__empty" role="status">
            <p>No featured items right now — check back soon.</p>
          </div>
        ) : (
          <div className="featured__grid" role="list">
            {featuredItems.map((item) => (
              <FeaturedCard
                key={item._id}
                item={item}
                onNavigate={navigate}
              />
            ))}
          </div>
        )}

        <div className="featured__cta">
          <button className="btn-primary" onClick={() => navigate('/menu')}>
            See Full Menu
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ABOUT SECTION
      ══════════════════════════════════════════════════════ */}
      <section className="about" aria-label="Our story">
        <div className="about__visual" aria-hidden="true">
          <div className="about__badge-ring">
            <div className="about__badge">
              <span className="badge-icon">🔥</span>
              <span className="badge-years">25+</span>
              <span className="badge-text">Years of BBQ</span>
            </div>
          </div>
          <div className="about__smoke-effect" aria-hidden="true" />
        </div>

        <div className="about__content">
          <span className="section-eyebrow section-eyebrow--light">Our Story</span>
          <h2 className="section-title section-title--light">Born in Texas.<br />Smoked in Subic.</h2>
          <WesternDivider light />
          <p className="about__body">
            For over 25 years, Texas Joe's has been bringing authentic American BBQ to the Philippines.
            Our pitmaster uses traditional techniques passed down through generations — slow-smoking
            every cut over real hickory wood until it reaches that perfect, fall-off-the-bone tenderness.
          </p>
          <p className="about__body">
            Using only USA Swift Premium Pork ribs and Certified Angus Beef, every plate that leaves
            our kitchen carries the soul of a true Texas smokehouse.
          </p>
          <button
            className="btn-outline-light"
            onClick={() => navigate('/about')}
            aria-label="Learn more about our story"
          >
            Our Full Story
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          LOCATION SECTION
      ══════════════════════════════════════════════════════ */}
      <section className="location" aria-label="Find us">
        <div className="location__header">
          <span className="section-eyebrow">Come Find Us</span>
          <h2 className="section-title">Where the Smoke Rises</h2>
          <WesternDivider />
        </div>

        <div className="location__body">
          <div className="location__info">
            <div className="location__detail">
              <span className="location__icon" aria-hidden="true">📍</span>
              <div>
                <strong>Texas Joe's House of Ribs</strong>
                <p>R7CG+7F9, Mc Kinley St,<br />Subic Bay Freeport Zone, Zambales</p>
              </div>
            </div>
            <div className="location__detail">
              <span className="location__icon" aria-hidden="true">🕐</span>
              <div>
                <strong>Hours</strong>
                <p>Mon – Sun: 11:00 AM – 10:00 PM</p>
              </div>
            </div>
            <a
              className="btn-primary"
              href="https://www.google.com/maps/dir/?api=1&destination=R7CG%2B7F9%2C%20Mc%20Kinley%20St%2C%20Subic%20Bay%20Freeport%20Zone%2C%20Zambales"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get directions to Texas Joe's"
            >
              Get Directions
            </a>
          </div>

          <div className="location__map">
            <iframe
              title="Texas Joe's House of Ribs Location"
              src="https://www.google.com/maps?q=R7CG%2B7F9%2C%20Mc%20Kinley%20St%2C%20Subic%20Bay%20Freeport%20Zone%2C%20Zambales&output=embed"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════════════════════ */}
      <section className="cta" aria-label="Get started">
        <div className="cta__bg"     aria-hidden="true" />
        <div className="cta__overlay" aria-hidden="true" />
        <div className="cta__content">
          <span className="section-eyebrow cta__eyebrow">Don't Wait, Partner</span>
          <h2 className="cta__title">
            Ready for the Best<br />BBQ in the Philippines?
          </h2>
          <p className="cta__sub">
            Dine in, order online, or book a table for your whole crew.
          </p>
          <div className="cta__actions">
            <button
              className="btn-primary"
              onClick={() => navigate('/reservations')}
              aria-label="Make a reservation"
            >
              🤠 Reserve a Table
            </button>
            <button
              className="btn-ghost cta__ghost"
              onClick={() => navigate('/menu')}
              aria-label="Order online"
            >
              Order Online
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Home