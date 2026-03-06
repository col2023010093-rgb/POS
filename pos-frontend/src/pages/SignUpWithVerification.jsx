import React, { useState } from 'react';
import api from '../api';  // ← Use configured API client instead of axios

export default function SignUpWithVerification() {
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', phone: '', confirmPassword: ''
  });
  const [step, setStep] = useState('register'); // 'register' | 'verify' | 'done'
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/register', form);  // ← Changed from axios to api
      setEmail(form.email);
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration error');
    }
    setLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/verify', { email, code });  // ← Changed from axios to api
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification error');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/resend', { email });  // ← Changed from axios to api
      setError('A new code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Resend error');
    }
    setLoading(false);
  };

  return (
    <div>
      {step === 'register' && (
        <form onSubmit={handleRegister}>
          <input type="email" name="email" required placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input type="text" name="firstName" required placeholder="First Name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
          <input type="text" name="lastName" required placeholder="Last Name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
          <input type="tel" name="phone" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <input type="password" name="password" required placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <input type="password" name="confirmPassword" required placeholder="Confirm Password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
          <button type="submit" disabled={loading}>Register</button>
          {error && <div style={{ color: 'red', marginTop: '8px' }}>{error}</div>}
        </form>
      )}

      {step === 'verify' && (
        <div className="modal" style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#fff', padding: '32px', borderRadius: '12px', minWidth: '320px', boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
          }}>
            <h2>Email Verification</h2>
            <p>Enter the 6-digit code sent to <b>{email}</b></p>
            <form onSubmit={handleVerify}>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                maxLength={6}
                required
                style={{ letterSpacing: '4px', fontSize: '18px', textAlign: 'center', marginBottom: '12px' }}
                placeholder="Enter code"
              />
              <button type="submit" disabled={loading} style={{ width: '100%' }}>Verify</button>
            </form>
            <button onClick={handleResend} disabled={loading} style={{ marginTop: '12px', width: '100%' }}>Resend Code</button>
            {error && <div style={{ color: 'red', marginTop: '8px' }}>{error}</div>}
          </div>
        </div>
      )}

      {step === 'done' && (
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <h2>Account Created!</h2>
          <p>Your email has been verified and your account is now active.</p>
        </div>
      )}
    </div>
  );
}