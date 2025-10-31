# 🍋 MangoWC Web

**MangoWC Web** is the website for **[MangoWC](https://github.com/DreamMaoMao/mangowc)** — a lightweight, high-performance Wayland compositor built on **dwl**.
This site provides detailed documentation, configuration guides, and developer resources for both users and contributors.

---

## ⚙️ Installation

> **Note:** This project uses [**Bun**](https://bun.com/) as the preferred package manager for its speed and modern features.

### 1. Clone the repository

```bash
git clone git@github.com:atheeq-rhxn/mangowc-web.git
cd mangowc-web
```

### 2. Install dependencies

```bash
bun install
```

### 3. (Optional) Set up environment variables

If needed, create a `.env` file inside the `apps/web` directory and adjust values based on `.env.example`.

---

## 🚀 Development

### Start the development server

```bash
bun run dev
```

Once running, open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🧰 Available Scripts

| Command               | Description                                |
| --------------------- | ------------------------------------------ |
| `bun run dev`         | Start the local development server         |
| `bun run build`       | Build the site for production              |
| `bun run check`       | Run linting and formatting using **Biome** |
| `bun run check-types` | Perform TypeScript type checking           |

---

## 🏗️ Project Structure

```
mangowc-web/
├── docs/                     # Markdown/MDX documentation content
├── apps/
│   └── web/                  # Main Next.js application
│       ├── src/
│       │   ├── app/          # Next.js App Router pages
│       │   ├── components/   # Shared UI components
│       │   └── lib/          # Configurations & utilities
│       └── public/           # Static assets
└── turbo.json                # Turborepo configuration
```

---

## 🌐 Links

* **Live Site:** [https://mangowc.vercel.app](https://mangowc.vercel.app)
* **Core Project:** [DreamMaoMao/mangowc](https://github.com/DreamMaoMao/mangowc)
* **Documentation:** [https://mangowc.vercel.app/docs](https://mangowc.vercel.app/docs)
