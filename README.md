# PulseChat 💬✨

A high-performance, professional team messaging application crafted with **Graphic Design Principles** (visual hierarchy, contrast, typography, whitespace, Material 3 design tokens), fluid **GSAP micro-animations**, pure **SVG vector reactions** (zero emojis), authentic **human-first team communication** (no AI gimmicks), real-time **multi-window synchronization**, **MongoDB Atlas** integration, and **Vercel** serverless deployment readiness.

---

## 🎨 Key Graphic Design & Architecture Highlights

1. **Strict Graphic Design Principles**:
   - **Visual Hierarchy & Typography**: Styled using Google Font `Plus Jakarta Sans` for clean, modern readability and `JetBrains Mono` for code snippets. Strict Material Design 3 type scales (Display, Headline, Title, Body, Label).
   - **Color & Contrast**: Sophisticated dark obsidian/slate theme (`#0a0d14`, `#141926`, `#1a2030`) paired with vibrant indigo primary (`#6366f1`), cyan accents (`#06b6d4`), and emerald presence indicators (`#10b981`), plus an accessible high-contrast light mode toggle.
   - **Material Design 3 Tokens**: Full integration of official Material 3 surface elevation levels (`--color-surface-container`, `--elevation-1` to `--elevation-4`), border hierarchy, and shape tokens.

2. **Crisp Vector SVGs Instead of Emojis**:
   - **Zero native system emojis**: Every reaction (Approve, Love, Fire, Ship it, Brilliant, Done, Agree, Celebrate, Watching, Favorite) is rendered as a clean, pixel-perfect, scalable SVG vector graphic with responsive hover states and active user highlights.
   - Vector status indicators and delivery checkmarks.

3. **GSAP Micro-Interactions**:
   - Spring message entrance animation on new messages (`power2.out`).
   - Reaction pill bounce on toggle (`back.out(2)`).
   - Animated send button feedback.
   - Staggered bouncing typing indicator dots.

4. **Authentic Team Messaging (No AI Bullshit)**:
   - **Persona Switcher**: Switch active identity anytime ("You" as Alex Rivera, Sarah Chen, Maya Lin, or David Kim) to test two-way team messaging on a single device.
   - **Real-Time Multi-Window Sync**: Powered by the browser `BroadcastChannel` API — open PulseChat in two separate browser tabs or side-by-side windows; messages, typing indicators, and reactions update **instantaneously across all tabs**!
   - **Realistic Peer Simulation**: Colleague replies can be triggered in solo demonstration mode.

5. **MongoDB Atlas Integration (`cloud.mongodb.com`)**:
   - Built-in **MongoDB Atlas Configuration Modal** with interactive connection guide:
     1. Free cluster deployment on [cloud.mongodb.com](https://cloud.mongodb.com).
     2. Database user creation and network access rules.
     3. Direct connection string validation and testing.
   - **Mongoose & Serverless Backend**: Includes `lib/mongodb.ts` with connection pooling, and API routes in `api/messages.ts` and `api/health.ts`.
   - **Offline-First Hybrid Engine**: Works immediately with zero configuration using local storage and automatically syncs to your live MongoDB Atlas cluster when configured.

6. **Vercel Ready Deployment (`vercel.com`)**:
   - Pre-configured `vercel.json` with rewrites for static assets and serverless `/api` routes.
   - Build verified with TypeScript and Vite: `npm run build`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ (Node v24 LTS is installed)
- npm v10+

### Installation & Running Locally

```bash
# Install dependencies (already installed)
npm install

# Start the development server
npm run dev
```

The app will be live at: **`http://localhost:3000/`**

### Building for Production

```bash
npm run build
```

---

## ☁️ Connecting to MongoDB Atlas (`cloud.mongodb.com`)

1. Open PulseChat at `http://localhost:3000/`.
2. Click the **Database icon** on the leftmost Activity Rail to open the **MongoDB Atlas Integration** modal.
3. In [cloud.mongodb.com](https://cloud.mongodb.com):
   - Create a free **M0 Cluster**.
   - Under **Database Access**, create a user with a secure password.
   - Under **Network Access**, click **Add IP Address** &rarr; select **Allow Access from Anywhere** (`0.0.0.0/0`).
   - Go to your Cluster &rarr; click **Connect** &rarr; **Drivers** &rarr; copy the connection string.
4. Paste the connection string into the modal (e.g. `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`).
5. Click **Test Connection** &rarr; **Save Configuration**.

---

## 🚢 Deploying to Vercel (`vercel.com`)

PulseChat is fully pre-configured for Vercel deployment:

```bash
# Deploy with Vercel CLI
npx vercel

# Or push your repository to GitHub and import it on vercel.com
```

In your Vercel project settings:
1. Framework Preset: **Vite**
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.

---

## 📂 Project Structure

```
PulseChat/
├── api/                     # Vercel serverless API routes
│   ├── health.ts            # MongoDB connection health ping
│   └── messages.ts          # Fetch & create messages
├── lib/
│   └── mongodb.ts           # Mongoose client pooling & schemas
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   └── SvgIcons.tsx # Curated vector SVG reactions & badges
│   │   ├── Sidebar/
│   │   │   ├── ActivityRail.tsx     # Navigation, persona switcher, theme
│   │   │   └── ConversationList.tsx # Search, channels & DM list
│   │   ├── Chat/
│   │   │   ├── ChatHeader.tsx       # Presence, calls, pin filter
│   │   │   ├── MessageList.tsx      # Grouped feed, date dividers, typing
│   │   │   ├── MessageItem.tsx      # SVG reactions, markdown, hover bar
│   │   │   └── MessageComposer.tsx  # Rich toolbar, SVG popover, GSAP send
│   │   ├── Drawer/
│   │   │   └── InfoDrawer.tsx       # Profile, pinned messages, shared media
│   │   └── Modals/
│   │       ├── MongoConfigModal.tsx # Atlas connection guide & test
│   │       └── NewConversationModal.tsx # Create channels & DMs
│   ├── services/
│   │   ├── mockData.ts      # Initial team personas, channels, messages
│   │   ├── storage.ts       # Local persistence & reaction state
│   │   ├── broadcast.ts     # BroadcastChannel multi-window real-time sync
│   │   └── mongoApi.ts      # MongoDB connection testing service
│   ├── styles/
│   │   ├── tokens.css       # Material Design 3 tokens & themes
│   │   └── globals.css      # Layout, typography, elevation, glassmorphism
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   ├── App.tsx              # Main application container
│   └── main.tsx             # React DOM root
├── index.html               # Typography & Material symbols
├── vite.config.ts           # Vite development server
├── vercel.json              # Vercel serverless configuration
└── package.json
```
