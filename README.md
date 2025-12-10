# 🔄 cURL to Postman Converter

A powerful web application that converts browser cURL commands into Postman collections with automatic variable detection and environment generation.

## ✨ Features

- **🔄 Multi-command Support**: Convert multiple cURL commands in a single operation
- **🌐 Smart Host Detection**: Automatically detects repeated hosts and creates reusable variables
- **🔑 Token Management**: Identifies authentication tokens (Bearer, API keys) and generates environment variables
- **🌍 Environment Generation**: Creates separate environments for localhost and remote domains
- **📝 Editable Names**: Customize request and environment names through an intuitive interface
- **📊 Summary View**: Visual overview of all detected requests, hosts, tokens, and environments
- **📋 Easy Export**: Copy to clipboard or download as JSON
- **⚡ Modern UI**: Clean, responsive interface built with Tailwind CSS
- **✅ Postman Compatible**: Generates collections compatible with Postman Collection v2.1

## 🚀 Usage

1. **Paste cURL Commands**: Copy one or more cURL commands from your browser's DevTools Network tab
2. **Process**: Click the "Process" button to analyze and convert
3. **Review**: Check the summary view and customize request/environment names if needed
4. **Export**: Download the collection and environments or copy the JSON directly

### Example Input

```bash
curl 'https://api.example.com/users' \
  -H 'Authorization: Bearer eyJhbGc...' \
  -H 'Content-Type: application/json'

curl 'https://api.example.com/posts' \
  -H 'Authorization: Bearer eyJhbGc...'
```

### What You Get

- **Postman Collection**: Ready-to-import collection with all your requests
- **Environment Files**: Automatically generated environments with:
  - Host variables (e.g., `api_example_com_host`)
  - Protocol variables (e.g., `api_example_com_protocol`)
  - Token variables (e.g., `bearer_token`)
- **Variable Detection**: Summary of all detected variables and their usage

## 🛠️ Tech Stack

- **Framework**: Angular 21.0
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4.1
- **Testing**: Vitest 4.0
- **Build Tool**: Angular CLI 21.0

## 💻 Development

### Prerequisites

- Node.js (with npm 10.9.4 or higher)
- Angular CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/MauryCL/curl-to-postman.git
cd curl-to-postman

# Install dependencies
npm install
```

### Development Server

To start a local development server:

```bash
npm start
# or
ng serve
```

Open your browser and navigate to `http://localhost:4200/`. The application will automatically reload when you modify source files.

### Building

To build the project for production:

```bash
npm run build
# or
ng build
```

The build artifacts will be stored in the `dist/` directory, optimized for performance.

### Running Tests

To execute unit tests:

```bash
npm test
# or
ng test
```

## 📁 Project Structure

```
src/
├── app/
│   ├── services/
│   │   ├── curl-parser.service.ts       # Parses cURL commands
│   │   ├── variable-detector.service.ts # Detects and manages variables
│   │   ├── postman-generator.service.ts # Generates Postman collections
│   │   └── openapi-generator.service.ts # OpenAPI support
│   ├── app.ts                           # Main application component
│   ├── app.html                         # Main template
│   └── app.css                          # Application styles
└── index.html                           # Entry point
```

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## 📄 License

This project is open source and available for personal and commercial use.

---

Built with ❤️ using Angular and Tailwind CSS
