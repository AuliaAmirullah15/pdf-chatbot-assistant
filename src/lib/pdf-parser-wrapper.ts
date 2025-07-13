// Safe wrapper for pdf-parse to avoid build issues
let pdfParse: any;

// Dynamically import pdf-parse to avoid build-time issues
const getPdfParse = async () => {
  if (!pdfParse) {
    try {
      pdfParse = (await import("pdf-parse")).default;
    } catch (error) {
      console.error("Failed to load pdf-parse:", error);
      throw new Error("PDF parsing library not available");
    }
  }
  return pdfParse;
};

export const parsePDF = async (buffer: Buffer) => {
  const parser = await getPdfParse();
  return parser(buffer);
};
