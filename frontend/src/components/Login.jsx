import React, { useState } from 'react';
import { loginUser, registerUser, resetPassword } from '../api';

function Login({ onLogin }) {
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (view === 'forgot') {
        const response = await resetPassword(email, password);
        setSuccessMsg(response.message);
        setView('login');
        setPassword('');
      } else if (view === 'signup') {
        const userData = await registerUser(name, email, password);
        onLogin(userData);
      } else {
        const userData = await loginUser(email, password);
        onLogin(userData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Processing...';
    if (view === 'forgot') return 'Set New Password';
    if (view === 'signup') return 'Create Terminal Account';
    return 'Sign In to Terminal';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f17', color: '#f8fafc' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '2.5rem', backgroundColor: '#131b2e', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>PULSE</div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
            {view === 'forgot' ? 'Reset your intelligence terminal access.' : 'Know what changed. Know what matters.'}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {view === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '0.3rem' }}>Full Name</label>
              <input 
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0b0f17', border: '1px solid #1e293b', color: '#f8fafc', boxSizing: 'border-box' }}
                placeholder="Divya Darsini"
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '0.3rem' }}>Email Address</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0b0f17', border: '1px solid #1e293b', color: '#f8fafc', boxSizing: 'border-box' }}
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '0.3rem' }}>
              {view === 'forgot' ? 'New Password' : 'Password'}
            </label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0b0f17', border: '1px solid #1e293b', color: '#f8fafc', boxSizing: 'border-box' }}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            style={{ width: '100%', padding: '0.85rem', backgroundColor: '#38bdf8', color: '#0b0f17', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem' }}
          >
            {getButtonText()}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          {view === 'login' ? (
            <>
              <span onClick={() => { setView('forgot'); setError(''); setSuccessMsg(''); }} style={{ color: '#94a3b8', cursor: 'pointer' }}>
                Forgot password?
              </span>
              <span onClick={() => { setView('signup'); setError(''); setSuccessMsg(''); }} style={{ color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer' }}>
                Create Account
              </span>
            </>
          ) : (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <span onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }} style={{ color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer' }}>
                ← Back to Login
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Login;