import React, { useState, useEffect } from 'react';
import { fetchWatchlist, acknowledgeChanges } from '../api';

function Watchlist({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acknowledging, setAcknowledging] = useState(false);
  const [acknowledgedSuccess, setAcknowledgedSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const result = await fetchWatchlist(userId);
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleAcknowledge = async () => {
    setAcknowledging(true);
    await acknowledgeChanges(userId);
    setAcknowledging(false);
    setAcknowledgedSuccess(true);
    setTimeout(() => {
      setAcknowledgedSuccess(false);
      loadData();
    }, 1500);
  };

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading market intelligence...</div>;
  if (!data) return <div style={{ color: 'var(--accent-red)', padding: '2rem' }}>Failed to connect to Pulse backend.</div>;

  // FIRST VISIT STATE
  if (data.is_first_visit) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="summary-card" style={{ padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
          <h2 style={{ margin: '0 0 1rem 0' }}>Your watchlist is ready.</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
            We'll remember what you see today and highlight meaningful changes when you return. No noise, just what matters.
          </p>
          {acknowledgedSuccess ? (
            <div style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Baseline created ✓</div>
          ) : (
            <button onClick={handleAcknowledge} style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
              Create My Baseline
            </button>
          )}
        </div>
      </div>
    );
  }

  const meaningfulStocks = data.watchlist.filter(s => s.meaningful_change);
  const topStock = meaningfulStocks.length > 0 ? meaningfulStocks[0] : data.watchlist[0];
  const restOfStocks = meaningfulStocks.length > 0 ? meaningfulStocks.slice(1) : data.watchlist.slice(1);

  // NO CHANGE STATE
  if (data.meaningful_count === 0) {
    return (
      <div>
        <div className="summary-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-green)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-green)' }}>Your watchlist looks stable.</h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Nothing significant changed since your last visit. All {data.watchlist.length} monitored stocks remained within your attention thresholds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* MARKET BRIEF */}
      <div className="summary-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-cyan)', backgroundColor: '#131b2e' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Your Market Brief</div>
        <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5' }}>
          {data.market_brief}
        </p>
      </div>

      {/* HERO SECTION: SINCE YOU LAST CHECKED */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.4rem' }}>Since you last checked</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            We found {data.meaningful_count} meaningful changes in your watchlist. Last checked: {new Date(data.last_seen_timestamp).toLocaleString()}
          </p>
        </div>
        
        <div>
          {acknowledgedSuccess ? (
            <span style={{ color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '0.9rem' }}>Baseline updated ✓</span>
          ) : (
            <button onClick={handleAcknowledge} disabled={acknowledging} style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
              {acknowledging ? 'Updating...' : 'Mark as Reviewed (Update Baseline)'}
            </button>
          )}
        </div>
      </div>

      {/* FEATURED HIGH ATTENTION CARD */}
      {topStock && (
        <div className="summary-card" style={{ marginBottom: '2.5rem', border: '1px solid rgba(56, 189, 248, 0.3)', background: 'linear-gradient(135deg, #131b2e 0%, #1a2642 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{topStock.ticker}</span>
              <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.5rem' }}>{topStock.company_name}</h3>
            </div>
            <span className={`badge badge-${topStock.attention_level.toLowerCase()}`}>
              {topStock.attention_level.toUpperCase()} ATTENTION
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CURRENT PRICE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>₹{topStock.current_price.toFixed(2)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SINCE LAST VISIT</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }} className={topStock.price_change_since_last_seen < 0 ? 'text-red' : 'text-green'}>
                {topStock.price_change_since_last_seen > 0 ? '+' : ''}{topStock.price_change_since_last_seen}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LAST SEEN</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>₹{topStock.last_seen_price.toFixed(2)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TRADING VOLUME</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{topStock.volume_ratio}× normal</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-cyan)', marginBottom: '0.3rem' }}>WHY THIS DESERVES ATTENTION</div>
            <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {topStock.explanation}
            </p>
          </div>
        </div>
      )}

      {/* OTHER MEANINGFUL CHANGES */}
      {restOfStocks.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Other meaningful changes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {restOfStocks.map(stock => (
              <div key={stock.ticker} className="summary-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem' }}>
                <div>
                  <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {stock.company_name} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stock.ticker}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {stock.explanation}
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>₹{stock.current_price.toFixed(2)}</div>
                    <div className={stock.price_change_since_last_seen < 0 ? 'text-red' : 'text-green'} style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                      {stock.price_change_since_last_seen > 0 ? '+' : ''}{stock.price_change_since_last_seen}%
                    </div>
                  </div>
                  <span className={`badge badge-${stock.attention_level.toLowerCase()}`}>
                    {stock.attention_level.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Watchlist;