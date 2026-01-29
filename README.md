# 🔄 cURL to Postman Converter

I got tired of manually copying and pasting cURL commands one by one to import them into Postman. I know there are alternatives—like Postman's own browser extension—but I wanted something simpler. I wanted something that would simply allow sharing cURLs directly from the browser without installing anything—no Postman, no extensions, just raw and easy to import.

That's how this project was born. It's the tool I built to save myself from those headaches.

Today, it does much more than just convert cURL to Postman, so the original name might be a bit confusing. I've thought about rebranding it, but honestly, I haven't had the time due to my work schedule.

[![Angular](https://img.shields.io/badge/Angular-21.0-red?logo=angular)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Features

### Current Features
- **🔄 Multi-command Support**: Convert multiple cURL commands in a single operation
- **🌐 Smart Host Detection**: Automatically detects repeated hosts and creates reusable variables
- **🔑 Token Management**: Identifies authentication tokens (Bearer, API keys) and generates environment variables
- **🌍 Environment Generation**: Creates separate environments for localhost and remote domains
- **📝 Editable Names**: Customize request and environment names through an intuitive interface
- **📊 Summary View**: Visual overview of all detected requests, hosts, tokens, and environments
- **📋 Easy Export**: Copy to clipboard or download as JSON
- **⚡ Modern UI**: Clean, responsive interface built with Angular and Tailwind CSS
- **✅ Multiple Export Formats**:
  - Postman Collection v2.1
  - OpenAPI 3.0
- **🎨 Request Editing**: Edit requests inline with detailed modal editor
- **↩️ Reset Functionality**: Reset individual or all requests to original state
- **🔍 Duplicate Detection**: Automatically identifies and highlights duplicate request names

### 🚀 Planned Features
See [ROADMAP.md](./ROADMAP.md) for detailed improvement plans:
- 📁 Multi-format input (Postman, Insomnia, OpenAPI, HAR files)
- 🎨 Complete Tailwind CSS migration
- 🧩 Reusable component library
- 💾 Auto-save with localStorage
- ↩️ Undo/Redo functionality
- 🔄 Bidirectional conversion

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (with npm 10.9.4+)
- Modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/MauryCL/curl-to-postman.git
cd curl-to-postman

# Install dependencies
npm install

# Start development server
npm start
```

Open your browser and navigate to `http://localhost:4200/`

---

## 📖 Usage Guide

### 1. Input cURL Commands

Copy cURL commands from your browser's DevTools Network tab:

```bash
curl 'https://api.example.com/users' \
  -H 'Authorization: Bearer eyJhbGc...' \
  -H 'Content-Type: application/json'

curl 'https://api.example.com/posts' \
  -H 'Authorization: Bearer eyJhbGc...'
```

### 2. Process & Review

Click **"Process"** to analyze and convert. The app will:
- Parse all cURL commands
- Detect repeated hosts and tokens
- Generate variable names automatically
- Create environment files

### 3. Customize (Optional)

- Edit request names in the Summary tab
- Modify environment variable names
- Edit request details (URL, headers, body)

### 4. Export

Choose your export format:
- **Postman Collection v2.1**: Ready to import into Postman
- **OpenAPI 3.0**: For API documentation

Download files or copy JSON to clipboard.

---

## 📦 What You Get

### Postman Collection
```json
{
  "info": {
    "name": "Generated Collection",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "GET /users",
      "request": {
        "method": "GET",
        "url": "{{api_example_com_protocol}}://{{api_example_com_host}}/users",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{bearer_token}}"
          }
        ]
      }
    }
  ]
}
```

### Environment Files
Automatically generated for each detected domain:

**api.example.com.postman_environment.json**
```json
{
  "name": "api.example.com",
  "values": [
    {
      "key": "api_example_com_host",
      "value": "api.example.com",
      "enabled": true
    },
    {
      "key": "api_example_com_protocol",
      "value": "https",
      "enabled": true
    },
    {
      "key": "bearer_token",
      "value": "eyJhbGc...",
      "enabled": true
    }
  ]
}
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 21.0 | Frontend framework |
| **TypeScript** | 5.9 | Type-safe development |
| **Tailwind CSS** | 4.1 | Utility-first styling |
| **Angular Signals** | - | Reactive state management |
| **Vitest** | 4.0 | Unit testing |
| **Angular Router** | 21.0 | Client-side routing |

---

## 💻 Development

### Available Scripts

```bash
# Development server (with hot reload)
npm start

# Build for production
npm run build

# Run tests
npm test

# Watch mode for tests
npm run test:watch

# Build and watch for changes
npm run watch
```

### Project Structure

```
src/app/
├── components/              # UI Components
│   ├── header/             # App header with info modal
│   ├── footer/             # App footer
│   ├── input-section/      # cURL input area
│   ├── output-section/     # Results display
│   ├── shared/             # Reusable components
│   │   ├── modal/          # Modal component
│   │   ├── toast/          # Toast notifications
│   │   ├── editable-list/  # Editable item lists
│   │   └── stats-grid/     # Statistics cards
│   └── tabs/               # Tab components
│       ├── summary-tab/    # Summary view
│       ├── output-viewer-tab/
│       ├── variables-tab/
│       └── additional-files-tab/
├── services/               # Business logic
│   ├── app-state.service.ts          # Global state management
│   ├── curl-parser.service.ts        # cURL parsing
│   ├── variable-detector.service.ts  # Variable detection
│   ├── conversion.service.ts         # Main conversion logic
│   ├── postman-generator.service.ts  # Postman export
│   └── openapi-generator.service.ts  # OpenAPI export
├── models/                 # TypeScript interfaces
│   ├── conversion-state.model.ts
│   ├── ui-state.model.ts
│   ├── parsed-request.model.ts
│   └── index.ts
├── pages/                  # Route pages
│   ├── home-page.component.ts
│   └── results-page.component.ts
└── app.routes.ts          # Routing configuration
```

### Code Guidelines

This project follows strict coding guidelines. See [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) for:
- File organization rules
- Component structure patterns
- State management with signals
- Testing with Vitest
- TypeScript best practices

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

Tests are written using **Vitest** and follow the patterns in `CODING_GUIDELINES.md`.

---

## 📚 Documentation

- **[ROADMAP.md](./ROADMAP.md)**: Planned improvements and features
- **[CODING_GUIDELINES.md](./CODING_GUIDELINES.md)**: Development standards
- **[docs/architecture_analysis.md](./docs/architecture_analysis.md)**: Architecture improvements analysis
- **[docs/component_reusability_guide.md](./docs/component_reusability_guide.md)**: Reusable component library guide and multi-format input

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Follow** the coding guidelines in `CODING_GUIDELINES.md`
4. **Commit** your changes (`git commit -m 'Add amazing feature'`)
5. **Push** to the branch (`git push origin feature/amazing-feature`)
6. **Open** a Pull Request

### Development Workflow

1. Check [ROADMAP.md](./ROADMAP.md) for planned features
2. Pick an item or propose a new feature
3. Follow the coding guidelines
4. Write tests for new functionality
5. Update documentation as needed

---

## 🐛 Known Issues & Limitations

- Currently only supports cURL input (multi-format support planned)
- No undo/redo functionality yet (planned in roadmap)
- No auto-save to localStorage (planned in roadmap)

See [ROADMAP.md](./ROADMAP.md) for planned solutions.

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- Built with [Angular](https://angular.dev)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Tested with [Vitest](https://vitest.dev)

---

## 📞 Contact

**Mauricio Areas** - [@MauryCL](https://github.com/MauryCL)

Project Link: [https://github.com/MauryCL/curl-to-postman](https://github.com/MauryCL/curl-to-postman)

---

<div align="center">

**Built with ❤️ using Angular and Tailwind CSS**

⭐ Star this repo if you find it helpful!

</div>
