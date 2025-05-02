import operator
from typing import Annotated, TypedDict, List, Dict, Any, Callable
from langgraph.graph import StateGraph, START, END
from tools import getMessages, short_term_retrieval, long_term_retrieval, rag_law, rag_previous_cases
from MemoryManager import string_reducer
from lib.llm import llm
from langchain_core.messages import SystemMessage, HumanMessage
from typing import List
from pydantic import BaseModel, Field
import time

# -- State Schema Definition --
class InsightState(TypedDict, total=False):
    # Input fields
    input: Annotated[str, string_reducer]
    user_id: Annotated[str, string_reducer]
    space_id: Annotated[str, string_reducer]
    thread_id: Annotated[str, string_reducer]
    memory_summary: Annotated[str, string_reducer]
    
    # Output fields
    summary: Annotated[str, string_reducer]
    positives: Annotated[List[str], operator.add]
    negatives: Annotated[List[Dict[str, Any]], operator.add]

class InsightStateInput(TypedDict):
    # Input fields for the graph
    input: Annotated[str, string_reducer]
    user_id: Annotated[str, string_reducer]
    space_id: Annotated[str, string_reducer]
    thread_id: Annotated[str, string_reducer]
    memory_summary: Annotated[str, string_reducer]

class InsightStateOutput(TypedDict):
    # Output fields returned by the graph
    summary: Annotated[str, string_reducer]
    positives: Annotated[List[str], operator.add]
    negatives: Annotated[List[Dict[str, Any]], operator.add]

# -- Node action functions --

def summarize_case(state: InsightStateInput) -> InsightState:
    """
    Summarize the entire case based only on chat messages from short-term memory.
    
    This function:
    1. Retrieves relevant conversation history from short-term memory
    2. Generates a comprehensive summary with the LLM using only chat context
    
    Returns the state updated with a detailed case summary based on chat messages
    """
    
    # Make a copy of the state to avoid mutating it
    new_state = state.copy()
    
    # Extract key information
    user_input = new_state.get("input", "")
    user_id = new_state.get("user_id", "")
    space_id = new_state.get("space_id", "")
    memory_summary = new_state.get("memory_summary", "")
    
    # Build a context-rich query from the user's input and memory summary
    query = user_input
    query = f"{user_input} {memory_summary}"
    
    try:
        print(f"Generating case summary for query: {query}")
        
        # Retrieve only chat messages from short-term memory
        short_term_history = getMessages(user_id=user_id, space_id=space_id)
        print("-x"*50)
        print(short_term_history)
        print("-x"*50)
        
        # Format the retrieved chat messages for the LLM
        if not short_term_history or len(short_term_history) == 0:
            print("No chat history found in short-term memory.")
            new_state["summary"] = "No chat history available to generate a case summary."
            return new_state
        
        chat_context = [f"<HumanMessage timestamp='{item["createdAt"]}''>{item["content"]}</HumanMessaage>" for item in short_term_history]
        
        # Create a prompt for the LLM to generate a comprehensive case summary
        system_message = """
        You are a legal insight generator specialized in creating comprehensive case summaries.
        Your task is to analyze conversation history about a legal case and create a clear,
        structured summary that highlights the key aspects, legal issues, and relevant context.
        
        Focus on:
        1. The core legal questions and issues at stake
        2. Relevant facts and timeline of events
        3. Key legal principles mentioned in the conversation
        4. Client's goals and concerns
        5. Important dates, deadlines, or procedural steps mentioned
        6. Any advice or strategies discussed
        
        Format your summary in a clear, structured manner with appropriate headings.
        Only use information directly mentioned in the conversation history.
        Be objective and balanced in your assessment.
        """
        
        user_message = f"""
        Please generate a comprehensive summary of this legal case based on the following chat history:
        
        USER QUERY: {query}
        
        CONVERSATION HISTORY:
        {chat_context}
        
        Provide a well-structured, comprehensive summary that captures the essence of this legal matter
        based solely on the information in these conversations.
        """
        
        # Generate case summary using LLM
        messages = [
            SystemMessage(content=system_message),
            HumanMessage(content=user_message)
        ]
        
        response = llm.invoke(messages)
        summary = response.content if hasattr(response, 'content') else str(response)
        
        # Store the summary in the state
        new_state["summary"] = summary
        print("Case summary generated successfully.")
        
    except Exception as e:
        print(f"Error generating case summary: {e}")
        new_state["summary"] = f"Unable to generate case summary due to an error: {str(e)}"
    
    return new_state


