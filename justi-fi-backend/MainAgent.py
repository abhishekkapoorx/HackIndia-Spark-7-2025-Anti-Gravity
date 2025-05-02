import operator
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END, MessagesState

# from langgraph.checkpoint.memory import MemorySaver
from typing import Annotated, Any, Dict, List, TypedDict, Optional
from langgraph.types import Send
from ChatSubGraph import build_chat_subgraph
from InsightGeneratorGraph import build_insight_generator
from lib.llm import llm
from pydantic import BaseModel, Field
from MemoryManager import build_memory_manager, string_reducer
from langchain_core.messages import SystemMessage, HumanMessage
import re

from tools import saveInNotion


class SuperGraphState(TypedDict):
    input: Annotated[str, string_reducer]
    user_id: Annotated[str, string_reducer]
    space_id: Annotated[str, string_reducer]
    thread_id: Annotated[str, string_reducer]
    output_message: Annotated[str, string_reducer]
    intents: List[str]
    chat_results: Annotated[str, string_reducer]
    memory_summary: Annotated[str, string_reducer]

    # insight graph states
    summary: Annotated[str, string_reducer]
    positives: Annotated[List[str], operator.add]
    negatives: Annotated[List[Dict[str, Any]], operator.add]

    document_generated: Annotated[bool, operator.add]


class InputState(TypedDict):
    input: Annotated[str, string_reducer]
    user_id: Annotated[str, string_reducer] = "uid"
    space_id: Annotated[str, string_reducer] = "sid"
    thread_id: Annotated[str, string_reducer] = "tid"


class OutputState(TypedDict):
    result: Annotated[str, string_reducer]

    # insight graph states
    summary: Annotated[str, string_reducer]
    positives: Annotated[List[str], operator.add]
    negatives: Annotated[List[Dict[str, Any]], operator.add]

    document_generated: Annotated[bool, operator.add]


class IntentResponse(BaseModel):
    """Response schema for intent classification."""

    intents: List[str] = Field(
        description="List of identified intents from the user message. Should include one or more of: 'chat', 'generate_insight', 'notion_documentor', 'notion_scheduler'."
    )

    def __str__(self) -> str:
        """String representation of the intents for logging."""
        return f"Detected intents: {', '.join(self.intents)}"


class DocumentResponse(BaseModel):
    document_title: str = Field(
        description="Complete title of the legal document (e.g., 'MOTION FOR SUMMARY JUDGMENT', 'COMPLAINT FOR DAMAGES AND INJUNCTIVE RELIEF')"
    )
    document_type: str = Field(
        description="Specific type of legal filing (e.g., Motion, Brief, Complaint, Answer, Petition, Memorandum, Order, Affidavit, Declaration)"
    )
    document_content: str = Field(
        description="Properly formatted content following court rules, including caption, case number, parties, jurisdiction statement, numbered paragraphs, legal citations, prayer for relief, and signature blocks"
    )
    court_name: str = Field(
        description="Full name of the court where document will be filed (e.g., 'UNITED STATES DISTRICT COURT FOR THE SOUTHERN DISTRICT OF NEW YORK')"
    )
    case_number: Optional[str] = Field(
        description="Official case/docket number in proper format (e.g., 'Case No. 2:21-cv-01234-JRC')",
        default=None,
    )
    filing_party: str = Field(
        description="Party submitting this document (e.g., 'Plaintiff', 'Defendant', 'Petitioner')"
    )
    opposing_party: Optional[str] = Field(
        description="Party opposing the filing party", default=None
    )
    certificate_of_service: Optional[str] = Field(
        description="Text certifying service of document to other parties", default=None
    )
    next_steps: Optional[List[str]] = Field(
        description="Procedural steps required after filing (e.g., serving process, scheduling hearing)",
        default=None,
    )


def memory_manager(state):
    """Retrieve and manage conversation memory across user interactions.

    This tool connects to the memory management subsystem to retrieve relevant
    conversation history and contextual information, enabling the assistant to
    maintain context across multiple turns of conversation.

    Args:
        state: The current state containing user input and identification

    Returns:
        State updated with relevant memory context
    """
    build_memory_manager().compile()
    return state


