import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'
import { useMenu } from '../context/MenuContext'
import ProductCard from '../Components/ProductCard'

const Home = () => {
  const navigate = useNavigate()
  const { products, loading } = useMenu()

  // ✅ Handle loading state
  if (loading) {
    return <div>Loading menu...</div>;
  }

  // ✅ Handle empty menu
  if (!products || products.length === 0) {
    return <div>No menu items available</div>;
  }

  // ✅ Now safe to filter
  const featuredItems = products.filter(item => item.popular || item.featured)

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <p>TEXAS JOE'S</p>
          <h1>THE ORIGINAL REAL AMERICAN 
            <br />  SMOKEHOUSE</h1>

          <p>IN THE PHILIPPINES</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/menu')}>View Menu</button>
          </div>
        </div>
      </section>

      {/* Tagline Section */}
      <section className="tagline-section">
        <div className="tagline-overlay"></div>
        <div className="tagline-content">
          <h2>IN THE BEGINNING. LET THERE BE BBQ. AND IT WAS GOOD!!!</h2>
          <p>Our meat is smoked with real hickory wood. Never Boiled. Never Dipped in Liquid Smoke.</p>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="featured-menu">
        <h2>Featured Items</h2>
        <p className="section-subtitle">Our most popular dishes</p>
        {loading ? (
          <p>Loading featured items...</p>
        ) : (
          <div className="menu-grid">
            {featuredItems.map((item) => (
              <div key={item._id} className="menu-card">
                <div className="menu-image">{item.image}</div>
                <div className="menu-info">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className="menu-footer">
                    <span className="price">${item.price}</span>
                    <button 
                      className="btn-order"
                      onClick={() => addToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="btn-primary" onClick={() => navigate('/menu')}>
            See More
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="about-content">
          <h2>Our Story</h2>
          <p>
            For nearly 40 years, Texas Joe's House of Ribs has been serving up 
            the finest slow-smoked BBQ in Austin. Our pitmaster uses traditional 
            techniques passed down through generations, ensuring every bite 
            delivers that authentic Texas flavor.
          </p>
          <button className="btn-primary" onClick={() => navigate('/about')}>Learn More</button>
        </div>
        <div className="about-image">
          <div className="image-placeholder">🔥</div>
        </div>
      </section>

      {/* Location Section */}
      <section className="location-section">
        <h2>Find Us</h2>
        <p>
          Texas Joe's House of Ribs<br />
          R7CG+7F9, Mc Kinley St, Subic Bay Freeport Zone, Zambales
        </p>
        <div className="map-container">
          <iframe
            title="Texas Joe's House of Ribs Location"
            src="https://www.google.com/maps?q=R7CG%2B7F9%2C%20Mc%20Kinley%20St%2C%20Subic%20Bay%20Freeport%20Zone%2C%20Zambales&output=embed"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <div className="map-actions">
          <a
            className="btn-primary"
            href="https://www.google.com/maps/dir/?api=1&destination=R7CG%2B7F9%2C%20Mc%20Kinley%20St%2C%20Subic%20Bay%20Freeport%20Zone%2C%20Zambales"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get Directions
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Taste the Best BBQ in Texas?</h2>
        <p>Visit us today or order online for delivery</p>
        <div className="cta-buttons">
          <button className="btn-primary" onClick={() => navigate('/reservations')}>Make a Reservation</button>
          <button className="btn-secondary" onClick={() => navigate('/menu')}>Order Delivery</button>
        </div>
      </section>
    </div>
  )
}

export default Home
