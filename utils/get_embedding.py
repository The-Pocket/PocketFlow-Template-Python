from openai import OpenAI
import os
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from dataclasses import dataclass
import hashlib
import json

@dataclass
class DocumentChunk:
    """Represents a chunk of text with metadata for RAG processing."""
    id: str
    text: str
    source: str
    metadata: Dict[str, Any]
    embedding: Optional[List[float]] = None

def get_embedding(text: str, model: str = "text-embedding-3-small") -> List[float]:
    """
    Get embedding vector for a single text string.
    
    Args:
        text: Text to embed
        model: OpenAI embedding model to use
    
    Returns:
        List of floats representing the embedding vector
    """
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "your-api-key"))
    
    # Clean and prepare text
    text = text.replace("\n", " ").strip()
    if not text:
        raise ValueError("Text cannot be empty")
    
    response = client.embeddings.create(
        input=text,
        model=model
    )
    
    return response.data[0].embedding

def get_embeddings_batch(texts: List[str], model: str = "text-embedding-3-small", 
                        batch_size: int = 100) -> List[List[float]]:
    """
    Get embeddings for multiple texts efficiently in batches.
    
    Args:
        texts: List of texts to embed
        model: OpenAI embedding model to use
        batch_size: Number of texts to process in each batch
    
    Returns:
        List of embedding vectors corresponding to input texts
    """
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "your-api-key"))
    
    all_embeddings = []
    
    # Process texts in batches
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        
        # Clean texts
        cleaned_batch = []
        for text in batch:
            cleaned_text = text.replace("\n", " ").strip()
            if not cleaned_text:
                cleaned_text = "empty"  # Placeholder for empty texts
            cleaned_batch.append(cleaned_text)
        
        # Get embeddings for batch
        response = client.embeddings.create(
            input=cleaned_batch,
            model=model
        )
        
        # Extract embeddings
        batch_embeddings = [data.embedding for data in response.data]
        all_embeddings.extend(batch_embeddings)
    
    return all_embeddings

