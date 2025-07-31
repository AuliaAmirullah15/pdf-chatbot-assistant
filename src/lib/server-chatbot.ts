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
      temperature: 0.6,
      numPredict: 150, // Further reduced for faster responses
      topP: 0.8, // Optimize for speed
      repeatPenalty: 1.1,
    });
  }

  async chat(question: string): Promise<ChatResponse> {
    try {
      console.log(`Processing question: ${question}`);

      // Step 1: Retrieve relevant context from uploaded documents (reduced to 2 for speed)
      const relevantChunks = await serverPDFProcessor.searchSimilarChunks(
        question,
        2
      );
      const context = relevantChunks.map((chunk) => chunk.content).join("\n\n");

      // Step 2: Generate answer using context
      const contextualPrompt = PromptTemplate.fromTemplate(`
Context: {context}
Answer the user's question concisely, using only the context above. Do not repeat or restate the question in your answer.
Question: {question}
Answer:`);

      const chain = RunnableSequence.from([
        contextualPrompt,
        this.llm,
        new StringOutputParser(),
      ]);

      const answer = await chain.invoke({
        context: context || "No documents uploaded.",
        question,
      });

      // Step 3: Update conversation history (limit to 4 total messages)
      this.conversationHistory.push({ role: "user", content: question });
      this.conversationHistory.push({ role: "assistant", content: answer });

      // Keep only last 4 messages for efficiency
      if (this.conversationHistory.length > 4) {
        this.conversationHistory = this.conversationHistory.slice(-4);
      }

      // Step 4: Generate sources list (simplified)
      const sources = relevantChunks.map(
        (chunk, index) => `Source ${index + 1}`
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
