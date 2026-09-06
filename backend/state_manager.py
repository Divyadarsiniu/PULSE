import os
import json
import hashlib
import uuid
from datetime import datetime, timezone

# ---------------------------------------------------------
# DATABASE CONFIGURATION
# ---------------------------------------------------------
USE_POSTGRES = os.getenv("DATABASE_URL") is not None
DB_URL = os.getenv("DATABASE_URL", "sqlite:///pulse.db")

if USE_POSTGRES and DB_URL.startswith("postgres://"):
    DB_URL = DB_URL.replace("postgres://", "postgresql://", 1)

def get_conn():
    if USE_POSTGRES:
        import psycopg2
        return psycopg2.connect(DB_URL)
    else:
        import sqlite3
        return sqlite3.connect("pulse.db", check_same_thread=False)

def _q(query: str) -> str:
    return query.replace("?", "%s") if USE_POSTGRES else query

# ---------------------------------------------------------
# INITIALIZATION & MIGRATION
# ---------------------------------------------------------
def init_db():
    conn = get_conn()
    c = conn.cursor()
    
    # 1. Create table (with last_checked_at if it's a fresh database)
    if USE_POSTGRES:
        c.execute('''CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, password_hash TEXT, user_id TEXT, last_checked_at TEXT)''')
    else:
        c.execute('''CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, password_hash TEXT, user_id TEXT, last_checked_at TEXT)''')
    
    # 2. Safe Migration: Add column for older accounts (fails silently if it already exists)
    try:
        c.execute('ALTER TABLE users ADD COLUMN last_checked_at TEXT')
    except:
        pass 
        
    c.execute('''CREATE TABLE IF NOT EXISTS memory_anchors (user_id TEXT PRIMARY KEY, timestamp TEXT, state_data TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS user_watchlists (user_id TEXT, ticker TEXT, UNIQUE(user_id, ticker))''')
    c.execute('''CREATE TABLE IF NOT EXISTS user_preferences (user_id TEXT PRIMARY KEY, price_threshold REAL DEFAULT 3.0, volume_threshold REAL DEFAULT 2.5, z_score_threshold REAL DEFAULT 2.0)''')
    if USE_POSTGRES:
        c.execute('''CREATE TABLE IF NOT EXISTS market_history (id SERIAL PRIMARY KEY, user_id TEXT, ticker TEXT, company_name TEXT, event_type TEXT, details TEXT, timestamp TEXT)''')
    else:
        c.execute('''CREATE TABLE IF NOT EXISTS market_history (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, ticker TEXT, company_name TEXT, event_type TEXT, details TEXT, timestamp TEXT)''')
        
    conn.commit()
    conn.close()

init_db()

def _q(query):
    """Translates SQLite queries to PostgreSQL if running in the cloud."""
    if not USE_POSTGRES:
        return query
    q = query.replace('?', '%s')
    if 'INSERT OR IGNORE INTO user_watchlists' in q:
        q = q.replace('INSERT OR IGNORE INTO user_watchlists', 'INSERT INTO user_watchlists') + ' ON CONFLICT (user_id, ticker) DO NOTHING'
    if 'INSERT OR IGNORE INTO user_preferences' in q:
        q = q.replace('INSERT OR IGNORE INTO user_preferences', 'INSERT INTO user_preferences') + ' ON CONFLICT (user_id) DO NOTHING'
    if 'excluded.' in q:
        q = q.replace('excluded.', 'EXCLUDED.')
    return q

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def register_user(name: str, email: str, password: str) -> dict:
    conn = get_conn()
    c = conn.cursor()
    c.execute(_q('SELECT email FROM users WHERE email = ?'), (email,))
    if c.fetchone():
        conn.close()
        return {"success": False, "message": "Email is already registered."}

    user_id = f"user_{str(uuid.uuid4())[:8]}"
    now_utc = datetime.now(timezone.utc).isoformat()
    
    c.execute(_q('INSERT INTO users (email, name, password_hash, user_id, last_checked_at) VALUES (?, ?, ?, ?, ?)'), 
              (email, name, hash_password(password), user_id, now_utc))
    c.execute(_q('INSERT OR IGNORE INTO user_preferences (user_id, price_threshold, volume_threshold, z_score_threshold) VALUES (?, 3.0, 2.5, 2.0)'), (user_id,))
    conn.commit()
    conn.close()
    
    # CRITICAL FIX: Return the live time (now_utc) instead of None, so new accounts say "Just now" instead of "First visit"
    return {"success": True, "user": {"id": user_id, "name": name, "email": email, "last_checked_at": now_utc}}

def login_user(email: str, password: str) -> dict:
    conn = get_conn()
    c = conn.cursor()
    c.execute(_q('SELECT user_id, name, email, last_checked_at FROM users WHERE email = ? AND password_hash = ?'), (email, hash_password(password)))
    row = c.fetchone()
    
    if row: 
        user_id, name, user_email, previous_check = row
        now_utc = datetime.now(timezone.utc).isoformat()
        
        c.execute(_q('UPDATE users SET last_checked_at = ? WHERE email = ?'), (now_utc, email))
        conn.commit()
        conn.close()
        
        # Fallback: if previous_check is somehow empty, use now_utc
        return {"success": True, "user": {"id": user_id, "name": name, "email": user_email, "last_checked_at": previous_check or now_utc}}
        
    conn.close()
    return {"success": False, "message": "Invalid credentials."}