def extract_positives(state: InsightState) -> InsightState:
    """
    Extract laws, precedents, and arguments that support the user's position.
    
    This function:
    1. Analyzes the case summary to identify favorable legal elements
    2. Extracts statutes, precedents, and legal principles that strengthen the case
    3. Structures these elements in a clear, actionable format
    
    Returns the state updated with a list of positive legal arguments
    """

    
    # Make a copy of the state to avoid mutating it
    new_state = state.copy()
    
    # Extract the case summary
    summary = new_state.get('summary', '')
    if not summary:
        print("No summary available to extract positive elements from")
        new_state['positives'] = []
        return new_state
    
    try:
        # Define a structured output format for positive elements
        class PositiveElement(BaseModel):
            """Model for a positive legal element that supports the case."""
            element: str = Field(description="The supporting statute, precedent, or legal principle")
            explanation: str = Field(description="Brief explanation of why this element is supportive")
            strength: str = Field(description="The relative strength of this support (Strong, Moderate, or Limited)")
        
        class PositiveElements(BaseModel):
            """Collection of positive legal elements."""
            elements: List[PositiveElement] = Field(description="List of elements that support the user's position")
        
        # Create a prompt for the LLM to extract positive elements
        system_message = """
        You are a legal insight extractor specialized in identifying favorable legal elements.
        Your task is to analyze a legal case summary and extract statutes, precedents, legal principles,
        and arguments that support the client's position or could be used to strengthen their case.
        
        For each positive element you identify, provide:
        1. The specific statute, precedent, or legal principle
        2. A brief explanation of why it's supportive
        3. An assessment of its strength (Strong, Moderate, or Limited)
        
        Be specific and precise. Focus only on genuinely supportive elements with legal merit.
        """
        
        user_message = f"""
        Please analyze the following legal case summary and identify all elements that support the client's position:
        
        {summary}
        
        Extract all statutes, precedents, legal principles, and arguments that could be used to strengthen the case.
        """
        
        # Extract positive elements using LLM with structured output
        messages = [
            SystemMessage(content=system_message),
            HumanMessage(content=user_message)
        ]
        
        response = llm.with_structured_output(PositiveElements).invoke(messages)
        positive_elements = response.elements
        
        # Convert structured output to the format expected by the state
        formatted_positives = []
        for element in positive_elements:
            formatted_text = f"**{element.element}** ({element.strength})\n{element.explanation}"
            formatted_positives.append(formatted_text)
        
        # Store the positive elements in the state
        new_state["positives"] = formatted_positives
        print(f"Successfully extracted {len(formatted_positives)} positive elements")
        
    except Exception as e:
        print(f"Error extracting positive elements: {e}")
        new_state["positives"] = []
    
    return new_state


def extract_negatives(state: InsightState) -> InsightState:
    """
    Identify negative arguments with citations and their rebuttals.
    
    This function:
    1. Analyzes the case summary to identify unfavorable legal elements
    2. Extracts opposing statutes, precedents, with citations
    3. Generates simple rebuttals for each negative element
    
    Returns the state updated with a list of negative legal arguments with citations and rebuttals
    """

    # Make a copy of the state to avoid mutating it
    new_state = state.copy()
    
    # Extract the case summary
    summary = new_state.get('summary', '')
    if not summary:
        print("No summary available to extract negative elements from")
        new_state['negatives'] = []
        return new_state
    
    formatted_negatives = []
    try:
        # Define a simplified structured output format for negative elements with their rebuttals
        class NegativeElementWithRebuttal(BaseModel):
            """Model for a negative legal element with its corresponding rebuttal."""
            citation: str = Field(description="The opposing statute, precedent, or legal principle with citation")
            rebuttal: str = Field(description="Rebuttal or counterargument to this negative element")
        
        class NegativesWithRebuttals(BaseModel):
            """Collection of negative legal elements with their rebuttals."""
            elements: List[NegativeElementWithRebuttal] = Field(description="List of negative elements with rebuttals")
        
        # Create a prompt for the LLM to extract negative elements and generate rebuttals
        system_message = """
        You are a legal risk assessor specialized in identifying challenging legal elements
        and developing rebuttals.
        
        Your task is to analyze a legal case summary and:
        1. Extract statutes, precedents, and legal principles that oppose the client's position, with proper citations
        2. Develop a simple rebuttal for each negative element
        
        Focus only on elements with proper citations that could be referenced in court.
        """
        
        user_message = f"""
        Please analyze the following legal case summary and identify elements that challenge the client's position,
        then develop a rebuttal for each:
        
        {summary}
        
        For each element:
        1. Provide the opposing statute, precedent, or principle with proper citation
        2. Provide a concise rebuttal to counter this opposition
        """
        
        # Extract negative elements and generate rebuttals using structured output
        messages = [
            SystemMessage(content=system_message),
            HumanMessage(content=user_message)
        ]
        
        response = llm.with_structured_output(NegativesWithRebuttals).invoke(messages)
        elements_with_rebuttals = response.elements
        
        # Convert structured output to the format expected by the state - simplified to just citations and rebuttals
        
        for element in elements_with_rebuttals:
            formatted_negative = {
                "citation": element.citation,
                "rebuttal": element.rebuttal
            }
            
            formatted_negatives.append(formatted_negative)
        print(formatted_negatives)
        # Store the negative elements with rebuttals in the state
        new_state["negatives"] = formatted_negatives
        print(f"Successfully extracted {len(formatted_negatives)} negative elements with rebuttals")
        
    except Exception as e:
        print(f"Error extracting negative elements or generating rebuttals: {e}")
    new_state["negatives"] = formatted_negatives
    
    return new_state


def merged_context(state: InsightState) -> InsightState:
    """
    Placeholder for merged context state
    """
    # This state can be used to merge or process the context further if needed
    return state


# -- Build Insight Generator StateGraph --
def build_insight_generator():
    sg = StateGraph(InsightState)

    # Register states
    sg.add_node('SummarizeCase', summarize_case)
    sg.add_node('ExtractPositives', extract_positives)
    sg.add_node('ExtractNegatives', extract_negatives)
    # Removed GenerateRebuttals node as its functionality is included in ExtractNegatives

    # Define transitions
    sg.add_edge(START, 'SummarizeCase')
    sg.add_edge('SummarizeCase', 'ExtractPositives')
    sg.add_edge('SummarizeCase', 'ExtractNegatives')
    sg.add_edge('ExtractPositives', END)
    sg.add_edge('ExtractNegatives', END)  # Updated to connect directly to END

    # Compile and return
    return sg
