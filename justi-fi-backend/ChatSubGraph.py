from token import STAR
from langgraph.graph import StateGraph, START, END
from typing import Annotated, Dict, Any, List, TypedDict
from lib.llm import llm
from langchain_core.messages import SystemMessage, HumanMessage
from MemoryManager import string_reducer
from lib.VectorStore import VectorStore
from lib.embeddings import embeddings_e5_large, embeddings_mpnet_base
from lib.api_keys import pinecone_api_key_anshul, pinecone_api_key_madhav

law_store = VectorStore("law", embeddings_e5_large, pinecone_api_key_anshul).getVectorStore()
preceeding_store = VectorStore("cases", embeddings_mpnet_base, pinecone_api_key_madhav).getVectorStore()

class ChatSubgraphState(TypedDict):
    """State for the chat subgraph."""
    user_id: Annotated[str, string_reducer]
    thread_id: Annotated[str, string_reducer]
    space_id: Annotated[str, string_reducer]
    input: Annotated[str, string_reducer]
    intents: List[str]
    chat_results: Annotated[str, string_reducer]
    memory_summary: Annotated[str, string_reducer]
    rag_law_context: Annotated[str, string_reducer]
    rag_preceedings_context: Annotated[str, string_reducer]
    doc_context: Annotated[str, string_reducer]
    merged_context_chat: Annotated[str, string_reducer]

class ChatSubgraphInput(TypedDict):
    """Input for the chat subgraph."""
    input: Annotated[str, string_reducer]
    user_id: Annotated[str, string_reducer]
    space_id: Annotated[str, string_reducer]
    thread_id: Annotated[str, string_reducer]
    memory_summary: Annotated[str, string_reducer]

class ChatSubgraphOutput(TypedDict):
    """Output for the chat subgraph."""
    chat_results: Annotated[str, string_reducer]



def rag_law(state: ChatSubgraphInput) -> ChatSubgraphState:
    # 1. Query vector DB with combined user input and memory summary
    # 2. Inject retrieved text into state['rag_context']
    user_query = state["input"]
    memory_context = state.get("memory_summary", "")
    
    # Merge user input with memory summary for richer context
    if memory_context:
        from lib.llm import llm
        from langchain_core.messages import SystemMessage, HumanMessage
        
        try:
            # Use LLM to create an optimized query that combines user input with memory context
            messages = [
                SystemMessage(content="""
                You are a legal query optimizer. Your task is to combine a user's question with relevant context 
                from their conversation history to create a more effective search query. Focus on:
                1. Legal terminology from both inputs
                2. Case references and citations
                3. Specific legal questions or requirements
                4. Relevant dates, names, and entities
                
                Return ONLY the optimized search query without explanations.
                """),
                HumanMessage(content=f"""
                USER QUESTION: {user_query}
                
                CONVERSATION CONTEXT: {memory_context}
                
                Create an optimized search query that combines the user's question with relevant context.
                """)
            ]
            
            # enhanced_query = llm.invoke(messages).content
            enhanced_query = user_query
            print(f"Enhanced query: {enhanced_query}")
            query = enhanced_query
        except Exception as e:
            print(f"Error creating enhanced query: {e}. Using original query.")
            # Fallback to simple concatenation if LLM enhancement fails
            query = f"{user_query} {memory_context}"
    else:
        query = user_query
    
    # Retrieve relevant documents along with similarity scores
    results = law_store.similarity_search_with_score(query, k=5)
    
    # Format and store the retrieved context using XML style tags
    law_context = []
    
    for i, (doc, score) in enumerate(results):
        law_context.append(f"""<Document rank="{i+1}" relevance="{score:.4f}">
      <Source>{doc.metadata.get('source_file', 'Legal Document')}</Source>
      <Url>{doc.metadata.get('document_url', 'Legal Document')}</Url>
      <Content>{doc.page_content}</Content>
    </Document>""")
    
    # Add retrieved context to state
    state['rag_law_context'] = "\n".join(law_context)
    
    return state

