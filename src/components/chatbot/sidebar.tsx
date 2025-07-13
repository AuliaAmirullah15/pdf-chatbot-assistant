import React from "react";
import { Menu, X, FileText, MessageCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useChatStore } from "../../store/chat-store";
import { FileUpload } from "./file-upload";
export const Sidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen, clearAll, documents } = useChatStore();
  const [isClearing, setIsClearing] = React.useState(false);

  const handleClearAll = async () => {
    if (
      window.confirm(
        "Are you sure you want to start fresh? This will clear all chat history and remove all uploaded documents."
      )
    ) {
      setIsClearing(true);
      try {
        await clearAll();
      } catch (error) {
        console.error("Failed to clear session:", error);
      } finally {
        setIsClearing(false);
      }
    }
  };

  if (!sidebarOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 bg-white shadow-md hover:bg-gray-50 md:hidden"
      >
        <Menu className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div className="w-80 sm:w-72 md:w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full fixed md:relative z-50 md:z-auto md:translate-x-0 transition-transform duration-200 ease-in-out">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold truncate">PDF Chatbot</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Documents Section - Combined with Upload */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <FileText className="h-4 w-4 mr-2" /> Documents (
                {documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Upload Section */}
              <div className="mb-4">
                <FileUpload />
              </div>

              {/* Documents List */}
              {documents.length === 0 ? (
                <div className="text-center p-4 text-gray-500">
                  <p className="text-sm">No documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-start justify-between p-3 bg-white rounded border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start space-x-2 min-w-0 flex-1">
                        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-sm font-medium truncate"
                            title={doc.name}
                          >
                            {doc.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doc.metadata.pages} pages •{" "}
                            {Math.round(doc.metadata.size / 1024)} KB
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Clear Chat Button - Fixed at Bottom */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-gray-50">
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="w-full text-sm"
            size="sm"
            disabled={isClearing}
          >
            {isClearing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Start Fresh Session
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
};
