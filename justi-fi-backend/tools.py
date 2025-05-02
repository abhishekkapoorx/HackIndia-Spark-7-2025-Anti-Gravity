import requests
from lib.llm import llm
from lib.VectorStore import VectorStore
from lib.embeddings import embeddings_e5_large, embeddings_mpnet_base
from lib.api_keys import pinecone_api_key_anshul, pinecone_api_key_madhav
from typing import Dict, List

import operator
from typing import TypedDict, List, Annotated, Optional, Any, Dict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
import os
import dotenv
import uuid
import asyncio
from langgraph.graph.message import add_messages
from langchain_core.messages import HumanMessage, SystemMessage
from lib.VectorStore import VectorStore
from lib.embeddings import embeddings
from lib.llm import llm
from langchain_core.documents import Document
from lib.api_keys import pinecone_api_key
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field

dotenv.load_dotenv()

law_store = VectorStore("law", embeddings_e5_large, pinecone_api_key_anshul).getVectorStore()
preceeding_store = VectorStore("cases", embeddings_mpnet_base, pinecone_api_key_madhav).getVectorStore()


long_term_db = VectorStore("long-term-db", embeddings, pinecone_api_key)
long_term_db = long_term_db.getVectorStore()

short_term_db = VectorStore("short-term-db", embeddings, pinecone_api_key)
short_term_db = short_term_db.getVectorStore()

def rag_law(query: str) -> List[str]:
    """Retrieve legal statutes, regulations, and legislative documents related to a query.
    
    This tool searches a vector database of legal statutes and regulations to find
    documents relevant to the user's query. It returns structured XML results with
    source information, relevance scores, and content excerpts from legal documents.
    
    Args:
        query: A string containing the legal question or topic to search for
        
    Returns:
        A list of XML-formatted document entries with source, URL, and content
    """
    # 1. Query vector DB with combined user input

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
    return law_context


def rag_previous_cases(query: str) -> List[str]:
    """Retrieve previous legal cases and precedents related to a query.
    
    This tool searches a vector database of legal case precedents to find
    similar cases relevant to the user's query. It returns structured XML results
    with case names, relevance scores, and key excerpts from previous legal cases.
    
    Args:
        query: A string containing the legal question or situation to find relevant cases for
        
    Returns:
        A list of XML-formatted document entries with source, URL, and content
    """
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
    
    return law_context


def short_term_retrieval(query:str, thread_id: str) -> List[str]:
    """Retrieve relevant recent conversation history from short-term memory.
    
    This tool optimizes the user's query to better match recent conversations,
    then searches the short-term memory store for relevant context. It uses
    semantic search to find the most similar previous exchanges.
    
    Args:
        state: The current state with user input
        
    Returns:
        Updated state with short_term_history field containing relevant recent conversations
    """
    # Make a copy of the state to avoid mutating it
    
    tid = thread_id
    
    try:
        # Define system message and user message for LLM
        system_message = """
        You are a query clarification assistant helping to improve search results.
        Your task is to analyze user queries and rewrite them to enhance semantic search relevance.
        Consider entities mentioned, timeframes, and specific information needs.
        Rewrite the query to be more specific and detailed for better search results.
        Return ONLY the rewritten query without explanations or additional text.
        """
        
        user_message = f"""
        Original query: {query}
        
        Please rewrite this query to:
        1. Identify specific entities (people, cases, documents)
        2. Clarify relevant timeframes
        3. Specify the exact information needed
        
        Make it optimized for semantic search against recent conversation history.
        """
        
        # Get clarified query from LLM with message objects
        messages = [
            SystemMessage(content=system_message),
            HumanMessage(content=user_message)
        ]
        llm_response = llm.invoke(messages)
        clarified_query = llm_response.content if hasattr(llm_response, 'content') else str(llm_response)
        
        print(f"Original query: {query}")
        print(f"Clarified query: {clarified_query}")
        
        # Query ChromaDB for recent memories using LangChain integration with clarified query
        filter_dict = {"thread_id": tid}
        results = short_term_db.similarity_search_with_score(
            query=clarified_query, k=15, filter=filter_dict
        )
        
    except Exception as e:
        print(f"Error retrieving from short-term memory: {e}")
        
    return [doc.page_content for doc, _ in results]


