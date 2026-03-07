import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './login.css';
import ForgotPasswordModal from './ForgotPasswordModal';

import logo   from '../assets/logo.png';
import slide1 from '../assets/slide1.png';
import slide2 from '../assets/slide2.png';
import slide3 from '../assets/slide3.png';
import slide4 from '../assets/slide4.png';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS   = 15 * 60 * 1000;
const LOCKOUT_KEY  = 'login_lockout';
const ATTEMPTS_KEY = 'login_attempts';

// ─── Lockout helpers ──────────────────────────────────────────────────────────

function getLockoutState() {
  try {
    return {
      lockoutUntil : parseInt(localStorage.getItem(LOCKOUT_KEY)  || '0', 10),
      attempts     : parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10),
    };
  } catch { return { lockoutUntil: 0, attempts: 0 }; }
}

function recordFailedAttempt() {
  try {
    let { attempts } = getLockoutState();
    attempts += 1;
    localStorage.setItem(ATTEMPTS_KEY, String(attempts));
    if (attempts >= MAX_ATTEMPTS) {
      localStorage.setItem(LOCKOUT_KEY, String(Date.now() + LOCKOUT_MS));
    }
    return attempts;
  } catch { return 0; }
}

function clearLockout() {
  try {
    localStorage.removeItem(LOCKOUT_KEY);
    localStorage.removeItem(ATTEMPTS_KEY);
  } catch { /* noop */ }
}

function getRemainingLockout() {
  const { lockoutUntil } = getLockoutState();
  const remaining = lockoutUntil - Date.now();
  return remaining > 0 ? remaining : 0;
}

// ─── Validation helpers ───────────────────────────────────────────────────────

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8)          score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[a-z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak',   color: '#d32f2f' };
  if (score <= 4) return { score, label: 'Medium', color: '#f9a825' };
  return              { score, label: 'Strong', color: '#2e7d32' };
}

function validatePhone(phone) {
  if (!phone) return true;
  return /^[0-9\-\+\(\)\s]+$/.test(phone) && phone.length >= 10;
}