def rag_previous_cases(state: ChatSubgraphInput) -> ChatSubgraphState:
    # 1. Query vector DB with combined user input and memory summary
    # 2. Inject retrieved text into state['rag_context']
    user_query = state["input"]
    memory_context = state.get("memory_summary", "")
    
    # Merge user input with memory summary for richer context
    if memory_context:
        
        
        try:
            # Use LLM to create an optimized query that combines user input with memory context
            messages = [
                SystemMessage(content="""
                You are a legal query optimizer. Your task is to combine a user's question with relevant context 
                from their conversation history to create a more effective search query. Focus on:
                1. Legal terminology from both inputs
                2. Case references and citations
                3. Specific legal questions or requirements
                4. Relevant dates, names, and entities
                
                Return ONLY the optimized search query without explanations.
                """),
                HumanMessage(content=f"""
                USER QUESTION: {user_query}
                
                CONVERSATION CONTEXT: {memory_context}
                
                Create an optimized search query that combines the user's question with relevant context.
                """)
            ]
            
            # enhanced_query = llm.invoke(messages).content
            print(f"Enhanced query: {user_query}")
            query = user_query
        except Exception as e:
            print(f"Error creating enhanced query: {e}. Using original query.")
            # Fallback to simple concatenation if LLM enhancement fails
            query = f"{user_query} {memory_context}"
    else:
        query = user_query
    
    # Retrieve relevant documents along with similarity scores
    results = preceeding_store.similarity_search_with_score(query, k=5)
    
    # Format and store the retrieved context using XML style tags
    law_context = []
    
    for i, (doc, score) in enumerate(results):
        law_context.append(f"""<Document rank="{i+1}" relevance="{score:.4f}">
      <Source>{doc.metadata.get('source_file', 'Legal Document')}</Source>
      <Url>{doc.metadata.get('document_url', 'Legal Document')}</Url>
      <Content>{doc.page_content}</Content>
    </Document>""")
    
    # Add retrieved context to state
    state["rag_preceedings_context"] = "\n".join(law_context)
    
    return state



def doc_ret(state: ChatSubgraphInput) -> ChatSubgraphState:
    """Retrieve relevant documents from case-specific document storage.
    
    This tool searches through uploaded case documents to find information relevant
    to the user's query. It provides access to client-specific files, briefs, and
    case documents that may not be available in public legal databases.
    
    Args:
        state: The current state containing user input and memory context
        
    Returns:
        Updated state with doc_context field containing relevant document excerpts
    """
    # 1. Semantic search over uploaded case docs
    # 2. Inject retrieved text into state['doc_context']
    # state['doc_context'] = "…relevant document excerpts…"
    return state

def context_merger(state: ChatSubgraphState) -> ChatSubgraphState:
    """Merge contexts from different retrieval sources into a single structured XML context.
    
    This function combines:
    1. Legal statutes and regulations from rag_law_context
    2. Previous similar cases from rag_preceedings_context
    3. Case-specific documents from doc_context
    
    The merged context preserves the source of each piece of information.
    """
    # Initialize merged context with XML header
    merged_context = ["<MergedContext>"]
    user_query = state.get("input", "")
    memory_summary = state.get("memory_summary", "")
    
    # Add query information section
    merged_context.append(f"""  <QueryInformation>
    <UserQuery>{user_query}</UserQuery>""")
    
    if memory_summary:
        # Extract only the essential part from memory_summary if it's XML
        if "<MemoryUpdate" in memory_summary:
            import re
            memory_extract = re.search(r"<UserQuery>(.*?)</UserQuery>", memory_summary)
            if memory_extract:
                memory_summary = memory_extract.group(1)
        
        merged_context.append(f"    <MemoryContext>{memory_summary}</MemoryContext>")
    
    merged_context.append("  </QueryInformation>")
    
    # Add legal statutes and regulations section if available
    rag_law_context = state.get("rag_law_context", "")
    if rag_law_context:
        merged_context.append("  <LegalStatutes>")
        merged_context.append(rag_law_context)
        merged_context.append("  </LegalStatutes>")
    
    # Add previous cases section if available
    rag_preceedings_context = state.get("rag_preceedings_context", "")
    if rag_preceedings_context:
        merged_context.append("  <PreviousCases>")
        merged_context.append(rag_preceedings_context)
        merged_context.append("  </PreviousCases>")
    
    # Add case document section if available
    doc_context = state.get("doc_context", "")
    if doc_context:
        merged_context.append("  <CaseDocuments>")
        # If doc_context is already XML-formatted, use it directly
        if doc_context.strip().startswith("<"):
            merged_context.append(doc_context)
        else:
            # Otherwise wrap it in Document tags
            merged_context.append(f"    <Document><Content>{doc_context}</Content></Document>")
        merged_context.append("  </CaseDocuments>")
    
    # Close the merged context XML
    merged_context.append("</MergedContext>")
    
    # Store the merged context in the state
    state["merged_context_chat"] = "\n".join(merged_context)
    
    return state

