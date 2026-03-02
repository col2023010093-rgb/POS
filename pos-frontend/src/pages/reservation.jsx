import React, { useState, useEffect } from 'react'
import { FaCalendarAlt, FaClock, FaUsers, FaUtensils, FaPhone, FaEnvelope, FaUser, FaCheckCircle, FaInfoCircle, FaChair, FaBirthdayCake, FaGlassCheers, FaBriefcase, FaHeart } from 'react-icons/fa'
import { GiBarbecue, GiPartyPopper } from 'react-icons/gi'
import './reservation.css'

const Reservation = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    occasion: '',
    seatingPreference: '',
    specialRequests: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  const occasions = [
    { id: 'none', label: 'None', icon: <FaUtensils /> },
    { id: 'birthday', label: 'Birthday', icon: <FaBirthdayCake /> },
    { id: 'anniversary', label: 'Anniversary', icon: <FaHeart /> },
    { id: 'business', label: 'Business', icon: <FaBriefcase /> },
    { id: 'celebration', label: 'Celebration', icon: <FaGlassCheers /> },
    { id: 'date', label: 'Date Night', icon: <GiPartyPopper /> }
  ]

  const seatingOptions = [
    { id: 'indoor', label: 'Indoor', description: 'Classic dining room' },
    { id: 'patio', label: 'Patio', description: 'Outdoor seating' },
    { id: 'bar', label: 'Bar Area', description: 'Casual atmosphere' },
    { id: 'private', label: 'Private Room', description: 'For special events' }
  ]

  const timeSlots = [
    '10:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM',
    '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'
  ]

  const guestOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+']

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Get maximum date (3 months from now)
  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3)
    return maxDate.toISOString().split('T')[0]
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleOptionSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      if (!formData.date) newErrors.date = 'Please select a date'
      if (!formData.time) newErrors.time = 'Please select a time'
      if (!formData.guests) newErrors.guests = 'Please select number of guests'
    }

    if (step === 2) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email'
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required'
      } else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep(2)) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
    }, 2000)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  if (isSuccess) {
    return (
      <div className={`reservation-page ${isLoaded ? 'loaded' : ''}`}>
        <div className="success-container">
          <div className="success-content">
            <div className="success-icon">
              <FaCheckCircle />
            </div>
            <h1>Reservation Confirmed!</h1>
            <p className="success-message">
              Thank you, {formData.firstName}! Your table has been reserved.
            </p>
            <div className="confirmation-details">
              <div className="detail-item">
                <FaCalendarAlt />
                <span>{formatDate(formData.date)}</span>
              </div>
              <div className="detail-item">
                <FaClock />
                <span>{formData.time}</span>
              </div>
              <div className="detail-item">
                <FaUsers />
                <span>{formData.guests} {formData.guests === '1' ? 'Guest' : 'Guests'}</span>
              </div>
              {formData.seatingPreference && (
                <div className="detail-item">
                  <FaChair />
                  <span>{seatingOptions.find(s => s.id === formData.seatingPreference)?.label}</span>
                </div>
              )}
            </div>
            <p className="confirmation-note">
              A confirmation email has been sent to <strong>{formData.email}</strong>
            </p>
            <div className="success-actions">
              <button 
                className="btn-primary"
                onClick={() => {
                  setIsSuccess(false)
                  setCurrentStep(1)
                  setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    date: '',
                    time: '',
                    guests: '2',
                    occasion: '',
                    seatingPreference: '',
                    specialRequests: ''
                  })
                }}
              >
                Make Another Reservation
              </button>
            </div>
          </div>
          <div className="success-decoration">
            <span className="confetti">🎉</span>
            <span className="confetti">🍖</span>
            <span className="confetti">✨</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`reservation-page ${isLoaded ? 'loaded' : ''}`}>
      {/* Hero Section */}
      <section className="reservation-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-badge">
            <GiBarbecue /> Reserve Your Table
          </span>
          <h1 className="hero-title">Book Your BBQ Experience</h1>
          <p className="hero-subtitle">
            Join us for an unforgettable dining experience with authentic Texas BBQ
          </p>
        </div>
        <div className="hero-decoration">
          <span className="floating-ember">🔥</span>
          <span className="floating-ember">✨</span>
          <span className="floating-ember">🔥</span>
        </div>
      </section>

      {/* Reservation Form Section */}
      <section className="reservation-section">
        <div className="reservation-container">
          {/* Progress Steps */}
          <div className="progress-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <div className="step-number">
                {currentStep > 1 ? <FaCheckCircle /> : '1'}
              </div>
              <span className="step-label">Date & Time</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="step-number">
                {currentStep > 2 ? <FaCheckCircle /> : '2'}
              </div>
              <span className="step-label">Your Details</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span className="step-label">Confirm</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="reservation-form">
            {/* Step 1: Date & Time */}
            <div className={`form-step ${currentStep === 1 ? 'active' : ''}`}>
              <div className="step-header">
                <h2>Select Date & Time</h2>
                <p>Choose your preferred reservation details</p>
              </div>

              <div className="form-grid">
                {/* Date Selection */}
                <div className="form-group">
                  <label>
                    <FaCalendarAlt /> Select Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className={errors.date ? 'error' : ''}
                  />
                  {errors.date && <span className="error-message">{errors.date}</span>}
                </div>

                {/* Guest Count */}
                <div className="form-group">
                  <label>
                    <FaUsers /> Number of Guests
                  </label>
                  <div className="guest-selector">
                    {guestOptions.map(num => (
                      <button
                        key={num}
                        type="button"
                        className={`guest-btn ${formData.guests === num ? 'selected' : ''}`}
                        onClick={() => handleOptionSelect('guests', num)}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  {errors.guests && <span className="error-message">{errors.guests}</span>}
                </div>
              </div>

              {/* Time Selection */}
              <div className="form-group full-width">
                <label>
                  <FaClock /> Select Time
                </label>
                <div className="time-slots">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      type="button"
                      className={`time-slot ${formData.time === time ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect('time', time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                {errors.time && <span className="error-message">{errors.time}</span>}
              </div>

              {/* Occasion Selection */}
              <div className="form-group full-width">
                <label>
                  <GiPartyPopper /> Special Occasion (Optional)
                </label>
                <div className="occasion-grid">
                  {occasions.map(occasion => (
                    <button
                      key={occasion.id}
                      type="button"
                      className={`occasion-btn ${formData.occasion === occasion.id ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect('occasion', occasion.id)}
                    >
                      <span className="occasion-icon">{occasion.icon}</span>
                      <span className="occasion-label">{occasion.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seating Preference */}
              <div className="form-group full-width">
                <label>
                  <FaChair /> Seating Preference (Optional)
                </label>
                <div className="seating-grid">
                  {seatingOptions.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      className={`seating-btn ${formData.seatingPreference === option.id ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect('seatingPreference', option.id)}
                    >
                      <span className="seating-label">{option.label}</span>
                      <span className="seating-desc">{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-next" onClick={nextStep}>
                  Continue to Your Details
                </button>
              </div>
            </div>

            {/* Step 2: Contact Details */}
            <div className={`form-step ${currentStep === 2 ? 'active' : ''}`}>
              <div className="step-header">
                <h2>Your Details</h2>
                <p>Please provide your contact information</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <FaUser /> First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label>
                    <FaUser /> Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>

                <div className="form-group">
                  <label>
                    <FaEnvelope /> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>
                    <FaPhone /> Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-group full-width">
                <label>
                  <FaInfoCircle /> Special Requests (Optional)
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  placeholder="Any dietary restrictions, allergies, or special arrangements?"
                  rows="4"
                />
              </div>

              <div className="form-actions dual">
                <button type="button" className="btn-back" onClick={prevStep}>
                  Back
                </button>
                <button type="button" className="btn-next" onClick={nextStep}>
                  Review Reservation
                </button>
              </div>
            </div>

            {/* Step 3: Confirmation */}
            <div className={`form-step ${currentStep === 3 ? 'active' : ''}`}>
              <div className="step-header">
                <h2>Confirm Your Reservation</h2>
                <p>Please review your booking details</p>
              </div>

              <div className="confirmation-card">
                <div className="confirmation-section">
                  <h3>Reservation Details</h3>
                  <div className="confirmation-grid">
                    <div className="confirm-item">
                      <FaCalendarAlt className="confirm-icon" />
                      <div>
                        <span className="confirm-label">Date</span>
                        <span className="confirm-value">{formatDate(formData.date)}</span>
                      </div>
                    </div>
                    <div className="confirm-item">
                      <FaClock className="confirm-icon" />
                      <div>
                        <span className="confirm-label">Time</span>
                        <span className="confirm-value">{formData.time}</span>
                      </div>
                    </div>
                    <div className="confirm-item">
                      <FaUsers className="confirm-icon" />
                      <div>
                        <span className="confirm-label">Guests</span>
                        <span className="confirm-value">{formData.guests} {formData.guests === '1' ? 'Person' : 'People'}</span>
                      </div>
                    </div>
                    {formData.seatingPreference && (
                      <div className="confirm-item">
                        <FaChair className="confirm-icon" />
                        <div>
                          <span className="confirm-label">Seating</span>
                          <span className="confirm-value">
                            {seatingOptions.find(s => s.id === formData.seatingPreference)?.label}
                          </span>
                        </div>
                      </div>
                    )}
                    {formData.occasion && formData.occasion !== 'none' && (
                      <div className="confirm-item">
                        <GiPartyPopper className="confirm-icon" />
                        <div>
                          <span className="confirm-label">Occasion</span>
                          <span className="confirm-value">
                            {occasions.find(o => o.id === formData.occasion)?.label}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="confirmation-section">
                  <h3>Contact Information</h3>
                  <div className="confirmation-grid">
                    <div className="confirm-item">
                      <FaUser className="confirm-icon" />
                      <div>
                        <span className="confirm-label">Name</span>
                        <span className="confirm-value">{formData.firstName} {formData.lastName}</span>
                      </div>
                    </div>
                    <div className="confirm-item">
                      <FaEnvelope className="confirm-icon" />
                      <div>
                        <span className="confirm-label">Email</span>
                        <span className="confirm-value">{formData.email}</span>
                      </div>
                    </div>
                    <div className="confirm-item">
                      <FaPhone className="confirm-icon" />
                      <div>
                        <span className="confirm-label">Phone</span>
                        <span className="confirm-value">{formData.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {formData.specialRequests && (
                  <div className="confirmation-section">
                    <h3>Special Requests</h3>
                    <p className="special-requests-text">{formData.specialRequests}</p>
                  </div>
                )}

                <div className="policy-notice">
                  <FaInfoCircle />
                  <p>
                    Please arrive 10 minutes before your reservation time. 
                    Reservations will be held for 15 minutes. For cancellations, 
                    please call us at least 2 hours in advance.
                  </p>
                </div>
              </div>

              <div className="form-actions dual">
                <button type="button" className="btn-back" onClick={prevStep}>
                  Back
                </button>
                <button 
                  type="submit" 
                  className={`btn-submit ${isSubmitting ? 'submitting' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle /> Confirm Reservation
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Info Cards */}
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">
              <FaClock />
            </div>
            <h3>Hours of Operation</h3>
            <ul>
              <li><span>Every Day:</span> 10:30 AM - 10:00 PM</li>
            </ul>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <FaPhone />
            </div>
            <h3>Contact Us</h3>
            <p>For parties larger than 10 or special events, please call us directly.</p>
            <a href="tel:+1234567890" className="phone-link">(123) 456-7890</a>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <FaInfoCircle />
            </div>
            <h3>Reservation Policy</h3>
            <p>We hold reservations for 15 minutes. Please call if you're running late. Walk-ins are welcome based on availability.</p>
          </div>

          {/* New: Private Function Rooms */}
          <div className="info-card">
            <div className="info-icon">
              <FaBriefcase />
            </div>
            <h3>Private Function Rooms</h3>
            <p>Private function rooms are available for your next business meeting, team building event, birthday party or other event.</p>
            <p>Table and Seating arrangements are flexible.</p>
            <p>We have a PA system and a projector screen for your use.</p>
            <p>We charge a 10% room charge which goes to your servers. We dedicate adequate servers exclusively for your event.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Reservation