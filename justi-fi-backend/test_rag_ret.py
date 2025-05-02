# import os
# from langchain_pinecone import PineconeVectorStore
# from langchain_huggingface import HuggingFaceEmbeddings
from lib.VectorStore import VectorStore
from lib.embeddings import embeddings_e5_large, embeddings_mpnet_base
from lib.api_keys import pinecone_api_key_anshul, pinecone_api_key_madhav

# # # Set your Pinecone API key
# # os.environ["PINECONE_API_KEY"] = "pcsk_2w3P93_4JfzzGbQqQjn1SjxDrwMN7f9jvNvaSLhfdmqTg4PrAf5kRZyj12e6sLS5E7Xmim"


# # Define your Pinecone index name
# index_name = "law"

# # Initialize the Pinecone vector store
# vectorstore = VectorStore("law", embeddings_e5_large, pinecone_api_key_anshul).getVectorStore()

# # Define your query
# query = "What is the procedure for filing a civil suit under Indian law?"

# # Retrieve relevant documents along with similarity scores
# results = vectorstore.similarity_search_with_score(query)

# # Display the retrieved documents with similarity scores and URLs
# print(f"\n🔍 Top {len(results)} relevant results for: '{query}'\n")
# for i, (doc, score) in enumerate(results, 1):
#     source = doc.metadata.get('source_file', 'Unknown')
#     url = doc.metadata.get('document_url', 'N/A')
#     print(f"[{i}] 📄 Source: {source}")
#     print(f"🔗 URL: {url}")
#     print(f"📊 Similarity Score: {score:.4f}")
#     print(f"📝 Content: {doc.page_content.strip()[:500]}...\n")




import os
from langchain_pinecone import PineconeVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
import json

# # Define your Pinecone index name
index_name = "cases"

# # Initialize the Pinecone vector store
vectorstore = VectorStore("cases", embeddings_mpnet_base, pinecone_api_key_madhav).getVectorStore()

# Define your query
query = "What is the procedure for filing a civil suit under Indian law?"

# Retrieve relevant documents along with similarity scores
results = vectorstore.similarity_search_with_score(query)

# Display the retrieved documents with similarity scores and full metadata
print(f"\n🔍 Top {len(results)} relevant results for: '{query}'\n")
for i, (doc, score) in enumerate(results, 1):
    print(f"[{i}] 📄 Document:")
    print(f"📊 Similarity Score: {score:.4f}")
    print("📝 Page Content:")
    print(doc.page_content.strip())
    print("🗂 Metadata:")
    print(json.dumps(doc.metadata, indent=2))
    print("\n" + "-"*80 + "\n")