def llm_chat_response(state: ChatSubgraphState) -> ChatSubgraphOutput:
    """Generate a comprehensive legal response based on the merged context from multiple sources.
    
    This function:
    1. Creates a structured prompt with clear citation instructions in markdown format
    2. Passes the full merged context to the LLM
    3. Generates a detailed response that cites relevant legal information with sources and URLs
    4. Returns the response in the chat_results field
    """
    from lib.llm import llm
    from langchain_core.messages import SystemMessage, HumanMessage
    
    # Extract key information from state
    user_query = state.get("input", "")
    merged_context = state.get("merged_context_chat", "")
    
    # Create a structured prompt for the LLM with markdown citation instructions
    system_message = """
    You are JustiFi, an expert legal assistant with access to legal statutes, case law, and relevant documents.
    Your role is to provide accurate, well-reasoned legal information based on the context provided.
    
    INSTRUCTIONS:
    1. Analyze all provided information carefully
    2. ALWAYS cite specific legal statutes, cases, or documents when referencing them
    3. Use proper markdown format for citations: **[Source Name](URL)**
    4. If a URL is not available, use just the source name in bold: **Source Name**
    5. Provide clear explanations that a non-lawyer could understand
    6. When uncertain, acknowledge limitations and avoid making definitive legal assertions
    7. Format your response in a structured, professional manner with markdown headings
    8. Include relevant dates, case numbers, and legal citations where available
    9. Be consistent with your citations - do not assign different numbers or formats to the same source
    10. If citing the same source multiple times, use identical formatting each time
    
    CITATION FORMAT EXAMPLES:
    
    From the context like:
    ```xml
    <Document rank="1" relevance="0.8543">
      <Source>Family Law Act 1975</Source>
      <Url>https://legislation.gov.au/Details/C2021C00451</Url>
      <Content>Section 60CC outlines the primary considerations for determining a child's best interests...</Content>
    </Document>
    ```
    
    You should cite it as:
    "...as outlined in Section 60CC **[Family Law Act 1975](https://legislation.gov.au/Details/C2021C00451)**..."
    
    From context like:
    ```xml
    <Document rank="2" relevance="0.7890">
      <Source>Smith v. Jones (2023)</Source>
      <Content>The court determined that in cases of shared custody...</Content>
    </Document>
    ```
    
    You should cite it as:
    "...as determined in **Smith v. Jones (2023)**..."
    
    IMPORTANT: If you reference the same source multiple times, always use the exact same citation format. Do not assign different numbers or identifiers to the same source.
    
    Always use these markdown citation formats to ensure users can easily identify and access legal sources.
    """
    
    # Create the human message with the full merged context
    human_message = f"""
    Please provide legal assistance with the following query:
    
    {user_query}
    
    Based on the following information:
    
    {merged_context}
    
    Generate a comprehensive and helpful legal analysis that ALWAYS cites relevant sources using markdown format.
    For every legal fact or reference you make, include a citation to the appropriate source.
    Remember to be consistent with your citations - if you reference the same source multiple times, use the exact same citation format each time.
    """
    
    try:
        # Generate response using LLM
        messages = [
            SystemMessage(content=system_message),
            HumanMessage(content=human_message)
        ]
        
        response = llm.invoke(messages)
        
        # Extract content from response
        response_content = response.content if hasattr(response, 'content') else str(response)
        
        # Add response to state
        state['chat_results'] = response_content
        
    except Exception as e:
        # Handle any errors
        print(f"Error generating LLM response: {e}")
        state['chat_results'] = f"I apologize, but I encountered an error while processing your request. Please try again or rephrase your question. Technical details: {str(e)}"
    
    return state

def build_chat_subgraph():
    g = StateGraph(ChatSubgraphState, input=ChatSubgraphInput, output=ChatSubgraphOutput)

    # Define nodes
    g.add_node("RAGLaw", rag_law)
    g.add_node("RAGPreviousCases", rag_previous_cases)
    g.add_node("DocRetrieval", doc_ret)
    g.add_node("ContextMerger", context_merger)
    g.add_node("LLMChat", llm_chat_response)

    # Wiring: START → parallel(RAG sources) → ContextMerger → LLM → END
    g.add_edge(START, "RAGLaw")
    g.add_edge(START, "DocRetrieval")
    g.add_edge(START, "RAGPreviousCases")

    # All retrieval nodes connect to the context merger
    g.add_edge("RAGLaw", "ContextMerger")
    g.add_edge("RAGPreviousCases", "ContextMerger")
    g.add_edge("DocRetrieval", "ContextMerger")
    
    # Context merger connects to LLM
    g.add_edge("ContextMerger", "LLMChat")
    g.add_edge("LLMChat", END)

    return g