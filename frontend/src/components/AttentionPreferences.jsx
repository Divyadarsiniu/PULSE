import React, { useState, useEffect } from 'react';
import { fetchPreferences, updatePreferences } from '../api';

export default function AttentionPreferences({ userId }) {
  const [prefs, setPrefs] = useState({ price_threshold: 3.0, volume_threshold: 2.5, z_score_threshold: 2.0 });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchPreferences(userId).then(p => { if(p) setPrefs(p); });
  }, [userId]);

  const handleSave = async (e) => {
    e.preventDefault();
    await updatePreferences(userId, prefs);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 style={{ marginBottom: '0.5rem' }}>Attention Preferences</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>These settings control when a market movement is considered meaningful for your watchlist.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem' }}>When should Pulse get my attention?</h2>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price movement threshold (%)</label>
              <input type="number" step="0.1" value={prefs.price_threshold} onChange={e => setPrefs({...prefs, price_threshold: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Volume activity threshold (×)</label>
              <input type="number" step="0.1" value={prefs.volume_threshold} onChange={e => setPrefs({...prefs, volume_threshold: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Statistical deviation threshold (σ)</label>
              <input type="number" step="0.1" value={prefs.z_score_threshold} onChange={e => setPrefs({...prefs, z_score_threshold: parseFloat(e.target.value)})} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button type="submit">Save Preferences</button>
              {saved && <span className="text-green">Settings saved ✓</span>}
            </div>
          </form>
        </div>

        <div className="card" style={{ height: 'fit-content', borderLeft: '4px solid var(--accent-cyan)' }}>
          <h3 className="text-cyan">Your Current Settings</h3>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Price movement:</span> <strong>≥ {prefs.price_threshold}%</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Volume:</span> <strong>≥ {prefs.volume_threshold}×</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Statistical deviation:</span> <strong>≥ {prefs.z_score_threshold}σ</strong></div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '0.85rem' }}>Example Evaluation</h3>
            <p style={{ fontSize: '0.9rem', margin: '0.5rem 0', color: 'var(--text-muted)' }}>If a watched asset moves {parseFloat(prefs.price_threshold) + 1.2}% and trading volume hits {parseFloat(prefs.volume_threshold) + 0.6}× normal, it will be flagged as a meaningful change on your Home feed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}