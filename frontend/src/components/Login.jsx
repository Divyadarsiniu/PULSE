import React, { useState } from 'react';
import { loginUser, registerUser } from '../api';

export default function Login({ onLogin, defaultView = 'login', onBack }) {
  const [isLogin, setIsLogin] = useState(defaultView === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      let userData;
      if (isLogin) {
        userData = await loginUser(email, password);
      } else {
        userData = await registerUser(name, email, password);
      }
      
      // CRITICAL FIX: We are passing the FULL userData object here. 
      // Do NOT do onLogin({ id: userData.id, email: userData.email }) because that deletes the timestamp!
      onLogin(userData); 
      
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        {onBack && (
          <button onClick={onBack} style={{ marginBottom: '1.5rem', border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}>
            ← Back to Home
          </button>
        )}
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, letterSpacing: '2px', fontSize: '1.8rem' }}>PULSE</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Know what changed. Know what matters.</p>
        </div>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(255, 68, 68, 0.1)', color: 'var(--accent-red)', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(255, 68, 68, 0.2)' }}>
            ⚠️ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'white', fontSize: '1rem' }} />
            </div>
          )}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'white', fontSize: '1rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'white', fontSize: '1rem' }} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontWeight: 'bold', fontSize: '1rem', backgroundColor: 'var(--accent-cyan)', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In to Terminal' : 'Create Terminal Account')}
          </button>
        </form>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>Forgot password?</span>
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}>
            {isLogin ? 'Create Account' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}