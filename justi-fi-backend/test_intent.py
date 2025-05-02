from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END, MessagesState
# from langgraph.checkpoint.memory import MemorySaver
from typing import Annotated, List, TypedDict
from langgraph.types import Send
from lib.llm import llm
from typing import List
# Fix: Import directly from pydantic instead of langchain_core.pydantic_v1
from pydantic import BaseModel, Field
from MemoryManager import build_memory_manager, string_reducer
from langchain_core.messages import HumanMessage, SystemMessage

class IntentResponse(BaseModel):
    """Response schema for intent classification."""
    intents: List[str] = Field(
        description="List of identified intents from the user message. Should include one or more of: 'chat', 'generate_insight', 'notion_documentor', 'notion_scheduler'."
    )
    
    def __str__(self) -> str:
        """String representation of the intents for logging."""
        return f"Detected intents: {', '.join(self.intents)}"

user_input = "I need to schedule a meeting with my lawyer next week."

# Define system message for structured intent extraction
system_message = """
You are an intent classification system for a legal assistant AI.
Your task is to analyze the user's input and identify what they want to do.

POSSIBLE INTENTS:
- "chat": For general conversation, questions, or clarifications
- "generate_insight": When the user wants analysis, insights, or interpretations of legal information
- "notion_documentor": When the user wants to create, update, or manage legal documents
- "notion_scheduler": When the user wants to manage schedule, appointments, or deadlines

Analyze the user's message and return the appropriate intents. Each message may have multiple intents.
"""

user_message = f"User input: {user_input}\n\nPlease classify the intents in this message."

try:
    # Use structured output directly with our Pydantic model
    structured_llm = llm.with_structured_output(IntentResponse)
    
    # Fix: Create a list of messages as input instead of using system/user parameters
    messages = [
        SystemMessage(content=system_message),
        HumanMessage(content=user_message)
    ]
    
    # Pass the messages list as the input
    response = structured_llm.invoke(messages)
    
    print(response)
    
    # Log the detected intents for debugging
    print(f"Detected intents: {response.intents}")
        
except Exception as e:
    # Fallback to default intent if any error occurs
    print(f"Intent detection error: {e}. Using default intents.")
