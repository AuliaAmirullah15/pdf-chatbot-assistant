"use client";

import { ChatInterface } from "../components/chatbot/chat-interface";
import { Sidebar } from "../components/chatbot/sidebar";

export default function Home() {
  return (
    <main className="h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-hidden min-w-0">
        <ChatInterface />
      </div>
    </main>
  );
}
