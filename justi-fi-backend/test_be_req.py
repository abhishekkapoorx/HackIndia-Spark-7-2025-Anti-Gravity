import requests


res = requests.post(f"http://localhost:3000/api/spaces/68139dd3fb94d3980eabdafc/space-messages", json={
    "user_id": "68139db5d8cc44bd868ae9b9",
})
print(res.json())