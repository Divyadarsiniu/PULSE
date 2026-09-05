import React, { useState, useEffect } from 'react';
import { fetchPreferences, updatePreferences } from '../api';

function UserProfile({ currentUser, onSwitchUser }) {
  const [priceThresh, setPriceThresh] = useState(3.0);
  const [volThresh, setVolThresh] = useState(2.5);
  const [zThresh, setZThresh] = useState(2.0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadPrefs() {
      const prefs = await fetchPreferences(currentUser.id);
      if (prefs) {
        setPriceThresh(prefs.price_threshold);
        setVolThresh(prefs.volume_threshold);
        setZThresh(prefs.z_score_threshold);
      }
    }
    loadPrefs();
  }, [currentUser.id]);

  const handleSave = async (e) => {
    e.preventDefault();
    await updatePreferences(currentUser.id, {
      price_threshold: parseFloat(priceThresh),
      volume_threshold: parseFloat(volThresh),
      z_score_threshold: parseFloat(zThresh)
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="header">
        <h1>Attention Preferences</h1>
        <p>Configure when market movements are considered meaningful for your personal intelligence feed.</p>
      </div>

      <div className="summary-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>When should Pulse get my attention?</h3>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
              Minimum Price Movement Threshold (%):
            </label>
            <input 
              type="number" step="0.1" 
              value={priceThresh} 
              onChange={(e) => setPriceThresh(e.target.value)}
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Changes below this percentage since your last visit are classified as normal noise.</span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
              Unusual Volume Multiplier (×):
            </label>
            <input 
              type="number" step="0.1" 
              value={volThresh} 
              onChange={(e) => setVolThresh(e.target.value)}
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trading volume exceeding this multiple of the 20-day average triggers attention.</span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
              Statistical Sensitivity (Z-Score σ):
            </label>
            <input 
              type="number" step="0.1" 
              value={zThresh} 
              onChange={(e) => setZThresh(e.target.value)}
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standard deviation threshold for structural regime change detection.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="submit">Save Preferences</button>
            {saved && <span style={{ color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '0.85rem' }}>Preferences updated ✓</span>}
          </div>
        </form>
      </div>

      {/* THRESHOLD PREVIEW */}
      <div className="summary-card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Live Threshold Preview</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          With your current settings, an asset movement of <strong>≥ {priceThresh}%</strong> and volume of <strong>≥ {volThresh}×</strong> will automatically be classified as <strong>HIGH ATTENTION</strong>.
        </p>
      </div>
    </div>
  );
}

export default UserProfile;