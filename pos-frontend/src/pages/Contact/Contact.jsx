import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './contact.css'

// ─── Real Texas Joe's contact info ───────────────────────────────────────────
const CONTACT_INFO = [
  {
    icon: '📍',
    label: 'Address',
    lines: ['Corner of Waterfront Rd. and McKinley St.', 'Subic Bay Freeport Zone, Zambales'],
  },
  {
    icon: '📞',
    label: 'Phone',
    lines: ['0917-512-3461'],
    href: 'tel:+639175123461',
  },
  {
    icon: '✉️',
    label: 'Email',
    lines: ['info@texasjoes.com'],
    href: 'mailto:info@texasjoes.com',
  },
  {
    icon: '🕐',
    label: 'Opening Hours',
    lines: ['Monday – Sunday', '10:30 AM – 10:00 PM'],
  },
]

const SOCIAL = [
  {
    label: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
    href: 'https://facebook.com/texasjoes',
  },
  {
    label: 'Instagram',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    href: 'https://instagram.com/texasjoes',
  },
  {
    label: 'TripAdvisor',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 110-16 8 8 0 010 16zm-3-8a3 3 0 106 0 3 3 0 00-6 0zm3 1.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
      </svg>
    ),
    href: 'https://www.tripadvisor.com/Restaurant_Review-g469411-d1969829-Reviews-Texas_Joe_s_House_of_Ribs-Olongapo_Central_Luzon_Region_Luzon.html',
  },
]

// ─── Shared Divider ───────────────────────────────────────────────────────────
const Divider = ({ light = false }) => (
  <div className={`tj-divider${light ? ' tj-divider--light' : ''}`} aria-hidden="true">
    <span /><span className="tj-divider__icon">✦</span><span />
  </div>
)

// ─── Contact Info Card ────────────────────────────────────────────────────────
const InfoCard = ({ item }) => (
  <div className="ct-info-card">
    <span className="ct-info-card__icon" aria-hidden="true">{item.icon}</span>
    <div className="ct-info-card__body">
      <span className="ct-info-card__label">{item.label}</span>
      {item.href
        ? <a className="ct-info-card__value ct-info-card__value--link" href={item.href}>
            {item.lines.join(' ')}
          </a>
        : item.lines.map((line, i) => (
            <span className="ct-info-card__value" key={i}>{line}</span>
          ))
      }
    </div>
  </div>
)

