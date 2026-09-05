import React, { useState } from 'react';
import Home from './components/Home';
import ManageWatchlist from './components/ManageWatchlist';
import ChangesFeed from './components/ChangesFeed';
import MarketHistory from './components/MarketHistory';
import AttentionPreferences from './components/AttentionPreferences';
import Login from './components/Login';
import './index.css';

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('pulse_user')));
  const [activeTab, setActiveTab] = useState('home');

  const handleLogin = (u) => { setUser(u); localStorage.setItem('pulse_user', JSON.stringify(u)); };
  const handleLogout = () => { setUser(null); localStorage.removeItem('pulse_user'); };

  if (!user) return <Login onLogin={handleLogin} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home userId={user.id} userName={user.name} />;
      case 'watchlist': return <ManageWatchlist userId={user.id} />;
      case 'changes': return <ChangesFeed userId={user.id} />;
      case 'history': return <MarketHistory userId={user.id} />;
      case 'settings': return <AttentionPreferences userId={user.id} />;
      default: return <Home userId={user.id} userName={user.name} />;
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