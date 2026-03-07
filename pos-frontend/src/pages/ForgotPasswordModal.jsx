import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../api';

// ─── Helpers (mirrored from Login.jsx for consistency) ────────────────────────

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

// ─── ForgotPasswordModal ──────────────────────────────────────────────────────

const ForgotPasswordModal = ({ onClose }) => {
  // step: 'email' → 'code' → 'done'
  const [step,            setStep]           = useState('email');
  const [email,           setEmail]          = useState('');
  const [code,            setCode]           = useState('');
  const [newPassword,     setNewPassword]    = useState('');
  const [confirmPassword, setConfirmPw]      = useState('');
  const [showNew,         setShowNew]        = useState(false);
  const [showConfirm,     setShowConfirm]    = useState(false);
  const [loading,         setLoading]        = useState(false);
  const [error,           setError]          = useState('');
  const [success,         setSuccess]        = useState('');
  const [fieldErrors,     setFieldErrors]    = useState({});
  const [resendCooldown,  setResendCooldown] = useState(0);

  // ── Resend cooldown timer ────────────────────────────────────────────────
  useEffect(() => {
    if (!resendCooldown) return;
    const id = setInterval(() => {
      setResendCooldown(c => {
        if (c <= 1) { clearInterval(id); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  // ── Focus first code box when entering code step ─────────────────────────
  useEffect(() => {
    if (step === 'code') {
      setTimeout(() => document.querySelector('.fp-code-input')?.focus(), 100);
    }
  }, [step]);

  // ── Close on Escape ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const clearMessages = () => { setError(''); setSuccess(''); setFieldErrors({}); };

  // ── Step 1: Request reset code ───────────────────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    const errs = {};
    if (!email.trim())             errs.email = 'Email is required.';
    else if (!isValidEmail(email)) errs.email = 'Enter a valid email address.';
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email: email.trim().toLowerCase() });
      // Success — advance to code step
      setStep('code');
      setSuccess('A reset code has been sent to your email.');
    } catch (err) {
      const status = err.response?.status;
      const code   = err.response?.data?.code;
      if (status === 429) {
        setError('Too many requests. Please wait a few minutes before trying again.');
      } else if (status === 404 || code === 'EMAIL_NOT_FOUND') {
        setFieldErrors({ email: 'No account found with that email address.' });
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify code + set new password ───────────────────────────────
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    const errs = {};
    if (!code || code.length !== 6)
      errs.code = 'Enter the full 6-digit code.';
    if (!newPassword)
      errs.newPassword = 'New password is required.';
    else if (getPasswordStrength(newPassword).score < 3)
      errs.newPassword = 'Password must be at least medium strength.';
    if (!confirmPassword)
      errs.confirmPassword = 'Please confirm your password.';
    else if (newPassword !== confirmPassword)
      errs.confirmPassword = 'Passwords do not match.';
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', {
        email       : email.trim().toLowerCase(),
        code        : code.trim(),
        newPassword : newPassword,
      });
      setStep('done');
    } catch (err) {
      const msg    = err.response?.data?.error || '';
      const status = err.response?.status;
      if (status === 429) {
        setError('Too many attempts. Please wait before trying again.');
      } else if (status === 400 && msg.toLowerCase().includes('expired')) {
        setError('Reset code has expired. Please request a new one.');
      } else if (status === 400) {
        setError('Invalid or expired reset code. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Resend code ──────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    clearMessages();
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email: email.trim().toLowerCase() });
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait before resending.');
        setResendCooldown(60);
        setLoading(false);
        return;
      }
    } finally {
      setLoading(false);
    }
    setCode('');
    setSuccess('A new reset code has been sent to your email.');
    setResendCooldown(60);
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="verification-modal-overlay fp-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Forgot Password"
      onClick={e => { if (e.target.classList.contains('fp-overlay')) onClose(); }}
    >
      <div className="verification-modal fp-modal">

        {/* ══ DONE ══════════════════════════════════════════════════════ */}
        {step === 'done' && (
          <div className="fp-done">
            <div className="fp-done-icon" aria-hidden="true">🤠</div>
            <h2>Password Reset!</h2>
            <p>
              Your password has been updated successfully.<br />
              You can now sign in with your new password.
            </p>
            <button className="btn-verify" onClick={onClose}>
              Back to Sign In
            </button>
          </div>
        )}

        {/* ══ EMAIL STEP ════════════════════════════════════════════════ */}
        {step === 'email' && (
          <>
            <div className="verification-header">
              <div className="fp-icon" aria-hidden="true">🔑</div>
              <h2>Forgot Password?</h2>
              <p>Enter your email and we'll send you a reset code.</p>
            </div>

            <form onSubmit={handleEmailSubmit} className="verification-form" noValidate>
              {error   && <div className="verification-error" role="alert">❌ {error}</div>}
              {success && <div className="verification-success" role="status">✅ {success}</div>}

              <div className="fp-field">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setFieldErrors(f => ({ ...f, email: '' })); }}
                  disabled={loading}
                  autoComplete="email"
                  autoFocus
                  aria-invalid={!!fieldErrors.email}
                  className={`fp-email-input${fieldErrors.email ? ' fp-input-error' : ''}`}
                />
                {fieldErrors.email && (
                  <span className="field-error" role="alert">⚠️ {fieldErrors.email}</span>
                )}
              </div>

              <button type="submit" className="btn-verify" disabled={loading}>
                {loading
                  ? <span className="btn-loading"><span className="spinner" aria-hidden="true" /> Sending…</span>
                  : 'Send Reset Code'
                }
              </button>

              <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                Cancel
              </button>
            </form>
          </>
        )}

        {/* ══ CODE + NEW PASSWORD STEP ══════════════════════════════════ */}
        {step === 'code' && (
          <>
            <div className="verification-header">
              <div className="fp-icon" aria-hidden="true">📬</div>
              <h2>Enter Reset Code</h2>
              <p>We sent a 6-digit code to</p>
              <span className="verification-email">{email}</span>
            </div>

            <form onSubmit={handleResetSubmit} className="verification-form" noValidate>
              {error   && <div className="verification-error" role="alert">❌ {error}</div>}
              {success && <div className="verification-success" role="status">✅ {success}</div>}

              {/* 6-digit code boxes — same UX as email verification */}
              <div>
                <div className="code-inputs">
                  {[0,1,2,3,4,5].map(index => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      className={`code-input fp-code-input${fieldErrors.code ? ' fp-input-error' : ''}`}
                      autoComplete="off"
                      value={code[index] || ''}
                      onChange={e => {
                        const val = e.target.value;
                        if (!/^\d*$/.test(val)) return;
                        const chars = code.split('');
                        chars[index] = val;
                        setCode(chars.join(''));
                        setFieldErrors(f => ({ ...f, code: '' }));
                        if (val && index < 5)
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
                {fieldErrors.code && (
                  <span className="field-error" role="alert" style={{ textAlign: 'center', display: 'block', marginTop: '4px' }}>
                    ⚠️ {fieldErrors.code}
                  </span>
                )}
              </div>

              {/* New password */}
              <div className="fp-field">
                <div className="password-wrapper">
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="New password"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setFieldErrors(f => ({ ...f, newPassword: '' })); }}
                    disabled={loading}
                    autoComplete="new-password"
                    aria-invalid={!!fieldErrors.newPassword}
                    style={{ borderColor: fieldErrors.newPassword ? '#d32f2f' : undefined }}
                  />
                  <span className="toggle-password" onClick={() => setShowNew(v => !v)}>
                    {showNew ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {newPassword && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div style={{
                        width      : `${(passwordStrength.score / 5) * 100}%`,
                        height     : '100%',
                        background : passwordStrength.color,
                        transition : 'width 0.2s ease',
                        borderRadius: '4px',
                      }} />
                    </div>
                    <small style={{ color: passwordStrength.color, fontSize: '11px' }}>
                      Strength: {passwordStrength.label}
                    </small>
                  </div>
                )}
                {fieldErrors.newPassword && (
                  <span className="field-error" role="alert">⚠️ {fieldErrors.newPassword}</span>
                )}
              </div>

              {/* Confirm password */}
              <div className="fp-field">
                <div className="password-wrapper">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={e => { setConfirmPw(e.target.value); setFieldErrors(f => ({ ...f, confirmPassword: '' })); }}
                    disabled={loading}
                    autoComplete="new-password"
                    aria-invalid={!!fieldErrors.confirmPassword}
                    style={{ borderColor: fieldErrors.confirmPassword ? '#d32f2f' : undefined }}
                  />
                  <span className="toggle-password" onClick={() => setShowConfirm(v => !v)}>
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {fieldErrors.confirmPassword && (
                  <span className="field-error" role="alert">⚠️ {fieldErrors.confirmPassword}</span>
                )}
              </div>

              <button
                type="submit"
                className="btn-verify"
                disabled={loading || code.length < 6}
              >
                {loading
                  ? <span className="btn-loading"><span className="spinner" aria-hidden="true" /> Resetting…</span>
                  : 'Reset Password'
                }
              </button>

              <button
                type="button"
                className="btn-resend"
                onClick={handleResend}
                disabled={loading || resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend Code'}
              </button>

              <button
                type="button"
                className="btn-cancel"
                onClick={() => { setStep('email'); setCode(''); clearMessages(); }}
                disabled={loading}
              >
                ← Use a different email
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordModal;