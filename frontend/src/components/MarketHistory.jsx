import React, { useState, useEffect } from 'react';
import { fetchWatchlist, fetchHistory } from '../api';

export default function MarketHistory({ userId }) {
  const [data, setData] = useState(null);
  const [historyEvents, setHistoryEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [wList, hist] = await Promise.all([fetchWatchlist(userId), fetchHistory(userId)]);
      setData(wList);
      setHistoryEvents(hist);
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading market history...</div>;
  if (!data) return <div className="text-red">Failed to connect to backend.</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Market History</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Review your previous baseline snapshot and the evolution of your watchlist.</p>

      {data.stocks.length === 0 ? (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 className="text-cyan">Memory Anchor</h3>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>No baseline created yet. Your baseline will appear here once you add stocks to your watchlist.</p>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <h3 className="text-cyan">Current Memory Anchor</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Last reviewed: {new Date(data.last_checked).toLocaleString()} · {data.stocks.length} stocks monitored</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {data.stocks.map(s => (
              <div key={s.ticker} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <div><strong style={{ fontSize: '0.9rem' }}>{s.ticker}</strong></div>
                <div style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>Baseline: ₹{s.last_seen_price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 style={{ marginBottom: '1.5rem' }}>Since Your Last Review (Audit Trail)</h2>
      {historyEvents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
          <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>No market history yet.</h3>
          <p style={{ color: 'var(--text-muted)' }}>Your market history will appear after you start monitoring stocks.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {historyEvents.map((ev, i) => (
            <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.2rem' }}>{new Date(ev.timestamp).toLocaleString()}</div>
                <div style={{ fontWeight: '600' }}>{ev.company_name} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{ev.ticker}</span></div>
                
                {ev.event_type === 'STOCK_ADDED' && <div style={{ fontSize: '0.9rem', marginTop: '0.3rem', color: 'var(--accent-cyan)' }}>Added to Watchlist</div>}
                {ev.event_type === 'STOCK_REMOVED' && <div style={{ fontSize: '0.9rem', marginTop: '0.3rem', color: 'var(--text-muted)' }}>Removed from Watchlist</div>}
                {ev.event_type === 'BASELINE_CREATED' && <div style={{ fontSize: '0.9rem', marginTop: '0.3rem', color: 'var(--accent-green)' }}>Initial Baseline Established at ₹{ev.details.price.toFixed(2)}</div>}
                {ev.event_type === 'BASELINE_UPDATED' && <div style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>Baseline updated: ₹{ev.details.old_price.toFixed(2)} → ₹{ev.details.new_price.toFixed(2)}</div>}
                {ev.event_type === 'MEANINGFUL_CHANGE' && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                    <div className={ev.details.price_change < 0 ? 'text-red' : 'text-green'} style={{ fontWeight: 'bold' }}>{ev.details.price_change > 0 ? '+' : ''}{ev.details.price_change}%</div>
                    <div style={{ color: 'var(--text-muted)' }}>{ev.details.volume_ratio}× volume</div>
                  </div>
                )}
              </div>
              {ev.event_type === 'MEANINGFUL_CHANGE' && (
                <div><span className={`badge badge-${ev.details.attention_level.toLowerCase()}`}>{ev.details.attention_level.toUpperCase()} ATTENTION</span></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}