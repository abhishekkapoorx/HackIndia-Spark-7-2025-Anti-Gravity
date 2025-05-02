import os
import requests
import json
import asyncio
from typing import Dict, Any, Optional, List

# Load Notion API key from environment or a fixed value for testing
NOTION_KEY = os.environ.get("NOTION_API_KEY", "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")

# Notion API headers
NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
}

async def save_to_notion(
    title: str, 
    content: str, 
    properties: Optional[Dict[str, Any]] = None,
    parent_page_id: Optional[str] = None,
    use_mcp: bool = False
) -> Dict[str, Any]:
    """
    Save content to Notion as a new page.
    
    Args:
        title: The title of the document
        content: The content of the document in markdown format
        properties: Additional properties for the Notion page
        parent_page_id: ID of the parent page (if None, will use the first page found)
        use_mcp: Whether to use the Model Context Protocol server for saving
        
    Returns:
        Dictionary with operation details and status
    """
    try:
        # If no parent page ID is provided, find the first available page
        if not parent_page_id:
            parent_page_id = await _get_first_parent_page_id()
            if not parent_page_id:
                return {"success": False, "error": "No parent page found"}
        
        # Format page content as blocks
        blocks = _format_content_as_blocks(content)
        
        # Create or update properties dictionary
        page_properties = {
            "title": {"title": [{"type": "text", "text": {"content": title}}]}
        }
        
        # Add custom properties if provided
        if properties:
            page_properties.update(properties)
        
        # Prepare request body for page creation
        create_page_body = {
            "parent": {"page_id": parent_page_id},
            "properties": page_properties,
            "children": blocks
        }
        
        if use_mcp:
            # Use the MCP server for creating content
            return await _create_page_via_mcp(create_page_body)
        else:
            # Use direct Notion API
            return await _create_page_direct(create_page_body)
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to save to Notion"
        }

async def _get_first_parent_page_id() -> Optional[str]:
    """
    Get the ID of the first available page in the workspace.
    
    Returns:
        ID of the first page or None if no pages found
    """
    search_params = {"filter": {"value": "page", "property": "object"}}
    
    try:
        response = requests.post(
            "https://api.notion.com/v1/search", 
            json=search_params, 
            headers=NOTION_HEADERS
        )
        
        if response.status_code == 200:
            results = response.json().get("results", [])
            if results:
                return results[0]["id"]
        
        return None
        
    except Exception as e:
        print(f"Error finding parent page: {e}")
        return None

def _format_content_as_blocks(content: str) -> List[Dict[str, Any]]:
    """
    Format markdown content as Notion API blocks.
    
    Args:
        content: Markdown formatted content
        
    Returns:
        List of Notion API blocks
    """
    blocks = []
    lines = content.split("\n")
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Skip empty lines
        if not line:
            i += 1
            continue
            
        # Heading blocks
        if line.startswith("# "):
            blocks.append({
                "object": "block",
                "type": "heading_1",
                "heading_1": {
                    "rich_text": [{"type": "text", "text": {"content": line[2:]}}]
                }
            })
        elif line.startswith("## "):
            blocks.append({
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"type": "text", "text": {"content": line[3:]}}]
                }
            })
        elif line.startswith("### "):
            blocks.append({
                "object": "block",
                "type": "heading_3",
                "heading_3": {
                    "rich_text": [{"type": "text", "text": {"content": line[4:]}}]
                }
            })
        # Bulleted list items
        elif line.startswith("- "):
            blocks.append({
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {
                    "rich_text": [{"type": "text", "text": {"content": line[2:]}}]
                }
            })
        # Numbered list items
        elif line.startswith("1. ") or line[0].isdigit() and line[1:].startswith(". "):
            text_content = line[line.find('. ')+2:]
            blocks.append({
                "object": "block",
                "type": "numbered_list_item",
                "numbered_list_item": {
                    "rich_text": [{"type": "text", "text": {"content": text_content}}]
                }
            })
        # Default to paragraph for everything else
        else:
            blocks.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": line}}]
                }
            })
            
        i += 1
        
    return blocks

async def _create_page_direct(create_page_body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a page directly using the Notion API.
    
    Args:
        create_page_body: The body for the page creation request
        
    Returns:
        Response data from the API
    """
    try:
        response = requests.post(
            "https://api.notion.com/v1/pages",
            json=create_page_body,
            headers=NOTION_HEADERS
        )
        
        if response.status_code == 200:
            result = response.json()
            return {
                "success": True,
                "page_id": result.get("id"),
                "url": result.get("url"),
                "message": "Document successfully saved to Notion"
            }
        else:
            return {
                "success": False, 
                "error": f"API Error: {response.status_code}", 
                "details": response.text
            }
            
    except Exception as e:
        return {"success": False, "error": str(e)}

async def _create_page_via_mcp(create_page_body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a page using the Model Context Protocol server.
    
    Args:
        create_page_body: The body for the page creation request
        
    Returns:
        Response data from the MCP server
    """
    try:
        # Call the MCP server (assuming it's running on localhost:3001)
        response = requests.post(
            "http://localhost:3001/api/notion/create-page",
            json=create_page_body
        )
        
        if response.status_code == 200:
            result = response.json()
            return {
                "success": True,
                "page_id": result.get("id"),
                "url": result.get("url", ""),
                "message": "Document successfully saved to Notion via MCP"
            }
        else:
            return {
                "success": False, 
                "error": f"MCP Server Error: {response.status_code}", 
                "details": response.text
            }
            
    except Exception as e:
        return {"success": False, "error": str(e)}

async def get_notion_page_content(page_id: str) -> Dict[str, Any]:
    """
    Retrieve content from a Notion page.
    
    Args:
        page_id: ID of the Notion page
        
    Returns:
        Dictionary with page content and metadata
    """
    try:
        # Get page metadata
        page_response = requests.get(
            f"https://api.notion.com/v1/pages/{page_id}",
            headers=NOTION_HEADERS
        )
        
        if page_response.status_code != 200:
            return {"success": False, "error": f"Failed to get page: {page_response.status_code}"}
            
        page_data = page_response.json()
        
        # Get page content (blocks)
        blocks_response = requests.get(
            f"https://api.notion.com/v1/blocks/{page_id}/children",
            headers=NOTION_HEADERS
        )
        
        if blocks_response.status_code != 200:
            return {"success": False, "error": f"Failed to get blocks: {blocks_response.status_code}"}
            
        blocks_data = blocks_response.json()
        
        # Extract title from properties
        title = ""
        if "properties" in page_data and "title" in page_data["properties"]:
            title_items = page_data["properties"]["title"].get("title", [])
            if title_items:
                title = title_items[0].get("plain_text", "")
        
        return {
            "success": True,
            "title": title,
            "url": page_data.get("url", ""),
            "blocks": blocks_data.get("results", []),
            "created_time": page_data.get("created_time"),
            "last_edited_time": page_data.get("last_edited_time"),
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}