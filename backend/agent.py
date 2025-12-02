import os
from typing import Annotated, Literal, TypedDict
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END, START
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from dotenv import load_dotenv

from tools import get_stock_price, get_stock_info, get_market_status, get_stock_history

load_dotenv()

# Define the state
class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]

# Initialize Tools
tools = [get_stock_price, get_stock_info, get_market_status, get_stock_history]

# Initialize LLM (OpenRouter)
# Note: User must provide OPENROUTER_API_KEY in .env
llm = ChatOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
    model="tngtech/deepseek-r1t2-chimera:free", 
)

llm_with_tools = llm.bind_tools(tools)

# System Prompt
SYSTEM_PROMPT = """You are VANTAGE, a high-frequency market intelligence agent.
Your goal is to provide real-time analysis and control the user's trading dashboard.

**Capabilities**:
1.  **Analyze**: Use `get_stock_info` and `get_stock_price` to analyze stocks.
2.  **Visualize**: Use `get_stock_history` to fetch data for the chart.
3.  **Execute**: (Simulated) You can place orders.

**Protocol**:
- When asked to analyze a stock, ALWAYS call `get_stock_history` to update the user's chart.
- **Structured Output**: To update the UI, you must include a JSON block in your final response.
  Format:
  ```json
  {
    "action": "update_chart",
    "symbol": "TCS.NS",
    "data": [ ... data from tool ... ]
  }
  ```
- **Confirmation**: Before executing a "Buy" or "Sell" order, you MUST ask the user for confirmation.
  Example: "I have analyzed TCS. Price is 3400. Shall I execute a BUY order for 10 QTY?"

**Tone**:
- Precise, Industrial, Professional.
- Short sentences. No fluff.
"""

# Define Nodes
def agent(state: AgentState):
    messages = state["messages"]
    # Add system message if not present
    if not isinstance(messages[0], SystemMessage):
        messages.insert(0, SystemMessage(content=SYSTEM_PROMPT))
    
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

# Define Graph
workflow = StateGraph(AgentState)

workflow.add_node("agent", agent)
workflow.add_node("tools", ToolNode(tools))

workflow.add_edge(START, "agent")

def should_continue(state: AgentState) -> Literal["tools", END]:
    messages = state["messages"]
    last_message = messages[-1]
    if last_message.tool_calls:
        return "tools"
    return END

workflow.add_conditional_edges("agent", should_continue)
workflow.add_edge("tools", "agent")

# Compile Graph
app = workflow.compile()
