import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'
import { useMenu } from '../context/MenuContext'
import { getImageSrc } from '../utils/image'

// ─── Real menu category data from texasjoes.com ──────────────────────────────
const MENU_CATEGORIES = [
  {
    id: 'baby-back',
    title: 'Baby Back Ribs',
    description: 'Baby Back Ribs come from the loin — more lean than Spare Ribs. Slow smoked and flame-kissed on the grill.',
    image: 'https://texasjoes.com/wp-content/uploads/2018/09/baby-back-ribs.jpg',
  },
  {
    id: 'spare-ribs',
    title: 'Hickory Smoked Spare Ribs',
    description: 'Only USA Swift Premium Pork ribs meet our standards. Slow smoked over hickory wood and char-broiled before serving.',
    image: 'https://texasjoes.com/wp-content/uploads/2018/09/hickory-smoked-ribs.jpg',
  },
  {
    id: 'platters',
    title: 'Classic BBQ Platters',
    description: 'Comes with our popular Roasted Garlic Green Beans and your choice of 2 delicious sides.',
    image: 'https://texasjoes.com/wp-content/uploads/2018/09/classic-bbq.jpg',
  },
  {
    id: 'sandwiches',
    title: 'Real BBQ Sandwiches',
    description: 'All sandwiches come with one side of your choice. Texas BBQ served between two buns.',
    image: 'https://texasjoes.com/wp-content/uploads/2018/09/real-bbq-sandwich.jpg',
  },
  {
    id: 'lunch',
    title: 'Lunch Meals',
    description: 'Not so hungry? Lighten up! Comes with rice and your choice of 1 side.',
    image: 'https://texasjoes.com/wp-content/uploads/2018/09/lunch-meal.jpg',
  },
  {
    id: 'desserts',
    title: 'Desserts',
    description: 'End your meal the Texas way — sweet finishes to a smoky feast.',
    image: 'https://texasjoes.com/wp-content/uploads/2018/09/desserts.jpg',
  },
]

const GALLERY = [
  'https://texasjoes.com/wp-content/uploads/2018/09/7.jpg',
  'https://texasjoes.com/wp-content/uploads/2018/09/5.jpg',
  'https://texasjoes.com/wp-content/uploads/2018/09/4.jpg',
  'https://texasjoes.com/wp-content/uploads/2018/09/8.jpg',
  'https://texasjoes.com/wp-content/uploads/2018/09/2.jpg',
  'https://texasjoes.com/wp-content/uploads/2018/09/1.jpg',
  'https://texasjoes.com/wp-content/uploads/2018/09/6.jpg',
  'https://texasjoes.com/wp-content/uploads/2018/09/3.jpg',
]

// ─── Shared divider ───────────────────────────────────────────────────────────
const Divider = ({ light = false }) => (
  <div className={`tj-divider${light ? ' tj-divider--light' : ''}`} aria-hidden="true">
    <span /><span className="tj-divider__icon">✦</span><span />
  </div>
)

// ─── Menu category card ───────────────────────────────────────────────────────
const CategoryCard = ({ item, onClick }) => (
  <div
    className="cat-card"
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={e => e.key === 'Enter' && onClick()}
    aria-label={`Browse ${item.title}`}
  >
    <div className="cat-card__img-wrap">
      <img src={item.image} alt={item.title} loading="lazy" />
      <div className="cat-card__overlay" aria-hidden="true" />
    </div>
    <div className="cat-card__body">
      <h3 className="cat-card__title">{item.title}</h3>
      <p className="cat-card__desc">{item.description}</p>
      <span className="cat-card__cta">View Items →</span>
    </div>
  </div>
)

