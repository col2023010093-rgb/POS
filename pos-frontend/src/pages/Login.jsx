import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './login.css';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaUser, FaPhone, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import api from '../api';

import logo from "../assets/logo.png";
import slide1 from "../assets/slide1.png";
import slide2 from "../assets/slide2.png";
import slide3 from "../assets/slide3.png";
import slide4 from "../assets/slide4.png";

// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_STORAGE_KEY = 'login_lockout';
const ATTEMPTS_STORAGE_KEY = 'login_attempts';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => {
  if (!phone) return true;
  return /^[0-9\-\+\(\)\s]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
};
const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { score, label: 'Weak', color: '#d32f2f', width: '33%' };
  if (score <= 4) return { score, label: 'Medium', color: '#f9a825', width: '66%' };
  return { score, label: 'Strong', color: '#2e7d32', width: '100%' };
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // ─── State ─────────────────────────────────────────────────────────────────
  const [step, setStep] = useState('login');
  const [isRegisterActive, setIsRegisterActive] = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '',
    lastName: '', phone: '', confirmPassword: ''
  });
  const [code, setCode] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ─── Brute Force Protection ─────────────────────────────────────────────────
  const [loginAttempts, setLoginAttempts] = useState(() => {
    try { return parseInt(localStorage.getItem(ATTEMPTS_STORAGE_KEY) || '0'); } catch { return 0; }
  });
  const [lockoutUntil, setLockoutUntil] = useState(() => {
    try { return parseInt(localStorage.getItem(LOCKOUT_STORAGE_KEY) || '0'); } catch { return 0; }
  });
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const lockoutTimerRef = useRef(null);

  // ─── Slide animation ────────────────────────────────────────────────────────
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [slide1, slide2, slide3, slide4];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ─── Lockout countdown timer ─────────────────────────────────────────────────
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      if (lockoutUntil > now) {
        setLockoutRemaining(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setLockoutRemaining(0);
        if (lockoutUntil > 0) {
          setLockoutUntil(0);
          setLoginAttempts(0);
          localStorage.removeItem(LOCKOUT_STORAGE_KEY);
          localStorage.removeItem(ATTEMPTS_STORAGE_KEY);
        }
      }
    };
    updateCountdown();
    lockoutTimerRef.current = setInterval(updateCountdown, 1000);
    return () => clearInterval(lockoutTimerRef.current);
  }, [lockoutUntil]);

  // ─── Restore verification state on refresh ──────────────────────────────────
  useEffect(() => {
    const savedEmail = localStorage.getItem('verifyEmail');
    if (savedEmail) {
      setVerifyEmail(savedEmail);
      setStep('verify');
      setIsRegisterActive(true);
    }
  }, []);

  // ─── Auto-focus first code input ─────────────────────────────────────────────
  useEffect(() => {
    if (step === 'verify') {
      setTimeout(() => document.querySelector('.code-input')?.focus(), 100);
    }
  }, [step]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
    setError('');
  }, []);

  const recordFailedAttempt = useCallback(() => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    localStorage.setItem(ATTEMPTS_STORAGE_KEY, String(newAttempts));
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_DURATION_MS;
      setLockoutUntil(until);
      localStorage.setItem(LOCKOUT_STORAGE_KEY, String(until));
    }
    return newAttempts;
  }, [loginAttempts]);

  const clearAttempts = useCallback(() => {
    setLoginAttempts(0);
    setLockoutUntil(0);
    localStorage.removeItem(ATTEMPTS_STORAGE_KEY);
    localStorage.removeItem(LOCKOUT_STORAGE_KEY);
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // ── Lockout check ──
    if (lockoutRemaining > 0) {
      const mins = Math.floor(lockoutRemaining / 60);
      const secs = lockoutRemaining % 60;
      setError(`Too many failed attempts. Try again in ${mins}m ${secs}s.`);
      return;
    }

    // ── Basic validation ──
    if (!formData.email.trim() || !formData.password) {
      setError('Please enter your email and password.');
      return;
    }
    if (!validateEmail(formData.email)) {
      setValidationErrors({ email: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData.email.trim(), formData.password);
      if (result.success) {
        clearAttempts();
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate('/'), 500);
      } else {
        const attempts = recordFailedAttempt();
        const remaining = MAX_LOGIN_ATTEMPTS - attempts;

        if (result.code === 'EMAIL_NOT_VERIFIED') {
          setError('Please verify your email before logging in.');
        } else if (result.error?.toLowerCase().includes('not found')) {
          setError('No account found with that email.');
        } else if (result.error?.toLowerCase().includes('password')) {
          setError(`Incorrect password.${remaining > 0 ? ` ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` : ''}`);
        } else {
          setError(result.error || 'Login failed. Please try again.');
        }

        if (attempts >= MAX_LOGIN_ATTEMPTS) {
          setError('Account temporarily locked for 15 minutes due to too many failed attempts.');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
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
    else if (!validateEmail(formData.email)) errors.email = 'Please enter a valid email';
    if (!formData.password) errors.password = 'Password is required';
    else if (getPasswordStrength(formData.password).score < 3) errors.password = 'Password must be at least medium strength';
    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (formData.phone && !validatePhone(formData.phone)) errors.phone = 'Please enter a valid phone number';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/auth/register', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone?.trim() || ''
      });
      const userEmail = formData.email.trim().toLowerCase();
      setVerifyEmail(userEmail);
      localStorage.setItem('verifyEmail', userEmail);
      setStep('verify');
    } catch (err) {
      const errorData = err.response?.data;
      const msg = errorData?.error || 'Registration failed';
      if (errorData?.code === 'EMAIL_VERIFIED_EXISTS') {
        setValidationErrors({ email: 'This email is already registered. Please sign in.' });
        setTimeout(() => { switchToLogin(); setFormData(p => ({ ...p, email: formData.email })); }, 2000);
      } else if (errorData?.code === 'EMAIL_EXISTS') {
        setValidationErrors({ email: 'This email is already registered.' });
      } else if (msg.toLowerCase().includes('email')) {
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
    if (!verifyEmail || !code || code.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      setLoading(false);
      return;
    }
    try {
      await api.post('/api/auth/verify', { email: verifyEmail.trim(), code: code.trim() });
      localStorage.removeItem('verifyEmail');
      setSuccess('Email verified! Logging you in...');
      setStep('done');
      setTimeout(async () => {
        const loginResult = await login(verifyEmail, formData.password);
        if (loginResult.success) {
          navigate('/');
        } else {
          setStep('login');
          setIsRegisterActive(false);
          setSuccess('Account verified! Please sign in.');
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Verification failed. Please try again.');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const switchToLogin = () => {
    setIsRegisterActive(false);
    setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '', confirmPassword: '' });
    setError(''); setSuccess(''); setValidationErrors({});
  };

  const switchToRegister = () => {
    setIsRegisterActive(true);
    setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '', confirmPassword: '' });
    setError(''); setSuccess(''); setValidationErrors({});
  };

  const passwordStrength = getPasswordStrength(formData.password || '');
  const isLocked = lockoutRemaining > 0;
  const attemptsLeft = MAX_LOGIN_ATTEMPTS - loginAttempts;

  return (
    <div className="login-page">
      <div className={`container ${isRegisterActive ? 'active' : ''}`} id="container">

        {/* ── Sign Up Form ── */}
        <div className="form-container sign-up">
          <form onSubmit={handleRegister} noValidate>
            <h1 className="t-sign">Create Account</h1>
            {error && <div className="login-error-message"><FaExclamationTriangle /> {error}</div>}
            {success && <div className="login-success-message">✅ {success}</div>}
            <p>Welcome! Create your customer account:</p>

            <div className="name-row">
              <div className="field-group" style={{ flex: 1 }}>
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input type="text" placeholder="First Name" name="firstName"
                    value={formData.firstName} onChange={handleChange} autoComplete="given-name"
                    className={validationErrors.firstName ? 'input-error' : ''} />
                </div>
                {validationErrors.firstName && <small className="field-error">⚠️ {validationErrors.firstName}</small>}
              </div>
              <div className="field-group" style={{ flex: 1 }}>
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input type="text" placeholder="Last Name" name="lastName"
                    value={formData.lastName} onChange={handleChange} autoComplete="family-name"
                    className={validationErrors.lastName ? 'input-error' : ''} />
                </div>
                {validationErrors.lastName && <small className="field-error">⚠️ {validationErrors.lastName}</small>}
              </div>
            </div>

            <div className="field-group">
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input type="email" placeholder="Email" name="email"
                  value={formData.email} onChange={handleChange} autoComplete="email"
                  className={validationErrors.email ? 'input-error' : ''} />
              </div>
              {validationErrors.email && <small className="field-error">⚠️ {validationErrors.email}</small>}
            </div>

            <div className="field-group">
              <div className="input-wrapper">
                <FaPhone className="input-icon" />
                <input type="tel" placeholder="Contact No. (optional)" name="phone"
                  value={formData.phone} onChange={handleChange} autoComplete="tel"
                  className={validationErrors.phone ? 'input-error' : ''} />
              </div>
              {validationErrors.phone && <small className="field-error">⚠️ {validationErrors.phone}</small>}
            </div>

            <div className="field-group">
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input type={showSignUpPassword ? 'text' : 'password'}
                  placeholder="Password (min. 8 chars)" name="password"
                  value={formData.password} onChange={handleChange} autoComplete="new-password"
                  className={validationErrors.password ? 'input-error' : ''} />
                <span className="toggle-password" onClick={() => setShowSignUpPassword(p => !p)}>
                  {showSignUpPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div style={{ width: passwordStrength.width, background: passwordStrength.color }} />
                  </div>
                  <small style={{ color: passwordStrength.color }}>Strength: {passwordStrength.label}</small>
                </div>
              )}
              {validationErrors.password && <small className="field-error">⚠️ {validationErrors.password}</small>}
            </div>

            <div className="field-group">
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password" name="confirmPassword"
                  value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password"
                  className={validationErrors.confirmPassword ? 'input-error' : ''} />
                <span className="toggle-password" onClick={() => setShowConfirmPassword(p => !p)}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {validationErrors.confirmPassword && <small className="field-error">⚠️ {validationErrors.confirmPassword}</small>}
            </div>

            <button className="btn-1st" type="submit" disabled={loading}>
              {loading ? <span className="btn-loading"><span className="spinner" /> Creating Account...</span> : 'Sign Up as Customer'}
            </button>
            <button className="btn-2nd" type="button" onClick={switchToLogin}>
              Already have an account? Sign In
            </button>
          </form>

          {/* ── Verification Modal ── */}
          {step === 'verify' && (
            <div className="verification-modal-overlay">
              <div className="verification-modal">
                <div className="verification-header">
                  <FaShieldAlt className="verify-icon" />
                  <h2>Verify Your Email</h2>
                  <p>We've sent a 6-digit code to</p>
                  <span className="verification-email">{verifyEmail}</span>
                </div>
                <form onSubmit={handleVerify} className="verification-form">
                  {error && <div className="verification-error"><FaExclamationTriangle /> {error}</div>}
                  {success && <div className="verification-success">✅ {success}</div>}
                  <div className="code-inputs">
                    {[0,1,2,3,4,5].map((index) => (
                      <input key={index} type="text" inputMode="numeric" pattern="[0-9]*"
                        maxLength={1} className="code-input" autoComplete="off"
                        value={code[index] || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (!/^\d*$/.test(value)) return;
                          const arr = code.split('');
                          arr[index] = value;
                          setCode(arr.join(''));
                          if (value && index < 5) e.target.parentElement.children[index + 1]?.focus();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !code[index] && index > 0)
                            e.target.parentElement.children[index - 1]?.focus();
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const paste = e.clipboardData.getData('text').replace(/\D/g, '');
                          if (paste.length === 6) { setCode(paste); e.target.parentElement.children[5]?.focus(); }
                        }}
                        onFocus={(e) => e.target.select()}
                      />
                    ))}
                  </div>
                  <button type="submit" className="btn-verify" disabled={loading || code.length < 6}>
                    {loading ? <span className="btn-loading"><span className="spinner" /> Verifying...</span> : 'Verify Account'}
                  </button>
                  <button type="button" className="btn-resend" disabled={loading}
                    onClick={async () => {
                      setLoading(true); setError(''); setSuccess('');
                      try {
                        await api.post('/api/auth/resend', { email: verifyEmail });
                        setSuccess('New code sent!'); setCode('');
                        setTimeout(() => setSuccess(''), 3000);
                      } catch (err) {
                        const wait = err.response?.data?.retryAfter || 60;
                        setError(err.response?.status === 429
                          ? `Please wait ${wait}s before resending.`
                          : err.response?.data?.error || 'Failed to resend code.');
                      } finally { setLoading(false); }
                    }}>Resend Code</button>
                  <button type="button" className="btn-cancel" disabled={loading}
                    onClick={async () => {
                      if (!window.confirm('Cancel registration? Your account will be deleted.')) return;
                      setLoading(true);
                      try {
                        await api.post('/api/auth/delete-unverified', { email: verifyEmail });
                        localStorage.removeItem('verifyEmail');
                        setStep('login'); setCode(''); setIsRegisterActive(false);
                        setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '', confirmPassword: '' });
                      } catch (err) {
                        setError(err.response?.data?.error || 'Failed to cancel. Please try again.');
                      } finally { setLoading(false); }
                    }}>Cancel Registration</button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* ── Sign In Form ── */}
        <div className="form-container sign-in">
          <form onSubmit={handleLoginSubmit} noValidate>
            <h1 className="t-sign">Welcome Back</h1>
            <p>Sign in to your account:</p>

            {isLocked && (
              <div className="lockout-warning">
                <FaShieldAlt /> Account locked.{' '}
                Try again in {Math.floor(lockoutRemaining / 60)}m {lockoutRemaining % 60}s
              </div>
            )}
            {!isLocked && loginAttempts > 0 && loginAttempts < MAX_LOGIN_ATTEMPTS && (
              <div className="attempts-warning">
                <FaExclamationTriangle /> {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining before lockout
              </div>
            )}
            {error && !isLocked && <div className="login-error-message"><FaExclamationTriangle /> {error}</div>}
            {success && <div className="login-success-message">✅ {success}</div>}

            <div className="field-group">
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input type="email" placeholder="Email" name="email"
                  value={formData.email} onChange={handleChange}
                  autoComplete="email" disabled={isLocked}
                  className={validationErrors.email ? 'input-error' : ''} />
              </div>
              {validationErrors.email && <small className="field-error">⚠️ {validationErrors.email}</small>}
            </div>

            <div className="field-group">
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input type={showPassword ? 'text' : 'password'}
                  placeholder="Password" name="password"
                  value={formData.password} onChange={handleChange}
                  autoComplete="current-password" disabled={isLocked} />
                <span className="toggle-password" onClick={() => !isLocked && setShowPassword(p => !p)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <div className="forgot-row">
              <a href="#" className="forgot-password">Forgot your password?</a>
            </div>

            <button className="btn-1st" type="submit" disabled={loading || isLocked}>
              {loading
                ? <span className="btn-loading"><span className="spinner" /> Signing in...</span>
                : isLocked
                  ? `Locked (${Math.floor(lockoutRemaining / 60)}m ${lockoutRemaining % 60}s)`
                  : 'SIGN IN'}
            </button>
            <button className="btn-2nd" type="button" onClick={switchToRegister}>
              CREATE AN ACCOUNT
            </button>
          </form>
        </div>

        {/* ── Toggle / Slider Panel ── */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-right">
              <h1 className="ds-sign">
                {isRegisterActive ? 'Create Your Account!' : 'Sign In to Your Account!'}
              </h1>
              <div className="logo">
                <img src={logo} alt="Restaurant Logo" className="logo-image" width={70} />
              </div>
              <div className="restaurant-names">
                <span className="line1">Texas Joe's</span>
                <span className="line2">House of Ribs</span>
              </div>
              <div className="navigation-buttons">
                <button className="btn-secondary" onClick={() => navigate('/')}>Home</button>
                <button className="btn-secondary" onClick={() => navigate('/menu')}>Menu</button>
                <button className="btn-secondary" onClick={() => navigate('/contact')}>Contact</button>
                <button className="btn-secondary" onClick={() => navigate('/about')}>About us</button>
              </div>
              <div className="ImageSlider">
                <div className="wrapper">
                  <div className="wrapper-holder"
                    style={{ transform: `translateX(-${currentSlide * 100}%)`, transition: 'transform 0.6s ease-in-out' }}>
                    {slides.map((slide, i) => (
                      <div key={i} className="slide" style={{ backgroundImage: `url(${slide})` }} />
                    ))}
                  </div>
                </div>
                <div className="dots-container">
                  {slides.map((_, i) => (
                    <button key={i}
                      className={`button ${currentSlide === i ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(i)}
                      aria-label={`Slide ${i + 1}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;