// Server-side PDF processor using LangChain and Ollama
import { parsePDF } from "./pdf-parser-wrapper";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OllamaEmbeddings } from "@langchain/ollama";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export interface PDFDocument {
  id: string;
  name: string;
  content: string;
  metadata: {
    pages: number;
    size: number;
    uploadDate: Date;
  };
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    documentId: string;
    pageNumber?: number;
    chunkIndex: number;
  };
}

class ServerPDFProcessor {
  private embeddings: OllamaEmbeddings;
  private textSplitter: RecursiveCharacterTextSplitter;
  private documents: Map<string, PDFDocument> = new Map();
  private vectorStore: MemoryVectorStore | null = null;
  private vectorStorePath: string;

  constructor() {
    this.embeddings = new OllamaEmbeddings({
      baseUrl: "http://localhost:11434",
      model: "nomic-embed-text:latest",
    });

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800, // Reduced from 1000 for faster processing
      chunkOverlap: 100, // Reduced from 200 for speed
      separators: ["\n\n", "\n", ".", " "], // Simplified separators
    });

    // Create data directory if it doesn't exist
    this.vectorStorePath = join(process.cwd(), "data", "vector_store");
    if (!existsSync(join(process.cwd(), "data"))) {
      mkdirSync(join(process.cwd(), "data"), { recursive: true });
    }
  }

  async processPDF(file: File): Promise<PDFDocument> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const pdfData = await parsePDF(buffer);

      const document: PDFDocument = {
        id: this.generateId(),
        name: file.name,
        content: pdfData.text,
        metadata: {
          pages: pdfData.numpages,
          size: file.size,
          uploadDate: new Date(),
        },
      };

      // Store document
      this.documents.set(document.id, document);

      // Process text into chunks
      const chunks = await this.createChunks(document);

      // Update vector store
      await this.updateVectorStore(chunks);

      console.log(
        `PDF processed: ${document.name}, ${chunks.length} chunks created`
      );
      return document;
    } catch (error) {
      console.error("Error processing PDF:", error);
      throw new Error("Failed to process PDF");
    }
  }

  private async createChunks(document: PDFDocument): Promise<DocumentChunk[]> {
    const textChunks = await this.textSplitter.splitText(document.content);

    return textChunks.map((chunk, index) => ({
      id: this.generateId(),
      content: chunk,
      metadata: {
        documentId: document.id,
        chunkIndex: index,
      },
    }));
  }

  private async updateVectorStore(chunks: DocumentChunk[]): Promise<void> {
    try {
      const texts = chunks.map((chunk) => chunk.content);
      const metadatas = chunks.map((chunk) => chunk.metadata);

      // Create new vector store with MemoryVectorStore
      this.vectorStore = await MemoryVectorStore.fromTexts(
        texts,
        metadatas,
        this.embeddings
      );

      console.log(`Vector store updated with ${chunks.length} chunks`);
    } catch (error) {
      console.error("Error updating vector store:", error);

      // If vector store fails, store chunks in memory for simple retrieval
      console.log("Falling back to in-memory storage without embeddings");

      // Store chunks in memory for simple retrieval
      const memoryStore = new Map<string, DocumentChunk>();
      chunks.forEach((chunk) => {
        memoryStore.set(chunk.id, chunk);
      });

      // Store in a simple property for retrieval
      (this as any).memoryChunks = Array.from(memoryStore.values());

      console.log(`Fallback: Stored ${chunks.length} chunks in memory`);
    }
  }

  async searchSimilarChunks(
    query: string,
    k: number = 5
  ): Promise<DocumentChunk[]> {
    if (!this.vectorStore) {
      console.log("No vector store available");

      // Check if we have memory chunks as fallback
      const memoryChunks = (this as any).memoryChunks;
      if (memoryChunks && memoryChunks.length > 0) {
        console.log("Using memory chunks for search");

        // Simple text-based search as fallback
        const lowercaseQuery = query.toLowerCase();
        const matchingChunks = memoryChunks.filter((chunk: DocumentChunk) =>
          chunk.content.toLowerCase().includes(lowercaseQuery)
        );

        return matchingChunks.slice(0, k);
      }

      return [];
    }

    try {
      const results = await this.vectorStore.similaritySearch(query, k);

      return results.map((result: any) => ({
        id: this.generateId(),
        content: result.pageContent,
        metadata: result.metadata as DocumentChunk["metadata"],
      }));
    } catch (error) {
      console.error("Error searching similar chunks:", error);

      // Fallback to memory search if vector search fails
      const memoryChunks = (this as any).memoryChunks;
      if (memoryChunks && memoryChunks.length > 0) {
        console.log("Falling back to memory search");

        const lowercaseQuery = query.toLowerCase();
        const matchingChunks = memoryChunks.filter((chunk: DocumentChunk) =>
          chunk.content.toLowerCase().includes(lowercaseQuery)
        );

        return matchingChunks.slice(0, k);
      }

      return [];
    }
  }

  getDocument(id: string): PDFDocument | undefined {
    return this.documents.get(id);
  }

  getAllDocuments(): PDFDocument[] {
    return Array.from(this.documents.values());
  }

  async isReady(): Promise<boolean> {
    try {
      // Test if Ollama is accessible
      await this.embeddings.embedQuery("test");
      return true;
    } catch (error) {
      console.error("Ollama not ready:", error);
      return false;
    }
  }

  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}

// Create singleton instance
export const serverPDFProcessor = new ServerPDFProcessor();