def getMessages(user_id: str, space_id: str) -> List[Dict[str, str]|None]:
    res = requests.post(f"http://localhost:3000/api/spaces/{space_id}/space-messages", json={
        "user_id": user_id,
    })
    return res.json()

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
def saveInNotion(response: DocumentResponse):
    """
    Save a legal document to Notion using direct API requests.
    
    Args:
        response: A DocumentResponse object containing the document details
    
    Returns:
        Dictionary with the save operation results
    """
    try:
        import os
        import requests
        
        # Load Notion API key from environment or use the fixed value
        NOTION_KEY = os.environ.get("NOTION_API_KEY", "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")
        
        # Notion API headers
        NOTION_HEADERS = {
            "Authorization": f"Bearer {NOTION_KEY}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
        }
        
        # Step 1: Find a parent page to add the document to
        search_params = {"filter": {"value": "page", "property": "object"}}
        
        search_response = requests.post(
            "https://api.notion.com/v1/search", 
            json=search_params, 
            headers=NOTION_HEADERS
        )
        
        if search_response.status_code != 200:
            return {
                "success": False,
                "error": f"Failed to find parent page: {search_response.status_code}",
                "details": search_response.text
            }
        
        search_results = search_response.json().get("results", [])
        if not search_results:
            return {
                "success": False,
                "error": "No parent pages found in Notion workspace"
            }
        
        # Get the ID of the first page
        parent_page_id = search_results[0]["id"]
        
        # Format document title and content
        title = response.document_title
        
        # Step 2: Create a new page with only title property (avoiding custom properties that might not exist)
        page_properties = {
            "title": {"title": [{"type": "text", "text": {"content": title}}]}
        }
        
        # Format content as blocks
        blocks = []
        
        # Title block
        blocks.append({
            "object": "block",
            "type": "heading_1",
            "heading_1": {
                "rich_text": [{"type": "text", "text": {"content": response.document_title}}]
            }
        })
        
        # Document type
        blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {
                "rich_text": [{"type": "text", "text": {"content": f"Document Type: {response.document_type}"}}]
            }
        })
        
        # Court Information section
        blocks.append({
            "object": "block",
            "type": "heading_2",
            "heading_2": {
                "rich_text": [{"type": "text", "text": {"content": "Court Information"}}]
            }
        })
        blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {
                "rich_text": [{"type": "text", "text": {"content": response.court_name}}]
            }
        })
        blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {
                "rich_text": [{"type": "text", "text": {"content": f"Case Number: {response.case_number if response.case_number else 'TBD'}"}}]
            }
        })
        
        # Parties section
        blocks.append({
            "object": "block",
            "type": "heading_2",
            "heading_2": {
                "rich_text": [{"type": "text", "text": {"content": "Parties"}}]
            }
        })
        blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {
                "rich_text": [{"type": "text", "text": {"content": f"Filing Party: {response.filing_party}"}}]
            }
        })
        if response.opposing_party:
            blocks.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": f"Opposing Party: {response.opposing_party}"}}]
                }
            })
        
        # Document Content section
        blocks.append({
            "object": "block",
            "type": "heading_2",
            "heading_2": {
                "rich_text": [{"type": "text", "text": {"content": "Document Content"}}]
            }
        })
        
        # Split the document content into paragraphs and add each paragraph as a block
        content_paragraphs = response.document_content.split('\n\n')
        for paragraph in content_paragraphs:
            if paragraph.strip():
                blocks.append({
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": paragraph.strip()}}]
                    }
                })
        
        # Certificate of Service section (if available)
        if response.certificate_of_service:
            blocks.append({
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"type": "text", "text": {"content": "Certificate of Service"}}]
                }
            })
            blocks.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": response.certificate_of_service}}]
                }
            })
        
        # Next Steps section
        blocks.append({
            "object": "block",
            "type": "heading_2",
            "heading_2": {
                "rich_text": [{"type": "text", "text": {"content": "Next Steps"}}]
            }
        })
        
        if response.next_steps:
            for step in response.next_steps:
                blocks.append({
                    "object": "block",
                    "type": "bulleted_list_item",
                    "bulleted_list_item": {
                        "rich_text": [{"type": "text", "text": {"content": step}}]
                    }
                })
        else:
            blocks.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": "No specific next steps identified."}}]
                }
            })
        
        # Create the request body
        create_page_body = {
            "parent": {"page_id": parent_page_id},
            "properties": page_properties,
            "children": blocks
        }
        
        # Step 3: Send the API request to create the page
        create_response = requests.post(
            "https://api.notion.com/v1/pages",
            json=create_page_body,
            headers=NOTION_HEADERS
        )
        
        if create_response.status_code in [200, 201]:
            result = create_response.json()
            print(f"Document saved to Notion: {title}")
            return {
                "success": True,
                "page_id": result.get("id"),
                "url": result.get("url"),
                "message": "Document successfully saved to Notion"
            }
        else:
            return {
                "success": False,
                "error": f"API Error: {create_response.status_code}",
                "details": create_response.text
            }
            
    except Exception as e:
        print(f"Error saving document to Notion: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to save document to Notion"
        }


def long_term_retrieval(query:str, space_id: str) -> List[str]:
    """Retrieve important historical information from long-term memory.
    
    This tool searches the long-term memory store for significant legal facts,
    case information, and other persistent knowledge that might be relevant to
    the current query. It optimizes the query for historical retrieval.
    
    Args:
        state: The current state with user input and optional clarified query
        
    Returns:
        Updated state with long_term_snippets field containing relevant historical information
    """
    
    try:
        # Use the clarified query if available, otherwise create one
       
        # Define system message and user message for LLM
        system_message = """
        You are a historical context assistant specializing in legal case information retrieval.
        Your task is to analyze user queries and optimize them for retrieving relevant historical data.
        Consider case history, precedents, and long-term context that might be relevant.
        Return ONLY the rewritten query without explanations or additional text.
        """
        
        user_message = f"""
        Original query: {query}
        
        Please rewrite this query to:
        1. Identify historical case information that might be relevant
        2. Include possible precedents or similar past situations
        3. Expand abbreviations and legal terminology
        4. Consider longer-term context and relationships
        
        Make it optimized for semantic search against historical case records.
        """
        
        # Get clarified query from LLM with message objects
        messages = [
            SystemMessage(content=system_message),
            HumanMessage(content=user_message)
        ]
        llm_response = llm.invoke(messages)
        query_text = llm_response.content if hasattr(llm_response, 'content') else str(llm_response)
        
        # Use Pinecone through LangChain
        filter_dict = {
            "space_id": space_id
        }
        
        results = long_term_db.similarity_search(
            query=query_text, k=15, filter=filter_dict
        )
        
    except Exception as e:
        print(f"Error retrieving from long-term memory: {e}")
        
    return [doc.page_content for doc in results]


tools = [rag_law, rag_previous_cases]
# llm_with_tools = llm.bind_tools(tools)