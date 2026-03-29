# Research Custom AI

A modern, interactive research assistant designed to categorize and preview documents efficiently. This project features a clean React-based UI with document thumbnailing and real-time activity tracking.

## 🚀 Getting Started

Follow these steps to set up the project locally:

### Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/alinadang/ResearchCustomAI.git
    cd ResearchCustomAI
    ```

2.  **Checkout the development branch**:
    ```bash
    git checkout front-end-prototype-one
    ```

3.  **Install dependencies**:
    ```bash
    npm install
    ```

### Running the Project

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Rendering**: [React PDF](https://react-pdf.org/)

## ✨ Key Features

- **Interactive Sources**: Upload, categorize, and manage research files.
- **Document Previews**: Render actual thumbnails of the first page of PDF documents.
- **Activity Tracker**: Real-time logging of document interactions.
- **Modern UI**: Sleek, responsive design with a focus on usability.

## 📂 Project Structure

- `src/components/`: Reusable UI components.
- `src/components/tabs/`: Tab-specific content (Chat, History, Artifacts, etc.).
- `src/context/`: State management (Activity, etc.).
- `src/data/`: Mock data for development.
