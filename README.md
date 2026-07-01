# Multi-Agent Academic Research Station — Frontend UI

This is the premium React-based frontend dashboard for the Multi-Agent Research Station. It features a space-themed, glassmorphic layout that provides visual agent pipeline tracing, manual profile customization, PDF uploading, and multi-format document downloads.

---

## 🎨 Design & Aesthetic Tokens

* **Glassmorphic Layout**: Designed using modern styling tokens, featuring backdrop blur layers, subtle neon border glows (`indigo`, `purple`, `emerald`), and sleek space-colored backdrops (`#0a0e1a`).
* **Dynamic Pipeline Tracking**: The agent sequence visualizer pulses in real-time with state highlights (`idle`, `running`, `completed`, `error`), complete with collapsible JSON logs.
* **DNA Profile Panel**: Displays average sentence gauges, Connector pills, and manual DNA override panels.
* **Interactive Chat Console**: Supports multi-file drag-and-drop uploads, instant input clearing, and citation badge parsing.

---

## 🛠️ Local Setup & Run

### 1. Prerequisites
Make sure you have **Node.js (v18+)** and **npm** installed.

### 2. Install Dependencies
Run from the `frontend/` directory:
```bash
npm install
```

### 3. Run Development Server
Start the local hot-reloaded development environment:
```bash
npm run dev
```
Open your browser and navigate to [http://localhost:5173](http://localhost:5173).

### 4. Build for Production
To bundle the static client files:
```bash
npm run build
```

---

## 📂 Project Structure

```text
frontend/
├── package.json
├── tailwind.config.js          # Tailwind theme configurations
├── index.html
├── src/
│   ├── main.jsx                # Application root
│   ├── index.css               # Base CSS layout & glassmorphic utility classes
│   ├── App.jsx                 # 3-column dashboard manager
│   ├── components/
│   │   ├── ChatInterface.jsx   # Chat list, uploading context, and export handlers
│   │   ├── SettingsPanel.jsx   # Client-side API credentials & LLM providers
│   │   ├── MemoryProfilePanel.jsx # Writing DNA gauges and metrics
│   │   └── AgentPipelineVisualizer.jsx # Glowing node flow visualizer
│   └── utils/
│       └── api.js              # Fetch requests with base URL auto-sanitization
└── README.md
```

---

## ☁️ Deployment (Vercel)

When deploying this frontend statically on Vercel:
1. Link your frontend repository to Vercel.
2. Configure this **Environment Variable**:
   * `VITE_API_URL` = `https://<your-render-backend>.onrender.com`
3. Click **Deploy**. Vercel will build the files and connect successfully to your Render backend.
