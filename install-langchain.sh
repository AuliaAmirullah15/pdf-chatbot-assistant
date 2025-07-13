#!/bin/bash

# PDF Chatbot Assistant - Install LangChain Dependencies
echo "🔧 Installing LangChain and AI dependencies..."

# Install core LangChain packages
echo "📦 Installing LangChain core packages..."
npm install langchain @langchain/core @langchain/community

# Install Ollama support
echo "🦙 Installing Ollama support..."
npm install @langchain/ollama

# Install LangGraph (if available)
echo "🕸️ Installing LangGraph..."
npm install @langchain/langgraph || echo "⚠️  LangGraph not available, skipping..."

# Install text splitters
echo "✂️  Installing text splitters..."
npm install @langchain/textsplitters

# Install vector store dependencies
echo "🔍 Installing vector store dependencies..."
npm install hnswlib-node

# Install PDF processing
echo "📄 Installing PDF processing..."
npm install pdf-parse pdf2pic pdfjs-dist

# Install tokenizer
echo "🔤 Installing tokenizer..."
npm install js-tiktoken

# Install additional dependencies
echo "📚 Installing additional dependencies..."
npm install remark-math rehype-katex katex

# Install type definitions
echo "🏷️  Installing type definitions..."
npm install --save-dev @types/pdf-parse

echo "✅ All dependencies installed!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure Ollama is running: ollama serve"
echo "2. Pull Llama 3.2 model: ollama pull llama3.2:latest"
echo "3. Start the development server: npm run dev"
echo "4. Open http://localhost:3000 in your browser"
