# AnswerTrace

An AI-search visibility and SEO platform built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Cheerio**, backed by **MongoDB**, **Nodemailer**, and a **vLLM** OpenAI-compatible inference server (`cyankiwi/Qwen3.5-9B-AWQ-4bit`).

AnswerTrace helps businesses see how AI agents research and answer customer questions, score on-page SEO signals, trace web searches and webpage reads during GEO/AEO simulations, and capture leads for expert follow-up.

## Features

- **Interactive Research Flow Visualizer:** Walks through how an AI agent receives a question, searches and checks the web, and returns an answer.
- **SEO Helper (Quick Scoring):** Inspects page metadata, headings, technical signals, links/images, and structured data with a 100-point score breakdown and category/severity filtering.
- **GEO / AEO Helper (Buyer Question Simulator):** Simulates potential customer questions against an AI agent, tracing web searches and webpage reads—including whether your target site appears.
- **Lead Capture & Staff Alerts:** Saves SEO and AEO follow-up inquiries (along with report/trace context) to MongoDB (`geo_aeo_lab`) and emails staff alerts via Nodemailer.
- **vLLM OpenAI-Compatible Inference:** Runs `cyankiwi/Qwen3.5-9B-AWQ-4bit` via Docker on port `33366` with reasoning parser support (`qwen3`) and a 32,768 context window.

## Tech Stack

- **Framework:** Next.js (App Router) & React
- **Language:** TypeScript
- **Styling & Motion:** Tailwind CSS, Framer Motion & Lucide Icons
- **HTML Parsing:** Cheerio
- **Database & Alerts:** MongoDB (`geo_aeo_lab`) & Nodemailer
- **AI Inference:** vLLM (`vllm/vllm-openai:latest`, `cyankiwi/Qwen3.5-9B-AWQ-4bit`)

## Prerequisites

- **Node.js** 18.18+ (or 20+ recommended)
- **npm** (or pnpm / yarn)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`, database `geo_aeo_lab`)
- **Docker** with NVIDIA GPU support (`--gpus all`) and NVIDIA Container Toolkit configured
- Hugging Face cache directory (`%USERPROFILE%\.cache\huggingface` on Windows)

## Installation & Setup

### 1. Start the vLLM Server

Run `start_vllm.bat` to launch the `qwen-vllm` container exposing the OpenAI-compatible endpoint on `http://localhost:33366`:

```bat
docker run -d --name qwen-vllm --gpus all -p 33366:8000 -v "%USERPROFILE%\.cache\huggingface:/root/.cache/huggingface" vllm/vllm-openai:latest --model cyankiwi/Qwen3.5-9B-AWQ-4bit --max-model-len 32768 --gpu-memory-utilization 0.85 --reasoning-parser qwen3 --max-num-seqs 16
```

Verify the container is up and serving models:

```bash
docker ps
curl http://localhost:33366/v1/models

```

### 2. Configure Environment Variables

Create `.env.local` in `web` with your MongoDB and Gmail alert settings:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=geo_aeo_lab
GMAIL_PWD=your-gmail-app-password
STAFF_ALERT_EMAIL=staff@example.com
```

### 3. Install Dependencies & Run the Server

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:30100](http://localhost:30100) in your browser.

## Available Scripts

| Command         | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `npm run dev`   | Starts the local Next.js development server on port `30100`. |
| `npm run build` | Creates an optimized production build.                       |
| `npm run start` | Runs the compiled production server.                         |
| `npm run lint`  | Runs ESLint across the codebase.                             |
| `npm run fix`   | Automatically fixes ESLint issues across project files.      |
