import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './reservation.css'

// ─── Opening hours ─────────────────────────────────────────────────────────────
// First slot: 10:30 AM · Last slot: 9:30 PM (closes 10:00 PM)
// Slots are blocked if they are < 30 min away from now

// ─── All slots with their numeric hour/min for comparison ─────────────────────
const ALL_SLOTS = [
  { label: '10:30 AM', h: 10, m: 30 },
  { label: '11:00 AM', h: 11, m: 0  },
  { label: '11:30 AM', h: 11, m: 30 },
  { label: '12:00 PM', h: 12, m: 0  },
  { label: '12:30 PM', h: 12, m: 30 },
  { label: '1:00 PM',  h: 13, m: 0  },
  { label: '1:30 PM',  h: 13, m: 30 },
  { label: '2:00 PM',  h: 14, m: 0  },
  { label: '5:00 PM',  h: 17, m: 0  },
  { label: '5:30 PM',  h: 17, m: 30 },
  { label: '6:00 PM',  h: 18, m: 0  },
  { label: '6:30 PM',  h: 18, m: 30 },
  { label: '7:00 PM',  h: 19, m: 0  },
  { label: '7:30 PM',  h: 19, m: 30 },
  { label: '8:00 PM',  h: 20, m: 0  },
  { label: '8:30 PM',  h: 20, m: 30 },
  { label: '9:00 PM',  h: 21, m: 0  },
  { label: '9:30 PM',  h: 21, m: 30 },
]

// ─── Slot status ───────────────────────────────────────────────────────────────
// Returns: 'available' | 'past' | 'full'
const getSlotStatus = (slot, selectedDate, bookedSlots = []) => {
  if (!selectedDate) return 'available'

  const [y, mo, d] = selectedDate.split('-').map(Number)
  const slotTime   = new Date(y, mo - 1, d, slot.h, slot.m)
  const now        = new Date()

  // Restriction 1 — block past times (with 30-min lead buffer)
  if (slotTime.getTime() - now.getTime() < 30 * 60 * 1000) return 'past'

  // Restriction 3 — block fully booked (from DB)
  if (bookedSlots.includes(slot.label)) return 'full'

  return 'available'
}

// ─── Fetch booked slots from your backend ─────────────────────────────────────
// Expected API:  GET /api/reservations/availability?date=YYYY-MM-DD
// Expected shape: { bookedSlots: ['6:00 PM', '7:30 PM'] }
//
// BACKEND SETUP NEEDED:
//   In your Express router, add:
//
//   router.get('/reservations/availability', async (req, res) => {
//     const { date } = req.query
//     const reservations = await Reservation.find({ date })
//     // Count how many bookings per slot; mark as "full" when limit is reached
//     const MAX_PER_SLOT = 5  // adjust to your table capacity
//     const counts = {}
//     reservations.forEach(r => { counts[r.time] = (counts[r.time] || 0) + 1 })
//     const bookedSlots = Object.entries(counts)
//       .filter(([, count]) => count >= MAX_PER_SLOT)
//       .map(([time]) => time)
//     res.json({ bookedSlots })
//   })
//
const fetchBookedSlots = async (date) => {
  try {
    const res = await fetch(`/api/reservations/availability?date=${date}`)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data.bookedSlots) ? data.bookedSlots : []
  } catch {
    // Fail open — don't block user if API is unreachable
    console.warn('[Reservation] Could not fetch availability. Showing all slots.')
    return []
  }
}

// ─── Other constants ──────────────────────────────────────────────────────────
const GUEST_OPTIONS = ['1','2','3','4','5','6','7','8','9','10+']

const OCCASIONS = [
  { id: 'none',         label: 'None',        icon: '🍖' },
  { id: 'birthday',    label: 'Birthday',    icon: '🎂' },
  { id: 'anniversary', label: 'Anniversary', icon: '❤️' },
  { id: 'business',    label: 'Business',    icon: '💼' },
  { id: 'celebration', label: 'Celebration', icon: '🥂' },
  { id: 'date',        label: 'Date Night',  icon: '✨' },
]