def intent_selector(state: SuperGraphState):
    """Analyze user input to determine their intentions and route accordingly.

    This tool uses LangChain's structured output for clean, type-safe parsing of user
    intents. It analyzes the user's message to identify if they want general conversation,
    legal insights, document management, or scheduling assistance.

    Args:
        state: The current state containing user input

    Returns:
        State updated with detected intents for routing
    """

    newstate = state.copy()
    user_input = state.get("input", "")

    # Define Pydantic model for the expected structured output

    # Define system message for structured intent extraction
    system_message = """
    You are an intent classification system for a legal assistant AI. 
    Your task is to analyze the user's input and precisely identify what they want to do.

    POSSIBLE INTENTS (select all that apply):
    - "chat": For general conversation, questions, clarifications, greetings, or when no other intent clearly applies
    - "generate_insight": When the user wants legal analysis, case interpretation, statutory insights, risk assessment, 
      or explanation of legal concepts and implications
    - "notion_documentor": When the user explicitly wants to create, edit, review, save, or manage legal documents, 
      briefs, motions, pleadings, contracts, or other written materials on notion
    - "notion_scheduler": When the user wants to schedule meetings, set reminders, manage deadlines, 
      track court dates, or organize their calendar using notion

    INSTRUCTIONS:
    1. Analyze the complete message for explicit and implicit requests
    2. Select ALL applicable intents that match the user's needs
    3. When in doubt between chat and a specialized intent, include both
    4. Focus on what the user wants to accomplish, not just keywords

    Return the identified intents as a list. Be precise to ensure correct routing.
    """

    user_message = (
        f"User input: {user_input}\n\nPlease classify the intents in this message."
    )

    try:
        # Use structured output directly with our Pydantic model
        structured_llm = llm.with_structured_output(IntentResponse)

        # Create a list of messages as input
        messages = [
            SystemMessage(content=system_message),
            HumanMessage(content=user_message),
        ]

        # Pass the messages list as the input
        response = structured_llm.invoke(messages)

        # The response is already a Pydantic object - no need for json parsing
        newstate["intents"] = response.intents

        # Log the detected intents for debugging
        print(f"Detected intents: {response.intents}")

    except Exception as e:
        # Fallback to default intent if any error occurs
        print(f"Intent detection error: {e}. Using default intents.")
        newstate["intents"] = ["chat"]

    return newstate


def chat(state):
    """Process general conversation or legal Q&A requests.

    This tool handles general conversation, questions, or clarification requests
    by providing informative responses based on legal knowledge and conversation context.

    Args:
        state: The current state containing user input and context

    Returns:
        State updated with chat response
    """
    return state


def insight_generator(state):
    """Generate legal insights, analyses, and interpretations.

    This tool provides deeper legal analysis, insights into case law,
    and interpretations of legal information based on the user query.

    Args:
        state: The current state containing user input and context

    Returns:
        State updated with legal insights
    """
    return state


