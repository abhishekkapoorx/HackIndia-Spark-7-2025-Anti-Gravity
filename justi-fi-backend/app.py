from fastapi import FastAPI, WebSocket
from MainAgent import compiled_graph as graph
from pydantic import BaseModel

app = FastAPI()


class ChatInput(BaseModel):
    input: str
    user_id: str
    space_id: str
    thread_id: str


@app.post("/chat")
async def chat(input: ChatInput):
    config = {"configurable": {"thread_id": input.thread_id}}
    response = await graph.ainvoke(
        {
            "input": input.input,
            "thread_id": input.thread_id,
            "user_id": input.user_id,
            "space_id": input.space_id,
        },
        config=config,
    )
    return response


# Streaming
# Serve the HTML chat interface
@app.get("/")
async def get():
    return {"message": "Hello, this is a chat server. Use /chat for POST requests."}


# WebSocket endpoint for real-time streaming
@app.websocket("/ws/{user_id}/{space_id}/{thread_id}")
async def websocket_endpoint(websocket: WebSocket, user_id:str, space_id: str, thread_id: str):
    config = {"configurable": {"thread_id": thread_id}}
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        async for event in graph.astream(
            {
                "input": data,
                "thread_id": thread_id,
                "user_id": user_id,
                "space_id": space_id,
            },
            config=config,
            stream_mode="messages",
        ):
            print(event)
            await websocket.send_text(event[0].content)
