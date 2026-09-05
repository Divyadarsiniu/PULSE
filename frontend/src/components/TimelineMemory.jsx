import React, { useState, useEffect } from 'react';
import { fetchWatchlist } from '../api';

function TimelineMemory({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const result = await fetchWatchlist(userId);
      setData(result);
      setLoading(false);
    }
    loadData();
  }, [userId]);

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading history...</div>;
  if (!data) return <div style={{ padding: '2rem' }}>Failed to retrieve data.</div>;

  const lastCheckedDate = data.is_first_visit ? "No previous visit recorded" : new Date(data.last_seen_timestamp).toLocaleString();

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="header">
        <h1>Your Market History</h1>
        <p>Review your previous baseline snapshot and the evolution of your watchlist.</p>
      </div>

      <div className="summary-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Last Visit Baseline</div>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{lastCheckedDate}</h3>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          This is the market reference point saved from your previous session. All movements on your home dashboard are measured strictly against this timestamp.
        </p>
      </div>

      <div className="summary-card">
        <h3 style={{ margin: '0 0 1rem 0' }}>Memory Anchor Details (Technical Inspection)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.watchlist.map(stock => (
            <div key={stock.ticker} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div>
                <strong>{stock.ticker}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({stock.company_name})</span>
              </div>
              <div style={{ fontFamily: 'monospace' }}>
                Stored Baseline: ₹{stock.last_seen_price.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TimelineMemory;