def notion_documentor(state: SuperGraphState):
    """Create, update, or manage legal documents.

    This tool handles document-related operations including creating
    new legal documents, updating existing ones, and managing document
    repositories in Notion.

    Args:
        state: The current state containing user input and context

    Returns:
        State updated with document operation results
    """
    new_state = state.copy()

    # Refine user input using LLM for better document processing
    user_input = state["input"]

    # Create prompts for better understanding the document request
    messages = [
        SystemMessage(
            content="""You are a legal document preparation assistant. 
        Your task is to analyze the user's request and identify key details needed for document creation:
        - Document type (motion, brief, complaint, etc.)
        - Key parties involved
        - Relevant case information
        - Specific formatting requirements
        - Deadline information (if any)
        
        Format the information clearly to prepare for document creation."""
        ),
        HumanMessage(
            content=f"User request: {user_input}\n\nPlease extract and organize the key information needed for proper document preparation."
        ),
    ]

    # Refine the input with the LLM
    refined_input = llm.invoke(messages).content

    print(f"Refined document request: {refined_input[:100]}...")
    messages = [
        SystemMessage(
            content="""You are a legal document management assistant specializing in court filings and legal documentation. 

                Your responsibilities include:
                1. Creating properly formatted legal documents that comply with court standards
                2. Ensuring all necessary components are included (headers, case numbers, signatures, etc.)
                3. Using appropriate legal terminology and citation formats
                4. Structuring documents according to legal conventions (e.g., pleadings, motions, briefs)
                5. Following jurisdiction-specific formatting requirements

                When drafting documents:
                - Use formal, precise legal language
                - Include proper party designations (plaintiff, defendant, etc.)
                - Format citations according to the Bluebook or jurisdiction requirements
                - Structure arguments with clear headings and paragraph numbering
                - Include necessary attestations and signature blocks
                - Ensure proper formatting for court acceptance (margins, spacing, page numbers)

                For templates, follow standard legal document structure:
                - Caption/Header with court information
                - Case identification
                - Document title
                - Body with numbered paragraphs
                - Conclusion/Prayer for relief
                - Date and signature block
                - Certificate of service where applicable

                Now, help the user with their document management request in Notion."""
        ),
        HumanMessage(
            content=f"User input: {refined_input}\n\nPlease create or modify the requested legal document following proper court filing standards."
        ),
    ]

    # Use the LLM to process the document request with structured output

    # Create structured output with our Pydantic model
    structured_doc_llm = llm.with_structured_output(DocumentResponse)
    response = structured_doc_llm.invoke(messages)

    function_result = saveInNotion(response)


    new_state["document_generated"] = function_result["success"]
    print(f"Document created: {response.document_title}")

    return new_state


def notion_scheduler(state: SuperGraphState):
    """Manage schedules, appointments, and legal deadlines.

    This tool helps users manage their legal calendar by scheduling meetings,
    tracking important dates, setting reminders for legal deadlines, and
    managing court appearances.

    Args:
        state: The current state containing user input and context

    Returns:
        State updated with scheduling operation results
    """
    return state


