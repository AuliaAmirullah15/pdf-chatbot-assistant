import React, { useRef, useState } from "react";
import { Upload, File, X, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useChatStore } from "../../store/chat-store";
import { PDFProcessingProgress } from "./pdf-processing-progress";

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addDocument, addMessage, syncDocuments } = useChatStore();

  const handleFileSelect = (file: File) => {
    if (file.type !== "application/pdf") {
      setUploadError("Please select a PDF file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadError("File size must be less than 50MB");
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
    setIsProcessing(true);

    // Call the callback if provided
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleProcessingComplete = (document: any) => {
    console.log("PDF processing completed:", document);

    // Create document object for the store
    const documentForStore = {
      id: document.id,
      name: document.name,
      content: `PDF content for ${document.name}`,
      metadata: document.metadata,
    };

    // Add to store
    addDocument(documentForStore);

    // Sync with server to ensure consistency
    syncDocuments();

    // Add system message about successful upload
    addMessage({
      content: `Successfully uploaded and processed "${document.name}"! 

📄 **Document Details:**
- Pages: ${document.metadata.pages}
- Size: ${Math.round(document.metadata.size / 1024)} KB
- Processed: ${new Date(document.metadata.uploadDate).toLocaleString()}

The document has been indexed and is ready for questions. You can now ask me anything about the content!`,
      role: "assistant",
    });

    // Reset state
    setIsProcessing(false);
    setSelectedFile(null);
  };

  const handleProcessingError = (error: string) => {
    console.error("PDF processing failed:", error);
    setUploadError(error);
    setIsProcessing(false);
    setSelectedFile(null);
  };

  const handleProcessingCancel = () => {
    setIsProcessing(false);
    setSelectedFile(null);
    setUploadError(null);
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
      {isProcessing && selectedFile ? (
        <PDFProcessingProgress
          file={selectedFile}
          onComplete={handleProcessingComplete}
          onError={handleProcessingError}
          onCancel={handleProcessingCancel}
        />
      ) : (
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
              <p className="text-xs text-gray-400">Maximum file size: 50MB</p>
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
      )}
    </div>
  );
};
