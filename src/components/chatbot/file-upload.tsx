import React, { useRef, useState } from "react";
import { Upload, File, X, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useChatStore } from "../../store/chat-store";

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { addDocument, setLoading, addMessage } = useChatStore();

  const handleFileSelect = async (file: File) => {
    if (file.type !== "application/pdf") {
      setUploadError("Please select a PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      return;
    }

    setUploadError(null);
    setLoading(true);

    try {
      console.log("Starting PDF upload for:", file.name);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);

      // Upload and process PDF via API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload PDF");
      }

      console.log("PDF uploaded successfully:", data.document);

      // Create document object for the store
      const document = {
        id: data.document.id,
        name: data.document.name,
        content: `PDF content for ${data.document.name}`,
        metadata: data.document.metadata,
      };

      // Add to store
      addDocument(document);

      // Add system message about successful upload
      addMessage({
        content: `Successfully uploaded and processed "${file.name}"! 

📄 **Document Details:**
- Pages: ${data.document.metadata.pages}
- Size: ${Math.round(data.document.metadata.size / 1024)} KB
- Processed: ${new Date(data.document.metadata.uploadDate).toLocaleString()}

The document has been indexed and is ready for questions. You can now ask me anything about the content!`,
        role: "assistant",
      });

      // Call the callback if provided
      if (onFileSelect) {
        onFileSelect(file);
      }

      console.log("PDF upload completed for:", document.name);
    } catch (error) {
      console.error("Error uploading PDF:", error);
      setUploadError(
        `Failed to upload PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <Card
        className={`transition-all duration-200 ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Upload PDF Document
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop your PDF file here, or click to browse
            </p>
            <Button
              onClick={handleButtonClick}
              variant="outline"
              className="mb-2"
            >
              <File className="h-4 w-4 mr-2" />
              Choose File
            </Button>
            <p className="text-xs text-gray-400">Maximum file size: 10MB</p>
          </div>

          {uploadError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              {uploadError}
              <button
                onClick={() => setUploadError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};
