def calculate_attention(is_meaningful: bool, price_change_pct: float, volume_ratio: float) -> tuple:
    """Calculates a score (0-100) and assigns an attention level."""
    if not is_meaningful:
        return 15, "Low"
    
    # Simple algorithm: Weigh volume spikes and price drops heavily
    score = int((abs(price_change_pct) * 5) + (volume_ratio * 15))
    score = min(100, max(0, score)) # Cap between 0 and 100
    
    if score >= 75:
        return score, "High"
    elif score >= 50:
        return score, "Medium"
    else:
        return score, "Low"