import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  File,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  Brain,
  Database,
  RefreshCw,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "processing" | "completed" | "error";
  icon: React.ReactNode;
  progress?: number;
  errorMessage?: string;
  duration?: number;
}

interface PDFProcessingProgressProps {
  file: File;
  onComplete: (document: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export const PDFProcessingProgress: React.FC<PDFProcessingProgressProps> = ({
  file,
  onComplete,
  onError,
  onCancel,
}) => {
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: "upload",
      title: "Uploading Document",
      description: "Transferring PDF file to server...",
      status: "pending",
      icon: <Upload className="w-5 h-5" />,
      progress: 0,
    },
    {
      id: "validation",
      title: "Validating File",
      description: "Checking file format and integrity...",
      status: "pending",
      icon: <Eye className="w-5 h-5" />,
    },
    {
      id: "extraction",
      title: "Extracting Text",
      description: "Reading and parsing PDF content...",
      status: "pending",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: "processing",
      title: "Processing Content",
      description: "Breaking text into chunks and creating embeddings...",
      status: "pending",
      icon: <Brain className="w-5 h-5" />,
    },
    {
      id: "indexing",
      title: "Building Index",
      description: "Creating searchable vector database...",
      status: "pending",
      icon: <Database className="w-5 h-5" />,
    },
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<
    number | null
  >(null);
  const currentStepIndexRef = useRef(0);
  const isProcessingRef = useRef(false);

  const updateStep = (stepId: string, updates: Partial<ProcessingStep>) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, ...updates } : step))
    );
  };

  useEffect(() => {
    let cancelled = false;

    const processFile = async () => {
      if (isProcessingRef.current || cancelled) {
        return; // Prevent multiple simultaneous uploads
      }
      isProcessingRef.current = true;

      try {
        // Step 1: Upload
        if (cancelled) return;
        updateStep("upload", {
          status: "processing",
          progress: 0,
        });

        const formData = new FormData();
        formData.append("file", file);

        // Simulate upload progress
        for (let i = 0; i <= 100; i += 20) {
          if (cancelled) return;
          updateStep("upload", { progress: i });
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        if (cancelled) return;
        updateStep("upload", {
          status: "completed",
          progress: 100,
          duration: 250,
        });
        setCurrentStepIndex(1);
        currentStepIndexRef.current = 1;

        // Step 2: Validation
        if (cancelled) return;
        updateStep("validation", { status: "processing" });
        await new Promise((resolve) => setTimeout(resolve, 200));

        if (file.type !== "application/pdf") {
          updateStep("validation", {
            status: "error",
            errorMessage: "Invalid file type. Please upload a PDF file.",
          });
          onError("Invalid file type. Please upload a PDF file.");
          return;
        }

        if (file.size > 50 * 1024 * 1024) {
          updateStep("validation", {
            status: "error",
            errorMessage: "File too large. Maximum size is 50MB.",
          });
          onError("File too large. Maximum size is 50MB.");
          return;
        }

        if (cancelled) return;
        updateStep("validation", {
          status: "completed",
          duration: 200,
        });
        setCurrentStepIndex(2);
        currentStepIndexRef.current = 2;

        // Step 3: Text Extraction
        if (cancelled) return;
        updateStep("extraction", { status: "processing" });

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (cancelled) return;
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to process PDF");
        }

        if (cancelled) return;
        updateStep("extraction", {
          status: "completed",
          duration: 1000,
        });
        setCurrentStepIndex(3);
        currentStepIndexRef.current = 3;

        // Step 4: Processing Content
        if (cancelled) return;
        updateStep("processing", { status: "processing" });
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (cancelled) return;
        updateStep("processing", {
          status: "completed",
          duration: 500,
        });
        setCurrentStepIndex(4);
        currentStepIndexRef.current = 4;

        // Step 5: Indexing
        if (cancelled) return;
        updateStep("indexing", { status: "processing" });
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (cancelled) return;
        updateStep("indexing", {
          status: "completed",
          duration: 300,
        });

        // Complete processing
        setOverallProgress(100);
        onComplete(data.document);
      } catch (error) {
        if (cancelled) return;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";

        // Mark current step as error
        setSteps((prev) =>
          prev.map((step, index) =>
            index === currentStepIndexRef.current
              ? {
                  ...step,
                  status: "error" as const,
                  errorMessage,
                }
              : step
          )
        );

        onError(errorMessage);
      } finally {
        isProcessingRef.current = false;
      }
    };

    processFile();

    // Cleanup function to cancel ongoing operations
    return () => {
      cancelled = true;
      isProcessingRef.current = false;
    };
  }, [file, onComplete, onError]);

  const getStepStatusIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case "processing":
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
        );
    }
  };

  const getStepStatusColor = (step: ProcessingStep) => {
    switch (step.status) {
      case "processing":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const completedSteps = steps.filter(
    (step) => step.status === "completed"
  ).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const elapsedTime = (Date.now() - startTime) / 1000;
  const estimatedTotal =
    completedSteps > 0 ? (elapsedTime / completedSteps) * totalSteps : 0;
  const timeRemaining = Math.max(0, estimatedTotal - elapsedTime);

  return (
    <Card className="w-full max-h-96 overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 min-w-0 flex-1 mr-2">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <File className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                Processing PDF
              </h3>
              <p className="text-xs text-gray-600 truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800 flex-shrink-0 text-xs px-2 py-1"
          >
            Cancel
          </Button>
        </div>

        {/* Overall Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-xs text-gray-500">
              {completedSteps}/{totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{Math.round(elapsedTime)}s</span>
            {timeRemaining > 0 && (
              <span>~{Math.round(timeRemaining)}s left</span>
            )}
          </div>
        </div>

        {/* Processing Steps */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start space-x-3 p-3 rounded-md border transition-all duration-300 ${getStepStatusColor(
                step
              )}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getStepStatusIcon(step)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium truncate">{step.title}</h4>
                  {step.duration && (
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {step.duration}ms
                    </span>
                  )}
                </div>

                <p
                  className="text-xs text-gray-600 mt-0.5 truncate"
                  title={step.description}
                >
                  {step.description}
                </p>

                {step.status === "processing" &&
                  step.progress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {step.progress}%
                      </span>
                    </div>
                  )}

                {step.status === "error" && step.errorMessage && (
                  <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate" title={step.errorMessage}>
                        {step.errorMessage}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Success Message */}
        {completedSteps === totalSteps && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <h4 className="text-sm font-medium text-green-800">Success!</h4>
                <p className="text-xs text-green-700 mt-0.5">
                  PDF indexed in {Math.round(elapsedTime)}s. Ready for
                  questions!
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
