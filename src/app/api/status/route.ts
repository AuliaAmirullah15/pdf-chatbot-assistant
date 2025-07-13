import { NextRequest, NextResponse } from "next/server";
import { serverChatbot } from "../../../lib/server-chatbot";

export async function GET(request: NextRequest) {
  try {
    const status = await serverChatbot.getSystemStatus();

    return NextResponse.json({
      success: true,
      status: {
        ...status,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Status API error:", error);
    return NextResponse.json(
      {
        error: "Failed to get system status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
