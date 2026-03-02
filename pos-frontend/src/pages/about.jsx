import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaFire, FaHeart, FaAward, FaUsers, FaLeaf, FaClock, FaQuoteLeft, FaStar, FaArrowRight } from 'react-icons/fa'
import { GiMeat, GiBarbecue, GiChefToque } from 'react-icons/gi'
import './about.css'

// Import images - replace with your actual images
import pitmaster from '../assets/pitmaster.jpg'
import restaurant from '../assets/restaurant.jpg'
import team1 from '../assets/team1.jpg'
import team2 from '../assets/team2.jpg'
import team3 from '../assets/team3.jpg'

const About = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    { icon: <FaFire />, number: '15+', label: 'Years of Experience' },
    { icon: <GiMeat />, number: '50K+', label: 'Pounds Smoked Yearly' },
    { icon: <FaUsers />, number: '100K+', label: 'Happy Customers' },
    { icon: <FaAward />, number: '25+', label: 'Awards Won' }
  ]

  const values = [
    {
      icon: <GiBarbecue />,
      title: 'Authentic Smoking',
      description: 'We use traditional Texas smoking techniques passed down through generations. Every cut is smoked low and slow over premium oak and hickory wood.'
    },
    {
      icon: <FaLeaf />,
      title: 'Fresh Ingredients',
      description: 'We source our meats from local farms and ranches. Our vegetables come fresh from nearby suppliers every morning.'
    },
    {
      icon: <FaHeart />,
      title: 'Made with Love',
      description: 'Every dish is prepared with passion and care. We treat every plate as if we\'re serving our own family.'
    },
    {
      icon: <GiChefToque />,
      title: 'Expert Pitmasters',
      description: 'Our team of skilled pitmasters brings decades of combined experience to perfect every rack, brisket, and rib.'
    }
  ]

  const timeline = [
    {
      year: '2009',
      title: 'The Beginning',
      description: 'Texas Joe started smoking meats in his backyard, perfecting recipes passed down from his grandfather.'
    },
    {
      year: '2012',
      title: 'First Food Truck',
      description: 'After winning local BBQ competitions, we launched our first food truck serving the Dallas community.'
    },
    {
      year: '2015',
      title: 'Our First Restaurant',
      description: 'Overwhelming demand led us to open our flagship restaurant, bringing authentic Texas BBQ to a permanent home.'
    },
    {
      year: '2018',
      title: 'Award Recognition',
      description: 'Named "Best BBQ in Texas" by Texas Monthly and featured on Food Network\'s BBQ championship.'
    },
    {
      year: '2023',
      title: 'Expanding the Family',
      description: 'Opened our second location and launched our signature sauce line available nationwide.'
    }
  ]

  const team = [
    {
      name: 'Joe "Texas" Martinez',
      role: 'Founder & Head Pitmaster',
      image: team1,
      bio: '25 years of BBQ mastery'
    },
    {
      name: 'Sarah Williams',
      role: 'Executive Chef',
      image: team2,
      bio: 'Culinary Institute graduate'
    },
    {
      name: 'Marcus Johnson',
      role: 'Pitmaster',
      image: team3,
      bio: '15 years smoking experience'
    }
  ]

  const testimonials = [
    {
      text: "The best BBQ I've ever had outside of Austin. The brisket melts in your mouth, and the ribs are fall-off-the-bone perfection.",
      author: 'Michael R.',
      rating: 5,
      location: 'Dallas, TX'
    },
    {
      text: "A true Texas BBQ experience. The atmosphere, the service, and most importantly, the food - everything is top-notch.",
      author: 'Jennifer S.',
      rating: 5,
      location: 'Houston, TX'
    },
    {
      text: "I drive 2 hours just for their burnt ends. Worth every mile. This place is a hidden gem that deserves all the recognition.",
      author: 'David L.',
      rating: 5,
      location: 'San Antonio, TX'
    }
  ]

  return (
    <div className={`about-page ${isLoaded ? 'loaded' : ''}`}>
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-overlay"></div>
        <div className="about-hero-content">
          <span className="hero-badge">Est. 2009</span>
          <h1 className="hero-title">Our Story</h1>
          <p className="hero-subtitle">
            From a backyard passion to Texas BBQ tradition
          </p>
          <div className="hero-decoration">
            <span className="floating-ember">🔥</span>
            <span className="floating-ember">✨</span>
            <span className="floating-ember">🔥</span>
          </div>
        </div>
        <div className="scroll-indicator">
          <span>Scroll to explore</span>
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="about-intro">
        <div className="intro-container">
          <div className="intro-image">
            <img src={pitmaster} alt="Texas Joe at the smoker" />
            <div className="image-badge">
              <GiBarbecue />
              <span>Since 2009</span>
            </div>
          </div>
          <div className="intro-content">
            <span className="section-tag">Who We Are</span>
            <h2>A Family Tradition of Smoke & Fire</h2>
            <p className="intro-lead">
              Texas Joe's House of Ribs was born from a simple belief: great BBQ takes time, 
              quality ingredients, and an unwavering commitment to tradition.
            </p>
            <p>
              What started as weekend cookouts in Joe Martinez's backyard has grown into one of 
              Texas's most beloved BBQ destinations. Our founder learned the art of smoking from 
              his grandfather, who ran a small smokehouse in Central Texas during the 1950s.
            </p>
            <p>
              Today, we continue those same traditions – waking up before dawn to tend our smokers, 
              hand-rubbing every cut with our secret blend of spices, and smoking our meats low and 
              slow until they reach absolute perfection.
            </p>
            <div className="intro-signature">
              <span className="signature">Texas Joe</span>
              <span className="signature-title">Founder & Head Pitmaster</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div 
              className="stat-card" 
              key={index}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <div className="values-container">
          <div className="values-header">
            <span className="section-tag">What We Stand For</span>
            <h2>Our Core Values</h2>
            <p>The principles that guide everything we do</p>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div 
                className="value-card" 
                key={index}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="about-timeline">
        <div className="timeline-container">
          <div className="timeline-header">
            <span className="section-tag">Our Journey</span>
            <h2>The Road to BBQ Excellence</h2>
          </div>
          <div className="timeline">
            {timeline.map((item, index) => (
              <div 
                className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`} 
                key={index}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="timeline-content">
                  <span className="timeline-year">{item.year}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <div className="timeline-marker">
                  <FaFire />
                </div>
              </div>
            ))}
            <div className="timeline-line"></div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team">
        <div className="team-container">
          <div className="team-header">
            <span className="section-tag">Meet the Crew</span>
            <h2>The Faces Behind the Smoke</h2>
            <p>Our talented team brings passion and expertise to every dish</p>
          </div>
          <div className="team-grid">
            {team.map((member, index) => (
              <div 
                className="team-card" 
                key={index}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="team-image">
                  <img src={member.image} alt={member.name} />
                  <div className="team-overlay">
                    <p>{member.bio}</p>
                  </div>
                </div>
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <span className="team-role">{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurant Image Section */}
      <section className="about-restaurant">
        <div className="restaurant-image-container">
          <img src={restaurant} alt="Texas Joe's Restaurant Interior" />
          <div className="restaurant-overlay">
            <div className="restaurant-content">
              <h2>Visit Our Restaurant</h2>
              <p>Experience the warmth of Texas hospitality in our rustic, family-friendly space</p>
              <div className="restaurant-features">
                <div className="feature">
                  <FaClock />
                  <span>Open 7 Days a Week</span>
                </div>
                <div className="feature">
                  <FaUsers />
                  <span>Seats 150+ Guests</span>
                </div>
                <div className="feature">
                  <GiBarbecue />
                  <span>Live Smoking Station</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="about-testimonials">
        <div className="testimonials-container">
          <div className="testimonials-header">
            <span className="section-tag">What People Say</span>
            <h2>Customer Love</h2>
          </div>
          <div className="testimonials-slider">
            {testimonials.map((testimonial, index) => (
              <div 
                className={`testimonial-card ${index === activeTestimonial ? 'active' : ''}`}
                key={index}
              >
                <FaQuoteLeft className="quote-icon" />
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
                <div className="testimonial-author">
                  <span className="author-name">{testimonial.author}</span>
                  <span className="author-location">{testimonial.location}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="testimonial-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === activeTestimonial ? 'active' : ''}`}
                onClick={() => setActiveTestimonial(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Ready to Taste the Tradition?</h2>
            <p>Join us for an unforgettable BBQ experience</p>
            <div className="cta-buttons">
              <Link to="/menu" className="cta-btn primary">
                <span>View Our Menu</span>
                <FaArrowRight />
              </Link>
              <Link to="/reservations" className="cta-btn secondary">
                <span>Make a Reservation</span>
                <FaArrowRight />
              </Link>
            </div>
          </div>
          <div className="cta-decoration">
            <span className="big-emoji">🍖</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About