// ─── UserMenu — authenticated users only ─────────────────────────────────────

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="btn-secondary"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {user.firstName} ▾
      </button>
      {open && (
        <ul
          role="menu"
          style={{
            position    : 'absolute',
            top         : '110%',
            right       : 0,
            background  : '#fff',
            borderRadius: '8px',
            boxShadow   : '0 4px 16px rgba(0,0,0,0.15)',
            minWidth    : '160px',
            listStyle   : 'none',
            padding     : '8px 0',
            zIndex      : 9999,
          }}
        >
          <li role="menuitem">
            <a href="/profile" style={{ display: 'block', padding: '8px 16px', color: '#3d2914', fontSize: '13px' }}>
              My Profile
            </a>
          </li>
          <li role="menuitem">
            <a href="/orders" style={{ display: 'block', padding: '8px 16px', color: '#3d2914', fontSize: '13px' }}>
              My Orders
            </a>
          </li>
          <li role="separator" style={{ borderTop: '1px solid #eee', margin: '4px 0' }} />
          <li role="menuitem">
            <button
              onClick={onLogout}
              style={{
                display    : 'block',
                width      : '100%',
                textAlign  : 'left',
                padding    : '8px 16px',
                background : 'none',
                border     : 'none',
                color      : '#c62828',
                fontSize   : '13px',
                cursor     : 'pointer',
              }}
            >
              Sign Out
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const Login = () => {
  const { user, login, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [step,             setStep]             = useState('login');
  const [isRegisterActive, setIsRegisterActive] = useState(false);
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState('');
  const [success,          setSuccess]          = useState('');

  // ── NEW: forgot password modal toggle ─────────────────────────────────────
  const [showForgotModal, setShowForgotModal] = useState(false);

  // ── Login form state ──────────────────────────────────────────────────────
  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginTouched,  setLoginTouched]  = useState({});
  const [loginErrors,   setLoginErrors]   = useState({});
  const [showPassword,  setShowPassword]  = useState(false);
  const [apiMsg,        setApiMsg]        = useState({ type: '', text: '' });

  // ── Brute-force lockout state ─────────────────────────────────────────────
  const [lockoutRemaining, setLockoutRemaining] = useState(getRemainingLockout());
  const [attemptsLeft,     setAttemptsLeft]     = useState(MAX_ATTEMPTS - getLockoutState().attempts);
  const isLocked = lockoutRemaining > 0;

  // ── Sign-up form state ────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [validationErrors,    setValidationErrors]    = useState({});
  const [showSignUpPassword,  setShowSignUpPassword]  = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Verification state ────────────────────────────────────────────────────
  const [verifyEmail, setVerifyEmail] = useState('');
  const [code,        setCode]        = useState('');

  // ── Redirect if already logged in ────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && user) navigate('/');
  }, [user, authLoading, navigate]);

  // ── Restore verification state on refresh ────────────────────────────────
  useEffect(() => {
    const savedEmail = localStorage.getItem('verifyEmail');
    if (savedEmail) {
      setVerifyEmail(savedEmail);
      setStep('verify');
      setIsRegisterActive(true);
    }
  }, []);

  // ── Auto-focus first code input ───────────────────────────────────────────
  useEffect(() => {
    if (step === 'verify') {
      setTimeout(() => document.querySelector('.code-input')?.focus(), 100);
    }
  }, [step]);

  // ── Lockout countdown ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!lockoutRemaining) return;
    const id = setInterval(() => {
      const rem = getRemainingLockout();
      setLockoutRemaining(rem);
      if (!rem) clearLockout();
    }, 1000);
    return () => clearInterval(id);
  }, [lockoutRemaining]);

  // ── Live login validation ─────────────────────────────────────────────────
  useEffect(() => {
    if (Object.keys(loginTouched).length === 0) return;
    const errs = {};
    if (loginTouched.email) {
      if (!loginEmail.trim())             errs.email = 'Email is required.';
      else if (!isValidEmail(loginEmail)) errs.email = 'Enter a valid email address.';
    }
    if (loginTouched.password && !loginPassword) {
      errs.password = 'Password is required.';
    }
    setLoginErrors(errs);
  }, [loginEmail, loginPassword, loginTouched]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const touchLogin = field => setLoginTouched(t => ({ ...t, [field]: true }));

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginTouched({ email: true, password: true });

    const errs = {};
    if (!loginEmail.trim())             errs.email    = 'Email is required.';
    else if (!isValidEmail(loginEmail)) errs.email    = 'Enter a valid email address.';
    if (!loginPassword)                 errs.password = 'Password is required.';
    if (Object.keys(errs).length > 0) { setLoginErrors(errs); return; }
    if (isLocked) return;

    setLoading(true);
    setApiMsg({ type: '', text: '' });

    const result = await login(loginEmail.trim(), loginPassword);

    if (result.success) {
      clearLockout();
      setApiMsg({ type: 'success', text: 'Login successful! Redirecting…' });
      setTimeout(() => navigate('/'), 500);
    } else {
      if (result.code === 'TOO_MANY_REQUESTS' || result.error?.includes('429')) {
        setLockoutRemaining(LOCKOUT_MS);
        setApiMsg({ type: 'error', text: 'Too many failed attempts. Please wait 15 minutes.' });
      } else {
        const newAttempts = recordFailedAttempt();
        const remaining   = MAX_ATTEMPTS - newAttempts;

        if (newAttempts >= MAX_ATTEMPTS) {
          setLockoutRemaining(LOCKOUT_MS);
          setApiMsg({ type: 'error', text: 'Too many failed attempts. Account locked for 15 minutes.' });
        } else {
          setAttemptsLeft(remaining);
          if (result.code === 'EMAIL_NOT_VERIFIED') {
            setApiMsg({ type: 'error', text: '⚠️ Please verify your email before logging in.' });
          } else {
            setApiMsg({ type: 'error', text: 'Invalid email or password.' });
          }
        }
      }
    }

    setLoading(false);
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setValidationErrors({});

    const errors = {};
    if (!formData.firstName?.trim()) errors.firstName = 'First name is required.';
    if (!formData.lastName?.trim())  errors.lastName  = 'Last name is required.';
    if (!formData.email?.trim())     errors.email     = 'Email is required.';
    else if (!isValidEmail(formData.email)) errors.email = 'Enter a valid email address.';
    if (!formData.password)          errors.password  = 'Password is required.';
    if (!formData.confirmPassword)   errors.confirmPassword = 'Please confirm your password.';
    if (formData.phone && !validatePhone(formData.phone)) errors.phone = 'Enter a valid phone number.';
    if (formData.password && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    if (formData.password && getPasswordStrength(formData.password).score < 3) {
      errors.password = 'Password must be at least medium strength.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/auth/register', {
        firstName : formData.firstName.trim(),
        lastName  : formData.lastName.trim(),
        email     : formData.email.trim().toLowerCase(),
        password  : formData.password,
        phone     : formData.phone?.trim() || '',
      });

      const userEmail = formData.email.trim().toLowerCase();
      setVerifyEmail(userEmail);
      localStorage.setItem('verifyEmail', userEmail);
      setStep('verify');
    } catch (err) {
      const errorData = err.response?.data;
      const msg = errorData?.error || 'Registration failed.';

      if (errorData?.code === 'EMAIL_VERIFIED_EXISTS') {
        setValidationErrors({ email: 'This email is already registered. Please sign in.' });
        setTimeout(() => { switchToLogin(); setLoginEmail(formData.email); }, 2000);
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
    if (!verifyEmail || !code || code.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/api/auth/verify', { email: verifyEmail.trim(), code: code.trim() });
      localStorage.removeItem('verifyEmail');
      setSuccess('Email verified successfully!');
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
      setError(err.response?.data?.message || err.response?.data?.error || 'Verification failed.');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const switchToLogin = () => {
    setIsRegisterActive(false);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
    setError(''); setSuccess(''); setValidationErrors({});
    setApiMsg({ type: '', text: '' });
  };

  const switchToRegister = () => {
    setIsRegisterActive(true);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
    setError(''); setSuccess(''); setValidationErrors({});
    setApiMsg({ type: '', text: '' });
  };

  const handleLogout = useCallback(() => {
    logout();
    clearLockout();
  }, [logout]);

  // ── NEW: open forgot password modal ───────────────────────────────────────
  const handleForgotPassword = (e) => {
    e.preventDefault();
    setShowForgotModal(true);
  };

  const passwordStrength = getPasswordStrength(formData.password || '');
  const lockoutMinutes   = Math.ceil(lockoutRemaining / 60000);

  if (authLoading) {
    return (
      <div className="login-page">
        <div style={{ color: '#fff', fontSize: '14px', position: 'relative', zIndex: 10 }}>
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className={`container${isRegisterActive ? ' active' : ''}`} id="container">

        {/* ── Sign Up Form ─────────────────────────────────────────────── */}
        <div className="form-container sign-up">
          <form onSubmit={handleRegister} noValidate>
            <h1 className="t-sign">Create Account</h1>

            {error   && <div className="login-error-message">❌ {error}</div>}
            {success && <div className="login-success-message">✅ {success}</div>}

            <p>Welcome! Create your customer account:</p>

            <div className="name-row">
              <div style={{ flex: 1 }}>
                <input
                  type="text" placeholder="First Name" name="firstName"
                  value={formData.firstName} onChange={handleRegisterChange}
                  autoComplete="given-name" aria-invalid={!!validationErrors.firstName}
                  style={{ borderColor: validationErrors.firstName ? '#d32f2f' : undefined, width: '100%' }}
                />
                {validationErrors.firstName && (
                  <span className="field-error" role="alert">⚠️ {validationErrors.firstName}</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="text" placeholder="Last Name" name="lastName"
                  value={formData.lastName} onChange={handleRegisterChange}
                  autoComplete="family-name" aria-invalid={!!validationErrors.lastName}
                  style={{ borderColor: validationErrors.lastName ? '#d32f2f' : undefined, width: '100%' }}
                />
                {validationErrors.lastName && (
                  <span className="field-error" role="alert">⚠️ {validationErrors.lastName}</span>
                )}
              </div>
            </div>

            <div>
              <input
                type="email" placeholder="Email" name="email"
                value={formData.email} onChange={handleRegisterChange}
                autoComplete="email" aria-invalid={!!validationErrors.email}
                style={{ borderColor: validationErrors.email ? '#d32f2f' : undefined }}
              />
              {validationErrors.email && (
                <span className="field-error" role="alert">⚠️ {validationErrors.email}</span>
              )}
            </div>

            <div>
              <input
                type="tel" placeholder="Contact No. (optional)" name="phone"
                value={formData.phone} onChange={handleRegisterChange}
                autoComplete="tel" aria-invalid={!!validationErrors.phone}
                style={{ borderColor: validationErrors.phone ? '#d32f2f' : undefined }}
              />
              {validationErrors.phone && (
                <span className="field-error" role="alert">⚠️ {validationErrors.phone}</span>
              )}
            </div>

            <div>
              <div className="password-wrapper">
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  placeholder="Password (min. 8 chars)" name="password"
                  value={formData.password} onChange={handleRegisterChange}
                  autoComplete="new-password" aria-invalid={!!validationErrors.password}
                  style={{ borderColor: validationErrors.password ? '#d32f2f' : undefined }}
                />
                <span className="toggle-password" onClick={() => setShowSignUpPassword(v => !v)}>
                  {showSignUpPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div style={{
                      width: `${(passwordStrength.score / 5) * 100}%`, height: '100%',
                      background: passwordStrength.color, transition: 'width 0.2s ease', borderRadius: '4px',
                    }} />
                  </div>
                  <small style={{ color: passwordStrength.color, fontSize: '11px' }}>
                    Strength: {passwordStrength.label}
                  </small>
                </div>
              )}
              {validationErrors.password && (
                <span className="field-error" role="alert">⚠️ {validationErrors.password}</span>
              )}
            </div>

            <div>
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password" name="confirmPassword"
                  value={formData.confirmPassword} onChange={handleRegisterChange}
                  autoComplete="new-password" aria-invalid={!!validationErrors.confirmPassword}
                  style={{ borderColor: validationErrors.confirmPassword ? '#d32f2f' : undefined }}
                />
                <span className="toggle-password" onClick={() => setShowConfirmPassword(v => !v)}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {validationErrors.confirmPassword && (
                <span className="field-error" role="alert">⚠️ {validationErrors.confirmPassword}</span>
              )}
            </div>

            <button className="btn-1st" type="submit" disabled={loading}>
              {loading ? 'Creating Account…' : 'Sign Up as Customer'}
            </button>
            <button className="btn-2nd" type="button" onClick={switchToLogin} disabled={loading}>
              Already have an account? Sign In
            </button>
          </form>

          {/* ── Verification Modal ──────────────────────────────────────── */}
          {step === 'verify' && (
            <div className="verification-modal-overlay">
              <div className="verification-modal">
                <div className="verification-header">
                  <div className="fp-icon" aria-hidden="true">✉️</div>
                  <h2>Verify Your Email</h2>
                  <p>We've sent a 6-digit code to</p>
                  <span className="verification-email">{verifyEmail}</span>
                </div>

                <form onSubmit={handleVerify} className="verification-form">
                  {error   && <div className="verification-error">❌ {error}</div>}
                  {success && <div className="verification-success">✅ {success}</div>}

                  <div className="code-inputs">
                    {[0, 1, 2, 3, 4, 5].map(index => (
                      <input
                        key={index} type="text" inputMode="numeric" pattern="[0-9]*"
                        maxLength={1} className="code-input" autoComplete="off"
                        value={code[index] || ''}
                        onChange={e => {
                          const value = e.target.value;
                          if (!/^\d*$/.test(value)) return;
                          const chars = code.split('');
                          chars[index] = value;
                          setCode(chars.join(''));
                          if (value && index < 5)
                            e.target.parentElement.children[index + 1]?.focus();
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Backspace' && !code[index] && index > 0)
                            e.target.parentElement.children[index - 1]?.focus();
                        }}
                        onPaste={e => {
                          e.preventDefault();
                          const paste = e.clipboardData.getData('text').replace(/\D/g, '');
                          if (paste.length === 6) {
                            setCode(paste);
                            e.target.parentElement.children[5]?.focus();
                          }
                        }}
                        onFocus={e => e.target.select()}
                      />
                    ))}
                  </div>

                  <button type="submit" className="btn-verify" disabled={loading || code.length < 6}>
                    {loading ? 'Verifying…' : 'Verify Account'}
                  </button>

                  <button
                    type="button" className="btn-resend" disabled={loading}
                    onClick={async () => {
                      setLoading(true); setError(''); setSuccess('');
                      try {
                        await api.post('/api/auth/resend', { email: verifyEmail });
                        setSuccess('New code sent!');
                        setCode('');
                        setTimeout(() => setSuccess(''), 3000);
                      } catch (err) {
                        if (err.response?.status === 429) {
                          const wait = err.response?.data?.retryAfter || 60;
                          setError(`Please wait ${wait} seconds before resending.`);
                        } else {
                          setError(err.response?.data?.error || 'Failed to resend code.');
                        }
                      } finally { setLoading(false); }
                    }}
                  >
                    Resend Code
                  </button>

                  <button
                    type="button" className="btn-cancel" disabled={loading}
                    onClick={async () => {
                      if (!window.confirm('Cancel registration? Your account will be deleted.')) return;
                      setLoading(true);
                      try {
                        await api.post('/api/auth/delete-unverified', { email: verifyEmail });
                        localStorage.removeItem('verifyEmail');
                        setStep('login'); setCode('');
                        setIsRegisterActive(false);
                        setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
                      } catch (err) {
                        setError(err.response?.data?.error || 'Failed to cancel.');
                      } finally { setLoading(false); }
                    }}
                  >
                    Cancel and go back
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* ── Sign In Form ──────────────────────────────────────────────── */}
        <div className="form-container sign-in">
          <form onSubmit={handleLoginSubmit} noValidate>
            <h1 className="t-sign">Log in to your Account</h1>
            <p>Welcome back! Log in to your account:</p>

            {isLocked && (
              <div className="lockout-warning" role="alert">
                🔒 Too many attempts. Try again in {lockoutMinutes} min.
              </div>
            )}

            {!isLocked && attemptsLeft < MAX_ATTEMPTS && attemptsLeft > 0 && (
              <div className="attempts-warning" role="alert">
                ⚠️ {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining before lockout.
              </div>
            )}

            {apiMsg.text && (
              <div
                className={apiMsg.type === 'success' ? 'login-success-message' : 'login-error-message'}
                role="alert"
              >
                {apiMsg.type === 'success' ? '✅' : '❌'} {apiMsg.text}
              </div>
            )}

            <div>
              <input
                type="email" placeholder="Email" name="email" value={loginEmail}
                onChange={e => { setLoginEmail(e.target.value); setApiMsg({ type: '', text: '' }); }}
                onBlur={() => touchLogin('email')}
                disabled={loading || isLocked} autoComplete="email"
                aria-invalid={!!loginErrors.email}
                style={{ borderColor: loginErrors.email ? '#d32f2f' : undefined }}
              />
              {loginErrors.email && (
                <span className="field-error" role="alert">⚠️ {loginErrors.email}</span>
              )}
            </div>

            <div>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'} placeholder="Password" name="password"
                  value={loginPassword}
                  onChange={e => { setLoginPassword(e.target.value); setApiMsg({ type: '', text: '' }); }}
                  onBlur={() => touchLogin('password')}
                  disabled={loading || isLocked} autoComplete="current-password"
                  aria-invalid={!!loginErrors.password}
                  style={{ borderColor: loginErrors.password ? '#d32f2f' : undefined }}
                />
                <span className="toggle-password" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {loginErrors.password && (
                <span className="field-error" role="alert">⚠️ {loginErrors.password}</span>
              )}
            </div>

            {/* ── CHANGED: e.preventDefault() + opens modal ─────────────── */}
            <div>
              <a href="/forgot-password" className="forgot-password" onClick={handleForgotPassword}>
                Forgot your password?
              </a>
            </div>

            <button className="btn-1st" type="submit" disabled={loading || isLocked} aria-busy={loading}>
              {loading
                ? <span className="btn-loading"><span className="spinner" aria-hidden="true" /> Signing in…</span>
                : 'SIGN IN'
              }
            </button>
            <button className="btn-2nd" type="button" onClick={switchToRegister} disabled={loading}>
              CREATE AN ACCOUNT
            </button>
          </form>
        </div>

        {/* ── Toggle Panel ──────────────────────────────────────────────── */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-right">
              <h1 className="ds-sign">
                {isRegisterActive ? 'Create Your Account!' : 'Sign In to Your Account!'}
              </h1>
              <div className="logo">
                <img src={logo} alt="Restaurant Logo" width={70} />
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
                <UserMenu user={user} onLogout={handleLogout} />
              </div>
              <div className="ImageSlider">
                <div className="wrapper">
                  <div className="wrapper-holder">
                    <div className="slide" style={{ backgroundImage: `url(${slide1})` }} />
                    <div className="slide" style={{ backgroundImage: `url(${slide2})` }} />
                    <div className="slide" style={{ backgroundImage: `url(${slide3})` }} />
                    <div className="slide" style={{ backgroundImage: `url(${slide4})` }} />
                  </div>
                </div>
                <div className="dots-container">
                  <a href="#slide1" className="button" />
                  <a href="#slide2" className="button" />
                  <a href="#slide3" className="button" />
                  <a href="#slide4" className="button" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Forgot Password Modal — outside container so it overlays all ── */}
      {showForgotModal && (
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
      )}
    </div>
  );
};

export default Login;