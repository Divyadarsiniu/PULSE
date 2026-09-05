import pandas as pd
import os
import yfinance as yf
from datetime import datetime, timedelta

import os
# Defaults to true in production for reliable Hackathon judging
USE_MOCK_DATA = os.getenv("USE_MOCK_DATA", "true").lower() == "true"

SEARCH_DB = [
    {"ticker": "HDFCBANK.NS", "name": "HDFC Bank"},
    {"ticker": "RELIANCE.NS", "name": "Reliance Industries"},
    {"ticker": "TCS.NS", "name": "Tata Consultancy Services"},
    {"ticker": "INFY.NS", "name": "Infosys"},
    {"ticker": "ICICIBANK.NS", "name": "ICICI Bank"},
    {"ticker": "SBIN.NS", "name": "State Bank of India"},
    {"ticker": "BHARTIARTL.NS", "name": "Bharti Airtel"},
    {"ticker": "ITC.NS", "name": "ITC Limited"},
    {"ticker": "HDFCLIFE.NS", "name": "HDFC Life"},
    {"ticker": "ASIANPAINT.NS", "name": "Asian Paints"},
]

def get_mock_data() -> pd.DataFrame:
    file_path = os.path.join(os.path.dirname(__file__), 'mock_market.csv')
    df = pd.read_csv(file_path, parse_dates=['date'])
    return df.sort_values(by=['ticker', 'date']).reset_index(drop=True)

def get_live_yfinance_data(tickers: list) -> pd.DataFrame:
    if not tickers: return pd.DataFrame()
    all_data = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=35) 
    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(start=start_date.strftime('%Y-%m-%d'), end=end_date.strftime('%Y-%m-%d'))
            if not hist.empty:
                hist = hist.reset_index()
                for _, row in hist.iterrows():
                    all_data.append({
                        'date': row['Date'], 'ticker': ticker,
                        'open': float(row['Open']), 'high': float(row['High']), 'low': float(row['Low']),
                        'close': float(row['Close']), 'volume': float(row['Volume'])
                    })
        except Exception: pass
    df = pd.DataFrame(all_data)
    if not df.empty:
        df['date'] = pd.to_datetime(df['date'], utc=True)
        df = df.sort_values(by=['ticker', 'date']).reset_index(drop=True)
    return df

def get_market_data(tickers: list = None) -> tuple:
    if not tickers: 
        return pd.DataFrame(), {"status": "NO DATA", "timestamp": datetime.now().isoformat()}
        
    if USE_MOCK_DATA:
        df = get_mock_data()
        meta = {"status": "DEMO DATA", "timestamp": datetime.now().isoformat()}
        return df, meta
    else:
        df = get_live_yfinance_data(tickers)
        meta = {"status": "LIVE", "timestamp": datetime.now().isoformat()}
        return df, meta