from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import OllamaEmbeddings
from dotenv import load_dotenv
load_dotenv()

embeddings = OllamaEmbeddings(
    model="llama3"
)

# Initialize the embedding model
embeddings_e5_large = HuggingFaceEmbeddings(model_name="intfloat/e5-large-v2")

embeddings_mpnet_base = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")