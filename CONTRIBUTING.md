# Contributing to PDF Chatbot Assistant

Thank you for your interest in contributing to the PDF Chatbot Assistant! This guide will help you get started with contributing to this project.

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork** locally
3. **Create a feature branch** from `main`
4. **Make your changes**
5. **Test your changes**
6. **Submit a pull request**

## 📋 Prerequisites

Before contributing, make sure you have:

- Node.js 18+ installed
- Ollama installed and running
- Required Ollama models downloaded:
  - `llama3.2:latest`
  - `nomic-embed-text:latest`
- Basic knowledge of TypeScript/React

## 🛠️ Development Setup

1. **Fork and clone the repository**
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
   ollama serve
   ollama pull llama3.2:latest
   ollama pull nomic-embed-text:latest
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm run build
   ./test-ai-integration.sh
   ```

## 📝 Making Changes

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Follow React best practices

### File Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   └── chatbot/          # Chatbot-specific components
├── lib/                   # Core libraries
│   ├── server-chatbot.ts  # AI chatbot logic
│   ├── server-pdf-processor.ts # PDF processing
│   └── ...
├── hooks/                 # Custom React hooks
└── store/                 # State management
```

### Adding New Features

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Add new functionality
   - Update tests if needed
   - Update documentation

3. **Test your changes**
   ```bash
   npm run build
   npm run dev
   ./test-ai-integration.sh
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

## 🧪 Testing

Before submitting a pull request, ensure:

1. **Build passes**
   ```bash
   npm run build
   ```

2. **Development server runs**
   ```bash
   npm run dev
   ```

3. **AI integration works**
   ```bash
   ./test-ai-integration.sh
   ```

4. **Manual testing**
   - Upload a PDF document
   - Chat with the AI assistant
   - Verify responses are contextually accurate

## 📦 Types of Contributions

### 🐛 Bug Fixes

- Fix existing functionality that's not working correctly
- Improve error handling
- Fix UI/UX issues

### ✨ New Features

- Add new AI capabilities
- Improve PDF processing
- Enhance the user interface
- Add new API endpoints

### 📚 Documentation

- Improve README.md
- Add code comments
- Create tutorials or guides
- Update API documentation

### 🎨 UI/UX Improvements

- Improve the interface design
- Add animations or transitions
- Improve accessibility
- Mobile responsiveness

## 🔧 Technical Guidelines

### API Routes

- Use proper HTTP status codes
- Include comprehensive error handling
- Add request/response validation
- Document API endpoints

### React Components

- Use functional components with hooks
- Implement proper prop types
- Add loading states
- Handle errors gracefully

### AI Integration

- Test with multiple document types
- Ensure context accuracy
- Handle edge cases
- Optimize performance

### State Management

- Use React hooks for local state
- Implement proper data flow
- Handle async operations correctly

## 📋 Pull Request Process

1. **Create a descriptive PR title**
   - Use conventional commits format
   - Examples: `feat: add document management`, `fix: resolve PDF parsing issue`

2. **Provide a clear description**
   - What changes were made
   - Why the changes were necessary
   - How to test the changes

3. **Link related issues**
   - Reference any related GitHub issues
   - Use keywords like "Closes #123"

4. **Ensure CI passes**
   - All tests must pass
   - Build must be successful

5. **Request review**
   - Tag relevant maintainers
   - Respond to feedback promptly

## 🐛 Reporting Issues

When reporting issues, please include:

1. **Clear description** of the problem
2. **Steps to reproduce** the issue
3. **Expected behavior** vs actual behavior
4. **System information** (OS, Node.js version, etc.)
5. **Screenshots** if applicable
6. **Error messages** or logs

## 💡 Feature Requests

For new features, please:

1. **Check existing issues** to avoid duplicates
2. **Describe the feature** clearly
3. **Explain the use case** and benefits
4. **Provide examples** if possible
5. **Consider implementation** complexity

## 🤝 Code of Conduct

This project follows a code of conduct to ensure a welcoming environment:

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Report inappropriate behavior

## 📞 Getting Help

If you need help:

1. **Check the documentation** first
2. **Search existing issues** for similar problems
3. **Create a new issue** with detailed information
4. **Join discussions** in the community

## 🎯 Roadmap

Current priorities:

- [ ] Multi-document support
- [ ] Advanced search filters
- [ ] Chat history persistence
- [ ] Multiple LLM model support
- [ ] Enhanced UI/UX features
- [ ] Mobile app version

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the PDF Chatbot Assistant! 🚀
