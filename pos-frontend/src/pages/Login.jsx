/**
 * Login.jsx  —  Sign In + Sign Up + Email Verification
 * ─────────────────────────────────────────────────────────────────────────────
 * Architecture
 *   ┌─ Login (main component)
 *   │    ├─ Sign-in form      — login with lockout protection
 *   │    ├─ Sign-up form      — registration with client-side validation
 *   │    ├─ VerificationModal — 6-digit email code (self-contained, overlays page)
 *   │    └─ ForgotPasswordModal (imported)
 *   └─ UserMenu               — nav dropdown for authenticated users
 *
 * Verification flow
 *   1. User submits sign-up form  →  POST /api/auth/register
 *   2. Backend creates unverified account + emails a 6-digit code
 *   3. VerificationModal mounts (outside .container, covers full viewport)
 *   4. User enters code  →  POST /api/auth/verify
 *   5a. Correct: account verified → auto-login → redirect to /
 *   5b. Wrong code: banner error + attempt counter (max 5)
 *   5c. Expired: prompt resend
 *   6. Resend: POST /api/auth/resend  (60-second client cooldown)
 *   7. Cancel: POST /api/auth/delete-unverified  (best-effort)
 *
 * Design note
 *   VerificationModal uses the exact same CSS classes as ForgotPasswordModal
 *   so both modals are visually identical without any extra CSS.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate }          from 'react-router-dom';
import { useAuth }              from '../context/AuthContext';
import api                      from '../api';
import { FaEye, FaEyeSlash }   from 'react-icons/fa';
import './login.css';
import ForgotPasswordModal      from './ForgotPasswordModal';

import logo   from '../assets/logo.png';
import slide1 from '../assets/slide1.png';
import slide2 from '../assets/slide2.png';
import slide3 from '../assets/slide3.png';
import slide4 from '../assets/slide4.png';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_LOGIN_ATTEMPTS  = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;   // 15 minutes
const LOCKOUT_LS_KEY      = 'login_lockout';
const ATTEMPTS_LS_KEY     = 'login_attempts';
const CODE_LENGTH         = 6;
const RESEND_COOLDOWN_SEC = 60;
const MAX_VERIFY_ATTEMPTS = 5;                 // wrong-code attempts before forced resend

// ─── Lockout helpers — persisted in localStorage so they survive refresh ──────

function getLockoutState() {
  try {
    return {
      lockoutUntil : parseInt(localStorage.getItem(LOCKOUT_LS_KEY)  || '0', 10),
      attempts     : parseInt(localStorage.getItem(ATTEMPTS_LS_KEY) || '0', 10),
    };
  } catch { return { lockoutUntil: 0, attempts: 0 }; }
}

function recordFailedLoginAttempt() {
  try {
    let { attempts } = getLockoutState();
    attempts += 1;
    localStorage.setItem(ATTEMPTS_LS_KEY, String(attempts));
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      localStorage.setItem(LOCKOUT_LS_KEY, String(Date.now() + LOCKOUT_DURATION_MS));
    }
    return attempts;
  } catch { return 0; }
}

function clearLoginLockout() {
  try {
    localStorage.removeItem(LOCKOUT_LS_KEY);
    localStorage.removeItem(ATTEMPTS_LS_KEY);
  } catch { /* noop */ }
}

function getRemainingLockoutMs() {
  const { lockoutUntil } = getLockoutState();
  const rem = lockoutUntil - Date.now();
  return rem > 0 ? rem : 0;
}

// ─── Validation helpers ───────────────────────────────────────────────────────

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[a-z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { score, label: 'Weak',   color: '#d32f2f' };
  if (score <= 4) return { score, label: 'Medium', color: '#f9a825' };
  return              { score, label: 'Strong', color: '#2e7d32' };
}

function isValidPhone(phone) {
  if (!phone) return true;
  return /^[0-9\-\+\(\)\s]+$/.test(phone) && phone.length >= 10;
}