def chunk_document(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """
    Split a document into overlapping chunks for better RAG performance.
    
    Args:
        text: Document text to chunk
        chunk_size: Target size for each chunk in characters
        overlap: Number of characters to overlap between chunks
    
    Returns:
        List of text chunks
    """
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        
        # Try to break at sentence boundaries
        if end < len(text):
            # Look for sentence endings within the last 100 characters
            sentence_end = text.rfind('.', end - 100, end)
            if sentence_end > start:
                end = sentence_end + 1
        
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        
        # Move start position with overlap
        start = end - overlap
        if start >= len(text):
            break
    
    return chunks

def create_document_chunks(text: str, source: str, metadata: Optional[Dict[str, Any]] = None) -> List[DocumentChunk]:
    """
    Create DocumentChunk objects from a text document.
    
    Args:
        text: Document text
        source: Source identifier (filename, URL, etc.)
        metadata: Additional metadata for the document
    
    Returns:
        List of DocumentChunk objects
    """
    if metadata is None:
        metadata = {}
    
    chunks = chunk_document(text)
    document_chunks = []
    
    for i, chunk_text in enumerate(chunks):
        # Create unique ID for chunk
        chunk_id = hashlib.md5(f"{source}_{i}_{chunk_text[:50]}".encode()).hexdigest()
        
        chunk_metadata = metadata.copy()
        chunk_metadata.update({
            "chunk_index": i,
            "total_chunks": len(chunks),
            "chunk_size": len(chunk_text)
        })
        
        document_chunks.append(DocumentChunk(
            id=chunk_id,
            text=chunk_text,
            source=source,
            metadata=chunk_metadata
        ))
    
    return document_chunks

def embed_document_chunks(chunks: List[DocumentChunk], model: str = "text-embedding-3-small") -> List[DocumentChunk]:
    """
    Add embeddings to DocumentChunk objects.
    
    Args:
        chunks: List of DocumentChunk objects
        model: OpenAI embedding model to use
    
    Returns:
        List of DocumentChunk objects with embeddings added
    """
    texts = [chunk.text for chunk in chunks]
    embeddings = get_embeddings_batch(texts, model)
    
    for chunk, embedding in zip(chunks, embeddings):
        chunk.embedding = embedding
    
    return chunks

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculate cosine similarity between two vectors.
    
    Args:
        vec1: First vector
        vec2: Second vector
    
    Returns:
        Cosine similarity score between -1 and 1
    """
    vec1_np = np.array(vec1)
    vec2_np = np.array(vec2)
    
    dot_product = np.dot(vec1_np, vec2_np)
    norm1 = np.linalg.norm(vec1_np)
    norm2 = np.linalg.norm(vec2_np)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    return dot_product / (norm1 * norm2)

def find_similar_chunks(query_embedding: List[float], chunks: List[DocumentChunk], 
                       top_k: int = 5, min_similarity: float = 0.7) -> List[Tuple[DocumentChunk, float]]:
    """
    Find the most similar chunks to a query embedding.
    
    Args:
        query_embedding: Embedding vector for the query
        chunks: List of DocumentChunk objects with embeddings
        top_k: Number of top results to return
        min_similarity: Minimum similarity threshold
    
    Returns:
        List of tuples (chunk, similarity_score) sorted by similarity
    """
    similarities = []
    
    for chunk in chunks:
        if chunk.embedding is None:
            continue
        
        similarity = cosine_similarity(query_embedding, chunk.embedding)
        if similarity >= min_similarity:
            similarities.append((chunk, similarity))
    
    # Sort by similarity (descending) and return top_k
    similarities.sort(key=lambda x: x[1], reverse=True)
    return similarities[:top_k]

def search_documents(query: str, chunks: List[DocumentChunk], top_k: int = 5, 
                    min_similarity: float = 0.7, model: str = "text-embedding-3-small") -> List[Tuple[DocumentChunk, float]]:
    """
    Search for relevant document chunks using semantic similarity.
    
    Args:
        query: Search query text
        chunks: List of DocumentChunk objects with embeddings
        top_k: Number of top results to return
        min_similarity: Minimum similarity threshold
        model: OpenAI embedding model to use for query
    
    Returns:
        List of tuples (chunk, similarity_score) sorted by relevance
    """
    query_embedding = get_embedding(query, model)
    return find_similar_chunks(query_embedding, chunks, top_k, min_similarity)

if __name__ == "__main__":
    print("Testing embedding utilities...")
    print("=" * 50)
    
    # Test 1: Basic embedding
    print("Test 1: Basic embedding generation")
    try:
        test_text = "This is a test sentence for embedding generation."
        embedding = get_embedding(test_text)
        print(f"Embedding dimension: {len(embedding)}")
        print(f"First 5 values: {embedding[:5]}")
        print("✓ Basic embedding successful")
    except Exception as e:
        print(f"✗ Basic embedding failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 2: Batch embeddings
    print("Test 2: Batch embedding generation")
    try:
        test_texts = [
            "The quick brown fox jumps over the lazy dog.",
            "Machine learning is transforming how we write.",
            "Character development is crucial in storytelling."
        ]
        embeddings = get_embeddings_batch(test_texts)
        print(f"Generated {len(embeddings)} embeddings")
        print(f"Each embedding has {len(embeddings[0])} dimensions")
        print("✓ Batch embeddings successful")
    except Exception as e:
        print(f"✗ Batch embeddings failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 3: Document chunking
    print("Test 3: Document chunking")
    try:
        sample_doc = """
        This is a sample document for testing chunking functionality. 
        It contains multiple sentences and paragraphs to demonstrate how 
        the chunking algorithm works. The algorithm should split this text 
        into manageable pieces while preserving sentence boundaries where possible.
        
        This is a second paragraph that continues the document. It provides 
        additional content to test the overlap functionality and ensure that 
        context is preserved between chunks.
        """
        
        chunks = chunk_document(sample_doc, chunk_size=100, overlap=20)
        print(f"Document split into {len(chunks)} chunks")
        for i, chunk in enumerate(chunks):
            print(f"Chunk {i+1}: {len(chunk)} chars - {chunk[:50]}...")
        print("✓ Document chunking successful")
    except Exception as e:
        print(f"✗ Document chunking failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 4: DocumentChunk creation and embedding
    print("Test 4: DocumentChunk creation and embedding")
    try:
        sample_text = "This is a test document for creating document chunks with embeddings."
        doc_chunks = create_document_chunks(sample_text, "test_document.txt", {"author": "test"})
        embedded_chunks = embed_document_chunks(doc_chunks)
        
        print(f"Created {len(embedded_chunks)} document chunks")
        for chunk in embedded_chunks:
            print(f"Chunk ID: {chunk.id[:8]}... | Text: {chunk.text[:30]}...")
            print(f"Has embedding: {chunk.embedding is not None}")
        print("✓ DocumentChunk creation and embedding successful")
    except Exception as e:
        print(f"✗ DocumentChunk creation and embedding failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 5: Similarity search
    print("Test 5: Similarity search")
    try:
        # Create some test chunks with embeddings
        test_docs = [
            "The protagonist walked through the dark forest, feeling afraid.",
            "Machine learning algorithms can help with text analysis.",
            "The character felt scared as they entered the spooky woods."
        ]
        
        chunks = []
        for i, text in enumerate(test_docs):
            chunk = DocumentChunk(
                id=f"test_{i}",
                text=text,
                source=f"test_doc_{i}.txt",
                metadata={"test": True}
            )
            chunks.append(chunk)
        
        # Add embeddings
        embedded_chunks = embed_document_chunks(chunks)
        
        # Search for similar content
        query = "character walking in scary forest"
        results = search_documents(query, embedded_chunks, top_k=2, min_similarity=0.3)
        
        print(f"Query: '{query}'")
        print(f"Found {len(results)} similar chunks:")
        for chunk, similarity in results:
            print(f"Similarity: {similarity:.3f} | Text: {chunk.text}")
        print("✓ Similarity search successful")
    except Exception as e:
        print(f"✗ Similarity search failed: {e}")
    
    print("\nAll embedding utility tests completed!")