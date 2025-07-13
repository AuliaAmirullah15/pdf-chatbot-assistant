import { NextRequest, NextResponse } from "next/server";
import { sessionChatbot, ChatResponse } from "../../../lib/session-chatbot";

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

    // Use the session-based AI chatbot with LangChain + Ollama
    const response: ChatResponse = await sessionChatbot.chat(message);

    return NextResponse.json({
      success: true,
      data: {
        answer: response.answer,
        relevantChunks: response.relevantChunks,
        sources: response.sources,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
