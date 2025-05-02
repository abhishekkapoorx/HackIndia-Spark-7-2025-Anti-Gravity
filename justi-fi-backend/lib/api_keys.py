import os
import getpass
from dotenv import load_dotenv
load_dotenv()

if not os.getenv("PINECONE_API_KEY"):
    os.environ["PINECONE_API_KEY"] = getpass.getpass("Enter your Pinecone API key: ")
if not os.getenv("PINECONE_API_KEY_ANSHUL"):
    os.environ["PINECONE_API_KEY"] = getpass.getpass("Enter your Anshul Pinecone API key: ")
if not os.getenv("PINECONE_API_KEY_MADHAV"):
    os.environ["PINECONE_API_KEY_MADHAV"] = getpass.getpass("Enter your Madhav Pinecone API key: ")

pinecone_api_key = os.getenv("PINECONE_API_KEY")
pinecone_api_key_anshul = os.getenv("PINECONE_API_KEY_ANSHUL")
pinecone_api_key_madhav = os.getenv("PINECONE_API_KEY_MADHAV")
