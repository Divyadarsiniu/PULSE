import React, { useEffect, useState } from 'react';
import './LandingPage.css';

export default function LandingPage({ onGetStarted }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="pulse-lp">
      {/* NAVIGATION */}
      <nav className="pulse-lp-nav">
        <div className="pulse-lp-logo">PULSE</div>
        <div className="pulse-lp-nav-links">
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works'); }}>How it works</a>
          <a href="#detection" onClick={(e) => { e.preventDefault(); scrollTo('detection'); }}>Detection</a>
          <a href="#why-pulse" onClick={(e) => { e.preventDefault(); scrollTo('why-pulse'); }}>Why PULSE</a>
        </div>
        <div className="pulse-lp-nav-actions">
          <button onClick={onGetStarted} className="pulse-lp-btn-primary">Get Started</button>
        </div>
      </nav>

      {/* SECTION 1 — HERO */}
      <section className="pulse-lp-hero">
        <div className="pulse-lp-hero-grid">
          <div>
            <div className="pulse-lp-hero-eyebrow">SMART MARKET WATCHLIST</div>
            <h1>Know what changed.</h1>
            <h2>Your watchlist remembers what you saw — and tells you what deserves your attention when you return.</h2>
            <p>
              PULSE tracks meaningful changes in the stocks you care about, compares them with your last reviewed state, and explains what moved.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={onGetStarted} className="pulse-lp-btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>Get Started</button>
              <button onClick={() => scrollTo('how-it-works')} className="pulse-lp-btn-ghost" style={{ border: '1px solid #333' }}>See How It Works</button>
            </div>
          </div>
          
          <div className="pulse-lp-hero-panel">
            <div className="pulse-panel-header">
              <div>
                <div className="pulse-panel-ticker">HDFCBANK</div>
                <div className="pulse-panel-price">₹1,612.40</div>
                <div className="pulse-panel-change">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M23 18l-9-9-4 4-8-8"/></svg>
                  -5.18%
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>ATTENTION</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff8800' }}>87 <span style={{fontSize:'1rem', color:'#555'}}>/ 100</span></div>
              </div>
            </div>

            <svg width="100%" height="80" viewBox="0 0 300 80" style={{ overflow: 'visible', margin: '1rem 0' }}>
              <path d="M0,20 Q50,20 100,40 T200,30 T300,70" fill="none" stroke="#ff4444" strokeWidth="3" className={animate ? "anim-line" : ""} />
              <circle cx="300" cy="70" r="5" fill="#ff4444" className={animate ? "anim-dot" : ""} />
            </svg>

            <div className="pulse-panel-stats">
              <div className="pulse-stat-box">
                <div className="pulse-stat-label">Volume</div>
                <div className="pulse-stat-val">3.1× avg</div>
              </div>
              <div className="pulse-stat-box">
                <div className="pulse-stat-label">Statistical Shift</div>
                <div className="pulse-stat-val">Z-Score 2.4</div>
              </div>
            </div>
            
            <div className="pulse-alert-badge">
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></div>
              Meaningful change detected
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — THE PROBLEM */}
      <section className="pulse-lp-section bg-alt">
        <div className="pulse-lp-section-inner">
          <div className="pulse-section-header">
            <h2>A watchlist should remember more than your stocks.</h2>
            <p>Traditional watchlists show current prices. Returning users have to mentally reconstruct what changed.</p>
          </div>
          <div className="pulse-compare-grid">
            <div className="pulse-compare-card">
              <h3 style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem', letterSpacing: '1px' }}>TRADITIONAL WATCHLIST</h3>
              <div className="pulse-stock-row"><span>HDFC Bank</span><span style={{color: '#ff4444'}}>-5.18%</span></div>
              <div className="pulse-stock-row"><span>Reliance</span><span style={{color: '#00d09c'}}>+0.80%</span></div>
              <div className="pulse-stock-row"><span>Infosys</span><span style={{color: '#ff4444'}}>-0.40%</span></div>
            </div>
            <div style={{ textAlign: 'center', color: '#888', fontStyle: 'italic', fontSize: '0.9rem' }}>
              "What changed since I last checked?" <br/>→
            </div>
            <div className="pulse-compare-card active">
              <h3 style={{ color: '#00b5ff', marginBottom: '1.5rem', fontSize: '0.9rem', letterSpacing: '1px' }}>PULSE</h3>
              <div style={{ color: '#00d09c', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1rem' }}>✓ 1 meaningful change detected</div>
              <div style={{ padding: '1rem', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: '6px' }}>
                <div style={{ fontWeight: 'bold' }}>HDFC Bank</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: '#ff4444' }}>-5.18% • 3.1× vol</span>
                  <span style={{ color: '#ff8800', fontWeight: 'bold' }}>Attn: 87</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — MEMORY ANCHOR */}
      <section className="pulse-lp-section">
        <div className="pulse-section-header">
          <h2>Your watchlist remembers where you left off.</h2>
          <p>PULSE creates a Memory Anchor when you review your watchlist. New observations are compared against that state.</p>
        </div>
        <div className="pulse-timeline">
          <div className="pulse-timeline-node">
            <div style={{ fontSize: '0.75rem', color: '#888' }}>MON</div>
            <div style={{ fontWeight: 'bold', margin: '0.25rem 0' }}>Memory Anchor</div>
            <div style={{ color: '#00d09c' }}>₹1,700</div>
          </div>
          <div className="pulse-timeline-node">
            <div style={{ fontSize: '0.75rem', color: '#888' }}>WED</div>
            <div style={{ fontWeight: 'bold', margin: '0.25rem 0' }}>Market moves</div>
            <div style={{ fontSize: '0.8rem', color: '#888' }}>Silent tracking</div>
          </div>
          <div className="pulse-timeline-node active">
            <div style={{ fontSize: '0.75rem', color: '#888' }}>THU</div>
            <div style={{ fontWeight: 'bold', margin: '0.25rem 0' }}>User returns</div>
            <div style={{ color: '#ff4444' }}>₹1,612 (-5.18%)</div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — HOW IT WORKS */}
      <section id="how-it-works" className="pulse-lp-section bg-alt">
        <div className="pulse-lp-section-inner">
          <div className="pulse-section-header">
            <h2>From market movement to meaningful insight.</h2>
          </div>
          <div className="pulse-grid-4">
            <div className="pulse-info-card">
              <h3 style={{ color: '#00b5ff' }}>01 — REMEMBER</h3>
              <p>Capture the exact price state when you last reviewed your list.</p>
            </div>
            <div className="pulse-info-card">
              <h3 style={{ color: '#00b5ff' }}>02 — DETECT</h3>
              <p>Find meaningful price, volume, and statistical deviations.</p>
            </div>
            <div className="pulse-info-card">
              <h3 style={{ color: '#00b5ff' }}>03 — RANK</h3>
              <p>Prioritize changes using an algorithmic Attention Score.</p>
            </div>
            <div className="pulse-info-card">
              <h3 style={{ color: '#00b5ff' }}>04 — EXPLAIN</h3>
              <p>Turn mathematical signals into clear human-readable context.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — DETECTION ENGINE */}
      <section id="detection" className="pulse-lp-section">
        <div className="pulse-section-header">
          <h2>Not every movement deserves your attention.</h2>
          <p>PULSE combines multiple signals instead of simply flagging every percentage movement.</p>
        </div>
        <div className="pulse-grid-3">
          <div className="pulse-info-card">
            <h3>PRICE</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00d09c', margin: '1rem 0' }}>+3.8%</div>
            <p>Significant movement from your specific remembered state.</p>
          </div>
          <div className="pulse-info-card">
            <h3>VOLUME</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '30px', margin: '1rem 0' }}>
               <div style={{ width: '8px', background: '#333', height: '30%' }}></div>
               <div style={{ width: '8px', background: '#333', height: '50%' }}></div>
               <div style={{ width: '8px', background: '#333', height: '40%' }}></div>
               <div style={{ width: '8px', background: '#00b5ff', height: '100%' }} className={animate ? "anim-bar" : ""}></div>
            </div>
            <p>Unusual trading activity increases significance.</p>
          </div>
          <div className="pulse-info-card">
            <h3>STATISTICAL SHIFT</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff8800', margin: '1rem 0' }}>Z 2.4</div>
            <p>Movement outside the recent normal algorithmic range.</p>
          </div>
        </div>
      </section>

      {/* SECTION 6 — ATTENTION SCORE */}
      <section className="pulse-lp-section bg-alt">
        <div className="pulse-lp-section-inner">
          <div className="pulse-section-header">
            <h2>Know what deserves your attention.</h2>
            <p>PULSE converts detected events into an Attention Score from 0–100.</p>
          </div>
          
          <div className="pulse-attention-visual">
            <div className="pulse-score-circle">
              <svg width="150" height="150">
                <circle cx="75" cy="75" r="65" fill="none" stroke="#222" strokeWidth="8" />
                <circle cx="75" cy="75" r="65" fill="none" stroke="#ff8800" strokeWidth="8" strokeDasharray="408" strokeDashoffset="53" style={{ transition: 'stroke-dashoffset 2s ease' }} />
              </svg>
              <div className="pulse-score-value">87</div>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#ff8800', letterSpacing: '2px', fontWeight: 'bold', marginBottom: '2rem' }}>HIGH ATTENTION</div>
            
            <div style={{ width: '100%', maxWidth: '300px' }}>
              <div className="pulse-meter-row">
                <span>Price movement</span>
                <div className="pulse-meter-bar"><div className="pulse-meter-fill" style={{ width: '80%', background: '#ff4444' }}></div></div>
              </div>
              <div className="pulse-meter-row">
                <span>Volume</span>
                <div className="pulse-meter-bar"><div className="pulse-meter-fill" style={{ width: '95%', background: '#00b5ff' }}></div></div>
              </div>
              <div className="pulse-meter-row">
                <span>Statistical shift</span>
                <div className="pulse-meter-bar"><div className="pulse-meter-fill" style={{ width: '70%', background: '#00d09c' }}></div></div>
              </div>
            </div>
            <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#777', textAlign: 'center' }}>
              Attention Score is an event-priority signal, not a buy/sell recommendation.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — WHY PULSE / JOURNEY */}
      <section id="why-pulse" className="pulse-lp-section">
        <div className="pulse-section-header">
          <h2>Built around the moment you return.</h2>
        </div>
        <div className="pulse-grid-3">
          <div className="pulse-info-card">
            <h3 style={{ color: '#fff' }}>01 / Add a stock</h3>
            <p>You add HDFC Bank to your watchlist. PULSE logs the initial price anchor.</p>
          </div>
          <div className="pulse-info-card">
            <h3 style={{ color: '#fff' }}>02 / Leave and return</h3>
            <p>Two days later, you return. The market has moved while you were away.</p>
          </div>
          <div className="pulse-info-card" style={{ borderColor: '#00b5ff' }}>
            <h3 style={{ color: '#00b5ff' }}>03 / See what changed</h3>
            <p>PULSE immediately highlights the anomaly. Instead of scanning everything, you see what matters.</p>
          </div>
        </div>
      </section>

      {/* SECTION 8 — RESPONSIBLE & TECH */}
      <section className="pulse-lp-section bg-alt" style={{ padding: '3rem 2rem' }}>
        <div className="pulse-lp-section-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Built to inform, not to decide.
            </h3>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>PULSE surfaces market changes and explains why they were highlighted. It does not predict returns or tell you what to buy or sell.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Simple technology. Serious purpose.</h3>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>
              Powered by <strong>FastAPI, React, Pandas, NumPy, and SQLite.</strong> Market data integrated via Yahoo Finance with support for controlled demo datasets.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="pulse-lp-section" style={{ textAlign: 'center', padding: '6rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.05, zIndex: 0, pointerEvents: 'none' }}>
           <path d="M0,50 Q400,200 800,50 T1600,100" fill="none" stroke="#fff" strokeWidth="2" />
        </svg>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem' }}>Stop asking what happened.</h2>
          <h3 style={{ fontSize: '2rem', color: '#00b5ff', marginBottom: '2.5rem', fontWeight: '500' }}>Start with what changed.</h3>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={onGetStarted} className="pulse-lp-btn-primary" style={{ padding: '0.85rem 2.5rem', fontSize: '1.1rem' }}>Get Started</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pulse-footer">
        <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', letterSpacing: '1px' }}>PULSE</div>
        <p style={{ color: '#00d09c', fontSize: '0.9rem', marginBottom: '2rem' }}>Know what changed.</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works'); }} style={{ color: '#888', textDecoration: 'none', fontSize: '0.85rem' }}>How it works</a>
          <a href="#detection" onClick={(e) => { e.preventDefault(); scrollTo('detection'); }} style={{ color: '#888', textDecoration: 'none', fontSize: '0.85rem' }}>Detection</a>
          <button onClick={onGetStarted} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0, fontSize: '0.85rem' }}>Get Started</button>
        </div>

        <p style={{ fontSize: '0.75rem', color: '#555', maxWidth: '600px', margin: '0 auto' }}>
          Market observations may be delayed or simulated in demo mode. PULSE is an informational tool, not investment advice.
        </p>
      </footer>
    </div>
  );
}