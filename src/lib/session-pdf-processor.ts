// Session-based PDF processor using LangChain and Ollama
import { parsePDF } from "./pdf-parser-wrapper";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OllamaEmbeddings } from "@langchain/ollama";
import { sessionManager, SessionData } from "./session-manager";

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

class SessionPDFProcessor {
  private embeddings: OllamaEmbeddings;
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.embeddings = new OllamaEmbeddings({
      baseUrl: "http://localhost:11434",
      model: "nomic-embed-text:latest",
    });

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 100,
      separators: ["\n\n", "\n", ".", " "],
    });
  }

  async uploadPDF(
    buffer: Buffer,
    filename: string
  ): Promise<{
    success: boolean;
    document?: PDFDocument;
    error?: string;
  }> {
    try {
      const session = await sessionManager.getOrCreateSession();

      // Parse the PDF
      const pdfContent = await parsePDF(buffer);

      // Create document object
      const document: PDFDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: filename,
        content: pdfContent.text,
        metadata: {
          pages: pdfContent.numpages,
          size: buffer.length,
          uploadDate: new Date(),
        },
      };

      // Store document in session
      session.documents.set(document.id, document);

      // Create chunks and rebuild vector store
      await this.rebuildVectorStore(session);

      return {
        success: true,
        document,
      };
    } catch (error) {
      console.error("Error uploading PDF:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async searchSimilarChunks(
    query: string,
    limit: number = 3
  ): Promise<DocumentChunk[]> {
    try {
      const session = await sessionManager.getOrCreateSession();

      if (!session.vectorStore) {
        console.log("No vector store available, returning empty results");
        return [];
      }

      // Search for similar chunks
      const results = await session.vectorStore.similaritySearch(query, limit);

      return results.map((doc: any, index: number) => ({
        id: `chunk_${index}`,
        content: doc.pageContent,
        metadata: {
          documentId: doc.metadata.documentId || "unknown",
          pageNumber: doc.metadata.pageNumber,
          chunkIndex: index,
        },
      }));
    } catch (error) {
      console.error("Error searching similar chunks:", error);

      // Fallback to simple text search
      const session = await sessionManager.getOrCreateSession();
      return this.fallbackTextSearch(session, query, limit);
    }
  }

  async getAllDocuments(): Promise<PDFDocument[]> {
    const session = await sessionManager.getOrCreateSession();
    return Array.from(session.documents.values());
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      const session = await sessionManager.getOrCreateSession();

      if (!session.documents.has(documentId)) {
        return false;
      }

      session.documents.delete(documentId);

      // Rebuild vector store without the deleted document
      await this.rebuildVectorStore(session);

      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      return false;
    }
  }

  async clearAllDocuments(): Promise<void> {
    const session = await sessionManager.getOrCreateSession();
    session.documents.clear();
    session.vectorStore = null;
  }

  private async rebuildVectorStore(session: SessionData): Promise<void> {
    try {
      const allDocuments = Array.from(session.documents.values());

      if (allDocuments.length === 0) {
        session.vectorStore = null;
        return;
      }

      // Split all documents into chunks
      const allChunks: DocumentChunk[] = [];

      for (const doc of allDocuments) {
        const chunks = await this.textSplitter.splitText(doc.content);

        const documentChunks: DocumentChunk[] = chunks.map((chunk, index) => ({
          id: `${doc.id}_chunk_${index}`,
          content: chunk,
          metadata: {
            documentId: doc.id,
            chunkIndex: index,
          },
        }));

        allChunks.push(...documentChunks);
      }

      // Create vector store from chunks
      const texts = allChunks.map((chunk) => chunk.content);
      const metadatas = allChunks.map((chunk) => chunk.metadata);

      session.vectorStore = await MemoryVectorStore.fromTexts(
        texts,
        metadatas,
        this.embeddings
      );

      console.log(
        `Vector store rebuilt with ${allChunks.length} chunks from ${allDocuments.length} documents`
      );
    } catch (error) {
      console.error("Error rebuilding vector store:", error);
      session.vectorStore = null;
    }
  }

  private fallbackTextSearch(
    session: SessionData,
    query: string,
    limit: number
  ): DocumentChunk[] {
    const queryLower = query.toLowerCase();
    const results: DocumentChunk[] = [];

    for (const doc of session.documents.values()) {
      const sentences = doc.content
        .split(/[.!?]+/)
        .filter((s: string) => s.trim().length > 0);

      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i].trim();
        if (sentence.toLowerCase().includes(queryLower)) {
          results.push({
            id: `${doc.id}_fallback_${i}`,
            content: sentence,
            metadata: {
              documentId: doc.id,
              chunkIndex: i,
            },
          });

          if (results.length >= limit) {
            break;
          }
        }
      }

      if (results.length >= limit) {
        break;
      }
    }

    return results;
  }
}

// Create singleton instance
export const sessionPDFProcessor = new SessionPDFProcessor();