def aggregator(state: SuperGraphState) -> OutputState:
    """Aggregate results from all graph nodes, prioritizing chat responses.

    This function:
    1. Prioritizes chat_results if available
    2. Summarizes the work done by other nodes (insight_generator, notion_documentor, notion_scheduler)
    3. Creates a structured response that helps the user understand all system activities
    4. Returns a unified result in the OutputState format
    """

    # Initialize the output state
    output = {"result": ""}

    # Check which intents were identified and processed
    intents = state.get("intents", [])
    resolved_intents = []

    # Priority 1: Chat response (if available)
    chat_results = state.get("chat_results", "")
    has_chat = "chat" in intents and chat_results
    if has_chat:
        resolved_intents.append("chat")

    # Check for other intent results
    insight_results = state.get("insight_results", "")
    has_insights = "generate_insight" in intents and insight_results
    if has_insights:
        resolved_intents.append("generate_insight")

    document_results = state.get("document_results", "")
    has_documents = "notion_documentor" in intents and document_results
    if has_documents:
        resolved_intents.append("notion_documentor")

    scheduler_results = state.get("scheduler_results", "")
    has_scheduling = "notion_scheduler" in intents and scheduler_results
    if has_scheduling:
        resolved_intents.append("notion_scheduler")

    # If we have chat results, prioritize them
    if has_chat:
        main_response = chat_results
    # Otherwise, use whatever result we have available
    elif has_insights:
        main_response = insight_results
    elif has_documents:
        main_response = document_results
    elif has_scheduling:
        main_response = scheduler_results
    else:
        # If no specific results, but intents were detected, explain what was attempted
        if intents:
            operations_attempted = []
            if "chat" in intents:
                operations_attempted.append("answering your query")
            if "generate_insight" in intents:
                operations_attempted.append("generating legal insights")
            if "notion_documentor" in intents:
                operations_attempted.append("managing legal documents")
            if "notion_scheduler" in intents:
                operations_attempted.append("handling scheduling tasks")

            operations_text = ", ".join(operations_attempted[:-1])
            if len(operations_attempted) > 1:
                operations_text += f", and {operations_attempted[-1]}"
            else:
                operations_text = operations_attempted[0]

            main_response = f"I processed your request by {operations_text}, but wasn't able to generate specific results. Could you please provide more details or rephrase your request?"
        else:
            # Complete fallback if no intents detected
            main_response = "I'm sorry, but I wasn't able to process your request effectively. Could you please rephrase or provide more details?"

    # If we need to summarize additional operations beyond the main response
    additional_operations = []

    # Generate LLM-enhanced descriptions of operations if needed
    if len(resolved_intents) > 1 or (intents and not resolved_intents):
        # Only generate descriptions for operations that weren't the main response
        operations_to_describe = []

        if has_insights and "generate_insight" not in resolved_intents[:1]:
            operations_to_describe.append(("Legal Analysis", insight_results))

        if has_documents and "notion_documentor" not in resolved_intents[:1]:
            operations_to_describe.append(("Document Management", document_results))

        if has_scheduling and "notion_scheduler" not in resolved_intents[:1]:
            operations_to_describe.append(("Scheduling", scheduler_results))

        # If we have operations to describe, use LLM to summarize them
        if operations_to_describe:
            try:
                # For each operation, get a concise summary using LLM
                for op_type, op_result in operations_to_describe:
                    # Generate icon based on operation type
                    icon = (
                        "📊"
                        if op_type == "Legal Analysis"
                        else "📄" if op_type == "Document Management" else "📅"
                    )

                    # Use LLM to generate a concise summary
                    messages = [
                        SystemMessage(
                            content=f"""
                        You are a legal assistant summarization expert. Your task is to create a very concise 
                        summary (1-2 sentences) of the {op_type.lower()} operations that were performed.
                        Focus only on what was accomplished, not how it was done.
                        Start directly with the key outcome, no preamble needed.
                        """
                        ),
                        HumanMessage(
                            content=f"Please summarize this {op_type.lower()} result concisely: {op_result[:500]}..."
                        ),
                    ]

                    summary = llm.invoke(messages).content
                    # Clean up common verbosity patterns
                    summary = re.sub(
                        r"^(I |In summary, |To summarize, |Overall, |The system )",
                        "",
                        summary,
                    )
                    summary = summary.strip()

                    additional_operations.append(f"{icon} **{op_type}**: {summary}")
            except Exception as e:
                # Fall back to simple summaries if LLM fails
                print(f"Error generating operation summaries: {e}")
                for op_type, op_result in operations_to_describe:
                    icon = (
                        "📊"
                        if op_type == "Legal Analysis"
                        else "📄" if op_type == "Document Management" else "📅"
                    )
                    summary = summarize_result(op_result)
                    additional_operations.append(f"{icon} **{op_type}**: {summary}")

        # If we attempted operations that didn't produce results, mention them
        attempted_but_failed = [
            intent for intent in intents if intent not in resolved_intents
        ]
        if attempted_but_failed:
            failed_operations = []
            if "chat" in attempted_but_failed:
                failed_operations.append("answering your query")
            if "generate_insight" in attempted_but_failed:
                failed_operations.append("generating legal insights")
            if "notion_documentor" in attempted_but_failed:
                failed_operations.append("processing legal documents")
            if "notion_scheduler" in attempted_but_failed:
                failed_operations.append("managing scheduling tasks")

            if failed_operations:
                failed_text = ", ".join(failed_operations[:-1])
                if len(failed_operations) > 1:
                    failed_text += f", and {failed_operations[-1]}"
                else:
                    failed_text = failed_operations[0]

                additional_operations.append(
                    f"ℹ️ **Note**: I also attempted {failed_text}, but couldn't complete those operations with the provided information."
                )

    # Construct the final response
    final_response = main_response

    # Add summaries of additional operations if they exist
    if additional_operations:
        final_response += "\n\n---\n\n**Additional operations performed:**\n\n"
        final_response += "\n\n".join(additional_operations)

    output["result"] = final_response
    return output


def summarize_result(result_text: str, max_length: int = 100) -> str:
    """Helper function to create a brief summary of operation results.

    Args:
        result_text: The full result text to summarize
        max_length: Maximum length of the summary

    Returns:
        A brief summary of the operation result
    """
    # If the result is short enough, just return it
    if len(result_text) <= max_length:
        return result_text

    # Try to find the first sentence or meaningful chunk
    sentences = result_text.split(".")
    if sentences and len(sentences[0]) + 1 <= max_length:
        return sentences[0] + "..."

    # If that doesn't work, just truncate
    return result_text[: max_length - 3] + "..."


