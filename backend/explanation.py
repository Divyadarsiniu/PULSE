def generate_explanation(ticker: str, is_meaningful: bool, price_change_pct: float, volume_ratio: float, structural_shift: bool) -> str:
    if not is_meaningful:
        return "Market behavior remains within normal statistical bounds relative to your baseline."
    
    direction = "fell" if price_change_pct < 0 else "rose"
    base_explanation = f"Since your last visit, this asset {direction} {abs(price_change_pct):.2f}% while trading volume reached {volume_ratio:.1f}× its recent average."
    
    if structural_shift:
        return f"{base_explanation} Statistical change detected: price movement exceeded normal volatility patterns."
    
    return base_explanation

def generate_market_brief(user_name: str, is_first_visit: bool, hours_away: float, meaningful_count: int, top_stock: dict) -> str:
    if is_first_visit:
        return f"Welcome to Pulse, {user_name}. Your baseline is set. When you return later, we will highlight what meaningfully changed."
    
    time_text = f"{round(hours_away, 1)} hours" if hours_away < 48 else f"{round(hours_away / 24, 1)} days"
    
    if meaningful_count == 0:
        return f"You were away for {time_text}. Your watchlist looks stable with no significant movements beyond your attention thresholds."
    
    top_name = top_stock.get("company_name", "an asset") if top_stock else "an asset"
    return f"You were away for {time_text}. We found {meaningful_count} meaningful changes. {top_name} deserves your attention due to unusual price and volume activity."