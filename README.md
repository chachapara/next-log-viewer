# next-log-viewer

A lightweight **real-time log viewer** for Next.js using **Server-Sent Events (SSE)**.  
Includes a simple tab-based UI (`ALL / INFO / WARN / ERROR`) and a plug-and-play API route.

Perfect for developers who want to monitor backend logs directly inside a Next.js app.

---

## 🚀 Features

- Live streaming logs via **SSE (Server-Sent Events)**
- UI tabs: **ALL, INFO, WARN, ERROR**
- Minimal and fast — no dependencies
- Works in **Next.js App Router**
- Easy API integration
- Tailwind-ready UI

---

## 📦 Installation

```sh
npm install next-log-viewer
```

---

## 🛠️ Setup

### 1. Create API Route  
Create the file:

```
app/api/log-stream/route.js
```

Add:

```js
import { sseLogHandler } from "next-log-viewer";

export const GET = (req) => sseLogHandler(req);
```

---

### 2. Use the Log Viewer Component

```jsx
"use client";
import { LogViewer } from "next-log-viewer";

export default function Page() {
  return <LogViewer api="/api/log-stream" />;
}
```

---

## 📤 Sending Logs (optional)

You can manually push logs using:

```js
import { pushLog } from "next-log-viewer";

pushLog("INFO", "Server started");
pushLog("ERROR", "Database not connected");
pushLog("WARN", "Memory usage high");
```

Useful inside:

- cron jobs  
- middleware  
- API routes  
- background workers  

---

## 🧱 Component UI Preview

Tabs:

```
[ ALL ] [ INFO ] [ WARN ] [ ERROR ]
```

Logs appear with colored backgrounds:

- 🔴 ERROR = red  
- 🟡 WARN = yellow  
- 🔵 INFO = gray  

---

## 📁 File Structure of Package

```
next-log-viewer/
│── index.js
│── package.json
│── README.md
│── components/
│   └── LogViewer.js
└── api/
    └── log-stream.js
```

---

## 📜 License

MIT License  
Created with ❤️ by YOU.

---

## ⭐ Support

If you like this package, please star ⭐ it on NPM and GitHub!

