# Nova AI

**Nova AI** යනු බහුභාෂා (English · සිංහල · தமிழ்) AI කතාබහ වෙබ් යෙදුමකි — Hugging Face Inference Providers හරහා විවෘත-බර (open-weight) භාෂා ආකෘති භාවිතා කරයි.

Nova AI is a premium multilingual AI chat web application built with Next.js App Router, React, TypeScript and Tailwind CSS. It supports Sinhala, Tamil and English, with real streaming AI responses, conversation history management, and a secure server-side provider integration.

---

## විශේෂාංග (Features)

- Real-time streaming AI chat (Server-Sent Events) — no fake/simulated replies
- සිංහල / தமிழ் / English UI සහ පිළිතුරු (language preference in Settings)
- Markdown rendering + syntax-highlighted code blocks with **Copy code**
- Copy message · Regenerate · Retry after failures · Stop generation
- Conversation history: new chat, rename, delete, clear all (with confirmation)
- Local conversation persistence (browser `localStorage`) with safe parsing
- Model picker (appears only when multiple models are configured on the server)
- Settings: theme (Cosmic dark / Light / System), language, model info, privacy & usage links
- Responsive layout: desktop sidebar + mobile drawer, keyboard accessible, reduced-motion support
- Secure API: zod validation, rate limiting, request size limits, timeouts, safe error mapping, security headers

---

## තාක්ෂණික පියවර (Tech Stack)

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 (custom cosmic/glass design system) |
| Markdown | react-markdown + remark-gfm + rehype-highlight |
| Backend | Next.js Route Handlers (`/api/chat`, `/api/models`) |
| AI | `@huggingface/inference` (Hugging Face Inference Providers) |
| Validation | Zod (server-side request schema) |
| Persistence | Browser `localStorage` (isolated storage layer) |
| Tests | Vitest |

---

## ස්ථාපනය (Installation)

පියවර අනුව ක්‍රියාත්මක කරන්න:

```bash
# 1. Dependencies ස්ථාපනය කරන්න
npm install

# 2. Environment configuration සකස් කරන්න
cp .env.example .env.local
# .env.local තුළ HF_TOKEN සහ HF_MODEL පුරවන්න (පහත වගුව බලන්න)

# 3. Development server ධාවනය කරන්න
npm run dev
# http://localhost:3000 විවෘත කරන්න

# 4. Quality checks
npm run lint
npm test
npm run build
npm start   # production server
```

### අවශ්‍ය පරිසර විචල්‍යයන් (Environment variables)

`.env.local` ගොනුවට එකතු කරන්න (`.env.example` placeholder පමණි — සැබෑ token කිසිවිටෙක commit නොකරන්න):

