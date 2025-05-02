from contextlib import asynccontextmanager
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent

from lib.llm import llm

@asynccontextmanager
async def make_Notion_graph():
    async with MultiServerMCPClient(
        {
            "notion": {
            "command": "npx",
            "args": ["-y", "@suekou/mcp-notion-server"],
            "env": {
                "NOTION_API_TOKEN": "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"
                }
            }
        }
    ) as client:
        agent = create_react_agent(llm, client.get_tools())
        yield agent