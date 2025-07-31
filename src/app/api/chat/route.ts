import { NextRequest, NextResponse } from "next/server";
import { serverChatbot, ChatResponse } from "../../../lib/server-chatbot";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    console.log(`Processing chat message: ${message}`);

    // Defensive: check Ollama status before chat
    const status = await serverChatbot.getSystemStatus();
    if (!status.ollamaReady) {
      return NextResponse.json(
        {
          error:
            "Ollama server is not running or not reachable on http://localhost:11434. Please start it with 'ollama serve'.",
        },
        { status: 503 }
      );
    }

    // Use the server-side AI chatbot with LangChain + Ollama
    const response: ChatResponse = await serverChatbot.chat(message);

    return NextResponse.json({
      success: true,
      data: {
        answer: response.answer,
        relevantChunks: response.relevantChunks,
        sources: response.sources,
      },
    });
  } catch (error) {
    // Log full error stack for debugging
    if (error instanceof Error) {
      console.error("Chat API error:", error.stack || error.message);
    } else {
      console.error("Chat API error:", error);
    }
    return NextResponse.json(
      {
        error: "Failed to process message",
        details: error instanceof Error ? error.message : JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}