| Variable | අවශ්‍යද | විස්තරය |
| --- | --- | --- |
| `HF_TOKEN` | ✅ | Hugging Face access token ([hf.co/settings/tokens](https://huggingface.co/settings/tokens)). සේවාදායකයේ පමණක් රැඳේ — browser එකට නිරාවරණය නොවේ. |
| `HF_MODEL` | ✅ | Default model id (උදා: `Qwen/Qwen2.5-72B-Instruct`) |
| `HF_MODELS` | ➖ | comma-separated model ලැයිස්තුවක් (එකකට වඩා තිබේ නම් model picker පෙන්වයි) |
| `HF_PROVIDER` | ➖ | Inference provider (default: `auto`) |
| `MAX_OUTPUT_TOKENS` | ➖ | උපරිම output tokens (default 1024) |
| `PROVIDER_TIMEOUT_MS` | ➖ | Provider timeout (default 60000) |
| `RATE_LIMIT_MAX` | ➖ | IP එකකට ඉල්ලීම් සීමාව (default 20) |
| `RATE_LIMIT_WINDOW_MS` | ➖ | Rate limit කවුළුව (default 60000 ms) |

> **සටහන:** Hugging Face Inference Providers හි මිල ගණන් සහ නොමිලේ භාවිත සීමා විවිධ විය හැක — යෙදවීමට පෙර [huggingface.co/pricing](https://huggingface.co/pricing) සහ model/provider පිටුවල වර්තමාන කොන්දේසි පරීක්ෂා කරන්න. කිසිදු provider එකක් "සම්පූර්ණයෙන් නොමිලේ" බවට මෙම ව්‍යාපෘතිය සහතික නොකරයි.

---

## ආකෘතිය (Architecture)

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # POST — streaming chat (SSE), validation, rate limit
│   │   └── models/route.ts    # GET  — configured model info (no secrets)
│   ├── privacy/page.tsx       # පෞද්ගලිකත්ව තොරතුරු (EN / සිංහල / தமிழ்)
│   ├── usage/page.tsx         # භාවිත සීමා සහ තොරතුරු
│   ├── layout.tsx             # providers, theme init, metadata
│   ├── page.tsx               # chat workspace
│   └── globals.css            # design tokens, glass, markdown, code theme
├── components/
│   ├── chat/                  # message list, bubbles, markdown, composer…
│   ├── settings/              # settings panel
│   ├── ui/                    # button, dialog, toast
│   ├── sidebar.tsx            # desktop sidebar + mobile drawer
│   ├── logo.tsx               # Nova AI branding
│   └── icons.tsx              # inline SVG icons
├── hooks/
│   ├── use-conversations.ts   # conversation store + persistence hooks
│   └── use-settings.tsx       # theme / locale / model context
└── lib/
    ├── ai/                    # provider client, prompts, error mapping, config
    ├── storage/               # localStorage adapters (safe parsing)
    ├── validation/chat.ts     # zod request schema + limits
    ├── rate-limit.ts          # in-memory sliding-window limiter
    ├── chat-client.ts         # client SSE streaming
    ├── i18n.ts                # EN / SI / TA strings
    └── sse.ts                 # SSE wire format
```

**Design decisions**

- **Streaming:** `/api/chat` SSE (`delta` → `done` / `error`) — first-token අසාර්ථකත්වයන් නිසි HTTP status code සමඟ ලැබේ (400/429/502/503/504/500); stream අතරමැද දෝෂ `error` event එකක් ලෙස එයි.
- **Secrets:** `HF_TOKEN` සේවාදායකයේ පමණක්. Client එකට model allowlist නාම පමණක් ලැබේ.
- **Validation:** zod strict schema — roles (`user`/`assistant` පමණි), පණිවිඩ දිග, පණිවිඩ ගණන, මුළු context දිග, body ප්‍රමාණය සීමා කෙරේ. Client-ඉදිරිපත් කළ `endpointUrl` වැනි ක්ෂේත්‍ර ප්‍රතික්ෂේප වේ (server endpoint එක කිසිවිටෙක වෙනස් කළ නොහැක).
- **Persistence:** `localStorage` (එක් device එකකට පමණි — cloud sync නොවේ). Storage layer හුදු `src/lib/storage/` තුළ හුදුකොට ඇත; අනාගතයේදී database/auth එකක් හඳුන්වා දීමට storage adapter පමණක් මාරු කළ යුතුය.
- **Safety:** react-markdown raw HTML render නොකරයි (XSS ආරක්ෂාව), model-generated code execute නොකෙරේ, provider error bodies/logs වලට message content සටහන් නොවේ.

---

## පරීක්ෂණ (Tests)

```bash
npm test
```

වත්මන් test suite එක ආවරණය කරයි:

- Chat API validation (හිස් පණිවිඩ, invalid roles, ප්‍රමාණ සීමා, strict schema)
- Missing credentials (`HF_TOKEN` / `HF_MODEL` → 503)
- Provider error mapping (401 → 502, 429 → 429, 5xx → 502, unexpected → 500)
- Streaming behavior (SSE deltas, malformed chunk filtering, mid-stream errors)
- Rate limiting (per-IP sliding window)
- Conversation persistence (round-trip, corrupt data, quota failures, clear)

---

## යෙදවීම (Deployment)

- Vercel / Docker / ඕනෑම Node.js host එකකට `npm run build` + `npm start` සමඟ යෙදවිය හැක.
- Server environment එකට `HF_TOKEN`, `HF_MODEL` එකතු කරන්න (platform secrets/settings).
- **Rate limiting:** තේරුම් ගැනීම — in-memory limiter එක single-instance deployment සඳහා සුදුසුයි. බහු-instance සැකසුම්වලදී Redis වැනි shared store එකක් යොදා `src/lib/rate-limit.ts` මාරු කරන්න.
- Reverse proxy එකක් හරහා යනවා නම් `x-forwarded-for` header එක ලැබෙන බව තහවුරු කරන්න (rate limit IP හඳුනාගැනීම සඳහා).

---

## සීමා (Known limitations)

- කතාබහ ඉතිහාසය browser `localStorage` තුළ පමණි (cloud sync / ගිණුම් නැත). පෞද්ගලිකත්ව විස්තර [Privacy page](/privacy) බලන්න.
- මෙම sandbox/පරිසරයේදී සජීවී provider පරීක්ෂණයක් සඳහා ජාල ප්‍රවේශය + සැබෑ `HF_TOKEN` අවශ්‍ය වේ — token නොමැති විට AI පිළිතුරු ලැබෙන්නේ නැත (සේවාදායකයේ පැහැදිලි `not_configured` දෝෂයක් පෙන්වයි).
- භාෂා තේරීම UI භාෂාව වෙනස් කරයි; AI පිළිතුරු භාෂාව system prompt එකෙන්/පරිශීලක භාෂාවෙන් තීරණය වේ.

---

## බලපත්‍රය (License)

Apache License 2.0 — [LICENSE](LICENSE) බලන්න.
