#!/bin/bash

# PDF Chatbot Assistant Setup Script
echo "🚀 Setting up PDF Chatbot Assistant..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed. Please install Ollama from https://ollama.com"
    exit 1
fi

# Check if Ollama service is running
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "❌ Ollama service is not running. Please start it with: ollama serve"
    exit 1
fi

# Check if Llama 3.2 model is available
if ! ollama list | grep -q "llama3.2"; then
    echo "📦 Llama 3.2 model not found. Pulling it now..."
    ollama pull llama3.2:latest
    if [ $? -ne 0 ]; then
        echo "❌ Failed to pull Llama 3.2 model"
        exit 1
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env.local file
echo "🔧 Creating environment configuration..."
cat > .env.local << EOF
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest

# Application Configuration
NEXT_PUBLIC_APP_NAME="PDF Chatbot Assistant"
EOF

echo "✅ Setup complete! You can now run the application with:"
echo "   npm run dev"
echo ""
echo "📖 Open http://localhost:3000 in your browser"
echo ""
echo "🎯 Features:"
echo "   • Upload PDF documents"
echo "   • Ask questions about your PDFs"
echo "   • Get AI-powered answers"
echo "   • Manage multiple documents"
echo ""
echo "🔧 Make sure Ollama is running: ollama serve"
