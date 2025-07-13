# PDF Chatbot Assistant 🤖📄

A modern, AI-powered PDF chatbot assistant built with Next.js, LangChain, Ollama, and Llama 3.2. Upload PDF documents and chat with an intelligent AI assistant that can answer questions based on your document content.

![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![LangChain](https://img.shields.io/badge/LangChain-0.3.29-green?style=flat-square)
![Ollama](https://img.shields.io/badge/Ollama-Local%20AI-orange?style=flat-square)

## ✨ Features

- **📄 PDF Upload & Processing**: Drag-and-drop PDF upload with intelligent text extraction
- **🤖 AI-Powered Chat**: Context-aware conversations using Llama 3.2
- **🔍 Vector Search**: Semantic similarity search for relevant document chunks
- **💬 Conversation History**: Maintains context across chat sessions
- **🛠️ Server-side Processing**: All AI logic runs on the server for optimal performance
- **🔄 Real-time Status**: System health monitoring and error handling
- **🎨 Modern UI**: Clean, responsive interface built with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Ollama installed and running
- Required Ollama models downloaded

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pdf-chatbot-assistant.git
   cd pdf-chatbot-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Ollama**
   ```bash
   # Start Ollama service
   ollama serve
   
   # Download required models
   ollama pull llama3.2:latest
   ollama pull nomic-embed-text:latest
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage

1. **Upload a PDF**: Drag and drop or click to upload your PDF document
2. **Wait for Processing**: The system will extract text and create embeddings
3. **Start Chatting**: Ask questions about your document content
4. **Get AI Responses**: Receive context-aware answers with source attribution

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: LangChain, Ollama, Llama 3.2
- **Vector Storage**: MemoryVectorStore with HNSWLib fallback
- **PDF Processing**: pdf-parse with intelligent text chunking
- **UI Components**: Lucide React icons, custom components

### Key Components

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # AI chat endpoint
│   │   ├── upload/        # PDF upload endpoint
│   │   └── status/        # System status endpoint
│   ├── layout.tsx         # App layout
│   └── page.tsx           # Main page
├── components/
│   └── chatbot/
│       ├── chat-interface.tsx    # Chat UI
│       ├── file-upload.tsx       # PDF upload UI
│       └── sidebar.tsx           # Navigation sidebar
├── lib/
│   ├── server-chatbot.ts         # AI chatbot logic
│   ├── server-pdf-processor.ts   # PDF processing
│   └── pdf-parser-wrapper.ts     # Safe PDF parsing
└── hooks/
    └── use-chat.ts               # Chat state management
```

## 🔧 Configuration

### Environment Variables

No environment variables are required as the system uses Ollama's default local configuration.

### Ollama Configuration

The system expects Ollama to be running on `http://localhost:11434` with these models:
- `llama3.2:latest` - For conversational AI
- `nomic-embed-text:latest` - For text embeddings
2. **Ollama** installed and running locally
3. **Llama 3.2** model pulled in Ollama

### Setting up Ollama

1. Install Ollama from [https://ollama.com](https://ollama.com)
2. Start Ollama service:
   ```bash
   ollama serve
   ```
3. Pull the Llama 3.2 model:
   ```bash
   ollama pull llama3.2:latest
   ```

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd pdf-chatbot-assistant
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload PDFs**: Click on the upload area in the sidebar to select PDF files
2. **Ask Questions**: Type your questions in the chat input field
3. **Get Answers**: The AI will provide answers based on the uploaded PDF content
4. **Manage Documents**: View, select, and remove documents from the sidebar
5. **Clear Chat**: Use the clear chat button to reset the conversation

## Advanced Features

### LangGraph Workflow

The application uses LangGraph to create sophisticated conversation flows:

- **Context Retrieval**: Searches for relevant document chunks
- **Answer Generation**: Uses retrieved context to generate responses
- **Response Formatting**: Formats and enhances the final response

### Vector Search

- **Semantic Search**: Uses embeddings to find relevant document sections
- **Chunk Management**: Splits documents into manageable chunks with overlap
- **Context Preservation**: Maintains document metadata and relationships

### PDF Processing

- **Multi-format Support**: Handles various PDF formats and structures
- **Text Extraction**: Extracts clean text from PDF documents
- **Metadata Extraction**: Captures document information (pages, size, etc.)

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest

# Application Configuration
NEXT_PUBLIC_APP_NAME="PDF Chatbot Assistant"
```

### Customization

- **Model Configuration**: Change the Ollama model in `src/lib/chatbot.ts`
- **Chunk Size**: Adjust text splitting parameters in `src/lib/pdf-processor.ts`
- **UI Styling**: Modify Tailwind classes in component files

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   └── chat/          # Chat API endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── chatbot/          # Chatbot-specific components
├── lib/                  # Core utilities
│   ├── chatbot.ts        # LangGraph workflow
│   ├── pdf-processor.ts  # PDF processing logic
│   └── utils.ts          # Utility functions
├── hooks/                # Custom React hooks
├── store/                # State management
└── types/                # TypeScript types
```

## Current Implementation Status

### ✅ Completed Features

- **Modern UI**: Clean, responsive interface with Tailwind CSS
- **File Upload**: Drag & drop PDF upload functionality
- **Chat Interface**: Real-time chat with message history
- **State Management**: Zustand store for application state
- **Document Management**: Upload, view, and manage PDF documents
- **Sidebar Navigation**: Collapsible sidebar with document list
- **TypeScript Support**: Full TypeScript implementation
- **Next.js 15**: Built on the latest Next.js framework

### 🚧 In Progress

- **PDF Processing**: Integration with pdf-parse for text extraction
- **LangChain Integration**: Core LangChain functionality
- **Vector Search**: HNSWLIB vector store implementation
- **Ollama Integration**: Local AI model integration
- **LangGraph Workflows**: Advanced conversation flows

### 📋 To Install LangChain Dependencies

Run the installation script to add all AI-related dependencies:

```bash
./install-langchain.sh
```

### 🎯 Current Demo

The current implementation includes a working chat interface with:

- PDF file upload simulation
- Message exchange functionality
- Document management
- Responsive UI components

To test the current version:

1. Start the development server: `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. Upload a PDF file (simulated processing)
4. Start chatting with the interface
