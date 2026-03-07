import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

// ─── Constants ────────────────────────────────────────────────────────────────

const RESEND_COOLDOWN_SECONDS = 60;
const CODE_LENGTH = 6;

// ─── EmailVerificationModal ───────────────────────────────────────────────────
// Visually and behaviorally mirrors ForgotPasswordModal.
// Props:
//   email        — the email address to verify
//   onVerified   — called with (email, password) after successful verification
//   onCancel     — called when user cancels (deletes unverified account)
//   password     — needed for auto-login after verification

const EmailVerificationModal = ({ email, password, onVerified, onCancel }) => {
  // step: 'verify' → 'done'
  const [step,           setStep]          = useState('verify');
  const [code,           setCode]          = useState('');
  const [loading,        setLoading]       = useState(false);
  const [error,          setError]         = useState('');
  const [success,        setSuccess]       = useState('');
  const [fieldError,     setFieldError]    = useState('');
  const [resendCooldown, setResendCooldown]= useState(0);

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

  // ── Auto-focus first code box on mount ───────────────────────────────────
  useEffect(() => {
    setTimeout(() => document.querySelector('.ev-code-input')?.focus(), 120);
  }, []);

  // ── Close on Escape — only calls onCancel if user confirms ───────────────
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') handleCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const clearMessages = () => { setError(''); setSuccess(''); setFieldError(''); };

  // ── Verify code ──────────────────────────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!code || code.length !== CODE_LENGTH) {
      setFieldError('Please enter the full 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/verify', {
        email: email.trim().toLowerCase(),
        code : code.trim(),
      });
      setStep('done');
    } catch (err) {
      const msg    = err.response?.data?.message || err.response?.data?.error || '';
      const status = err.response?.status;

      if (status === 429) {
        setError('Too many attempts. Please wait before trying again.');
      } else if (msg.toLowerCase().includes('expired')) {
        setError('Verification code has expired. Please request a new one.');
        setCode('');
      } else if (status === 401 || msg.toLowerCase().includes('invalid')) {
        setError('Incorrect code. Please check and try again.');
        setCode('');
        setTimeout(() => document.querySelector('.ev-code-input')?.focus(), 50);
      } else {
        setError('Verification failed. Please try again.');
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
      await api.post('/api/auth/resend', { email: email.trim().toLowerCase() });
      setSuccess('A new code has been sent to your email.');
      setCode('');
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setTimeout(() => document.querySelector('.ev-code-input')?.focus(), 50);
    } catch (err) {
      const status = err.response?.status;
      const wait   = err.response?.data?.retryAfter || RESEND_COOLDOWN_SECONDS;
      if (status === 429) {
        setError(`Please wait ${wait} seconds before resending.`);
        setResendCooldown(wait);
      } else {
        setError(err.response?.data?.error || 'Failed to resend code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Cancel — confirm then delete unverified account ──────────────────────
  const handleCancel = useCallback(async () => {
    if (!window.confirm('Cancel registration? Your unverified account will be deleted.')) return;
    setLoading(true);
    try {
      await api.post('/api/auth/delete-unverified', { email: email.trim().toLowerCase() });
    } catch {
      // Best-effort — proceed with cancel regardless
    } finally {
      setLoading(false);
    }
    onCancel();
  }, [email, onCancel]);

  // ── Code input helpers ───────────────────────────────────────────────────
  const handleCodeChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;
    const chars = code.split('');
    chars[index] = val;
    const next = chars.join('');
    setCode(next);
    setFieldError('');
    if (val && index < CODE_LENGTH - 1)
      e.target.parentElement.children[index + 1]?.focus();
  };

  const handleCodeKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0)
      e.target.parentElement.children[index - 1]?.focus();
  };

  const handleCodePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '');
    if (paste.length === CODE_LENGTH) {
      setCode(paste);
      setFieldError('');
      e.target.parentElement.children[CODE_LENGTH - 1]?.focus();
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="verification-modal-overlay ev-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Email Verification"
      style={{
        display        : 'flex',
        justifyContent : 'center',
        alignItems     : 'center',
        position       : 'fixed',
        top            : 0,
        left           : 0,
        width          : '100vw',
        height         : '100vh',
      }}
    >
      <div className="verification-modal ev-modal">

        {/* ══ DONE ════════════════════════════════════════════════════ */}
        {step === 'done' && (
          <div className="fp-done">
            <div className="fp-done-icon" aria-hidden="true">🤠</div>
            <h2>Account Verified!</h2>
            <p>
              Your email has been verified successfully.<br />
              Welcome to Texas Joe's House of Ribs!
            </p>
            <button
              className="btn-verify"
              onClick={() => onVerified(email, password)}
            >
              Let's Go!
            </button>
          </div>
        )}

        {/* ══ VERIFY STEP ═════════════════════════════════════════════ */}
        {step === 'verify' && (
          <>
            <div className="verification-header">
              <div className="fp-icon" aria-hidden="true">✉️</div>
              <h2>Verify Your Email</h2>
              <p>We've sent a 6-digit code to</p>
              <span className="verification-email">{email}</span>
            </div>

            <form onSubmit={handleVerify} className="verification-form" noValidate>
              {error   && <div className="verification-error"  role="alert">❌ {error}</div>}
              {success && <div className="verification-success" role="status">✅ {success}</div>}

              {/* 6-digit code boxes */}
              <div>
                <div className="code-inputs">
                  {Array.from({ length: CODE_LENGTH }, (_, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      className={`code-input ev-code-input${fieldError ? ' fp-input-error' : ''}`}
                      autoComplete="off"
                      value={code[index] || ''}
                      onChange={e => handleCodeChange(e, index)}
                      onKeyDown={e => handleCodeKeyDown(e, index)}
                      onPaste={handleCodePaste}
                      onFocus={e => e.target.select()}
                      disabled={loading}
                      aria-label={`Digit ${index + 1}`}
                    />
                  ))}
                </div>
                {fieldError && (
                  <span
                    className="field-error"
                    role="alert"
                    style={{ textAlign: 'center', display: 'block', marginTop: '4px' }}
                  >
                    ⚠️ {fieldError}
                  </span>
                )}
              </div>

              {/* Verify button */}
              <button
                type="submit"
                className="btn-verify"
                disabled={loading || code.length < CODE_LENGTH}
              >
                {loading
                  ? <span className="btn-loading"><span className="spinner" aria-hidden="true" /> Verifying…</span>
                  : 'Verify Account'
                }
              </button>

              {/* Resend button */}
              <button
                type="button"
                className="btn-resend"
                onClick={handleResend}
                disabled={loading || resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `Resend Code (${resendCooldown}s)`
                  : 'Resend Code'
                }
              </button>

              {/* Cancel button */}
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel registration
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};

export default EmailVerificationModal;