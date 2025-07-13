// Server-side chatbot using LangChain and Ollama
import { Ollama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { serverPDFProcessor, type DocumentChunk } from "./server-pdf-processor";

export interface ChatResponse {
  answer: string;
  relevantChunks: DocumentChunk[];
  sources?: string[];
}

class ServerChatbot {
  private llm: Ollama;
  private conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }> = [];

  constructor() {
    this.llm = new Ollama({
      baseUrl: "http://localhost:11434",
      model: "llama3.2:latest",
      temperature: 0.7,
    });
  }

  async chat(question: string): Promise<ChatResponse> {
    try {
      console.log(`Processing question: ${question}`);

      // Step 1: Retrieve relevant context from uploaded documents
      const relevantChunks = await serverPDFProcessor.searchSimilarChunks(
        question,
        5
      );
      const context = relevantChunks.map((chunk) => chunk.content).join("\n\n");

      // Step 2: Generate answer using context
      const contextualPrompt = PromptTemplate.fromTemplate(`
You are a helpful AI assistant that answers questions based on PDF documents that users have uploaded.

Context from uploaded documents:
{context}

Previous conversation:
{conversationHistory}

User question: {question}

Instructions:
- Provide a clear, accurate, and helpful answer based on the context provided
- If the question cannot be answered from the context, say so clearly
- Use information from the context to support your answer
- Be concise but thorough
- If no documents have been uploaded, explain that documents need to be uploaded first

Answer:`);

      const conversationHistory = this.conversationHistory
        .slice(-6) // Keep last 3 exchanges
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");

      const chain = RunnableSequence.from([
        contextualPrompt,
        this.llm,
        new StringOutputParser(),
      ]);

      const answer = await chain.invoke({
        context: context || "No documents have been uploaded yet.",
        conversationHistory,
        question,
      });

      // Step 3: Update conversation history
      this.conversationHistory.push({ role: "user", content: question });
      this.conversationHistory.push({ role: "assistant", content: answer });

      // Step 4: Generate sources list
      const sources = relevantChunks.map(
        (chunk, index) =>
          `Source ${index + 1}: Document chunk ${chunk.metadata.chunkIndex}`
      );

      console.log(
        `Generated response with ${relevantChunks.length} relevant chunks`
      );

      return {
        answer,
        relevantChunks,
        sources,
      };
    } catch (error) {
      console.error("Error in chat:", error);

      // Fallback response
      const fallbackAnswer = `I apologize, but I encountered an error while processing your question: "${question}". 

This could be due to:
- Ollama not running (make sure it's started: \`ollama serve\`)
- Network connectivity issues
- The AI model not being available

Please try again, or check if Ollama is running properly.`;

      return {
        answer: fallbackAnswer,
        relevantChunks: [],
        sources: [],
      };
    }
  }

  async getSystemStatus(): Promise<{
    ollamaReady: boolean;
    documentsCount: number;
    hasVectorStore: boolean;
  }> {
    try {
      // Test Ollama connectivity
      const ollamaReady = await this.testOllama();

      // Get document count
      const documents = serverPDFProcessor.getAllDocuments();
      const documentsCount = documents.length;

      // Check if vector store exists
      const hasVectorStore = documentsCount > 0;

      return {
        ollamaReady,
        documentsCount,
        hasVectorStore,
      };
    } catch (error) {
      console.error("Error getting system status:", error);
      return {
        ollamaReady: false,
        documentsCount: 0,
        hasVectorStore: false,
      };
    }
  }

  private async testOllama(): Promise<boolean> {
    try {
      await this.llm.invoke("Hello");
      return true;
    } catch (error) {
      console.error("Ollama not ready:", error);
      return false;
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getConversationHistory() {
    return this.conversationHistory;
  }
}

// Create singleton instance
export const serverChatbot = new ServerChatbot();
