# SplitThat

**Split bills. Not friendships.**

An AI-powered expense splitting app that makes dividing costs as easy as snapping a photo. Powered by Gemini 3 Flash and integrated with Splitwise.

## What it does

1. **Snap a receipt** - Upload any receipt image
2. **AI does the math** - Gemini extracts and itemizes everything
3. **Assign items** - Tap who had what
4. **Publish to Splitwise** - Done. No more "you owe me" texts.

## Features

- **AI Receipt Scanning** - Gemini 3 Flash extracts items, prices, tax, and tip
- **Itemized Splitting** - Assign individual items to specific people
- **Manual Splits** - For when you just need to split something quickly
- **Splitwise Sync** - Seamlessly push expenses to your Splitwise account
- **Group Support** - Split with your roommates, trip buddies, or dinner crew

## Tech Stack

- **Next.js 16** - App Router + TypeScript
- **Convex** - Real-time database
- **Google Gemini** - AI-powered receipt parsing
- **Splitwise API** - Expense management
- **Tailwind + shadcn/ui** - Clean, responsive UI

## Local dev setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run Convex dev server (in a separate terminal)
npx convex dev

# Run the app
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and start splitting.

## Environment Variables

```
SPLITWISE_CLIENT_ID=
SPLITWISE_CLIENT_SECRET=
GEMINI_API_KEY=
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
TOKEN_ENCRYPTION_KEY=
```

---

Built with caffeine and the eternal desire to know exactly who owes what :P.