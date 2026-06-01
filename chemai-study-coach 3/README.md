# ⚗️ ChemAI Study Coach

An AI-powered chemistry study app for college students. Paste your notes, get a custom quiz, track your weak topics.

---

## What It Does

1. **Paste chemistry notes** into the text area
2. **Click "Generate Quiz"** — the AI creates 10 multiple choice + 5 short answer questions
3. **Take the quiz** — answer MC questions, write short answers, self-grade
4. **See your results** — score, weak topics, incorrect question review
5. **Track progress** over time on the Dashboard

---

## Tech Stack

| Layer       | Technology              |
|-------------|-------------------------|
| Framework   | Next.js 14 (App Router) |
| Styling     | Tailwind CSS            |
| AI          | Anthropic Claude API    |
| Storage     | localStorage (MVP)      |
| Deployment  | Vercel                  |

---

## Project Structure

```
chemai-study-coach/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate-quiz/
│   │   │       └── route.ts        ← The AI API call lives here
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                ← Main app shell + state management
│   ├── components/
│   │   ├── Button.tsx              ← Reusable button
│   │   ├── Dashboard.tsx           ← Progress dashboard
│   │   ├── Header.tsx              ← Nav bar
│   │   ├── MultipleChoiceSection.tsx ← MC quiz UI
│   │   ├── NoteInput.tsx           ← Note paste + "Generate Quiz" button
│   │   ├── ResultsPanel.tsx        ← Score + weak topics after quiz
│   │   └── ShortAnswerSection.tsx  ← Short answer UI + self-grading
│   └── lib/
│       ├── storage.ts              ← localStorage read/write helpers
│       ├── types.ts                ← All TypeScript interfaces
│       └── utils.ts                ← Small utility functions
├── .env.example                    ← Copy to .env.local
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## Local Setup (Step by Step)

### Step 1 — Prerequisites

Make sure you have:
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- An **Anthropic API key** — [console.anthropic.com](https://console.anthropic.com)

### Step 2 — Install dependencies

```bash
cd chemai-study-coach
npm install
```

### Step 3 — Set up environment variables

```bash
# Copy the example file
cp .env.example .env.local

# Open .env.local and add your Anthropic API key:
# ANTHROPIC_API_KEY=sk-ant-...
```

### Step 4 — Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Deploy to Vercel

### Option A — Vercel CLI (easiest)

```bash
# Install Vercel CLI if you don't have it
npm install -g vercel

# Deploy from your project folder
vercel

# Follow the prompts. When asked for environment variables,
# add ANTHROPIC_API_KEY with your key.
```

### Option B — GitHub + Vercel Dashboard

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. In **Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your key from console.anthropic.com
4. Click **Deploy**

Vercel auto-detects Next.js. No build config needed.

---

## Environment Variables Reference

| Variable              | Required | Description                          |
|-----------------------|----------|--------------------------------------|
| `ANTHROPIC_API_KEY`   | ✅ Yes   | Your Anthropic API key               |

---

## How the AI Integration Works

**File:** `src/app/api/generate-quiz/route.ts`

```
User pastes notes
    ↓
POST /api/generate-quiz  { notes: "..." }
    ↓
Anthropic Claude API (claude-opus-4-5)
    ↓
Structured JSON response with 10 MC + 5 SA questions
    ↓
Quiz saved to localStorage
    ↓
Quiz displayed to user
```

The prompt instructs the model to return **only JSON** with no markdown fences. The API route parses it, validates the structure, and returns a typed `Quiz` object.

---

## Data Storage (MVP)

All data is saved in the browser's **localStorage** under the key `chemai_data`. This means:
- ✅ No backend database needed
- ✅ Works offline after first load
- ⚠️ Data is device-specific (not synced across devices)
- ⚠️ Cleared if user clears browser data

**Phase 2 migration:** Replace `src/lib/storage.ts` functions with Supabase calls. The rest of the app won't need changes.

---

## Phase 2 Roadmap (Not Built Yet)

The codebase is structured to make these easy to add:

- [ ] **PDF upload** — add a file input in `NoteInput.tsx`, extract text server-side
- [ ] **Supabase** — replace `src/lib/storage.ts` with Supabase client calls
- [ ] **Spaced repetition** — schedule quiz reminders based on weak topics
- [ ] **Progress charts** — add a chart library (recharts) to the Dashboard
- [ ] **Difficulty scaling** — pass previous results to the AI prompt to adjust difficulty

---

## Customization Tips

**Change the AI model:**
In `src/app/api/generate-quiz/route.ts`, change `claude-opus-4-5` to any model you prefer.

**Adjust question count:**
Edit the prompt in `buildPrompt()` — change "10 multiple choice" and "5 short answer" to your preference.

**Change the styling:**
Edit `tailwind.config.js` to change the `brand` color. The whole UI uses this color variable.

---

## Troubleshooting

**"API key not configured" error:**
→ Make sure `.env.local` exists and contains `ANTHROPIC_API_KEY=sk-ant-...`
→ Restart the dev server after changing `.env.local`

**"Failed to parse AI response" error:**
→ The AI occasionally returns malformed JSON. Just try again — it's rare.

**Quiz not generating:**
→ Check the browser console and terminal for error details.
→ Make sure your API key has available credits.