// ─── UserMenu ─────────────────────────────────────────────────────────────────

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
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
        <ul role="menu" style={{
          position: 'absolute', top: '110%', right: 0, background: '#fff',
          borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          minWidth: '160px', listStyle: 'none', padding: '8px 0', zIndex: 9999,
        }}>
          <li role="menuitem">
            <a href="/profile" style={{ display: 'block', padding: '8px 16px', color: '#3d2914', fontSize: '13px' }}>My Profile</a>
          </li>
          <li role="menuitem">
            <a href="/orders" style={{ display: 'block', padding: '8px 16px', color: '#3d2914', fontSize: '13px' }}>My Orders</a>
          </li>
          <li role="separator" style={{ borderTop: '1px solid #eee', margin: '4px 0' }} />
          <li role="menuitem">
            <button onClick={onLogout} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '8px 16px', background: 'none', border: 'none',
              color: '#c62828', fontSize: '13px', cursor: 'pointer',
            }}>
              Sign Out
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

// ─── VerificationModal ────────────────────────────────────────────────────────
/**
 * Self-contained 6-digit email verification modal.
 *
 * Shares all CSS classes with ForgotPasswordModal for identical appearance:
 *   verification-modal-overlay, verification-modal, verification-header,
 *   fp-icon, verification-email, verification-form, code-inputs, code-input,
 *   btn-verify, btn-resend, btn-cancel, verification-error, verification-success
 *
 * Props
 *   verifyEmail  {string}   email displayed + sent to API
 *   password     {string}   password for auto-login after verification
 *   loginFn      {function} AuthContext login(email, password)
 *   onSuccess    {function(autoLoginOk: boolean)} called after verify
 *   onCancel     {function} called after user confirms cancellation
 */
