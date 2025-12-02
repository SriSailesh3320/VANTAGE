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
    try:
        ticker = yf.Ticker(symbol)
        # Fetch history
        history = ticker.history(period=period)
        
        if history.empty:
            return f"Could not find history for symbol: {symbol}"
        
        # Format for Recharts (Array of objects)
        # We'll limit to last 100 points to keep payload small
        data = []
        for date, row in history.iterrows():
            data.append({
                "time": date.strftime('%Y-%m-%d'),
                "value": round(row['Close'], 2)
            })
            
        return str(data) # Return as string representation of list
    except Exception as e:
        return f"Error fetching history for {symbol}: {str(e)}"
