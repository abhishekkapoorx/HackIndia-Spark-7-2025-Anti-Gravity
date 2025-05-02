import getpass
import os
import time
from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore

class VectorStore:


    def __init__(self, index_name, embedding, api_key, *args, **kwargs):
        self.index_name = index_name  # change if desired
        self.embedding = embedding
        self.api_key = api_key
        self.pc = Pinecone(api_key=api_key)

        existing_indexes = [index_info["name"] for index_info in self.pc.list_indexes()]

        if index_name not in existing_indexes:
            self.pc.create_index(
                name=index_name,
                dimension=4096,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1"),
            )
            while not self.pc.describe_index(index_name).status["ready"]:
                time.sleep(1)

        self.index = self.pc.Index(index_name)
        print(f"Index: {index_name}")

        self.vector_store = PineconeVectorStore(index=self.index, embedding=self.embedding, pinecone_api_key=self.api_key)

    def __str__(self):
        return f"<Pinecone VectorStore - {self.index_name}>"
    
    def getVectorStore(self):
        return self.vector_store
    
