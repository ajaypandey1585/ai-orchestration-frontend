import os
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

# Initialize Chroma client with new settings
client = chromadb.PersistentClient(path="./chroma_db")

# Initialize a sentence transformer model (or use your own method for vectorization)
model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

# Path to your folder containing the files to convert
folder_path = r'C:/Python_Task/AI-Orc/pdf'

# Function to split the content into chunks
def chunk_content(content, chunk_size=500):
    words = content.split()  # Split content into words
    for i in range(0, len(words), chunk_size):
        yield " ".join(words[i:i+chunk_size])  # Yield chunks of the specified size

# Iterate through the files in the folder and process them
for file_name in os.listdir(folder_path):
    file_path = os.path.join(folder_path, file_name)

    if os.path.isfile(file_path):
        # Read the file content (assuming it's a text file)
        try:
            # Try reading with UTF-8 encoding first
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            print(f"Failed to read {file_name} with UTF-8 encoding. Trying 'latin-1' encoding.")
            # Fallback to a different encoding
            with open(file_path, 'r', encoding='latin-1') as f:
                content = f.read()

        # Split the content into chunks
        chunks = list(chunk_content(content))

        # Convert each chunk into embeddings using the transformer model
        embeddings = model.encode(chunks)

        # Create a separate collection for each file using the file name (without extension)
        collection_name = os.path.splitext(file_name)[0]  # Collection name without file extension
        collection = client.get_or_create_collection(collection_name)

        # Store the chunks and their embeddings in the respective collection
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            chunk_id = f"{file_name}_chunk_{i}"  # Create a unique ID for each chunk
            collection.add(
                documents=[chunk],  # Original chunk content
                embeddings=[embedding.tolist()],  # Vectorized chunk
                metadatas=[{"file_name": file_name, "chunk_index": i}],  # Metadata (file name and chunk index)
                ids=[chunk_id]  # Unique chunk ID
            )

        print(f"File {file_name} has been added to the collection: {collection_name} with {len(chunks)} chunks.")

# List all available collections (indexes) in ChromaDB
collections = client.list_collections()

# Print the names of the collections (indexes)
print("Available collections (indexes):")
for collection in collections:
    print(collection.name)

print(f"All files in {folder_path} have been converted and stored in separate collections in ChromaDB.")
