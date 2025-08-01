import { NextRequest, NextResponse } from "next/server";
import { serverPDFProcessor } from "../../../lib/server-pdf-processor";

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

    // Process the PDF using the server-side processor
    // Create a File-like object for processPDF
    const fileLike = {
      name: file.name,
      size: file.size,
      arrayBuffer: async () => buffer,
    } as unknown as File;

    let document;
    try {
      document = await serverPDFProcessor.processPDF(fileLike);
    } catch (error) {
      return NextResponse.json(
        {
          error: "Failed to process PDF",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        metadata: document.metadata,
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
