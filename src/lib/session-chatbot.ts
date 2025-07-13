// Session-based chatbot using LangChain and Ollama
import { Ollama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import {
  sessionPDFProcessor,
  type DocumentChunk,
} from "./session-pdf-processor";
import { sessionManager } from "./session-manager";

export interface ChatResponse {
  answer: string;
  relevantChunks: DocumentChunk[];
  sources?: string[];
}

class SessionChatbot {
  private llm: Ollama;

  constructor() {
    this.llm = new Ollama({
      baseUrl: "http://localhost:11434",
      model: "llama3.2:latest",
      temperature: 0.6,
      numPredict: 150,
      topP: 0.8,
      repeatPenalty: 1.1,
    });
  }

  async chat(question: string): Promise<ChatResponse> {
    try {
      const session = await sessionManager.getOrCreateSession();
      console.log(`Processing question for session ${session.id}: ${question}`);

      // Step 1: Retrieve relevant context from uploaded documents
      const relevantChunks = await sessionPDFProcessor.searchSimilarChunks(
        question,
        2
      );
      const context = relevantChunks.map((chunk) => chunk.content).join("\n\n");

      // Step 2: Build conversation history for context
      const recentHistory = session.chatHistory.slice(-4); // Last 4 messages
      const historyContext =
        recentHistory.length > 0
          ? recentHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")
          : "";

      // Step 3: Generate answer using context and history
      const contextualPrompt = PromptTemplate.fromTemplate(`
${
  historyContext ? `Previous conversation:\n${historyContext}\n\n` : ""
}Context from documents: {context}
Question: {question}
Answer briefly based on the context and conversation:`);

      const chain = RunnableSequence.from([
        contextualPrompt,
        this.llm,
        new StringOutputParser(),
      ]);

      const answer = await chain.invoke({
        context: context || "No documents uploaded.",
        question,
      });

      // Step 4: Update conversation history
      session.chatHistory.push({ role: "user", content: question });
      session.chatHistory.push({ role: "assistant", content: answer });

      // Keep only last 8 messages for efficiency (4 exchanges)
      if (session.chatHistory.length > 8) {
        session.chatHistory = session.chatHistory.slice(-8);
      }

      // Step 5: Generate sources list
      const sources = relevantChunks.map(
        (chunk, index) => `Source ${index + 1}`
      );

      console.log(
        `Generated response for session ${session.id} with ${relevantChunks.length} relevant chunks`
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
    sessionId: string;
  }> {
    try {
      const session = await sessionManager.getOrCreateSession();

      // Test Ollama connectivity
      const ollamaReady = await this.testOllama();

      // Get document count for this session
      const documents = await sessionPDFProcessor.getAllDocuments();
      const documentsCount = documents.length;

      // Check if vector store exists
      const hasVectorStore = documentsCount > 0;

      return {
        ollamaReady,
        documentsCount,
        hasVectorStore,
        sessionId: session.id,
      };
    } catch (error) {
      console.error("Error getting system status:", error);
      return {
        ollamaReady: false,
        documentsCount: 0,
        hasVectorStore: false,
        sessionId: "unknown",
      };
    }
  }

  async clearHistory(): Promise<void> {
    const session = await sessionManager.getOrCreateSession();
    session.chatHistory = [];
  }

  async getConversationHistory(): Promise<
    Array<{
      role: "user" | "assistant";
      content: string;
    }>
  > {
    const session = await sessionManager.getOrCreateSession();
    return session.chatHistory;
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
}

// Create singleton instance
export const sessionChatbot = new SessionChatbot();
