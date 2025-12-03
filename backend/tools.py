import yfinance as yf
from langchain_core.tools import tool

@tool
def get_stock_price(symbol: str):
    """Get the current stock price for a given symbol (e.g., RELIANCE.NS, TCS.NS)."""
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period="1d")
        if data.empty:
            return f"Could not find data for symbol: {symbol}"
        current_price = data['Close'].iloc[-1]
        return f"The current price of {symbol} is {current_price:.2f}"
    except Exception as e:
        return f"Error fetching price for {symbol}: {str(e)}"

@tool
def get_stock_info(symbol: str):
    """Get company information and fundamentals for a given symbol."""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        # Extract key info to avoid token limit issues
        key_info = {
            "name": info.get("longName"),
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "marketCap": info.get("marketCap"),
            "peRatio": info.get("trailingPE"),
            "dividendYield": info.get("dividendYield"),
            "summary": info.get("longBusinessSummary")
        }
        return str(key_info)
    except Exception as e:
        return f"Error fetching info for {symbol}: {str(e)}"

@tool
def get_market_status():
    """Get the current status of the Indian Stock Market (NSE/BSE)."""
    # Mocking market status for now as yfinance doesn't provide live market status directly easily
    return "The Indian Stock Market (NSE/BSE) is currently OPEN (Mock Status)."

def fetch_stock_history(symbol: str, period: str = "1mo"):
    """
    Helper function to fetch stock history.
    Returns a list of dictionaries: [{"time": "YYYY-MM-DD HH:MM", "open": 100, "high": 110, "low": 90, "close": 105}, ...]
    """
    try:
        ticker = yf.Ticker(symbol)
        
        # Determine interval based on period
        interval = "1d"
        if period == "1d":
            interval = "5m"
        elif period == "5d":
            interval = "15m"
        elif period == "1mo":
            interval = "90m" 
            
        # Fetch history
        history = ticker.history(period=period, interval=interval)
        
        if history.empty:
            return []
        
        # Format for Recharts
        data = []
        for date, row in history.iterrows():
            # Format date to ISO string for frontend parsing
            time_str = date.isoformat()

            data.append({
                "time": time_str,
                "open": round(row['Open'], 2),
                "high": round(row['High'], 2),
                "low": round(row['Low'], 2),
                "close": round(row['Close'], 2),
                "value": round(row['Close'], 2) # Keep 'value' for backward compatibility with AreaChart if needed
            })
            
        return data
    except Exception as e:
        print(f"Error fetching history: {e}")
        return []

@tool
def get_stock_history(symbol: str, period: str = "1mo"):
    """
    Get historical stock data for a given symbol to render a chart.
    Args:
        symbol: Stock symbol (e.g., TCS.NS, RELIANCE.NS)
        period: Data period (e.g., '1d', '5d', '1mo', '3mo', '1y')
    Returns:
        JSON string containing list of data points: [{time: 'YYYY-MM-DD', value: 123.45}, ...]
    """
    data = fetch_stock_history(symbol, period)
    if not data:
        return f"Could not find history for symbol: {symbol}"
    # Optimization: Do not return full data to LLM to save tokens.
    # The frontend will fetch data directly upon receiving the 'update_chart' action.
    return f"Chart data for {symbol} ({period}) is available. Action: update_chart."