// ─── Contact Form ─────────────────────────────────────────────────────────────
const ContactForm = () => {
  const [form,    setForm]    = useState({ name: '', email: '', subject: '', message: '' })
  const [errors,  setErrors]  = useState({})
  const [status,  setStatus]  = useState('idle') // idle | loading | success | error

  const validate = () => {
    const e = {}
    if (!form.name.trim())                           e.name    = 'Name is required.'
    if (!form.email.trim())                          e.email   = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email))      e.email   = 'Enter a valid email address.'
    if (!form.subject.trim())                        e.subject = 'Subject is required.'
    if (!form.message.trim())                        e.message = 'Message is required.'
    else if (form.message.trim().length < 10)        e.message = 'Message must be at least 10 characters.'
    return e
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear error on change
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }

    setStatus('loading')
    // Simulate async submission — replace with your real API call
    try {
      await new Promise(res => setTimeout(res, 1400))
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="ct-form-success" role="alert">
        <span className="ct-form-success__icon" aria-hidden="true">✅</span>
        <h3 className="ct-form-success__title">Message Sent!</h3>
        <p  className="ct-form-success__body">
          Thanks for reaching out. We'll get back to you as soon as the smoke clears.
        </p>
        <button
          className="btn-primary"
          onClick={() => setStatus('idle')}
        >
          Send Another Message
        </button>
      </div>
    )
  }

  return (
    <form className="ct-form" onSubmit={handleSubmit} noValidate aria-label="Contact form">
      <div className="ct-form__row">
        {/* Name */}
        <div className={`ct-form__group${errors.name ? ' ct-form__group--error' : ''}`}>
          <label className="ct-form__label" htmlFor="ct-name">Your Name</label>
          <input
            className="ct-form__input"
            id="ct-name"
            name="name"
            type="text"
            placeholder="e.g. Juan dela Cruz"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
            aria-describedby={errors.name ? 'ct-name-err' : undefined}
          />
          {errors.name && <span className="ct-form__error" id="ct-name-err" role="alert">{errors.name}</span>}
        </div>

        {/* Email */}
        <div className={`ct-form__group${errors.email ? ' ct-form__group--error' : ''}`}>
          <label className="ct-form__label" htmlFor="ct-email">Email Address</label>
          <input
            className="ct-form__input"
            id="ct-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            aria-describedby={errors.email ? 'ct-email-err' : undefined}
          />
          {errors.email && <span className="ct-form__error" id="ct-email-err" role="alert">{errors.email}</span>}
        </div>
      </div>

      {/* Subject */}
      <div className={`ct-form__group${errors.subject ? ' ct-form__group--error' : ''}`}>
        <label className="ct-form__label" htmlFor="ct-subject">Subject</label>
        <input
          className="ct-form__input"
          id="ct-subject"
          name="subject"
          type="text"
          placeholder="e.g. Reservation inquiry, Feedback..."
          value={form.subject}
          onChange={handleChange}
          aria-describedby={errors.subject ? 'ct-subject-err' : undefined}
        />
        {errors.subject && <span className="ct-form__error" id="ct-subject-err" role="alert">{errors.subject}</span>}
      </div>

      {/* Message */}
      <div className={`ct-form__group${errors.message ? ' ct-form__group--error' : ''}`}>
        <label className="ct-form__label" htmlFor="ct-message">Message</label>
        <textarea
          className="ct-form__textarea"
          id="ct-message"
          name="message"
          rows={5}
          placeholder="Tell us how we can help..."
          value={form.message}
          onChange={handleChange}
          aria-describedby={errors.message ? 'ct-message-err' : undefined}
        />
        {errors.message && <span className="ct-form__error" id="ct-message-err" role="alert">{errors.message}</span>}
      </div>

      {status === 'error' && (
        <p className="ct-form__submit-error" role="alert">
          Something went wrong. Please try again or email us directly at info@texasjoes.com.
        </p>
      )}

      <button
        className={`btn-primary ct-form__submit${status === 'loading' ? ' ct-form__submit--loading' : ''}`}
        type="submit"
        disabled={status === 'loading'}
        aria-busy={status === 'loading'}
      >
        {status === 'loading' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Contact() {
  const navigate = useNavigate()

  return (
    <div className="contact-page">

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="ct-hero" aria-label="Contact Texas Joe's">
        <div className="ct-hero__bg"      aria-hidden="true" />
        <div className="ct-hero__overlay" aria-hidden="true" />
        <div className="ct-hero__body">
          <p  className="ct-hero__eyebrow">We'd Love to Hear From You</p>
          <h1 className="ct-hero__title">Visit Our<br />Smokehouse</h1>
          <Divider light />
          <p className="ct-hero__sub">
            Corner of Waterfront Rd. and McKinley St., Subic Bay Freeport Zone
          </p>
        </div>
        <div className="ct-hero__scroll" aria-hidden="true">
          <span className="ct-hero__scroll-line" />
          <span className="ct-hero__scroll-text">Scroll</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CONTACT INFO CARDS
      ══════════════════════════════════════════════════════ */}
      <section className="ct-info" aria-label="Contact information">
        <div className="ct-info__grid">
          {CONTACT_INFO.map((item, i) => (
            <InfoCard key={i} item={item} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FORM + MAP (two-column)
      ══════════════════════════════════════════════════════ */}
      <section className="ct-main" aria-label="Contact form and map">

        {/* ── LEFT: form ──────────────────────────────────── */}
        <div className="ct-main__form-col">
          <p  className="section-label">Drop Us a Line</p>
          <h2 className="section-title">Send a Message</h2>
          <Divider />
          <p className="ct-main__intro">
            Have a question, a special request, or just want to say hey?
            Fill out the form and we'll get back to you pronto.
          </p>
          <ContactForm />
        </div>

        {/* ── RIGHT: map ──────────────────────────────────── */}
        <div className="ct-main__map-col" aria-label="Location map">
          <div className="ct-map-header">
            <p  className="section-label">Find Us</p>
            <h2 className="section-title">Our Location</h2>
            <Divider />
            <p className="ct-map-header__address">
              Corner of Waterfront Rd. and McKinley St.,<br />
              Subic Bay Freeport Zone, Zambales
            </p>
            <a
              className="btn-primary ct-map-header__btn"
              href="https://www.google.com/maps/dir/?api=1&destination=Corner+Waterfront+Rd+McKinley+St+Subic+Bay+Freeport+Zone+Zambales"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get directions to Texas Joe's on Google Maps"
            >
              Get Directions
            </a>
          </div>
          <div className="ct-map">
            <iframe
              title="Texas Joe's Location — Subic Bay"
              src="https://www.google.com/maps?q=R7CG%2B7F9%2C+Mc+Kinley+St%2C+Subic+Bay+Freeport+Zone%2C+Zambales&output=embed"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════
          SOCIAL MEDIA
      ══════════════════════════════════════════════════════ */}
      <section className="ct-social" aria-label="Follow us on social media">
        <div className="ct-social__inner">
          <p  className="section-label section-label--gold">Stay Connected</p>
          <h2 className="ct-social__title">Follow the Smoke</h2>
          <Divider light />
          <p className="ct-social__sub">
            Keep up with our latest specials, events, and BBQ content.
          </p>
          <div className="ct-social__icons">
            {SOCIAL.map(s => (
              <a
                key={s.label}
                className="ct-social__icon"
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow Texas Joe's on ${s.label}`}
              >
                <span className="ct-social__icon-svg">{s.icon}</span>
                <span className="ct-social__icon-label">{s.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA BAND
      ══════════════════════════════════════════════════════ */}
      <section className="ct-cta" aria-label="Order now">
        <div className="ct-cta__overlay" aria-hidden="true" />
        <div className="ct-cta__body">
          <p  className="section-label section-label--gold">Hungry?</p>
          <h2 className="ct-cta__title">Ready to Order?</h2>
          <Divider light />
          <p className="ct-cta__sub">Dine in, take out, or order online.</p>
          <div className="ct-cta__actions">
            <button className="btn-primary" onClick={() => navigate('/menu')}>
              View Menu
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