import { NextRequest, NextResponse } from "next/server";
import { sessionPDFProcessor } from "../../../lib/session-pdf-processor";

export async function GET(request: NextRequest) {
  try {
    const documents = await sessionPDFProcessor.getAllDocuments();

    return NextResponse.json({
      success: true,
      documents: documents.map((doc) => ({
        id: doc.id,
        name: doc.name,
        metadata: doc.metadata,
      })),
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch documents",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("id");

    if (documentId) {
      // Delete single document
      const success = await sessionPDFProcessor.deleteDocument(documentId);

      if (!success) {
        return NextResponse.json(
          { error: "Document not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Document deleted successfully",
      });
    } else {
      // Clear all documents from session
      await sessionPDFProcessor.clearAllDocuments();

      return NextResponse.json({
        success: true,
        message: "All documents cleared successfully",
      });
    }
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      {
        error: "Failed to delete document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