def get_user_preferences(user_id: str) -> dict:
    conn = get_conn()
    c = conn.cursor()
    c.execute(_q('SELECT price_threshold, volume_threshold, z_score_threshold FROM user_preferences WHERE user_id = ?'), (user_id,))
    row = c.fetchone()
    conn.close()
    if row: return {"price_threshold": row[0], "volume_threshold": row[1], "z_score_threshold": row[2]}
    return {"price_threshold": 3.0, "volume_threshold": 2.5, "z_score_threshold": 2.0}

def update_user_preferences(user_id: str, price: float, volume: float, z_score: float):
    conn = get_conn()
    c = conn.cursor()
    c.execute(_q('''INSERT INTO user_preferences (user_id, price_threshold, volume_threshold, z_score_threshold) VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET price_threshold=excluded.price_threshold, volume_threshold=excluded.volume_threshold, z_score_threshold=excluded.z_score_threshold
    '''), (user_id, price, volume, z_score))
    conn.commit()
    conn.close()

def log_history(user_id: str, ticker: str, company_name: str, event_type: str, details: dict):
    conn = get_conn()
    c = conn.cursor()
    c.execute(_q('''INSERT INTO market_history (user_id, ticker, company_name, event_type, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)'''), 
                   (user_id, ticker, company_name, event_type, json.dumps(details), datetime.now().isoformat()))
    conn.commit()
    conn.close()

def get_user_history(user_id: str) -> list:
    conn = get_conn()
    c = conn.cursor()
    c.execute(_q('SELECT ticker, company_name, event_type, details, timestamp FROM market_history WHERE user_id = ? ORDER BY id DESC'), (user_id,))
    rows = c.fetchall()
    conn.close()
    return [{"ticker": r[0], "company_name": r[1], "event_type": r[2], "details": json.loads(r[3]), "timestamp": r[4]} for r in rows]

def get_last_seen_state(user_id: str) -> dict:
    conn = get_conn()
    c = conn.cursor()
    c.execute(_q('SELECT timestamp, state_data FROM memory_anchors WHERE user_id = ?'), (user_id,))
    row = c.fetchone()
    conn.close()
    if row: return {"timestamp": row[0], "stocks": json.loads(row[1])}
    return None

def save_current_state(user_id: str, watchlist_data: list):
    conn = get_conn()
    c = conn.cursor()
    timestamp = datetime.now().isoformat()
    state_data = json.dumps({item["ticker"]: item["current_price"] for item in watchlist_data})
    c.execute(_q('''INSERT INTO memory_anchors (user_id, timestamp, state_data) VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET timestamp=excluded.timestamp, state_data=excluded.state_data'''), (user_id, timestamp, state_data))
    conn.commit()
    conn.close()

def get_user_tickers(user_id: str) -> list:
    conn = get_conn()
    c = conn.cursor()
    c.execute(_q('SELECT ticker FROM user_watchlists WHERE user_id = ?'), (user_id,))
    rows = c.fetchall()
    conn.close()
    return [row[0] for row in rows]

def add_ticker_to_watchlist(user_id: str, ticker: str, initial_price: float, company_name: str):
    conn = get_conn()
    c = conn.cursor()
    c.execute(_q('INSERT OR IGNORE INTO user_watchlists (user_id, ticker) VALUES (?, ?)'), (user_id, ticker.upper()))
    
    c.execute(_q('SELECT state_data FROM memory_anchors WHERE user_id = ?'), (user_id,))
    row = c.fetchone()
    state = json.loads(row[0]) if row and row[0] else {}
    
    if ticker.upper() not in state:
        state[ticker.upper()] = initial_price
        c.execute(_q('''INSERT INTO memory_anchors (user_id, timestamp, state_data) VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET state_data=excluded.state_data'''), (user_id, datetime.now().isoformat(), json.dumps(state)))
    
    conn.commit()
    conn.close()
    log_history(user_id, ticker.upper(), company_name, "STOCK_ADDED", {"price": initial_price})
    log_history(user_id, ticker.upper(), company_name, "BASELINE_CREATED", {"price": initial_price})

def remove_ticker_from_watchlist(user_id: str, ticker: str):
    conn = get_conn()
    c = conn.cursor()
    c.execute(_q('DELETE FROM user_watchlists WHERE user_id = ? AND ticker = ?'), (user_id, ticker.upper()))
    
    c.execute(_q('SELECT state_data FROM memory_anchors WHERE user_id = ?'), (user_id,))
    row = c.fetchone()
    if row:
        state = json.loads(row[0])
        if ticker.upper() in state:
            del state[ticker.upper()]
            c.execute(_q('UPDATE memory_anchors SET state_data = ? WHERE user_id = ?'), (json.dumps(state), user_id))
    
    conn.commit()
    conn.close()
    log_history(user_id, ticker.upper(), ticker.upper(), "STOCK_REMOVED", {})