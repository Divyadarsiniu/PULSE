# PULSE — Smart Market Watchlist

**Know what changed.**

A session-aware market intelligence terminal that remembers your last observed state and highlights only the meaningful structural shifts that occurred while you were away.

Built for the Groww CODE 2026 Hackathon.
**Author:** Divya Darsini. U

---

## 1. The Vision & Core Pipeline

Standard watchlists operate on a universal 24-hour clock. They tell you a stock is down 1% *today*. But if an investor checks their portfolio after three days offline, today's 1% drop hides the 8% crash that happened yesterday.

PULSE shifts the paradigm from "Daily Market Tracking" to "Personalized Attention Tracking." It operates on a strict pipeline:

1. **REMEMBER:** When you add a stock, PULSE takes a snapshot of the exact price. This is your immutable **Memory Anchor**.
2. **DETECT:** When you return, a Pandas-powered backend fetches live data and runs statistical math comparing the live market *exclusively* against your Anchor.
3. **RANK:** It filters out ordinary volatility and ranks anomalies based on price deltas, volume multipliers, and standard deviations (Z-scores).
4. **EXPLAIN:** It converts the mathematical triggers into a deterministic, plain-English market brief.
5. **REVIEW:** The system waits for your human acknowledgement. Only when you click "Mark as Reviewed" does your Anchor update to the current state, logging the event in an audit trail.

---

## 2. The Mathematical Engine

PULSE does not use LLMs for detection—financial data requires strict determinism. The backend utilizes `pandas` and `numpy` to run a two-tier anomaly detection pipeline.

### Tier 1: User-Defined Thresholds

The engine evaluates the basic percentage delta and volume ratio against the user's custom settings (e.g., > 3.0% price move and > 2.5x volume).

* **Session Return:** $R = \frac{P_{current} - P_{anchor}}{P_{anchor}} \times 100$
* **Volume Ratio:** $V_{ratio} = \frac{V_{current}}{V_{20\_day\_avg}}$

### Tier 2: Regime Shift Detection (Statistical)

A 4% move in a highly volatile stock is noise; a 4% move in an index fund is a crash. To normalize this, PULSE calculates a 20-day rolling mean ($\mu$) and standard deviation ($\sigma$) of the asset's returns to compute the Z-Score of the current movement:


$$Z = \frac{R_{session} - \mu}{\sigma}$$


If $Z \geq 2.0$, the engine flags a **Structural Regime Shift**. This grants a +15 point boost to the asset's Attention Score, elevating it to "High Attention" regardless of the absolute percentage, ensuring users catch relative anomalies.

---

## 3. Terminal Navigation (The UI)

* **Home (Intelligence Feed):** The primary dashboard. It actively compares your Memory Anchor against live market data, surfaces the highest-ranked anomalies as Hero Cards, and waits for your "Review".
* **Watchlist:** The control center for monitored assets. Searching for a stock here does *not* trigger monitoring. Only explicitly clicking "+ Add to Watchlist" initializes a new Memory Anchor for that specific asset.
* **Changes:** A dedicated feed filtering out stable stocks, showing only the assets that breached your attention thresholds since your last review.
* **History (Audit Trail):** An immutable SQLite ledger. It records the exact timestamps and prices when baselines were created, updated, or when structural shifts were acknowledged.
* **Settings:** Allows the user to directly manipulate the variables in the backend mathematical engine (Price %, Volume Multiplier, Z-Score $\sigma$).

---

## 4. Technology Stack & Architecture

* **Frontend:** React, Vite, Raw CSS Grid/Flexbox (Dark Fintech UI)
* **Backend:** Python 3, FastAPI, Uvicorn
* **Data Processing:** Pandas, NumPy
* **Database:** SQLite3 (Local fallback) / PostgreSQL (Cloud deployment)
* **Market Data:** `yfinance` (Live) / `mock_market.csv` (Deterministic Demo)

---

## 5. Local Setup & Testing Instructions for Judges

To evaluate the mathematical engine and state-management locally, follow these exact steps.

### Step 1: Clone the Repository

```bash
git clone https://github.com/Divyadarsiniu/PULSE.git
cd PULSE

```

### Step 2: Start the FastAPI Backend

The backend requires Python 3.9+. We recommend using a virtual environment.

```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate

# Install dependencies and start server
pip install -r requirements.txt
uvicorn main:app --reload

```

*The backend will run on `[http://127.0.0.1:8000](http://127.0.0.1:8000)`.*

### Step 3: Start the React Frontend

Open a **new terminal window** in the repository root.

```bash
cd frontend
npm install
npm run dev

```

*The frontend will run on `http://localhost:5173`. Open this URL in your browser.*

### ⚠️ Important Note on Demo Mode vs. Live Data

Because `yfinance` can throttle IPs during rapid hackathon testing, the backend is equipped with a deterministic offline dataset (`mock_market.csv`).

* To test the app with **Live Yahoo Finance Data**, ensure line 2 of `backend/market_data.py` is set to: `USE_MOCK_DATA = False`.
* To test the engine deterministically (guaranteed to trigger anomalies for evaluation regardless of weekend market hours), set it to: `USE_MOCK_DATA = True`. The mock data passes through the *exact same* Pandas detection pipeline as the live data.

---

## 6. Engineering Trade-offs & Future Scope

1. **SQLite vs PostgreSQL:** For the MVP, SQLite was chosen to keep the architecture portable for local evaluation without Docker overhead. The `state_manager.py` file is equipped to auto-translate SQLite queries to PostgreSQL when deployed to a cloud environment (like Render).
2. **Sequential Data Fetching:** Currently, live data is fetched iteratively via `yfinance`. This is stable for 5-10 stocks but will bottleneck at 50+. A production environment would replace this with vectorized batch fetching or a WebSocket connection (e.g., AlphaVantage).
3. **Authentication:** The MVP mocks session auth locally to prioritize engineering hours on the statistical detection engine. Production scaling would require server-side cryptographic JWTs.