import React from "react";
import { Menu, X, FileText, MessageCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useChatStore } from "../../store/chat-store";
import { FileUpload } from "./file-upload";
export const Sidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen, clearMessages, documents } =
    useChatStore();
  if (!sidebarOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-10"
      >
        {" "}
        <Menu className="h-4 w-4" />{" "}
      </Button>
    );
  }
  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {" "}
      <div className="p-4 border-b border-gray-200">
        {" "}
        <div className="flex items-center justify-between">
          {" "}
          <h1 className="text-lg font-semibold">PDF Chatbot</h1>{" "}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
          >
            {" "}
            <X className="h-4 w-4" />{" "}
          </Button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="p-4 border-b border-gray-200">
        {" "}
        <Card>
          {" "}
          <CardHeader>
            {" "}
            <CardTitle className="text-sm flex items-center">
              {" "}
              <FileText className="h-4 w-4 mr-2" /> Upload Documents{" "}
            </CardTitle>{" "}
          </CardHeader>
          <CardContent>
            <FileUpload />
          </CardContent>{" "}
        </Card>{" "}
      </div>{" "}
      <div className="flex-1 overflow-y-auto p-4">
        {" "}
        <Card>
          {" "}
          <CardHeader>
            {" "}
            <CardTitle className="text-sm">
              {" "}
              Documents ({documents.length}){" "}
            </CardTitle>{" "}
          </CardHeader>{" "}
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center p-4 text-gray-500">
                <p className="text-sm">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 bg-white rounded border"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.metadata.pages} pages,{" "}
                          {Math.round(doc.metadata.size / 1024)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>{" "}
        </Card>{" "}
      </div>{" "}
      <div className="p-4 border-t border-gray-200">
        {" "}
        <Button variant="outline" onClick={clearMessages} className="w-full">
          {" "}
          <MessageCircle className="h-4 w-4 mr-2" /> Clear Chat{" "}
        </Button>{" "}
      </div>{" "}
    </div>
  );
};