const SEATING = [
  { id: 'indoor',  label: 'Indoor',       desc: 'Classic dining room' },
  { id: 'patio',   label: 'Patio',        desc: 'Outdoor seating'     },
  { id: 'bar',     label: 'Bar Area',     desc: 'Casual atmosphere'   },
  { id: 'private', label: 'Private Room', desc: 'For special events'  },
]

const INFO_CARDS = [
  {
    icon: '🕐', title: 'Opening Hours',
    content: 'Open every day · 10:30 AM – 10:00 PM',
  },
  {
    icon: '📞', title: 'Call Us',
    content: 'For parties larger than 10 or special events, please call us directly.',
    link: { href: 'tel:+639175123461', label: '0917-512-3461' },
  },
  {
    icon: 'ℹ️', title: 'Reservation Policy',
    content: "We hold reservations for 15 minutes. Please call if you're running late. Walk-ins welcome based on availability.",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getMinDate = () => new Date().toISOString().split('T')[0]
const getMaxDate = () => {
  const d = new Date(); d.setMonth(d.getMonth() + 3)
  return d.toISOString().split('T')[0]
}
const formatDate = ds => {
  if (!ds) return ''
  const [y, m, day] = ds.split('-').map(Number)
  return new Date(y, m - 1, day).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const Divider = ({ light = false }) => (
  <div className={`tj-divider${light ? ' tj-divider--light' : ''}`} aria-hidden="true">
    <span /><span className="tj-divider__icon">✦</span><span />
  </div>
)

const Steps = ({ current }) => (
  <div className="rv-steps" role="list" aria-label="Reservation steps">
    {['Date & Time', 'Your Details', 'Confirm'].map((label, i) => {
      const n = i + 1
      const done   = current > n
      const active = current === n
      return (
        <React.Fragment key={n}>
          <div
            className={`rv-step${active ? ' rv-step--active' : ''}${done ? ' rv-step--done' : ''}`}
            role="listitem" aria-current={active ? 'step' : undefined}
          >
            <span className="rv-step__circle">{done ? '✓' : n}</span>
            <span className="rv-step__label">{label}</span>
          </div>
          {n < 3 && (
            <span className={`rv-step__line${done ? ' rv-step__line--done' : ''}`} aria-hidden="true" />
          )}
        </React.Fragment>
      )
    })}
  </div>
)

const SlotLegend = () => (
  <div className="rv-slot-legend" aria-label="Time slot key">
    <span className="rv-slot-legend__item rv-slot-legend__item--available">Available</span>
    <span className="rv-slot-legend__item rv-slot-legend__item--past">Past / Too Soon</span>
    <span className="rv-slot-legend__item rv-slot-legend__item--full">Fully Booked</span>
  </div>
)

const SuccessScreen = ({ formData, onReset }) => (
  <div className="rv-success" role="alert" aria-live="polite">
    <div className="rv-success__icon" aria-hidden="true">✅</div>
    <h2 className="rv-success__title">Reservation Confirmed!</h2>
    <p className="rv-success__msg">
      Thank you, <strong>{formData.firstName}</strong>! Your table request has been received.
      We'll confirm your booking shortly.
    </p>
    <div className="rv-success__summary">
      <div className="rv-success__row"><span>📅</span><span>{formatDate(formData.date)}</span></div>
      <div className="rv-success__row"><span>🕐</span><span>{formData.time}</span></div>
      <div className="rv-success__row">
        <span>👥</span>
        <span>{formData.guests} {formData.guests === '1' ? 'Guest' : 'Guests'}</span>
      </div>
      {formData.seatingPreference && (
        <div className="rv-success__row">
          <span>🪑</span>
          <span>{SEATING.find(s => s.id === formData.seatingPreference)?.label}</span>
        </div>
      )}
    </div>
    <p className="rv-success__note">
      A confirmation email will be sent to <strong>{formData.email}</strong>.<br />
      Estimated response: within 1 business hour.
    </p>
    <button className="btn-primary" onClick={onReset}>Make Another Reservation</button>
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────
const Reservation = () => {
  const navigate = useNavigate()

  const EMPTY_FORM = {
    firstName: '', lastName: '', email: '', phone: '',
    date: '', time: '', guests: '2',
    occasion: '', seatingPreference: '', specialRequests: '',
  }

  const [step,            setStep]            = useState(1)
  const [formData,        setFormData]        = useState(EMPTY_FORM)
  const [errors,          setErrors]          = useState({})
  const [submitting,      setSubmitting]      = useState(false)
  const [success,         setSuccess]         = useState(false)
  const [bookedSlots,     setBookedSlots]     = useState([])
  const [loadingSlots,    setLoadingSlots]    = useState(false)
  const [availabilityErr, setAvailabilityErr] = useState(false)
  // Tick every 60s so "past" slots update in real time without a page reload
  const [tick, setTick] = useState(0)

  // ── Re-tick every minute so past-time blocking stays accurate ──────────────
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  // ── Restriction 4: fetch booked slots from DB whenever date changes ────────
  useEffect(() => {
    if (!formData.date) { setBookedSlots([]); return }

    let cancelled = false
    setLoadingSlots(true)
    setAvailabilityErr(false)

    fetchBookedSlots(formData.date).then(slots => {
      if (cancelled) return
      setBookedSlots(slots)
      setLoadingSlots(false)
      // If the already-selected time just became full, deselect it
      setFormData(p => ({
        ...p,
        time: slots.includes(p.time) ? '' : p.time,
      }))
    }).catch(() => {
      if (!cancelled) { setLoadingSlots(false); setAvailabilityErr(true) }
    })

    return () => { cancelled = true }
  }, [formData.date])

  // ── Compute slot statuses (memoised on date, bookedSlots, tick) ────────────
  const slotStatuses = useCallback(
    () => ALL_SLOTS.map(slot => ({
      ...slot,
      status: getSlotStatus(slot, formData.date, bookedSlots),
    })),
    [formData.date, bookedSlots, tick]
  )()

  const availableCount = slotStatuses.filter(s => s.status === 'available').length

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = e => {
    const { name, value } = e.target
    if (name === 'date') {
      // Clear selected time when date changes — old slot may be invalid on new date
      setFormData(p => ({ ...p, date: value, time: '' }))
    } else {
      setFormData(p => ({ ...p, [name]: value }))
    }
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const pick = (field, value) => {
    setFormData(p => ({ ...p, [field]: value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  const pickGuests = (n) => {
    pick('guests', n)
    if (n === '10+') {
      setErrors(p => ({
        ...p,
        guests: 'For groups of 10 or more, please call 0917-512-3461 or use Private Function Rooms below.',
      }))
    } else {
      setErrors(p => ({ ...p, guests: '' }))
    }
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = s => {
    const e = {}

    if (s === 1) {
      if (!formData.date)   e.date   = 'Please select a date.'
      if (!formData.guests) e.guests = 'Please select number of guests.'
      if (formData.guests === '10+') {
        e.guests = 'For groups of 10 or more, please call 0917-512-3461 or use Private Function Rooms below.'
      }
      if (!formData.time) {
        e.time = 'Please select an available time slot.'
      } else {
        // Race-condition guard: re-check the chosen slot right before advancing
        const slot = ALL_SLOTS.find(sl => sl.label === formData.time)
        if (slot) {
          const status = getSlotStatus(slot, formData.date, bookedSlots)
          if (status === 'past') e.time = 'That time has already passed. Please choose another slot.'
          if (status === 'full') e.time = 'That slot is now fully booked. Please choose another.'
        }
      }
    }

    if (s === 2) {
      if (!formData.firstName.trim()) e.firstName = 'First name is required.'
      if (!formData.lastName.trim())  e.lastName  = 'Last name is required.'
      if (!formData.email.trim())     e.email     = 'Email is required.'
      else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email address.'
      if (!formData.phone.trim())     e.phone     = 'Phone number is required.'
      else if (!/^\d{7,}$/.test(formData.phone.replace(/\D/g, '')))
        e.phone = 'Enter a valid phone number (digits only, min 7).'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate(step)) setStep(s => Math.min(s + 1, 3)) }
  const back = () => setStep(s => Math.max(s - 1, 1))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate(2)) return
    setSubmitting(true)
    try {
      // ── Wire up your real API here ──────────────────────────────────────
      // const res = await fetch('/api/reservations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // })
      // if (!res.ok) throw new Error('Submission failed')
      await new Promise(res => setTimeout(res, 1600)) // remove when API is ready
      setSuccess(true)
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again or call us directly.' })
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setSuccess(false); setStep(1); setFormData(EMPTY_FORM)
    setErrors({}); setBookedSlots([])
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="reservation-page">
        <div className="rv-success-wrap">
          <SuccessScreen formData={formData} onReset={reset} />
        </div>
      </div>
    )
  }

  return (
    <div className="reservation-page">

      {/* ════════════════ HERO ════════════════ */}
      <section className="rv-hero" aria-label="Book your table">
        <div className="rv-hero__bg"      aria-hidden="true" />
        <div className="rv-hero__overlay" aria-hidden="true" />
        <div className="rv-hero__body">
          <p  className="rv-hero__eyebrow">Texas Joe's · Subic Bay</p>
          <h1 className="rv-hero__title">Reserve Your<br />Table</h1>
          <Divider light />
          <p className="rv-hero__sub">
            Book your smokehouse experience — authentic slow-smoked BBQ, warm Texas hospitality.
          </p>
        </div>
        <div className="rv-hero__scroll" aria-hidden="true">
          <span className="rv-hero__scroll-line" />
          <span className="rv-hero__scroll-text">Scroll</span>
        </div>
      </section>

      {/* ════════════════ FORM ════════════════ */}
      <section className="rv-section" aria-label="Reservation form">
        <div className="rv-container">
          <Steps current={step} />

          <form className="rv-form" onSubmit={handleSubmit} noValidate aria-label="Reservation form">

            {/* ── STEP 1 ── */}
            <div className={`rv-form__step${step === 1 ? ' rv-form__step--active' : ''}`} aria-hidden={step !== 1}>
              <div className="rv-step-header">
                <p className="section-label">Step 1 of 3</p>
                <h2 className="rv-step-header__title">Select Date & Time</h2>
                <Divider />
                <p className="rv-step-header__sub">Choose your preferred date, time, and party size.</p>
              </div>

              {/* Date + Guests */}
              <div className="rv-form__row">
                <div className={`rv-field${errors.date ? ' rv-field--error' : ''}`}>
                  <label className="rv-field__label" htmlFor="rv-date">📅 Select Date</label>
                  <input
                    className="rv-field__input" id="rv-date" name="date" type="date"
                    value={formData.date} onChange={handleChange}
                    min={getMinDate()} max={getMaxDate()}
                    aria-describedby={errors.date ? 'rv-date-err' : undefined}
                  />
                  {errors.date && <span className="rv-field__error" id="rv-date-err" role="alert">{errors.date}</span>}
                </div>

                <div className={`rv-field${errors.guests ? ' rv-field--error' : ''}`}>
                  <label className="rv-field__label">👥 Number of Guests</label>
                  <div className="rv-guests">
                    {GUEST_OPTIONS.map(n => (
                      <button
                        key={n} type="button"
                        className={`rv-guests__btn${formData.guests === n ? ' rv-guests__btn--active' : ''}${n === '10+' ? ' rv-guests__btn--special' : ''}`}
                        onClick={() => pickGuests(n)}
                        aria-pressed={formData.guests === n}
                        aria-label={n === '10+' ? '10 or more guests — please call' : `${n} guest${n !== '1' ? 's' : ''}`}
                      >{n}</button>
                    ))}
                  </div>
                  {errors.guests && (
                    <span className={`rv-field__error${formData.guests === '10+' ? ' rv-field__error--info' : ''}`} role="alert">
                      {errors.guests}
                      {formData.guests === '10+' && (
                        <> — <a href="tel:+639175123461">call us</a></>
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Time slots */}
              <div className={`rv-field${errors.time ? ' rv-field--error' : ''}`}>
                <div className="rv-times-header">
                  <label className="rv-field__label">🕐 Select Time</label>

                  {/* Restriction 2 — opening hours notice */}
                  <span className="rv-times-hours">Open 10:30 AM – 10:00 PM</span>

                  {loadingSlots && (
                    <span className="rv-times-loading" aria-live="polite">
                      <span className="rv-spinner--small" aria-hidden="true" /> Checking availability…
                    </span>
                  )}
                  {!loadingSlots && formData.date && (
                    <span className={`rv-times-available${availableCount === 0 ? ' rv-times-available--none' : ''}`} aria-live="polite">
                      {availableCount > 0
                        ? `${availableCount} slot${availableCount !== 1 ? 's' : ''} available`
                        : '⚠ No slots available — try another date'
                      }
                    </span>
                  )}
                </div>

                {!formData.date
                  ? <p className="rv-times-hint">👆 Select a date above to see available slots.</p>
                  : (
                    <>
                      <SlotLegend />
                      <div className="rv-times" role="group" aria-label="Available time slots">
                        {slotStatuses.map(slot => {
                          const unavail     = slot.status !== 'available'
                          const isSelected  = formData.time === slot.label
                          return (
                            <button
                              key={slot.label} type="button"
                              className={[
                                'rv-times__btn',
                                isSelected            ? 'rv-times__btn--active' : '',
                                slot.status === 'past'? 'rv-times__btn--past'   : '',
                                slot.status === 'full'? 'rv-times__btn--full'   : '',
                              ].filter(Boolean).join(' ')}
                              onClick={() => !unavail && pick('time', slot.label)}
                              disabled={unavail}
                              aria-pressed={isSelected}
                              aria-disabled={unavail}
                              title={
                                slot.status === 'past' ? 'This time has passed or is too soon' :
                                slot.status === 'full' ? 'Fully booked' : slot.label
                              }
                            >
                              {slot.label}
                              {slot.status === 'full' && <span className="rv-times__tag">Full</span>}
                              {slot.status === 'past' && <span className="rv-times__tag">Past</span>}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )
                }

                {availabilityErr && (
                  <p className="rv-field__error rv-field__error--warn" role="alert">
                    ⚠ Couldn't load live availability. All slots shown — we'll confirm on submission.
                  </p>
                )}
                {errors.time && <span className="rv-field__error" role="alert">{errors.time}</span>}
              </div>

              {/* Occasion */}
              <div className="rv-field">
                <label className="rv-field__label">🎉 Special Occasion <span className="rv-field__optional">(Optional)</span></label>
                <div className="rv-occasions">
                  {OCCASIONS.map(o => (
                    <button
                      key={o.id} type="button"
                      className={`rv-occasions__btn${formData.occasion === o.id ? ' rv-occasions__btn--active' : ''}`}
                      onClick={() => pick('occasion', o.id)}
                      aria-pressed={formData.occasion === o.id}
                    >
                      <span className="rv-occasions__icon" aria-hidden="true">{o.icon}</span>
                      <span className="rv-occasions__label">{o.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seating */}
              <div className="rv-field">
                <label className="rv-field__label">🪑 Seating Preference <span className="rv-field__optional">(Optional)</span></label>
                <div className="rv-seating">
                  {SEATING.map(s => (
                    <button
                      key={s.id} type="button"
                      className={`rv-seating__btn${formData.seatingPreference === s.id ? ' rv-seating__btn--active' : ''}`}
                      onClick={() => pick('seatingPreference', s.id)}
                      aria-pressed={formData.seatingPreference === s.id}
                    >
                      <span className="rv-seating__label">{s.label}</span>
                      <span className="rv-seating__desc">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rv-form__actions">
                <button
                  type="button" className="btn-primary rv-form__next"
                  onClick={next}
                  disabled={formData.guests === '10+'}
                >
                  Continue to Your Details →
                </button>
              </div>
            </div>

            {/* ── STEP 2 ── */}
            <div className={`rv-form__step${step === 2 ? ' rv-form__step--active' : ''}`} aria-hidden={step !== 2}>
              <div className="rv-step-header">
                <p className="section-label">Step 2 of 3</p>
                <h2 className="rv-step-header__title">Your Details</h2>
                <Divider />
                <p className="rv-step-header__sub">How should we reach you?</p>
              </div>

              <div className="rv-form__row">
                <div className={`rv-field${errors.firstName ? ' rv-field--error' : ''}`}>
                  <label className="rv-field__label" htmlFor="rv-fname">First Name</label>
                  <input className="rv-field__input" id="rv-fname" name="firstName" type="text"
                    placeholder="Juan" value={formData.firstName} onChange={handleChange} autoComplete="given-name" />
                  {errors.firstName && <span className="rv-field__error" role="alert">{errors.firstName}</span>}
                </div>
                <div className={`rv-field${errors.lastName ? ' rv-field--error' : ''}`}>
                  <label className="rv-field__label" htmlFor="rv-lname">Last Name</label>
                  <input className="rv-field__input" id="rv-lname" name="lastName" type="text"
                    placeholder="dela Cruz" value={formData.lastName} onChange={handleChange} autoComplete="family-name" />
                  {errors.lastName && <span className="rv-field__error" role="alert">{errors.lastName}</span>}
                </div>
                <div className={`rv-field${errors.email ? ' rv-field--error' : ''}`}>
                  <label className="rv-field__label" htmlFor="rv-email">Email Address</label>
                  <input className="rv-field__input" id="rv-email" name="email" type="email"
                    placeholder="you@example.com" value={formData.email} onChange={handleChange} autoComplete="email" />
                  {errors.email && <span className="rv-field__error" role="alert">{errors.email}</span>}
                </div>
                <div className={`rv-field${errors.phone ? ' rv-field--error' : ''}`}>
                  <label className="rv-field__label" htmlFor="rv-phone">Phone Number</label>
                  <input className="rv-field__input" id="rv-phone" name="phone" type="tel"
                    placeholder="0917-512-3461" value={formData.phone} onChange={handleChange} autoComplete="tel" />
                  {errors.phone && <span className="rv-field__error" role="alert">{errors.phone}</span>}
                </div>
              </div>

              <div className="rv-field">
                <label className="rv-field__label" htmlFor="rv-requests">
                  Special Requests <span className="rv-field__optional">(Optional)</span>
                </label>
                <textarea className="rv-field__input rv-field__textarea" id="rv-requests"
                  name="specialRequests" rows={4}
                  placeholder="Dietary restrictions, allergies, high chair, anniversary message…"
                  value={formData.specialRequests} onChange={handleChange}
                />
              </div>

              <div className="rv-form__actions rv-form__actions--dual">
                <button type="button" className="btn-ghost-dark" onClick={back}>← Back</button>
                <button type="button" className="btn-primary" onClick={next}>Review Reservation →</button>
              </div>
            </div>

            {/* ── STEP 3 ── */}
            <div className={`rv-form__step${step === 3 ? ' rv-form__step--active' : ''}`} aria-hidden={step !== 3}>
              <div className="rv-step-header">
                <p className="section-label">Step 3 of 3</p>
                <h2 className="rv-step-header__title">Confirm Your Reservation</h2>
                <Divider />
                <p className="rv-step-header__sub">Please review your details before submitting.</p>
              </div>

              <div className="rv-confirm">
                <div className="rv-confirm__section">
                  <h3 className="rv-confirm__heading">Reservation Details</h3>
                  <div className="rv-confirm__grid">
                    <div className="rv-confirm__item">
                      <span className="rv-confirm__icon">📅</span>
                      <div><span className="rv-confirm__lbl">Date</span><span className="rv-confirm__val">{formatDate(formData.date)}</span></div>
                    </div>
                    <div className="rv-confirm__item">
                      <span className="rv-confirm__icon">🕐</span>
                      <div><span className="rv-confirm__lbl">Time</span><span className="rv-confirm__val">{formData.time}</span></div>
                    </div>
                    <div className="rv-confirm__item">
                      <span className="rv-confirm__icon">👥</span>
                      <div><span className="rv-confirm__lbl">Guests</span><span className="rv-confirm__val">{formData.guests} {formData.guests === '1' ? 'Person' : 'People'}</span></div>
                    </div>
                    {formData.seatingPreference && (
                      <div className="rv-confirm__item">
                        <span className="rv-confirm__icon">🪑</span>
                        <div><span className="rv-confirm__lbl">Seating</span><span className="rv-confirm__val">{SEATING.find(s => s.id === formData.seatingPreference)?.label}</span></div>
                      </div>
                    )}
                    {formData.occasion && formData.occasion !== 'none' && (
                      <div className="rv-confirm__item">
                        <span className="rv-confirm__icon">🎉</span>
                        <div><span className="rv-confirm__lbl">Occasion</span><span className="rv-confirm__val">{OCCASIONS.find(o => o.id === formData.occasion)?.label}</span></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rv-confirm__section">
                  <h3 className="rv-confirm__heading">Contact Information</h3>
                  <div className="rv-confirm__grid">
                    <div className="rv-confirm__item">
                      <span className="rv-confirm__icon">👤</span>
                      <div><span className="rv-confirm__lbl">Name</span><span className="rv-confirm__val">{formData.firstName} {formData.lastName}</span></div>
                    </div>
                    <div className="rv-confirm__item">
                      <span className="rv-confirm__icon">✉️</span>
                      <div><span className="rv-confirm__lbl">Email</span><span className="rv-confirm__val">{formData.email}</span></div>
                    </div>
                    <div className="rv-confirm__item">
                      <span className="rv-confirm__icon">📞</span>
                      <div><span className="rv-confirm__lbl">Phone</span><span className="rv-confirm__val">{formData.phone}</span></div>
                    </div>
                  </div>
                </div>

                {formData.specialRequests && (
                  <div className="rv-confirm__section">
                    <h3 className="rv-confirm__heading">Special Requests</h3>
                    <p className="rv-confirm__requests">{formData.specialRequests}</p>
                  </div>
                )}

                <div className="rv-confirm__policy">
                  <span aria-hidden="true">ℹ️</span>
                  <p>
                    Please arrive 10 minutes before your reservation time. Reservations held for 15 minutes.
                    For cancellations please call at least 2 hours in advance at{' '}
                    <a href="tel:+639175123461">0917-512-3461</a>.
                  </p>
                </div>
              </div>

              {errors.submit && (
                <p className="rv-field__error rv-field__error--submit" role="alert">{errors.submit}</p>
              )}

              <div className="rv-form__actions rv-form__actions--dual">
                <button type="button" className="btn-ghost-dark" onClick={back}>← Back</button>
                <button
                  type="submit"
                  className={`btn-primary rv-form__submit${submitting ? ' rv-form__submit--loading' : ''}`}
                  disabled={submitting} aria-busy={submitting}
                >
                  {submitting
                    ? <><span className="rv-spinner" aria-hidden="true" /> Processing…</>
                    : '✓ Confirm Reservation'
                  }
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* ── Info Cards ── */}
        <div className="rv-info-cards">
          {INFO_CARDS.map((card, i) => (
            <div className="rv-info-card" key={i}>
              <span className="rv-info-card__icon" aria-hidden="true">{card.icon}</span>
              <h3 className="rv-info-card__title">{card.title}</h3>
              <p className="rv-info-card__body">{card.content}</p>
              {card.link && <a className="rv-info-card__link" href={card.link.href}>{card.link.label}</a>}
            </div>
          ))}
          <div className="rv-info-card rv-info-card--featured">
            <span className="rv-info-card__icon" aria-hidden="true">🏛️</span>
            <h3 className="rv-info-card__title">Private Function Rooms</h3>
            <p className="rv-info-card__body">
              Available for business meetings, team building, birthday parties, and other events.
              Flexible seating, PA system, and projector screen included.
              A 10% room charge goes directly to your dedicated servers.
            </p>
            <button className="btn-primary rv-info-card__btn" onClick={() => navigate('/contact')}>
              Request Event Booking
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA Band ── */}
      <section className="rv-cta" aria-label="Explore the menu">
        <div className="rv-cta__overlay" aria-hidden="true" />
        <div className="rv-cta__body">
          <p  className="section-label section-label--gold">While You're Here</p>
          <h2 className="rv-cta__title">Browse the Menu First</h2>
          <Divider light />
          <p className="rv-cta__sub">Know what you're ordering before you arrive — slow-smoked BBQ awaits.</p>
          <button className="btn-primary" onClick={() => navigate('/menu')}>View Full Menu</button>
        </div>
      </section>

    </div>
  )
}

export default Reservation