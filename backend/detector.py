import pandas as pd

def calculate_20_day_avg_volume(df: pd.DataFrame, ticker: str) -> float:
    if df.empty or 'ticker' not in df.columns: 
        return 0.0
        
    ticker_df = df[df['ticker'] == ticker].copy()
    if ticker_df.empty: 
        return 0.0
        
    return float(ticker_df['volume'].tail(20).mean())

def get_latest_price_and_volume(df: pd.DataFrame, ticker: str) -> tuple:
    if df.empty or 'ticker' not in df.columns: 
        return 0.0, 0.0
        
    ticker_df = df[df['ticker'] == ticker]
    if ticker_df.empty: 
        return 0.0, 0.0
        
    latest = ticker_df.iloc[-1]
    return float(latest['close']), float(latest['volume'])

def detect_structural_shift(df: pd.DataFrame, ticker: str, current_price: float, last_seen_price: float, z_threshold: float) -> bool:
    if current_price == last_seen_price: 
        return False
        
    if df.empty or 'ticker' not in df.columns: 
        return False

    ticker_df = df[df['ticker'] == ticker].copy()
    if len(ticker_df) < 20: 
        return False
    
    ticker_df['returns'] = ticker_df['close'].pct_change()
    hist_returns = ticker_df['returns'].tail(20)
    mean_ret = hist_returns.mean()
    std_ret = hist_returns.std()
    
    if pd.isna(std_ret) or std_ret == 0: 
        return False
        
    session_return = (current_price - last_seen_price) / last_seen_price
    z_score = abs((session_return - mean_ret) / std_ret)
    
    return z_score > z_threshold

def detect_meaningful_change(current_price: float, current_volume: float, avg_volume: float, last_seen_price: float, df: pd.DataFrame, ticker: str, prefs: dict) -> dict:
    if last_seen_price <= 0:
        return {"is_meaningful": False, "price_change_pct": 0.0, "volume_ratio": 1.0, "structural_shift": False}

    price_change_pct = ((current_price - last_seen_price) / last_seen_price) * 100
    volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1.0

    p_thresh = prefs.get("price_threshold", 3.0)
    v_thresh = prefs.get("volume_threshold", 2.5)
    z_thresh = prefs.get("z_score_threshold", 2.0)

    tier_1 = (abs(price_change_pct) >= p_thresh and volume_ratio >= v_thresh)
    tier_2 = detect_structural_shift(df, ticker, current_price, last_seen_price, z_thresh)

    return {
        "is_meaningful": tier_1 or tier_2,
        "price_change_pct": round(price_change_pct, 2),
        "volume_ratio": round(volume_ratio, 2),
        "structural_shift": tier_2
    }