function VerificationModal({ verifyEmail, password, loginFn, onSuccess, onCancel }) {

  const [digits,      setDigits]      = useState(Array(CODE_LENGTH).fill(''));
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [fieldError,  setFieldError]  = useState('');
  const [cooldown,    setCooldown]    = useState(0);
  const [badAttempts, setBadAttempts] = useState(0); // wrong-code counter
  const inputRefs = useRef([]);

  // Derived: string representation of entered code
  const code        = digits.join('');
  const isComplete  = digits.every(d => d !== '');
  const isExhausted = badAttempts >= MAX_VERIFY_ATTEMPTS;

  // ── Resend cooldown ticker ─────────────────────────────────────────────────
  useEffect(() => {
    if (!cooldown) return;
    const id = setInterval(() => setCooldown(c => (c > 1 ? c - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  // ── Auto-focus first box on mount ──────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 120);
  }, []);

  // ── ESC key → trigger cancel ───────────────────────────────────────────────
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') handleCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearMessages = () => { setError(''); setSuccess(''); setFieldError(''); };

  // ── Digit-box event handlers ───────────────────────────────────────────────

  const handleDigitChange = (e, i) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;        // reject non-numeric
    const next = [...digits];
    next[i] = val.slice(-1);              // keep single char
    setDigits(next);
    setFieldError('');
    if (val && i < CODE_LENGTH - 1) inputRefs.current[i + 1]?.focus();
  };

  const handleDigitKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft'  && i > 0)               inputRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < CODE_LENGTH - 1) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    setFieldError('');
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  };

  // ── Submit verification code ───────────────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!isComplete) {
      setFieldError('Please enter the full 6-digit code.');
      const firstEmpty = digits.findIndex(d => !d);
      inputRefs.current[firstEmpty === -1 ? 0 : firstEmpty]?.focus();
      return;
    }

    if (isExhausted) {
      setError('Too many incorrect attempts. Please request a new code below.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/verify', {
        email : verifyEmail.trim().toLowerCase(),
        code  : code,
      });

      // ── Success path ─────────────────────────────────────────────────────
      setSuccess('✅ Email verified! Signing you in…');
      localStorage.removeItem('verifyEmail');

      setTimeout(async () => {
        const result = await loginFn(verifyEmail, password);
        onSuccess(result?.success ?? false);
      }, 1100);

    } catch (err) {
      const msg    = err.response?.data?.message || err.response?.data?.error || '';
      const status = err.response?.status;

      if (status === 429) {
        setError('Too many attempts. Please wait before trying again.');
      } else if (msg.toLowerCase().includes('expired')) {
        setError('This code has expired. Request a new one below.');
        setDigits(Array(CODE_LENGTH).fill(''));
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      } else if (msg.toLowerCase().includes('already verified')) {
        setSuccess('Your account is already verified. Signing in…');
        localStorage.removeItem('verifyEmail');
        setTimeout(async () => {
          const result = await loginFn(verifyEmail, password);
          onSuccess(result?.success ?? false);
        }, 1100);
      } else if (status === 400 || status === 401) {
        // Wrong code — track attempts
        const next = badAttempts + 1;
        setBadAttempts(next);
        const rem = MAX_VERIFY_ATTEMPTS - next;
        setError(
          rem > 0
            ? `Incorrect code — ${rem} attempt${rem !== 1 ? 's' : ''} remaining.`
            : 'Too many incorrect attempts. Please request a new code below.'
        );
        setDigits(Array(CODE_LENGTH).fill(''));
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Resend code ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    clearMessages();
    setLoading(true);
    try {
      await api.post('/api/auth/resend', {
        email: verifyEmail.trim().toLowerCase(),
      });
      setSuccess('A new verification code has been sent to your email.');
      setDigits(Array(CODE_LENGTH).fill(''));
      setBadAttempts(0);               // reset wrong-attempt counter on fresh code
      setCooldown(RESEND_COOLDOWN_SEC);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err) {
      const status = err.response?.status;
      const wait   = err.response?.data?.retryAfter ?? RESEND_COOLDOWN_SEC;
      if (status === 429) {
        setError(`Too many requests. Please wait ${wait}s before resending.`);
        setCooldown(wait);
      } else if (err.response?.data?.error?.toLowerCase().includes('already verified')) {
        setSuccess('Your account is already verified. Try signing in.');
      } else {
        setError(err.response?.data?.error || 'Failed to resend code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Cancel — delete unverified account (best-effort), then close ───────────
  const handleCancel = async () => {
    if (!window.confirm('Cancel registration? Your unverified account will be removed.')) return;
    setLoading(true);
    try {
      await api.post('/api/auth/delete-unverified', {
        email: verifyEmail.trim().toLowerCase(),
      });
    } catch { /* proceed regardless of whether delete succeeds */ } finally {
      setLoading(false);
    }
    localStorage.removeItem('verifyEmail');
    onCancel();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="verification-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Email Verification"
      /* Click backdrop to cancel */
      onClick={e => { if (e.target === e.currentTarget) handleCancel(); }}
    >
      <div className="verification-modal">

        {/* ── Header — matches ForgotPasswordModal step='code' header ── */}
        <div className="verification-header">
          <span className="fp-icon" aria-hidden="true">✉️</span>
          <h2>Verify Your Email</h2>
          <p>We've sent a 6-digit code to</p>
          <span className="verification-email">{verifyEmail}</span>
        </div>

        {/* ── Form ────────────────────────────────────────────────────── */}
        <form
          onSubmit={handleVerify}
          className="verification-form"
          noValidate
          aria-label="Email verification form"
        >

          {/* Status banners */}
          {error   && <div className="verification-error"  role="alert"  aria-live="assertive">❌ {error}</div>}
          {success && <div className="verification-success" role="status" aria-live="polite">{success}</div>}

          {/* 6 digit-boxes */}
          <div>
            <div
              className="code-inputs"
              role="group"
              aria-label={`Enter ${CODE_LENGTH}-digit verification code`}
            >
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  className={`code-input${fieldError ? ' fp-input-error' : ''}`}
                  autoComplete="off"
                  value={digit}
                  onChange={e  => handleDigitChange(e, i)}
                  onKeyDown={e => handleDigitKeyDown(e, i)}
                  onPaste={handlePaste}
                  onFocus={e  => e.target.select()}
                  disabled={loading}
                  aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
                />
              ))}
            </div>
            {fieldError && (
              <span
                className="field-error"
                role="alert"
                style={{ display: 'block', textAlign: 'center', marginTop: '4px' }}
              >
                ⚠️ {fieldError}
              </span>
            )}
          </div>

          {/* Verify — disabled until all boxes filled */}
          <button
            type="submit"
            className="btn-verify"
            disabled={loading || !isComplete || isExhausted}
            aria-busy={loading}
          >
            {loading
              ? <span className="btn-loading"><span className="spinner" aria-hidden="true" /> Verifying…</span>
              : 'Verify Account'
            }
          </button>

          {/* Resend with countdown */}
          <button
            type="button"
            className="btn-resend"
            onClick={handleResend}
            disabled={loading || cooldown > 0}
            aria-label={cooldown > 0 ? `Resend available in ${cooldown} seconds` : 'Resend verification code'}
          >
            {cooldown > 0 ? `Resend Code (${cooldown}s)` : 'Resend Code'}
          </button>

          {/* Cancel */}
          <button
            type="button"
            className="btn-cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel registration
          </button>

        </form>
      </div>
    </div>
  );
}

// ─── Main Login page component ────────────────────────────────────────────────

const Login = () => {
  const { user, login, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate()
  const location  = useLocation()
  const returnTo  = location.state?.from || null;

  // ── UI state ───────────────────────────────────────────────────────────────
  const [step,             setStep]             = useState('login');  // 'login' | 'verify'
  const [isRegisterActive, setIsRegisterActive] = useState(false);    // adds .active to .container
  const [loading,          setLoading]          = useState(false);
  const [showForgotModal,  setShowForgotModal]  = useState(false);

  // ── Login form ─────────────────────────────────────────────────────────────
  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginTouched,  setLoginTouched]  = useState({});
  const [loginErrors,   setLoginErrors]   = useState({});
  const [showPassword,  setShowPassword]  = useState(false);
  const [apiMsg,        setApiMsg]        = useState({ type: '', text: '' });

  // ── Lockout state ──────────────────────────────────────────────────────────
  const [lockoutRemaining, setLockoutRemaining] = useState(getRemainingLockoutMs());
  const [attemptsLeft,     setAttemptsLeft]     = useState(
    MAX_LOGIN_ATTEMPTS - getLockoutState().attempts
  );
  const isLocked = lockoutRemaining > 0;

  // ── Sign-up form ───────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',
    phone: '', password: '', confirmPassword: '',
  });
  const [validationErrors,    setValidationErrors]    = useState({});
  const [showSignUpPassword,  setShowSignUpPassword]  = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [regError,            setRegError]            = useState('');
  const [regSuccess,          setRegSuccess]          = useState('');

  // ── Email for verification modal ───────────────────────────────────────────
  // Stored in localStorage so it survives a page refresh mid-flow
  const [verifyEmail, setVerifyEmail] = useState('');

  // ── Redirect if already authenticated ─────────────────────────────────────
  useEffect(() => {
    if (!authLoading && user) navigate(user.role === 'admin' ? '/admin/dashboard' : '/');
  }, [user, authLoading, navigate]);

  // ── Restore verification step on page refresh ──────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('verifyEmail');
    if (saved) {
      setVerifyEmail(saved);
      setStep('verify');
      setIsRegisterActive(true);
    }
  }, []);

  // ── Lockout countdown (updates every second while active) ─────────────────
  useEffect(() => {
    if (!lockoutRemaining) return;
    const id = setInterval(() => {
      const rem = getRemainingLockoutMs();
      setLockoutRemaining(rem);
      if (!rem) clearLoginLockout();
    }, 1000);
    return () => clearInterval(id);
  }, [lockoutRemaining]);

  // ── Live login field validation (only after user touches fields) ───────────
  useEffect(() => {
    if (!Object.keys(loginTouched).length) return;
    const errs = {};
    if (loginTouched.email) {
      if (!loginEmail.trim())             errs.email = 'Email is required.';
      else if (!isValidEmail(loginEmail)) errs.email = 'Enter a valid email address.';
    }
    if (loginTouched.password && !loginPassword) errs.password = 'Password is required.';
    setLoginErrors(errs);
  }, [loginEmail, loginPassword, loginTouched]);

  // ── Login submit ───────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginTouched({ email: true, password: true });

    const errs = {};
    if (!loginEmail.trim())             errs.email    = 'Email is required.';
    else if (!isValidEmail(loginEmail)) errs.email    = 'Enter a valid email address.';
    if (!loginPassword)                 errs.password = 'Password is required.';
    if (Object.keys(errs).length) { setLoginErrors(errs); return; }
    if (isLocked) return;

    setLoading(true);
    setApiMsg({ type: '', text: '' });

    try {
      const result = await login(loginEmail.trim(), loginPassword);

      if (result.success) {
        clearLoginLockout();
        setApiMsg({ type: 'success', text: 'Login successful! Redirecting…' });
        setTimeout(() => {
          const role = result.user?.role || result.data?.role;
          navigate(role === 'admin' ? '/admin/dashboard' : (returnTo || '/'));
        }, 500);
      } else {
        if (result.code === 'TOO_MANY_REQUESTS' || String(result.error).includes('429')) {
          setLockoutRemaining(LOCKOUT_DURATION_MS);
          setApiMsg({ type: 'error', text: 'Too many failed attempts. Please wait 15 minutes.' });
        } else {
          const newAttempts = recordFailedLoginAttempt();
          const left        = MAX_LOGIN_ATTEMPTS - newAttempts;
          if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            setLockoutRemaining(LOCKOUT_DURATION_MS);
            setApiMsg({ type: 'error', text: 'Too many failed attempts. Account locked for 15 minutes.' });
          } else {
            setAttemptsLeft(left);
            setApiMsg({
              type: 'error',
              text: result.code === 'EMAIL_NOT_VERIFIED'
                ? '⚠️ Please verify your email before signing in.'
                : 'Invalid email or password.',
            });
          }
        }
      }
    } catch (err) {
      // AuthContext threw instead of returning { success: false }
      // This prevents the page from refreshing on a network/auth error
      const status = err?.response?.status;
      if (status === 429) {
        setLockoutRemaining(LOCKOUT_DURATION_MS);
        setApiMsg({ type: 'error', text: 'Too many failed attempts. Please wait 15 minutes.' });
      } else if (status === 401 || status === 400) {
        const newAttempts = recordFailedLoginAttempt();
        const left        = MAX_LOGIN_ATTEMPTS - newAttempts;
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          setLockoutRemaining(LOCKOUT_DURATION_MS);
          setApiMsg({ type: 'error', text: 'Too many failed attempts. Account locked for 15 minutes.' });
        } else {
          setAttemptsLeft(left);
          setApiMsg({ type: 'error', text: 'Invalid email or password.' });
        }
      } else {
        setApiMsg({ type: 'error', text: 'Something went wrong. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Sign-up field change ───────────────────────────────────────────────────
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
    setRegError('');
  };

  // ── Sign-up submit ─────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRegError(''); setRegSuccess(''); setValidationErrors({});

    // Client-side validation — mirrors backend rules
    const errors = {};
    if (!formData.firstName?.trim()) errors.firstName = 'First name is required.';
    if (!formData.lastName?.trim())  errors.lastName  = 'Last name is required.';
    if (!formData.email?.trim())     errors.email     = 'Email is required.';
    else if (!isValidEmail(formData.email))
                                     errors.email     = 'Enter a valid email address.';
    if (!formData.password)          errors.password  = 'Password is required.';
    else if (getPasswordStrength(formData.password).score < 3)
                                     errors.password  = 'Password must be at least medium strength.';
    if (!formData.confirmPassword)   errors.confirmPassword = 'Please confirm your password.';
    else if (formData.password !== formData.confirmPassword)
                                     errors.confirmPassword = 'Passwords do not match.';
    if (formData.phone && !isValidPhone(formData.phone))
                                     errors.phone = 'Enter a valid phone number.';

    if (Object.keys(errors).length) {
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

      // Backend accepted registration → show verification modal
      const email = formData.email.trim().toLowerCase();
      setVerifyEmail(email);
      localStorage.setItem('verifyEmail', email);
      setStep('verify');

    } catch (err) {
      const data = err.response?.data;
      const msg  = data?.error || data?.message || 'Registration failed. Please try again.';

      if (data?.code === 'EMAIL_VERIFIED_EXISTS') {
        setValidationErrors({ email: 'This email is already registered. Please sign in.' });
        setTimeout(() => { switchToLogin(); setLoginEmail(formData.email); }, 2000);
      } else if (data?.code === 'EMAIL_EXISTS') {
        setValidationErrors({ email: 'This email is already registered.' });
      } else if (msg.toLowerCase().includes('email')) {
        setValidationErrors({ email: msg });
      } else {
        setRegError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Panel helpers ──────────────────────────────────────────────────────────
  const resetForms = () => {
    setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
    setValidationErrors({});
    setRegError(''); setRegSuccess('');
    setApiMsg({ type: '', text: '' });
  };

  const switchToLogin = () => { setIsRegisterActive(false); resetForms(); };
  const switchToRegister = () => { setIsRegisterActive(true); resetForms(); };

  const handleLogout = useCallback(() => { logout(); clearLoginLockout(); }, [logout]);
  const handleForgotPassword = (e) => { e.preventDefault(); setShowForgotModal(true); };

  // ── Verification modal callbacks ───────────────────────────────────────────
  const handleVerifySuccess = (autoLoginOk) => {
    setStep('login');
    setIsRegisterActive(false);
    setVerifyEmail('');
    resetForms();
    if (!autoLoginOk) {
      // Auto-login didn't work — tell user to sign in manually
      setApiMsg({ type: 'success', text: '✅ Account verified! Please sign in.' });
    }
    // If autoLoginOk: login() already ran → useEffect detects user → redirects to /
  };

  const handleVerifyCancel = () => {
    setStep('login');
    setIsRegisterActive(false);
    setVerifyEmail('');
    resetForms();
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const passwordStrength = getPasswordStrength(formData.password || '');
  const lockoutMinutes   = Math.ceil(lockoutRemaining / 60000);

  if (authLoading) {
    return (
      <div className="login-page">
        <span style={{ color: '#fff', fontSize: '14px', position: 'relative', zIndex: 10 }}>
          Loading…
        </span>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className={`container${isRegisterActive ? ' active' : ''}`} id="container">

        {/* ════════════════════════════════════════════════════════════════
            SIGN UP PANEL
            ════════════════════════════════════════════════════════════════ */}
        <div className="form-container sign-up">
          <form onSubmit={handleRegister} noValidate aria-label="Sign up form">
            <h1 className="t-sign">Create Account</h1>
            {regError   && <div className="login-error-message"   role="alert" >❌ {regError}</div>}
            {regSuccess && <div className="login-success-message" role="status">✅ {regSuccess}</div>}
            <p>Welcome! Create your customer account:</p>

            {/* Name row */}
            <div className="name-row">
              <div style={{ flex: 1 }}>
                <input type="text" name="firstName" placeholder="First Name"
                  value={formData.firstName} onChange={handleRegisterChange}
                  autoComplete="given-name" aria-invalid={!!validationErrors.firstName}
                  style={{ borderColor: validationErrors.firstName ? '#d32f2f' : undefined, width: '100%' }} />
                {validationErrors.firstName && <span className="field-error" role="alert">⚠️ {validationErrors.firstName}</span>}
              </div>
              <div style={{ flex: 1 }}>
                <input type="text" name="lastName" placeholder="Last Name"
                  value={formData.lastName} onChange={handleRegisterChange}
                  autoComplete="family-name" aria-invalid={!!validationErrors.lastName}
                  style={{ borderColor: validationErrors.lastName ? '#d32f2f' : undefined, width: '100%' }} />
                {validationErrors.lastName && <span className="field-error" role="alert">⚠️ {validationErrors.lastName}</span>}
              </div>
            </div>

            {/* Email */}
            <div>
              <input type="email" name="email" placeholder="Email"
                value={formData.email} onChange={handleRegisterChange}
                autoComplete="email" aria-invalid={!!validationErrors.email}
                style={{ borderColor: validationErrors.email ? '#d32f2f' : undefined }} />
              {validationErrors.email && <span className="field-error" role="alert">⚠️ {validationErrors.email}</span>}
            </div>

            {/* Phone */}
            <div>
              <input type="tel" name="phone" placeholder="Contact No. (optional)"
                value={formData.phone} onChange={handleRegisterChange}
                autoComplete="tel" aria-invalid={!!validationErrors.phone}
                style={{ borderColor: validationErrors.phone ? '#d32f2f' : undefined }} />
              {validationErrors.phone && <span className="field-error" role="alert">⚠️ {validationErrors.phone}</span>}
            </div>

            {/* Password + strength */}
            <div>
              <div className="password-wrapper">
                <input type={showSignUpPassword ? 'text' : 'password'} name="password"
                  placeholder="Password (min. 8 chars)" value={formData.password}
                  onChange={handleRegisterChange} autoComplete="new-password"
                  aria-invalid={!!validationErrors.password}
                  style={{ borderColor: validationErrors.password ? '#d32f2f' : undefined }} />
                <span className="toggle-password" onClick={() => setShowSignUpPassword(v => !v)} aria-label="Toggle password visibility">
                  {showSignUpPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div style={{ width: `${(passwordStrength.score/5)*100}%`, height: '100%',
                      background: passwordStrength.color, transition: 'width 0.2s ease', borderRadius: '4px' }} />
                  </div>
                  <small style={{ color: passwordStrength.color, fontSize: '11px' }}>Strength: {passwordStrength.label}</small>
                </div>
              )}
              {validationErrors.password && <span className="field-error" role="alert">⚠️ {validationErrors.password}</span>}
            </div>

            {/* Confirm password */}
            <div>
              <div className="password-wrapper">
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
                  placeholder="Confirm Password" value={formData.confirmPassword}
                  onChange={handleRegisterChange} autoComplete="new-password"
                  aria-invalid={!!validationErrors.confirmPassword}
                  style={{ borderColor: validationErrors.confirmPassword ? '#d32f2f' : undefined }} />
                <span className="toggle-password" onClick={() => setShowConfirmPassword(v => !v)} aria-label="Toggle password visibility">
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {validationErrors.confirmPassword && <span className="field-error" role="alert">⚠️ {validationErrors.confirmPassword}</span>}
            </div>

            <button className="btn-1st" type="submit" disabled={loading} aria-busy={loading}>
              {loading
                ? <span className="btn-loading"><span className="spinner" aria-hidden="true" /> Creating Account…</span>
                : 'Sign Up as Customer'}
            </button>
            <button className="btn-2nd" type="button" onClick={switchToLogin} disabled={loading}>
              Already have an account? Sign In
            </button>
          </form>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            SIGN IN PANEL
            ════════════════════════════════════════════════════════════════ */}
        <div className="form-container sign-in">
          <form onSubmit={handleLoginSubmit} noValidate aria-label="Sign in form">
            <h1 className="t-sign">Log in to your Account</h1>
            <p>Welcome back! Log in to your account:</p>

            {isLocked && (
              <div className="lockout-warning" role="alert">
                🔒 Too many attempts. Try again in {lockoutMinutes} min.
              </div>
            )}
            {!isLocked && attemptsLeft < MAX_LOGIN_ATTEMPTS && attemptsLeft > 0 && (
              <div className="attempts-warning" role="alert">
                ⚠️ {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining before lockout.
              </div>
            )}
            {apiMsg.text && (
              <div className={apiMsg.type === 'success' ? 'login-success-message' : 'login-error-message'} role="alert">
                {apiMsg.type === 'success' ? '✅' : '❌'} {apiMsg.text}
              </div>
            )}

            <div>
              <input type="email" placeholder="Email" value={loginEmail}
                onChange={e => { setLoginEmail(e.target.value); setApiMsg({ type: '', text: '' }); }}
                onBlur={() => setLoginTouched(t => ({ ...t, email: true }))}
                disabled={loading || isLocked} autoComplete="email"
                aria-invalid={!!loginErrors.email}
                style={{ borderColor: loginErrors.email ? '#d32f2f' : undefined }} />
              {loginErrors.email && <span className="field-error" role="alert">⚠️ {loginErrors.email}</span>}
            </div>

            <div>
              <div className="password-wrapper">
                <input type={showPassword ? 'text' : 'password'} placeholder="Password"
                  value={loginPassword}
                  onChange={e => { setLoginPassword(e.target.value); setApiMsg({ type: '', text: '' }); }}
                  onBlur={() => setLoginTouched(t => ({ ...t, password: true }))}
                  disabled={loading || isLocked} autoComplete="current-password"
                  aria-invalid={!!loginErrors.password}
                  style={{ borderColor: loginErrors.password ? '#d32f2f' : undefined }} />
                <span className="toggle-password" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password visibility">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {loginErrors.password && <span className="field-error" role="alert">⚠️ {loginErrors.password}</span>}
            </div>

            <div>
              <a href="/forgot-password" className="forgot-password" onClick={handleForgotPassword}>
                Forgot your password?
              </a>
            </div>

            <button className="btn-1st" type="submit" disabled={loading || isLocked} aria-busy={loading}>
              {loading
                ? <span className="btn-loading"><span className="spinner" aria-hidden="true" /> Signing in…</span>
                : 'SIGN IN'}
            </button>
            <button className="btn-2nd" type="button" onClick={switchToRegister} disabled={loading}>
              CREATE AN ACCOUNT
            </button>
          </form>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            TOGGLE PANEL — image slider + branding + nav buttons
            ════════════════════════════════════════════════════════════════ */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-right">
              <h1 className="ds-sign">
                {isRegisterActive ? 'Create Your Account!' : 'Sign In to Your Account!'}
              </h1>
              <div className="logo">
                <img src={logo} alt="Texas Joe's House of Ribs" width={70} />
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
                    {[slide1, slide2, slide3, slide4].map((src, i) => (
                      <div key={i} className="slide" style={{ backgroundImage: `url(${src})` }} />
                    ))}
                  </div>
                </div>
                <div className="dots-container">
                  {['#slide1','#slide2','#slide3','#slide4'].map((id, i) => (
                    <a key={id} href={id} className="button" aria-label={`Slide ${i + 1}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MODALS — rendered via portal directly into document.body
          Escapes .login-page overflow:hidden which traps fixed overlays.
          ════════════════════════════════════════════════════════════════════ */}
      {step === 'verify' && verifyEmail && ReactDOM.createPortal(
        <VerificationModal
          verifyEmail={verifyEmail}
          password={formData.password}
          loginFn={login}
          onSuccess={handleVerifySuccess}
          onCancel={handleVerifyCancel}
        />,
        document.body
      )}

      {showForgotModal && ReactDOM.createPortal(
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />,
        document.body
      )}

    </div>
  );
};

export default Login;