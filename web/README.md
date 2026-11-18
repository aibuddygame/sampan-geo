# SEO AI

An AI-powered website SEO auditor built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Cheerio**, using local LLMs (**Ollama**) to generate context-aware code fixes.

Enter any public URL to inspect on-page, technical, content, link/media, and social metadata—receiving a 100-point score breakdown and copy-paste HTML/JSON-LD fixes tailored to the scanned page.

## Features

- **100-Point Weighted SEO Audit:** Evaluates 10 core checks across 5 categories (_Meta & Indexing_, _Content & Headings_, _Technical SEO_, _Links & Media_, and _Social & Open Graph_).
- **Local AI Code Recommendations:** Uses local LLM inference via Ollama (defaulting to `qwen3.5`) to generate tailored fixes and ready-to-copy code snippets based on the target page's actual tags and content.
- **Swappable LLM Backend:** Cleanly decoupled LLM adapter layer supporting both **Ollama** and **vLLM** (OpenAI-compatible endpoint).
- **Graceful Degradation:** Returns the full deterministic Cheerio SEO score report even if the local LLM service is offline.
- **Interactive SPA Dashboard:** Filter checks by category, inspect sub-scores, and copy suggested code snippets with one click.

## Tech Stack

- **Framework:** Next.js (App Router) & React
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Lucide Icons
- **HTML Parsing:** Cheerio
- **AI Inference:** Ollama SDK (`qwen3.5`)

## Prerequisites

- **Node.js** 18.18+ (or 20+ recommended)
- **npm** (or pnpm / yarn)
- **Ollama** installed locally

## Installation & Setup

### 1. Install Ollama & Pull the `qwen3.5` Model

Download and install Ollama for your operating system:

- **macOS / Windows:** Download the installer from [ollama.com](https://ollama.com/download).

Verify Ollama is running, then pull the `qwen3.5` model:

```bash
ollama pull qwen3.5
```

_(Optional)_ Confirm the model is available locally:

```bash
ollama list
```

### 2. Clone the Repository & Install Dependencies

```bash
cd web
npm install
```

### 3. Run the Development Server

Make sure Ollama is running in the background (`ollama serve` if not running as a desktop service), then start Next.js:

```bash
npm run dev
```

Open [http://localhost:30100](http://localhost:30100) in your browser, enter a website URL (e.g., `https://example.com`), and click **Run Audit**.

## Available Scripts

| Command         | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `npm run dev`   | Starts the local Next.js development server on port `30100`. |
| `npm run build` | Creates an optimized production build.                       |
| `npm run start` | Runs the compiled production server.                         |
| `npm run lint`  | Runs ESLint across the codebase.                             |
| `npm run fix`   | Automatically fixes ESLint issues across project files.      |
