import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../api';

import logo from "../assets/logo.png";
import slide1 from "../assets/slide1.png";
import slide2 from "../assets/slide2.png";
import slide3 from "../assets/slide3.png";
import slide4 from "../assets/slide4.png";

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState('login');
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

  // ✅ Restore verification state on refresh
  useEffect(() => {
    const savedEmail = localStorage.getItem('verifyEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setStep('verify');
      setIsRegisterActive(true);
    }
  }, []);

  // ✅ Auto-focus first code input when modal opens
  useEffect(() => {
    if (step === 'verify') {
      setTimeout(() => {
        const firstInput = document.querySelector('.code-input');
        firstInput?.focus();
      }, 100);
    }
  }, [step]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePassword = (password) => {
    return password.length >= 6
  }

  const validatePhone = (phone) => {
    if (!phone) return true
    const re = /^[0-9\-\+\(\)\s]+$/
    return re.test(phone) && phone.length >= 10
  }

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setValidationErrors((prev) => ({ ...prev, [name]: '' }))
    setError('')
  }

  const handleRegisterChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setValidationErrors((prev) => ({ ...prev, [name]: '' }))
    setError('')
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('📝 Submitting login form:', formData.email);
      
      const result = await login(formData.email.trim(), formData.password);
      
      console.log('📊 Login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful!');
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        // ✅ Show specific error messages
        if (result.code === 'EMAIL_NOT_VERIFIED') {
          setError('⚠️ Please verify your email before logging in.');
        } else if (result.error?.includes('not found')) {
          setError('📧 Email address not found. Please create an account.');
        } else if (result.error?.includes('password')) {
          setError('🔐 Incorrect password. Please try again.');
        } else {
          setError(result.error || 'Login failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      setError('❌ An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

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
    if (!formData.password) errors.password = 'Password is required';
    if (!formData.confirmPassword) errors.confirmPassword = 'Confirm password is required';

    if (formData.email && !validateEmail(formData.email)) errors.email = 'Please enter a valid email';
    if (formData.phone && !validatePhone(formData.phone)) errors.phone = 'Please enter a valid phone number';
    if (formData.password && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (formData.password && getPasswordStrength(formData.password).score < 3) {
      errors.password = 'Password must be at least medium strength';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/register', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone?.trim() || ''
      });

      const userEmail = formData.email.trim().toLowerCase();
      setEmail(userEmail);
      localStorage.setItem('verifyEmail', userEmail);
      setSuccess('');
      setStep('verify');
    } catch (err) {
      const errorData = err.response?.data;
      const msg = errorData?.error || 'Registration failed';
      
      // ✅ Handle different error types
      if (errorData?.code === 'EMAIL_VERIFIED_EXISTS') {
        setValidationErrors({ 
          email: '⚠️ This email is already registered and verified. Please login instead.' 
        });
        // Optional: Switch to login form
        setTimeout(() => {
          switchToLogin();
          setFormData(prev => ({ ...prev, email: formData.email }));
        }, 2000);
      } else if (errorData?.code === 'EMAIL_EXISTS') {
        setValidationErrors({ 
          email: '⚠️ This email is already registered. Please login.' 
        });
      } else if (msg.includes('email') || msg.includes('Email')) {
        setValidationErrors({ email: msg });
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!email || !code || code.length !== 6) {
        setError('Please enter a valid 6-digit code');
        setLoading(false);
        return;
      }
      
      await api.post('/api/auth/verify', { 
        email: email.trim(), 
        code: code.trim()
      });
      
      localStorage.removeItem('verifyEmail');
      setSuccess('Email verified successfully!');
      setStep('done');
      
      // ✅ Optional: Auto-login after verification
      setTimeout(async () => {
        // Auto-login with the registered credentials
        const loginResult = await login(email, formData.password);
        if (loginResult.success) {
          navigate('/');
        } else {
          // If auto-login fails, redirect to login page
          setStep('login');
          setIsRegisterActive(false);
          setSuccess('Account verified! Please login.');
        }
      }, 1500);
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                     err.response?.data?.error || 
                     'Verification failed';
      
      setError(errorMsg);
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset form when switching between login/register
  const switchToLogin = () => {
    setIsRegisterActive(false);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
    setValidationErrors({});
  };

  const switchToRegister = () => {
    setIsRegisterActive(true);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
    setValidationErrors({});
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
              <div className="login-error-message">❌ {error}</div>
            )}
            {success && (
              <div className="login-success-message">✅ {success}</div>
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
                  autoComplete="given-name"
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
                  autoComplete="family-name"
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
                autoComplete="email"
                style={{ borderColor: validationErrors.email ? '#d32f2f' : undefined }}
              />
              {validationErrors.email && (
                <small style={{ color: '#d32f2f', fontSize: '11px', display: 'block', marginTop: '3px' }}>⚠️ {validationErrors.email}</small>
              )}
            </div>

            <div>
              <input
                type="tel"
                placeholder="Contact No. (optional)"
                name="phone"
                value={formData.phone}
                onChange={handleRegisterChange}
                autoComplete="tel"
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
                  autoComplete="new-password"
                  style={{ borderColor: validationErrors.password ? '#d32f2f' : undefined }}
                />
                <span className="toggle-password" onClick={() => setShowSignUpPassword(!showSignUpPassword)}>
                  {showSignUpPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

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
                  autoComplete="new-password"
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

            <button className="btn-1st" type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up as Customer'}
            </button>
            <button
              className="btn-2nd"
              id="login"
              type="button"
              onClick={switchToLogin}
            >
              Already have account? Sign In
            </button>
          </form>

{/* Verification Modal */}
{step === 'verify' && (
  <div className="verification-modal-overlay" onClick={(e) => {
    if (e.target.className === 'verification-modal-overlay') {
      // Prevent closing modal by clicking outside
      e.stopPropagation();
    }
  }}>
    <div className="verification-modal">
      <div className="verification-header">
        <h2>Email Verification</h2>
        <p>We've sent a 6-digit code to</p>
        <span className="verification-email">{email}</span>
      </div>

      <form onSubmit={handleVerify} className="verification-form">
        {error && <div className="verification-error">❌ {error}</div>}
        {success && <div className="verification-success">✅ {success}</div>}

        <div className="code-inputs">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              className="code-input"
              autoComplete="off"
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
              onPaste={(e) => {
                e.preventDefault();
                const paste = e.clipboardData.getData('text').replace(/\D/g, '');
                if (paste.length === 6) {
                  setCode(paste);
                  const inputs = e.target.parentElement.children;
                  inputs[5]?.focus();
                }
              }}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>

        <button type="submit" className="btn-verify" disabled={loading || code.length < 6}>
          {loading ? 'Verifying...' : 'Verify Account'}
        </button>

        <button
          type="button"
          className="btn-resend"
          onClick={async () => {
            setLoading(true);
            setError('');
            setSuccess('');
            try {
              await api.post('/api/auth/resend', { email });
              setSuccess('New code sent to your email!');
              setCode('');
              setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
              if (err.response?.status === 429) {
                const secondsToWait = err.response?.data?.retryAfter || 60;
                setError(`Please wait ${secondsToWait} seconds before resending`);
              } else {
                setError(err.response?.data?.error || 'Failed to resend code');
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
          onClick={async () => {
            // ✅ Ask for confirmation
            if (!window.confirm('Are you sure you want to cancel? Your account will be deleted.')) {
              return;
            }

            setLoading(true);
            setError('');
            setSuccess('');

            try {
              // ✅ Delete unverified account
              await api.post('/api/auth/delete-unverified', { email });

              localStorage.removeItem('verifyEmail');
              setStep('login');
              setCode('');
              setError('');
              setSuccess('');
              setIsRegisterActive(false);
              setFormData({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                phone: '',
                confirmPassword: ''
              });

              setSuccess('Account cancelled and deleted.');
              setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
              setError(err.response?.data?.error || 'Failed to delete account');
              console.error('Delete error:', err);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
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
            
            <p>Welcome back! Log in to your account:</p>
            
            <div>
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleLoginChange}
                required
              />
              {error && error.includes('Email') && (
                <small style={{ color: '#d32f2f', fontSize: '11px', display: 'block', marginTop: '3px' }}>
                  ⚠️ {error}
                </small>
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
                  required
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {error && error.includes('password') && (
                <small style={{ color: '#d32f2f', fontSize: '11px', display: 'block', marginTop: '3px' }}>
                  ⚠️ {error}
                </small>
              )}
            </div>

            <div>
              <a href="#" className="forgot-password">
                Forgot your password?
              </a>
            </div>
            <button className="btn-1st" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'SIGN IN'}
            </button>
            <button
              className="btn-2nd"
              type="button"
              onClick={switchToRegister}
            >
              CREATE AN ACCOUNT
            </button>
          </form>
        </div>

        {/* Toggle Section - keeping your existing code */}
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
                    <div className="slide" style={{ backgroundImage: `url(${slide1})` }}></div>
                    <div className="slide" style={{ backgroundImage: `url(${slide2})` }}></div>
                    <div className="slide" style={{ backgroundImage: `url(${slide3})` }}></div>
                    <div className="slide" style={{ backgroundImage: `url(${slide4})` }}></div>
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