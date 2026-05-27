# IPL Auction War Room Simulator 🏆

An advanced Operations Research & Data Science application designed to simulate and optimize Indian Premier League (IPL) mega-auctions. Built using **Python**, **Streamlit**, and **Linear Programming (PuLP)**, this tool acts as a "Digital Coach" and Franchise War Room, ruthlessly optimizing a 25-man squad and a Playing XI while adhering to strict budget constraints and league rules.

## 🚀 Features

- **Single-Stage Lexicographic Optimization Engine**: Solves the complex *Knapsack Problem* using the CBC LP solver. It mathematically maximizes the team's custom `Power_Index` while simultaneously minimizing the `Auction_Price` in a single pass without sacrificing performance.
- **Phase-Specific Chemistry Engine**: Analyzes the synergy of the Playing XI, classifying players into archetypes (e.g., *Sloggers*, *Anchors*, *Strike Bowlers*) to ensure balanced team composition.
- **Bidding War Simulator (Sensitivity Analysis)**: Allows users to manually inflate a player's auction price in real-time. The AI instantly re-architects the remaining 24 spots to absorb the budget hit.
- **Live Market Chaos Engine (Mock SaaS)**: Simulates real-world market shifts. Periodically triggers random player injuries (blocking them from the draft pool) and form adjustments, requiring dynamic tactical pivoting.
- **PDF Export Engine**: Dynamically generates a professionally formatted, franchise-themed A4 PDF report detailing the optimal drafted squad and starting XI.
- **Venue Intelligence**: Automatically adjusts player effectiveness (Power Index) based on the pitch characteristics (Spin-friendly, Pace-friendly, Flat track) of selected home stadiums.

## 🛠️ Tech Stack

- **Frontend**: Streamlit (Python), Custom CSS for Franchise Theming
- **Optimization Math**: PuLP (Linear Programming)
- **Data Engineering**: Pandas, NumPy
- **Document Generation**: fpdf2
- **Data Visualization**: Plotly Express

## 🧠 The Mathematics Behind the Optimizer

The core engine relies on a strictly constrained Binary Integer Programming model. 

```text
Objective Function:
Maximize -> (1000 * Total_Power_Index) - (Total_Auction_Price)
```

**Rigid Constraints Enforced:**
- Budget <= Selected Purse Limit (e.g., ₹100 Cr)
- Total Squad Size == 25
- Playing XI Size == 11
- Overseas Limit <= 8 (Squad) and <= 4 (Playing XI)
- Wicketkeepers == Exactly 1 (Playing XI)
- Bowlers >= 5 (Playing XI)

## 💻 Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ipl-auction-optimizer.git
   cd ipl-auction-optimizer
   ```
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Run the War Room:**
   ```bash
   streamlit run app.py
   ```

## 📈 Future Scope
- Integration with live sports APIs (e.g., CricketData) for real-time form tracking.
- Automated web scraping pipeline for pre-auction stats aggregation.
- Porting the analytical engine to a mobile Progressive Web App (PWA) using FastAPI and React Native.

---
*Built with passion by a Data Science Engineering student navigating the intersection of Sports Analytics and Machine Learning.*
