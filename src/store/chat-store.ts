import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface PDFDocument {
  id: string;
  name: string;
  content: string;
  metadata: {
    pages: number;
    size: number;
    uploadDate: Date;
  };
}

interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    documentId: string;
    pageNumber?: number;
    chunkIndex: number;
  };
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  relevantChunks?: DocumentChunk[];
}

interface ChatState {
  // Documents
  documents: PDFDocument[];
  currentDocument: PDFDocument | null;

  // Chat
  messages: Message[];
  isLoading: boolean;
  error: string | null;

  // UI
  sidebarOpen: boolean;

  // Actions
  addDocument: (document: PDFDocument) => void;
  removeDocument: (documentId: string) => void;
  setCurrentDocument: (document: PDFDocument | null) => void;
  syncDocuments: () => Promise<void>; // New action to sync with server

  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  clearMessages: () => void;
  clearDocuments: () => void;
  clearAll: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set) => ({
      // Initial state
      documents: [],
      currentDocument: null,
      messages: [],
      isLoading: false,
      error: null,
      sidebarOpen:
        typeof window !== "undefined" ? window.innerWidth >= 768 : true,

      // Document actions
      addDocument: (document) => {
        set((state) => ({
          documents: [...state.documents, document],
          currentDocument: document,
        }));
      },

      removeDocument: (documentId) => {
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== documentId),
          currentDocument:
            state.currentDocument?.id === documentId
              ? null
              : state.currentDocument,
        }));
      },

      setCurrentDocument: (document) => {
        set({ currentDocument: document });
      },

      // Sync documents with server
      syncDocuments: async () => {
        try {
          const response = await fetch("/api/documents");
          const data = await response.json();

          if (data.success) {
            set({ documents: data.documents });
          } else {
            console.error("Failed to sync documents:", data.error);
          }
        } catch (error) {
          console.error("Error syncing documents:", error);
        }
      },

      // Chat actions
      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: Math.random().toString(36).substring(2, 15),
          timestamp: new Date(),
        };

        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },

      clearMessages: () => {
        set({ messages: [] });
      },

      clearDocuments: () => {
        set({ documents: [], currentDocument: null });
      },

      clearAll: async () => {
        try {
          // First, clear local state immediately for better UX
          set({
            messages: [],
            documents: [],
            currentDocument: null,
            error: null,
          });

          // Then clear all documents on the server
          const response = await fetch("/api/documents", {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to clear session on server");
          }

          // No need to sync here - we want to stay cleared!
        } catch (error) {
          console.error("Failed to clear session:", error);
          set({ error: "Failed to clear session" });
        }
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      // UI actions
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },
    }),
    {
      name: "pdf-chatbot-store",
    }
  )
);

// Selectors
export const useDocuments = () => useChatStore((state) => state.documents);
export const useCurrentDocument = () =>
  useChatStore((state) => state.currentDocument);
export const useMessages = () => useChatStore((state) => state.messages);
export const useIsLoading = () => useChatStore((state) => state.isLoading);
export const useError = () => useChatStore((state) => state.error);
export const useSidebarOpen = () => useChatStore((state) => state.sidebarOpen);
