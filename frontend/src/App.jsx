import React, { useState } from 'react';
import Home from './components/Home';
import ManageWatchlist from './components/ManageWatchlist';
import ChangesFeed from './components/ChangesFeed';
import MarketHistory from './components/MarketHistory';
import AttentionPreferences from './components/AttentionPreferences';
import Login from './components/Login';
import LandingPage from './pages/LandingPage';
import './index.css';

export default function App() {
  // SELF-HEALING CACHE
  const [user, setUser] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem('pulse_user'));
    if (storedUser && (!storedUser.last_checked_at || storedUser.last_checked_at === 'None')) {
      storedUser.last_checked_at = new Date().toISOString();
      localStorage.setItem('pulse_user', JSON.stringify(storedUser));
    }
    return storedUser;
  });
  
  const [activeTab, setActiveTab] = useState('home');
  // FIXED: Using showAuth for the single "Get Started" button
  const [showAuth, setShowAuth] = useState(false); 

  const handleLogin = (u) => { 
    setUser(u); 
    localStorage.setItem('pulse_user', JSON.stringify(u)); 
  };
  
  const handleLogout = () => { 
    setUser(null); 
    localStorage.removeItem('pulse_user'); 
    setShowAuth(false); 
  };

  if (!user) {
    if (showAuth) {
      // User clicked Get Started, show the login/signup screen
      return <Login onLogin={handleLogin} defaultView="signup" onBack={() => setShowAuth(false)} />;
    }
    // FIXED: Properly passing onGetStarted to match your LandingPage.jsx!
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home userId={user.id} userName={user.name} lastCheckedAt={user.last_checked_at} />;
      case 'watchlist': return <ManageWatchlist userId={user.id} />;
      case 'changes': return <ChangesFeed userId={user.id} />;
      case 'history': return <MarketHistory userId={user.id} />;
      case 'settings': return <AttentionPreferences userId={user.id} />;
      default: return <Home userId={user.id} userName={user.name} lastCheckedAt={user.last_checked_at} />;
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">PULSE<span>Know what changed.</span></div>
        <nav style={{ flex: 1 }}>
          {['home', 'watchlist', 'changes', 'history'].map(t => (
            <div key={t} className={`nav-item ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </div>
          ))}
          <div style={{ margin: '2rem 0', height: '1px', background: 'var(--border-color)' }} />
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</div>
        </nav>
        <div>
          <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>{user.email}</div>
          <button className="secondary" style={{ width: '100%', padding: '0.5rem', color: 'var(--accent-red)' }} onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className="main-content">{renderContent()}</main>
    </div>
  );
}