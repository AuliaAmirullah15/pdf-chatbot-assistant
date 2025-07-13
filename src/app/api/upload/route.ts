import { NextRequest, NextResponse } from "next/server";
import { sessionPDFProcessor } from "../../../lib/session-pdf-processor";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 400 }
      );
    }

    console.log(`Processing PDF: ${file.name} (${file.size} bytes)`);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Process the PDF using the session-based processor
    const result = await sessionPDFProcessor.uploadPDF(buffer, file.name);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Failed to process PDF",
          details: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      document: {
        id: result.document!.id,
        name: result.document!.name,
        metadata: result.document!.metadata,
      },
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      {
        error: "Failed to process PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
