# Quick Start Guide - PDF Chatbot Assistant

## 🚀 Getting Started (5 minutes)

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone and Install**

   ```bash
   git clone <repository-url>
   cd pdf-chatbot-assistant
   npm install
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - Visit [http://localhost:3000](http://localhost:3000)

### 🎮 Current Features Demo

#### 1. Upload PDF Files

- Click the upload area in the sidebar
- Select a PDF file from your computer
- File will be added to the document list

#### 2. Chat Interface

- Type questions in the chat input
- Get simulated AI responses
- View conversation history

#### 3. Document Management

- View uploaded documents in the sidebar
- See file details (name, size, pages)
- Clear chat history with the button

### 🔧 Full AI Setup (Optional)

For the complete AI-powered experience:

1. **Install Ollama**

   ```bash
   # macOS
   brew install ollama

   # Or download from https://ollama.com
   ```

2. **Start Ollama Service**

   ```bash
   ollama serve
   ```

3. **Pull Llama 3.2 Model**

   ```bash
   ollama pull llama3.2:latest
   ```

4. **Install LangChain Dependencies**

   ```bash
   ./install-langchain.sh
   ```

5. **Restart Development Server**
   ```bash
   npm run dev
   ```

### 📱 UI Overview

#### Sidebar

- **PDF Upload**: Drag & drop or click to upload
- **Document List**: View all uploaded PDFs
- **Clear Chat**: Reset conversation history
- **Toggle**: Show/hide sidebar

#### Chat Area

- **Message History**: View all conversations
- **Input Field**: Type your questions
- **Send Button**: Submit messages
- **Typing Indicator**: Shows when AI is responding

### 🎯 Next Steps

1. **Test the Interface**: Upload a PDF and start chatting
2. **Explore Components**: Check out the UI components
3. **Add AI Features**: Run the LangChain installation script
4. **Customize**: Modify styles and components as needed

### 💡 Tips

- Use the sidebar to manage multiple documents
- Chat history is maintained during the session
- The interface is fully responsive (mobile-friendly)
- TypeScript provides excellent development experience

### 🆘 Need Help?

- Check the main README.md for detailed documentation
- Review the source code in `/src` directory
- Look at component files in `/src/components`

---

**Happy Coding!** 🎉
