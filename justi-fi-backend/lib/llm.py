import os, getpass
import dotenv
dotenv.load_dotenv()


def _set_env(var: str):
    if not os.environ.get(var):
        os.environ[var] = getpass.getpass(f"{var}: ")

_set_env("GROQ_API_KEY")


from langchain_groq import ChatGroq

llm = ChatGroq(model="llama-3.1-8b-instant")