// ─── Main component ───────────────────────────────────────────────────────────
const Home = () => {
  const navigate  = useNavigate()
  const { products, loading } = useMenu()

  const featuredItems = (!loading && Array.isArray(products))
    ? products.filter(i => i.popular || i.featured).slice(0, 4)
    : []

  return (
    <div className="home">

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="hero" aria-label="Welcome">
        <div className="hero__bg"      aria-hidden="true" />
        <div className="hero__overlay" aria-hidden="true" />

        <div className="hero__body">
          <p  className="hero__eyebrow">Texas Joe's — Est. 1999</p>
        <h1 className="hero__title">
          The Original Real American Smokehouse
        </h1>
          <p  className="hero__sub">In the Philippines</p>
          <div className="hero__actions">
            <button className="btn-primary" onClick={() => navigate('/menu')}>
              View Menu
            </button>
            <button className="btn-ghost" onClick={() => navigate('/reservations')}>
              Reserve a Table
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PROMISE STRIP
      ══════════════════════════════════════════════════════ */}
      <section className="promise" aria-label="Our promise">
        <div className="promise__inner">
          <Divider />
          <h2 className="promise__headline">
            "In the Beginning. Let There Be BBQ.<br />And It Was Good!!!"
          </h2>
          <p className="promise__body">
            Our meat is smoked with real hickory wood.&ensp;
            <strong>Never Boiled. Never Dipped in Liquid Smoke.</strong>
          </p>
          <Divider />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PHOTO GALLERY — auto-scrolling strip
      ══════════════════════════════════════════════════════ */}
      <section className="gallery" aria-label="Food gallery">
        <div className="gallery__track" aria-hidden="true">
          {[...GALLERY, ...GALLERY].map((src, i) => (
            <div className="gallery__item" key={i}>
              <img src={src} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          MENU CATEGORIES
      ══════════════════════════════════════════════════════ */}
      <section className="menu-cats" aria-label="Menu categories">
        <div className="section-header">
          <p className="section-label">From the Pit</p>
          <h2 className="section-title">Our Menu</h2>
          <Divider />
          <p className="section-sub">
            Slow-smoked with real hickory wood — never boiled, never dipped in liquid smoke.
          </p>
        </div>

        <div className="cat-grid">
          {MENU_CATEGORIES.map(cat => (
            <CategoryCard
              key={cat.id}
              item={cat}
              onClick={() => navigate('/menu')}
            />
          ))}
        </div>

        <div className="section-cta">
          <button className="btn-primary" onClick={() => navigate('/menu')}>
            See Full Menu
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          POPULAR ITEMS — live from database
      ══════════════════════════════════════════════════════ */}
      {!loading && featuredItems.length > 0 && (
        <section className="popular" aria-label="Popular items">
          <div className="section-header section-header--dark">
            <p className="section-label section-label--gold">Best Sellers</p>
            <h2 className="section-title section-title--light">Crowd Favourites</h2>
            <Divider light />
          </div>

          <div className="popular__grid">
            {featuredItems.map(item => (
              <div
                className="pop-card"
                key={item._id}
                onClick={() => navigate('/menu')}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate('/menu')}
                aria-label={`View ${item.name}`}
              >
                <div className="pop-card__img">
                  {item.image
                    ? <img
                        src={getImageSrc(item.image)}
                        alt={item.name}
                        onError={e => { e.currentTarget.style.display = 'none' }}
                      />
                    : <span className="pop-card__emoji">🍖</span>
                  }
                  {item.popular && <span className="pop-card__badge">★ Best Seller</span>}
                </div>
                <div className="pop-card__body">
                  <span className="pop-card__cat">{item.category}</span>
                  <h3 className="pop-card__name">{item.name}</h3>
                  <p className="pop-card__desc">{item.description}</p>
                  <div className="pop-card__footer">
                    <span className="pop-card__price">₱{Number(item.price).toLocaleString()}</span>
                    <button
                      className="btn-order"
                      onClick={e => { e.stopPropagation(); navigate('/menu') }}
                      aria-label={`Order ${item.name}`}
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          FUNCTION ROOMS
      ══════════════════════════════════════════════════════ */}
      <section className="events" aria-label="Private function rooms">
        <div className="events__overlay" aria-hidden="true" />
        <div className="events__body">
          <p className="section-label section-label--gold">Private Events</p>
          <h2 className="events__title">
            Private Function Rooms Available for Your Next Business Meeting,
            Team Building Event, Birthday Party or Other Event.
          </h2>
          <Divider light />
          <button className="btn-primary" onClick={() => navigate('/reservations')}>
            Find Out More
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CONTACT & MAP
      ══════════════════════════════════════════════════════ */}
      <section className="contact" aria-label="Contact and location">
        <div className="contact__info">
          <p className="section-label">Visit Us</p>
          <h2 className="section-title">Find Us</h2>
          <Divider />

          <ul className="contact__list" role="list">
            <li>
              <span className="contact__icon" aria-hidden="true">📍</span>
              <span>
                Corner of Waterfront Rd. and McKinley St.,<br />
                Subic Bay Freeport Zone
              </span>
            </li>
            <li>
              <span className="contact__icon" aria-hidden="true">📞</span>
              <a href="tel:+639175123461">0917-512-3461</a>
            </li>
            <li>
              <span className="contact__icon" aria-hidden="true">✉️</span>
              <a href="mailto:info@texasjoes.com">info@texasjoes.com</a>
            </li>
            <li>
              <span className="contact__icon" aria-hidden="true">🕐</span>
              <span>Open every day &nbsp;·&nbsp; 10:30 AM – 10:00 PM</span>
            </li>
          </ul>

          <a
            className="btn-primary"
            href="https://www.google.com/maps/dir/?api=1&destination=Corner+Waterfront+Rd+McKinley+St+Subic+Bay+Freeport+Zone+Zambales"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Get directions to Texas Joe's"
          >
            Get Directions
          </a>
        </div>

        <div className="contact__map">
          <iframe
            title="Texas Joe's Location — Subic Bay"
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
      <section className="cta-band" aria-label="Order now">
        <div className="cta-band__overlay" aria-hidden="true" />
        <div className="cta-band__body">
          <p className="section-label section-label--gold">Don't Wait</p>
          <h2 className="cta-band__title">Ready to Order?</h2>
          <p className="cta-band__sub">Dine in, take out, or order online.</p>
          <div className="cta-band__actions">
            <button className="btn-primary" onClick={() => navigate('/menu')}>
              Order Online
            </button>
            <button className="btn-ghost" onClick={() => navigate('/reservations')}>
              Reserve a Table
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Home