import React, { useState, useEffect } from 'react';
import { fetchWatchlist, acknowledgeChanges, searchStocks, addStockToWatchlist } from '../api';

// Time calculator now accepts the live ticking clock
function timeAgo(dateString, currentTime) {
  if (!dateString || dateString === 'None' || dateString === 'null') return "Just now";
  
  const date = new Date(dateString);
  if (isNaN(date)) return "Just now"; 
  
  const seconds = Math.floor((currentTime - date) / 1000);

  if (seconds < 0 || seconds < 60) return "Just now";
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  if (days < 30) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? 's' : ''} ago`;
}

export default function Home({ userId, userName, lastCheckedAt }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewed, setReviewed] = useState(false);
  const [now, setNow] = useState(new Date()); // LIVE CLOCK STATE
  
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [adding, setAdding] = useState(false);

  // TICK THE CLOCK EVERY 10 SECONDS
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(interval);
  }, []);

  const load = async () => { setLoading(true); setData(await fetchWatchlist(userId)); setLoading(false); };
  useEffect(() => { load(); }, [userId]);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQ(q);
    if (q.length > 1) setSearchResults(await searchStocks(q));
    else setSearchResults([]);
  };

  const handleAdd = async (ticker) => {
    setAdding(true);
    await addStockToWatchlist(userId, ticker);
    setSearchQ('');
    setSearchResults([]);
    await load();
    setAdding(false);
  };

  const handleReview = async () => {
    await acknowledgeChanges(userId);
    setReviewed(true);
    setTimeout(() => { setReviewed(false); load(); }, 1500);
  };

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading your market intelligence...</div>;
  if (!data) return <div className="text-red">We couldn't update your market data. <button onClick={load}>Retry</button></div>;

  // Pass the live ticking clock into the calculator
  const lastCheckedStr = timeAgo(lastCheckedAt, now);
  
  let daysAway = 0;
  if (lastCheckedAt && lastCheckedAt !== 'None' && lastCheckedAt !== 'null') {
    const dateObj = new Date(lastCheckedAt);
    if (!isNaN(dateObj)) {
      daysAway = Math.floor((now - dateObj) / (1000 * 60 * 60 * 24));
    }
  }
  
  const welcomeMessage = daysAway > 0 
    ? `You were away for ${daysAway} day${daysAway > 1 ? 's' : ''}. Here's what changed.`
    : "Here's what changed since you last checked.";

  const SearchComponent = () => (
    <div style={{ position: 'relative', marginBottom: '2rem', maxWidth: '600px' }}>
      <input type="text" placeholder="Search stocks, companies or tickers to start monitoring..." value={searchQ} onChange={handleSearch} style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--accent-cyan)' }} />
      {searchResults.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '0 0 8px 8px', zIndex: 10, maxHeight: '300px', overflowY: 'auto' }}>
          {searchResults.map(res => (
            <div key={res.ticker} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontWeight: '600' }}>{res.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>{res.ticker}</span></div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>₹{res.current_price.toFixed(2)} <span className={res.today_change < 0 ? 'text-red' : 'text-green'} style={{ marginLeft: '0.5rem' }}>{res.today_change > 0 ? '+' : ''}{res.today_change}% today</span></div>
              </div>
              <button onClick={() => handleAdd(res.ticker)} disabled={adding} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>+ Add to Watchlist</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (data.stocks.length === 0) {
    return (
      <div>
        <h1 style={{ marginBottom: '0.2rem' }}>Welcome back, {userName.split(' ')[0]}.</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Start building your watchlist to monitor meaningful market changes.</p>
        <SearchComponent />
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', borderStyle: 'dashed' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>Your watchlist is empty.</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Add your first stock above to create a baseline.</p>
        </div>
      </div>
    );
  }

  const meaningful = data.stocks.filter(s => s.meaningful_change);
  const featured = meaningful.find(s => s.attention_level === 'High') || meaningful[0];
  const others = meaningful.filter(s => s.ticker !== featured?.ticker);

  return (
    <div>
      <SearchComponent />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome back, {userName.split(' ')[0]}.</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>{welcomeMessage}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Last checked · {lastCheckedStr}
          </p>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
          {data.source_meta.status} · Updated {new Date(data.source_meta.timestamp).toLocaleTimeString()}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
        <div className="card"><h3>Watchlist</h3><div style={{ fontSize: '1.5rem' }}>{data.stocks.length} stocks</div></div>
        <div className="card"><h3>Meaningful</h3><div style={{ fontSize: '1.5rem' }}>{data.meaningful_changes} detected</div></div>
        <div className="card"><h3>High Attention</h3><div style={{ fontSize: '1.5rem', color: 'var(--accent-red)' }}>{data.high_attention}</div></div>
        <div className="card"><h3>Medium</h3><div style={{ fontSize: '1.5rem', color: 'var(--accent-amber)' }}>{data.medium_attention}</div></div>
      </div>

      {meaningful.length === 0 ? (
        <div className="card" style={{ borderLeft: '4px solid var(--accent-green)' }}>
          <h2 className="text-green">Your watchlist looks stable.</h2>
          <p style={{ color: 'var(--text-muted)' }}>Nothing significant changed since your last visit. All {data.stocks.length} watched stocks remained within your attention thresholds.</p>
        </div>
      ) : (
        <>
          <h2 style={{ marginBottom: '1.5rem' }}>Since you last checked</h2>
          {featured && (
            <div className="card hero-card" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <h1 style={{ margin: 0 }}>{featured.company_name}</h1>
                  <span style={{ color: 'var(--text-muted)' }}>{featured.ticker}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h1 className={featured.price_change_since_last_visit < 0 ? 'text-red' : 'text-green'}>
                    {featured.price_change_since_last_visit > 0 ? '+' : ''}{featured.price_change_since_last_visit}%
                  </h1>
                  <span className={`badge badge-${featured.attention_level.toLowerCase()}`}>{featured.attention_level.toUpperCase()} ATTENTION</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <div><h3>Last Seen</h3><div>₹{featured.last_seen_price.toFixed(2)}</div></div>
                <div><h3>Current</h3><div>₹{featured.current_price.toFixed(2)}</div></div>
                <div><h3>Change</h3><div className={featured.price_change_since_last_visit < 0 ? 'text-red' : 'text-green'}>{featured.price_change_since_last_visit}%</div></div>
                <div><h3>Volume</h3><div>{featured.volume_ratio}× normal</div></div>
              </div>
              <div>
                <h3 className="text-cyan">Why this caught your attention</h3>
                <p style={{ margin: 0 }}>{featured.explanation}</p>
              </div>
            </div>
          )}

          {others.length > 0 && (
            <div style={{ marginBottom: '3rem' }}>
              <h3>Other meaningful changes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {others.map(s => (
                  <div key={s.ticker} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{s.company_name} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.ticker}</span></div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.explanation}</div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', gap: '2rem', alignItems: 'center' }}>
                      <div className={s.price_change_since_last_visit < 0 ? 'text-red' : 'text-green'} style={{ fontWeight: 'bold' }}>
                        {s.price_change_since_last_visit > 0 ? '+' : ''}{s.price_change_since_last_visit}%
                      </div>
                      <span className={`badge badge-${s.attention_level.toLowerCase()}`}>{s.attention_level.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-main)' }}>
            <div>
              <h2 style={{ margin: 0 }}>Reviewed everything?</h2>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Your current market state will become your new baseline.</p>
            </div>
            <button onClick={handleReview} disabled={reviewed}>
              {reviewed ? 'Baseline updated ✓' : 'Mark as Reviewed'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}