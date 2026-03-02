import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import api from '../api';

// ✅ Import real images or use placeholder URLs
import logo from "../assets/logo.png";
import slide1 from "../assets/slide1.png";
import slide2 from "../assets/slide2.png";
import slide3 from "../assets/slide3.png";
import slide4 from "../assets/slide4.png";

const Login = () => {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState('login'); // 'login' | 'register' | 'verify' | 'done'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    confirmPassword: ''
  })
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isRegisterActive, setIsRegisterActive] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // ✅ Validation helpers
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePassword = (password) => {
    return password.length >= 6
  }

  const validatePhone = (phone) => {
    if (!phone) return true // phone is optional
    const re = /^[0-9\-\+\(\)\s]+$/
    return re.test(phone) && phone.length >= 10
  }

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setValidationErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleRegisterChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setValidationErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/'); // Redirect to home
        }, 1000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Login failed');
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setValidationErrors({})

    // ✅ Comprehensive validation
    const errors = {}
    
    if (!formData.firstName?.trim()) {
      errors.firstName = 'First name is required'
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters'
    }

    if (!formData.lastName?.trim()) {
      errors.lastName = 'Last name is required'
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters'
    }

    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (!validatePassword(formData.password)) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid phone number (at least 10 digits)'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setLoading(true)
    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim()
      })
      setSuccess('Account created successfully! Redirecting to home...')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed'
      if (errorMsg.includes('Email')) {
        setValidationErrors({ email: errorMsg })
      } else {
        setError(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  const [emailStatus, setEmailStatus] = useState({ checking: false, available: null, message: '' });

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: '#d32f2f' };
    if (score <= 4) return { score, label: 'Medium', color: '#f9a825' };
    return { score, label: 'Strong', color: '#2e7d32' };
  };

  const passwordStrength = getPasswordStrength(formData.password || '');

  const handleEmailBlur = async () => {
    const email = (formData.email || '').trim().toLowerCase();
    if (!email || !validateEmail(email)) return;

    try {
      setEmailStatus({ checking: true, available: null, message: 'Checking email...' });
      const { data } = await api.post('/api/auth/check-email', { email });
      setEmailStatus({ checking: false, available: data.available, message: data.message });
      if (!data.available) {
        setValidationErrors((prev) => ({ ...prev, email: 'Email is already registered' }));
      }
    } catch {
      setEmailStatus({ checking: false, available: null, message: '' });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setValidationErrors({});

    const errors = {};
    if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) errors.lastName = 'Last name is required';
    if (!formData.email?.trim()) errors.email = 'Email is required';
    if (!formData.phone?.trim()) errors.phone = 'Phone is required';
    if (!formData.password) errors.password = 'Password is required';
    if (!formData.confirmPassword) errors.confirmPassword = 'Confirm password is required';

    if (formData.email && !validateEmail(formData.email)) errors.email = 'Please enter a valid email';
    if (formData.phone && !validatePhone(formData.phone)) errors.phone = 'Please enter a valid phone number';
    if (formData.password && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (formData.password && getPasswordStrength(formData.password).score < 5) {
      errors.password = 'Password must be strong (8+ chars, upper/lower/number/symbol)';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    try {
      // email used check
      const check = await api.post('/api/auth/check-email', { email: formData.email.toLowerCase() });
      if (!check.data.available) {
        setValidationErrors({ email: 'Email is already registered' });
        setLoading(false);
        return;
      }

      await api.post('/api/auth/register', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim()
      });

      setEmail(formData.email.toLowerCase());
      setStep('verify');
      setSuccess('Verification code sent to your email.');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      if (msg.toLowerCase().includes('email already')) {
        setValidationErrors({ email: 'Email is already registered' });
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    console.log('🚀 handleVerify called');
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('📧 Email:', email);
      console.log('🔐 Code:', code);
      console.log('📝 Code length:', code.length);
      
      if (!email || !code || code.length !== 6) {
        console.error('❌ Validation failed');
        setError('Please enter a valid 6-digit code');
        setLoading(false);
        return;
      }
      
      console.log('🔄 Sending verification request to /api/auth/verify');
      console.log('Payload:', { email: email.trim(), code: code.trim() });
      
      const response = await api.post('/api/auth/verify', { 
        email: email.trim(), 
        code: code.trim()
      });
      
      console.log('✅ Success response:', response.data);
      setSuccess('Email verified successfully!');
      setStep('done');
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (err) {
      console.error('🔴 Full error object:', err);
      console.error('📍 Error status:', err.response?.status);
      console.error('📋 Error data:', err.response?.data);
      console.error('💬 Error message:', err.message);
      console.error('🌐 Request URL:', err.config?.url);
      console.error('🔌 Request method:', err.config?.method);
      
      const errorMsg = err.response?.data?.message || 
                     err.response?.data?.error || 
                     err.message ||
                     'Verification failed - please check backend logs';
      
      console.error('🎯 Final error message:', errorMsg);
      setError(errorMsg);
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const testAPI = async () => {
    try {
      const response = await api.get('http://localhost:4000/health');
      console.log('✅ Backend is reachable:', response.data);
    } catch (err) {
      console.error('❌ Cannot reach backend:', err.message);
    }
  };

  return (
    <div className="login-page">
      <div
        className={`container ${isRegisterActive ? 'active' : ''}`}
        id="container"
      >
        {/* Sign Up Form */}
        <div className="form-container sign-up">
          <form onSubmit={handleRegister}>
            <h1 className="t-sign">Create Account</h1>
            {error && (
              <div style={{ color: '#d32f2f', fontSize: '12px', marginBottom: '10px', backgroundColor: '#ffebee', padding: '8px', borderRadius: '4px' }}>
                ❌ {error}
              </div>
            )}
            {success && (
              <div style={{ color: '#2e7d32', fontSize: '12px', marginBottom: '10px', backgroundColor: '#e8f5e9', padding: '8px', borderRadius: '4px' }}>
                ✅ {success}
              </div>
            )}
            <p>Welcome! Create your customer account:</p>

            <div className="name-row">
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleRegisterChange}
                  style={{ borderColor: validationErrors.firstName ? '#d32f2f' : undefined, width: '100%' }}
                />
                {validationErrors.firstName && (
                  <small style={{ color: '#d32f2f', fontSize: '11px' }}>⚠️ {validationErrors.firstName}</small>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleRegisterChange}
                  style={{ borderColor: validationErrors.lastName ? '#d32f2f' : undefined, width: '100%' }}
                />
                {validationErrors.lastName && (
                  <small style={{ color: '#d32f2f', fontSize: '11px' }}>⚠️ {validationErrors.lastName}</small>
                )}
              </div>
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleRegisterChange}
                onBlur={handleEmailBlur}
                style={{ borderColor: validationErrors.email ? '#d32f2f' : undefined }}
              />
              {validationErrors.email && (
                <small style={{ color: '#d32f2f', fontSize: '11px', display: 'block', marginTop: '3px' }}>⚠️ {validationErrors.email}</small>
              )}
              {!validationErrors.email && emailStatus.message && (
                <small
                  style={{
                    color: emailStatus.available === false ? '#d32f2f' : '#2e7d32',
                    fontSize: '11px',
                    display: 'block',
                    marginTop: '3px'
                  }}
                >
                  {emailStatus.message}
                </small>
              )}
            </div>

            <div>
              <input
                type="tel"
                placeholder="Contact No. (optional)"
                name="phone"
                value={formData.phone}
                onChange={handleRegisterChange}
                style={{ borderColor: validationErrors.phone ? '#d32f2f' : undefined }}
              />
              {validationErrors.phone && (
                <small style={{ color: '#d32f2f', fontSize: '11px', display: 'block', marginTop: '3px' }}>⚠️ {validationErrors.phone}</small>
              )}
            </div>

            <div>
              <div className="password-wrapper signup-password">
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  placeholder="Password (min. 8 chars + upper/lower/number/symbol)"
                  name="password"
                  value={formData.password}
                  onChange={handleRegisterChange}
                  style={{ borderColor: validationErrors.password ? '#d32f2f' : undefined }}
                />
                <span className="toggle-password" onClick={() => setShowSignUpPassword(!showSignUpPassword)}>
                  {showSignUpPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {/* Password strength indicator */}
              <div style={{ marginTop: '6px' }}>
                <div style={{ height: '6px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      height: '100%',
                      background: passwordStrength.color,
                      transition: 'width 0.2s ease'
                    }}
                  />
                </div>
                <small style={{ color: passwordStrength.color, fontSize: '11px' }}>
                  Strength: {formData.password ? passwordStrength.label : 'N/A'}
                </small>
              </div>
              {validationErrors.password && (
                <small style={{ color: '#d32f2f', fontSize: '11px', display: 'block', marginTop: '3px' }}>⚠️ {validationErrors.password}</small>
              )}
            </div>

            <div>
              <div className="password-wrapper signup-password">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleRegisterChange}
                  style={{ borderColor: validationErrors.confirmPassword ? '#d32f2f' : undefined }}
                />
                <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {validationErrors.confirmPassword && (
                <small style={{ color: '#d32f2f', fontSize: '11px', display: 'block', marginTop: '3px' }}>⚠️ {validationErrors.confirmPassword}</small>
              )}
            </div>

            <button className="btn-1st" type="submit" disabled={loading || !!success}>
              {loading ? 'Creating Account...' : 'Sign Up as Customer'}
            </button>
            <button
              className="btn-2nd"
              id="login"
              type="button"
              onClick={() => {
                setIsRegisterActive(false)
                setError('')
                setSuccess('')
                setValidationErrors({})
              }}
            >
              Already have account? Sign In
            </button>
          </form>

{/* Add this right after your sign-up form block */}
{step === 'verify' && (
  <div className="verification-modal-overlay">
    <div className="verification-modal">

      <div className="verification-header">
        <h2>Email Verification</h2>
        <p>We've sent a 6-digit code to</p>
        <span className="verification-email">{email}</span>
      </div>

      <form onSubmit={handleVerify} className="verification-form">
        {error && (
          <div className="verification-error">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="verification-success">
            ✅ {success}
          </div>
        )}

        <div className="code-inputs">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              className="code-input"
              value={code[index] || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (!/^\d*$/.test(value)) return;
                
                const newCode = code.split('');
                newCode[index] = value;
                setCode(newCode.join(''));

                if (value && index < 5) {
                  const nextInput = e.target.parentElement.children[index + 1];
                  nextInput?.focus();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !code[index] && index > 0) {
                  const prevInput = e.target.parentElement.children[index - 1];
                  prevInput?.focus();
                }
              }}
              onFocus={(e) => e.target.select()}
              autoFocus={index === 0}
            />
          ))}
        </div>

        <button 
          type="submit" 
          className="btn-verify" 
          disabled={loading || code.length < 6}
        >
          {loading ? 'Verifying...' : 'Verify Account'}
        </button>

        <button
          type="button"
          className="btn-resend"
          onClick={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError('');
            setSuccess('');
            try {
              const response = await api.post('/api/auth/resend', { email });
              
              if (response.status === 200) {
                setSuccess('New code sent to your email!');
                setCode('');
                setTimeout(() => setSuccess(''), 3000);
              }
            } catch (err) {
              console.error('❌ Resend error:', err);
              
              // ✅ Handle rate limit error (429 status)
              if (err.response?.status === 429) {
                const secondsToWait = err.response?.data?.retryAfter || 60;
                setError(`Please wait ${secondsToWait} seconds before resending`);
              } else {
                const errorMsg = err.response?.data?.error || 'Failed to resend code';
                setError(errorMsg);
              }
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          Resend Code
        </button>

        <button
          type="button"
          className="btn-cancel"
          onClick={() => {
            setStep('register');
            setCode('');
            setError('');
            setSuccess('');
          }}
        >
          Cancel and go back
        </button>
      </form>
    </div>
  </div>
)}

        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in">
          <form onSubmit={handleLoginSubmit}>
            <h1 className="t-sign">Log in to your Account</h1>
            {error && (
              <div style={{ color: '#d32f2f', fontSize: '12px', marginBottom: '10px', backgroundColor: '#ffebee', padding: '8px', borderRadius: '4px' }}>
                ❌ {error}
              </div>
            )}
            {success && (
              <div style={{ color: '#2e7d32', fontSize: '12px', marginBottom: '10px', backgroundColor: '#e8f5e9', padding: '8px', borderRadius: '4px' }}>
                ✅ {success}
              </div>
            )}
            <p>Welcome back! Log in to your account:</p>
            
            <div>
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleLoginChange}
                style={{ borderColor: validationErrors.email ? '#d32f2f' : undefined }}
              />
              {validationErrors.email && (
                <small style={{ color: '#d32f2f', fontSize: '11px', display: 'block', marginTop: '3px' }}>⚠️ {validationErrors.email}</small>
              )}
            </div>

            <div>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleLoginChange}
                  style={{ borderColor: validationErrors.password ? '#d32f2f' : undefined }}
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {validationErrors.password && (
                <small style={{ color: '#d32f2f', fontSize: '11px', display: 'block', marginTop: '3px' }}>⚠️ {validationErrors.password}</small>
              )}
            </div>

            <div>
              <a href="#" className="forgot-password">
                Forgot your password?
              </a>
            </div>
            <button className="btn-1st" type="submit" disabled={loading || !!success}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <button
              className="btn-2nd"
              id="register"
              type="button"
              onClick={() => {
                setIsRegisterActive(true)
                setError('')
                setSuccess('')
                setValidationErrors({})
              }}
            >
              Create an Account
            </button>
          </form>
        </div>

        {/* Toggle Section */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-right">
              <h1 className="ds-sign">
                {isRegisterActive
                  ? 'Create Your Account!'
                  : 'Sign In to Your Account!'}
              </h1>
              <div className="logo">
                <img
                  src={logo}
                  alt="Restaurant Logo"
                  className="logo-image"
                  width={70}
                />
              </div>

              <div className="restaurant-names">
                <span className="line1">Texas Joe's</span>
                <span className="line2">House of Ribs</span>
              </div>

              <div className="navigation-buttons">
                <button className="btn-secondary" onClick={() => navigate('/')}>
                  Home
                </button>
                <button className="btn-secondary" onClick={() => navigate('/menu')}>
                  Menu
                </button>
                <button className="btn-secondary" onClick={() => navigate('/contact')}>
                  Contact
                </button>
                <button className="btn-secondary" onClick={() => navigate('/about')}>
                  About us
                </button>
              </div>

              <div className="ImageSlider">
                <div className="wrapper">
                  <div className="wrapper-holder">
                    <div
                      className="slide"
                      style={{ backgroundImage: `url(${slide1})` }}
                    ></div>
                    <div
                      className="slide"
                      style={{ backgroundImage: `url(${slide2})` }}
                    ></div>
                    <div
                      className="slide"
                      style={{ backgroundImage: `url(${slide3})` }}
                    ></div>
                    <div
                      className="slide"
                      style={{ backgroundImage: `url(${slide4})` }}
                    ></div>
                  </div>
                </div>

                <div className="dots-container">
                  <a href="#slide1" className="button"></a>
                  <a href="#slide2" className="button"></a>
                  <a href="#slide3" className="button"></a>
                  <a href="#slide4" className="button"></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
