#!/bin/bash

# GitHub Publishing Script for PDF Chatbot Assistant
# This script helps you publish your project to GitHub

echo "🚀 Publishing PDF Chatbot Assistant to GitHub..."
echo ""

# Function to check if GitHub CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        echo "❌ GitHub CLI (gh) is not installed."
        echo "Please install it from: https://cli.github.com/"
        echo ""
        echo "Alternative: You can create the repository manually on GitHub.com"
        echo "Then push using: git remote add origin https://github.com/yourusername/pdf-chatbot-assistant.git"
        echo "                 git push -u origin main"
        exit 1
    fi
}

# Function to check if user is logged in to GitHub CLI
check_gh_auth() {
    if ! gh auth status &> /dev/null; then
        echo "❌ You are not logged in to GitHub CLI."
        echo "Please run: gh auth login"
        exit 1
    fi
}

# Function to create GitHub repository
create_github_repo() {
    echo "Creating GitHub repository..."
    
    # Create the repository
    gh repo create pdf-chatbot-assistant \
        --public \
        --description "🤖📄 A modern AI-powered PDF chatbot assistant built with Next.js, LangChain, Ollama, and Llama 3.2" \
        --source . \
        --push
    
    if [ $? -eq 0 ]; then
        echo "✅ Repository created successfully!"
        echo "🌐 Your repository is now available at: https://github.com/$(gh api user --jq '.login')/pdf-chatbot-assistant"
    else
        echo "❌ Failed to create repository. Please check your permissions and try again."
        exit 1
    fi
}

# Function to add additional repository settings
configure_repo() {
    echo ""
    echo "Configuring repository settings..."
    
    # Add topics/tags
    gh repo edit --add-topic "nextjs" --add-topic "langchain" --add-topic "ollama" --add-topic "llama" --add-topic "ai" --add-topic "pdf" --add-topic "chatbot" --add-topic "typescript" --add-topic "react"
    
    echo "✅ Repository configured with topics"
}

# Function to create a release
create_release() {
    echo ""
    echo "Creating initial release..."
    
    gh release create v1.0.0 \
        --title "🎉 Initial Release - Full AI Integration" \
        --notes "
# PDF Chatbot Assistant v1.0.0

## 🎉 Initial Release

This is the first release of the PDF Chatbot Assistant with full AI integration!

### ✨ Features

- 📄 **PDF Upload & Processing**: Drag-and-drop PDF upload with intelligent text extraction
- 🤖 **AI-Powered Chat**: Context-aware conversations using Llama 3.2
- 🔍 **Vector Search**: Semantic similarity search for relevant document chunks
- 💬 **Conversation History**: Maintains context across chat sessions
- 🛠️ **Server-side Processing**: All AI logic runs on the server for optimal performance
- 🔄 **Real-time Status**: System health monitoring and error handling
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS

### 🚀 Quick Start

1. Install dependencies: \`npm install\`
2. Set up Ollama with required models
3. Start the development server: \`npm run dev\`
4. Open http://localhost:3000 and start chatting!

### 🔧 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: LangChain, Ollama, Llama 3.2
- **Vector Storage**: MemoryVectorStore
- **PDF Processing**: pdf-parse with intelligent text chunking

### 📚 Documentation

- [README.md](README.md) - Complete setup and usage guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- [AI_INTEGRATION_STATUS.md](AI_INTEGRATION_STATUS.md) - Technical implementation details

Ready to use! 🚀
"
    
    echo "✅ Release v1.0.0 created"
}

# Main execution
echo "Prerequisites check..."
check_gh_cli
check_gh_auth

echo "✅ GitHub CLI is ready"
echo ""

# Ask user for confirmation
echo "This will create a public repository called 'pdf-chatbot-assistant' on GitHub."
echo "Are you sure you want to continue? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    create_github_repo
    configure_repo
    create_release
    
    echo ""
    echo "🎉 Success! Your PDF Chatbot Assistant is now published on GitHub!"
    echo ""
    echo "🌐 Repository: https://github.com/$(gh api user --jq '.login')/pdf-chatbot-assistant"
    echo "📋 Next steps:"
    echo "  1. Visit your repository on GitHub"
    echo "  2. Update the README with your GitHub username"
    echo "  3. Add any additional documentation"
    echo "  4. Share your project with the community!"
    echo ""
    echo "Thank you for using the PDF Chatbot Assistant! 🚀"
else
    echo "❌ Operation cancelled."
    echo ""
    echo "Manual steps to publish:"
    echo "1. Create a new repository on GitHub.com"
    echo "2. Add the remote: git remote add origin https://github.com/yourusername/pdf-chatbot-assistant.git"
    echo "3. Push the code: git push -u origin main"
fi