# Add conditional edges from memory_manager based on intent
def route_from_memory(state: SuperGraphState):
    """Route user requests based on detected intents.

    This tool examines the intents detected in the user's message and
    determines which functional nodes should process the request.
    Multiple intents can be handled simultaneously.

    Args:
        state: The current state containing detected intents

    Returns:
        List of routing instructions based on detected intents
    """
    print("-x" * 100, state)
    intents = state["intents"]
    router_list = []
    # if "chat" in intents:
    #     router_list.append(Send("chat", {"input": state["input"], "user_id": state["user_id"], "space_id": state["space_id"], "thread_id": state["thread_id"], "memory_summary": state["memory_summary"]}))
    router_list.append(
        Send(
            "chat",
            {
                "input": state["input"],
                "user_id": state["user_id"],
                "space_id": state["space_id"],
                "thread_id": state["thread_id"],
                "memory_summary": state["memory_summary"],
            },
        )
    )
    if "generate_insight" in intents:
        router_list.append(
            Send(
                "insight_generator",
                {
                    "input": state["input"],
                    "user_id": state["user_id"],
                    "space_id": state["space_id"],
                    "thread_id": state["thread_id"],
                    "memory_summary": state["memory_summary"],
                },
            )
        )
    if "notion_documentor" in intents:
        router_list.append(
            Send(
                "notion_documentor",
                {
                    "input": state["input"],
                    "user_id": state["user_id"],
                    "space_id": state["space_id"],
                    "thread_id": state["thread_id"],
                    "memory_summary": state["memory_summary"],
                },
            )
        )
    if "notion_scheduler" in intents:
        router_list.append(
            Send(
                "notion_scheduler",
                {
                    "input": state["input"],
                    "user_id": state["user_id"],
                    "space_id": state["space_id"],
                    "thread_id": state["thread_id"],
                    "memory_summary": state["memory_summary"],
                },
            )
        )
    # return [Send(intent, {"hello": "world"}) for intent in intents if intent in ["chat", "generate_insight", "notion_documentor", "notion_aggregator"]]
    return router_list


def input_mapper(state: InputState) -> SuperGraphState:
    new_state = state.copy()
    new_state["intents"] = []
    new_state["output_message"] = ""
    new_state["chat_results"] = ""
    new_state["memory_summary"] = ""
    new_state["summary"] = ""
    new_state["positives"] = []
    new_state["negatives"] = []
    new_state["result"] = ""
    new_state["memory_summary"] = state["input"]
    new_state["thread_id"] = state["thread_id"]
    new_state["user_id"] = state["user_id"]
    new_state["space_id"] = state["space_id"]
    new_state["input"] = state["input"]
    return new_state


graph = StateGraph(SuperGraphState, input=InputState, output=OutputState)
graph.add_node("input_mapper", input_mapper)
graph.add_node("memory_manager", build_memory_manager().compile())
graph.add_node("intent_selector", intent_selector)
graph.add_node("chat", build_chat_subgraph().compile())
graph.add_node("insight_generator", build_insight_generator().compile())
graph.add_node("notion_documentor", notion_documentor)
graph.add_node("notion_scheduler", notion_scheduler)
graph.add_node("result_aggregator", aggregator)

# Define the edges between nodes
graph.add_edge(START, "input_mapper")
graph.add_edge("input_mapper", "memory_manager")
graph.add_edge("memory_manager", "intent_selector")


graph.add_conditional_edges(
    "intent_selector",
    route_from_memory,
    {
        "chat": "chat",
        "insight_generator": "insight_generator",
        "notion_documentor": "notion_documentor",
        "notion_scheduler": "notion_scheduler",
    },
)

graph.add_edge("chat", "result_aggregator")
graph.add_edge("insight_generator", "result_aggregator")
graph.add_edge("notion_documentor", "result_aggregator")
graph.add_edge("notion_scheduler", "result_aggregator")
graph.add_edge("result_aggregator", END)

# Compile the graph
memory_path = "./agent_memory"
# memory_saver = MemorySaver()
# compiled_graph = graph.compile(checkpointer=memory_saver)
compiled_graph = graph.compile()
compiled_graph
