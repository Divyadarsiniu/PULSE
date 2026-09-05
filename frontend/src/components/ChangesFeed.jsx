import React, { useState, useEffect } from 'react';
import { fetchWatchlist } from '../api';

export default function ChangesFeed({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setData(await fetchWatchlist(userId));
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading intelligence feed...</div>;
  if (!data) return <div className="text-red">Failed to connect to backend.</div>;

  const meaningful = data.stocks.filter(s => s.meaningful_change);

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>What Changed</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Meaningful movements detected since your previous observations.</p>
      
      {meaningful.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>No meaningful changes detected.</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {meaningful.map(stock => (
            <div key={stock.ticker} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0 }}>{stock.company_name}</h2>
                  <span style={{ color: 'var(--text-muted)' }}>{stock.ticker}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 className={stock.price_change_since_last_visit < 0 ? 'text-red' : 'text-green'} style={{ margin: 0 }}>
                    {stock.price_change_since_last_visit > 0 ? '+' : ''}{stock.price_change_since_last_visit}%
                  </h2>
                  <span className={`badge badge-${stock.attention_level.toLowerCase()}`}>{stock.attention_level.toUpperCase()}</span>
                </div>
              </div>
              <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem' }}>{stock.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}