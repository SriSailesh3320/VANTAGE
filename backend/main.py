from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
import openai
from agent import app as agent_app

app = FastAPI(title="Smart Product Buyer Agent", description="Stock Market Agent with Palantir-style UI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
async def root():
    return {"message": "System Operational. Agent Ready."}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        inputs = {"messages": [HumanMessage(content=request.message)]}
        result = agent_app.invoke(inputs)
        last_message = result["messages"][-1]
        return {"response": last_message.content}
    except openai.RateLimitError as e:
        raise HTTPException(
            status_code=429, 
            detail="Rate limit exceeded on the AI model. Please wait a moment or check your OpenRouter API limits."
        )
    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "Rate limit" in error_str:
             raise HTTPException(
                status_code=429, 
                detail="Rate limit exceeded on the AI model. Please wait a moment or check your OpenRouter API limits."
            )
        raise HTTPException(status_code=500, detail=str(e))

from tools import fetch_stock_history

@app.get("/history")
async def get_history(symbol: str, period: str = "1mo"):
    """
    Direct endpoint to fetch stock history for charts.
    """
    try:
        data = fetch_stock_history(symbol, period)
        if not data:
            raise HTTPException(status_code=404, detail=f"No data found for {symbol}")
        return {"symbol": symbol, "period": period, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
