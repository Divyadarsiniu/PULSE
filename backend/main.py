from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import state_manager
import market_data
from market_data import get_market_data
from detector import calculate_20_day_avg_volume, get_latest_price_and_volume, detect_meaningful_change
from attention import calculate_attention

app = FastAPI(title="Pulse Intelligence API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class LoginRequest(BaseModel): email: str; password: str
class SignupRequest(BaseModel): name: str; email: str; password: str
class TickerRequest(BaseModel): ticker: str
class PreferencesRequest(BaseModel): price_threshold: float; volume_threshold: float; z_score_threshold: float

@app.post("/auth/signup")
def signup(req: SignupRequest):
    res = state_manager.register_user(req.name, req.email, req.password)
    if not res["success"]: raise HTTPException(status_code=400, detail=res["message"])
    return res

@app.post("/auth/login")
def login(req: LoginRequest):
    res = state_manager.login_user(req.email, req.password)
    if not res["success"]: raise HTTPException(status_code=401, detail=res["message"])
    return res

@app.get("/preferences/{user_id}")
def get_preferences(user_id: str): return state_manager.get_user_preferences(user_id)

@app.put("/preferences/{user_id}")
def update_preferences(user_id: str, req: PreferencesRequest):
    state_manager.update_user_preferences(user_id, req.price_threshold, req.volume_threshold, req.z_score_threshold)
    return {"success": True}

@app.get("/stocks/search")
def search_stocks(q: str):
    q = q.lower()
    results = [s for s in market_data.SEARCH_DB if q in s['name'].lower() or q in s['ticker'].lower()]
    if not results: return []
    
    tickers = [s['ticker'] for s in results]
    df, _ = get_market_data(tickers)
    
    out = []
    for r in results:
        item = dict(r)
        if not df.empty and item['ticker'] in df['ticker'].values:
            t_df = df[df['ticker'] == item['ticker']]
            latest = t_df.iloc[-1]
            prev = t_df.iloc[-2] if len(t_df) > 1 else latest
            item['current_price'] = float(latest['close'])
            item['today_change'] = round(((item['current_price'] - float(prev['close'])) / float(prev['close'])) * 100, 2)
            item['timestamp'] = datetime.now().isoformat()
        else:
            item['current_price'] = 0.0
            item['today_change'] = 0.0
            item['timestamp'] = datetime.now().isoformat()
        out.append(item)
    return out

@app.get("/history/{user_id}")
def get_history(user_id: str):
    return state_manager.get_user_history(user_id)

def generate_processed_watchlist(user_id: str):
    tickers = state_manager.get_user_tickers(user_id)
    if not tickers:
        return True, datetime.now().isoformat(), [], {"status": "LIVE", "timestamp": datetime.now().isoformat()}

    market_df, source_meta = get_market_data(tickers)
    prev_state = state_manager.get_last_seen_state(user_id)
    prefs = state_manager.get_user_preferences(user_id)
    
    is_first_visit = prev_state is None
    last_seen_ts = prev_state["timestamp"] if prev_state else datetime.now().isoformat()
    prev_prices = prev_state["stocks"] if prev_state else {}

    processed = []
    for ticker in tickers:
        avg_vol = calculate_20_day_avg_volume(market_df, ticker)
        curr_price, curr_vol = get_latest_price_and_volume(market_df, ticker)
        last_price = prev_prices.get(ticker, curr_price)
        
        det = detect_meaningful_change(curr_price, curr_vol, avg_vol, last_price, market_df, ticker, prefs)
        score, level = calculate_attention(det["is_meaningful"], det["price_change_pct"], det["volume_ratio"])
        
        exp = ""
        if det["is_meaningful"]:
            dir_text = "fell" if det["price_change_pct"] < 0 else "rose"
            exp = f"Since your last visit, {ticker} {dir_text} {abs(det['price_change_pct'])}% while trading volume reached {det['volume_ratio']}× its recent average."
            if det["structural_shift"]: exp += " A statistical regime change was detected."

        company_match = next((s['name'] for s in market_data.SEARCH_DB if s['ticker'] == ticker), ticker.split('.')[0])

        processed.append({
            "ticker": ticker,
            "company_name": company_match,
            "current_price": curr_price,
            "last_seen_price": last_price,
            "price_change_since_last_visit": det["price_change_pct"],
            "volume_ratio": det["volume_ratio"],
            "attention_score": score if not det["structural_shift"] else min(100, score + 15),
            "attention_level": "High" if det["structural_shift"] else level,
            "meaningful_change": det["is_meaningful"],
            "explanation": exp if not is_first_visit else "Initial baseline established."
        })

    processed.sort(key=lambda x: x["attention_score"], reverse=True)
    return is_first_visit, last_seen_ts, processed, source_meta

@app.get("/watchlist/{user_id}")
def get_watchlist(user_id: str):
    is_first_visit, last_seen_ts, watchlist, source_meta = generate_processed_watchlist(user_id)
    meaningful = [s for s in watchlist if s["meaningful_change"]]
    
    if not watchlist:
        brief = "Your watchlist is empty. Add a stock to start monitoring."
    elif is_first_visit: 
        brief = "Welcome to Pulse. Your baseline is set."
    elif meaningful: 
        brief = f"We found {len(meaningful)} meaningful changes. {meaningful[0]['company_name']} deserves the most attention due to unusual activity."
    else:
        brief = "Your watchlist looks stable. No significant movements detected."

    return {
        "is_first_visit": is_first_visit,
        "last_checked": last_seen_ts,
        "current_timestamp": datetime.now().isoformat(),
        "meaningful_changes": len(meaningful),
        "high_attention": len([s for s in meaningful if s["attention_level"] == "High"]),
        "medium_attention": len([s for s in meaningful if s["attention_level"] == "Medium"]),
        "low_attention": len(watchlist) - len(meaningful),
        "market_brief": brief,
        "source_meta": source_meta,
        "stocks": watchlist
    }

@app.post("/watchlist/{user_id}/acknowledge")
def acknowledge_changes(user_id: str):
    _, _, watchlist, _ = generate_processed_watchlist(user_id)
    for stock in watchlist:
        if stock["meaningful_change"]:
            state_manager.log_history(user_id, stock["ticker"], stock["company_name"], "MEANINGFUL_CHANGE", {
                "price_change": stock["price_change_since_last_visit"], "volume_ratio": stock["volume_ratio"], "attention_level": stock["attention_level"]
            })
            state_manager.log_history(user_id, stock["ticker"], stock["company_name"], "BASELINE_UPDATED", {
                "old_price": stock["last_seen_price"], "new_price": stock["current_price"]
            })
    state_manager.save_current_state(user_id, watchlist)
    return {"success": True}

@app.post("/watchlist/{user_id}/add")
def add_ticker(user_id: str, req: TickerRequest):
    tickers = state_manager.get_user_tickers(user_id)
    if req.ticker.upper() in tickers: return {"success": False, "message": "Already monitored"}
    
    df, _ = get_market_data([req.ticker])
    current_price = float(df.iloc[-1]['close']) if not df.empty else 0.0
    company_match = next((s['name'] for s in market_data.SEARCH_DB if s['ticker'] == req.ticker.upper()), req.ticker.split('.')[0])
    
    state_manager.add_ticker_to_watchlist(user_id, req.ticker, current_price, company_match)
    return {"success": True}

@app.post("/watchlist/{user_id}/remove")
def remove_ticker(user_id: str, req: TickerRequest):
    state_manager.remove_ticker_from_watchlist(user_id, req.ticker)
    return {"success": True}

@app.get("/health")
def health_check():
    import state_manager
    return {"status": "ok", "environment": "production" if state_manager.USE_POSTGRES else "development"}