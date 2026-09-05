import React, { useState, useEffect } from 'react';
import { fetchWatchlist, removeStockFromWatchlist } from '../api';

export default function ManageWatchlist({ userId }) {
  const [trackedStocks, setTrackedStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWatchlist = async () => {
    setLoading(true);
    const data = await fetchWatchlist(userId);
    if (data && data.stocks) setTrackedStocks(data.stocks);
    setLoading(false);
  };
  useEffect(() => { loadWatchlist(); }, [userId]);

  const handleRemove = async (ticker) => {
    await removeStockFromWatchlist(userId, ticker);
    await loadWatchlist();
  };

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading watchlist...</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>My Watchlist</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Stocks you're monitoring for meaningful changes.</p>

      {trackedStocks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
          <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>Your watchlist is empty.</h3>
          <p style={{ color: 'var(--text-muted)' }}>Use the Home dashboard to search and add stocks.</p>
        </div>
      ) : (
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Monitored Assets ({trackedStocks.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {trackedStocks.map(stock => (
              <div key={stock.ticker} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '1rem' }}>{stock.ticker}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stock.company_name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <span style={{ fontWeight: '600' }}>₹{stock.current_price.toFixed(2)}</span>
                  <button onClick={() => handleRemove(stock.ticker)} className="secondary" style={{ color: 'var(--accent-red)', padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: 'rgba(239, 68, 68, 0.3)' }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}