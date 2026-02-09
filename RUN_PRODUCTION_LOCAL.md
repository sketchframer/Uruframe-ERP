# Run Structura ERP — Production Local

Two terminals: **backend** (FastAPI + SQLite) and **frontend** (Vite production build).

---

## 1. Install dependencies

```bash
# Frontend (from project root)
npm install

# Backend
cd backend
uv sync
cd ..
```

## 2. Set your network IP (one-time)

Find your machine's local IP:

```bash
ipconfig getifaddr en0
```

Edit `.env.local` in the project root — this is the **only file** where you set the IP:

```env
VITE_API_URL=http://YOUR_IP:8000
VITE_USE_API=true
GEMINI_API_KEY=your-key-here  # optional
```

> Replace `YOUR_IP` with the output of the command above (e.g. `192.168.0.127`).
>
> The backend CORS is already set to `*` in `backend/.env`, so no IP config needed there.

**Tip:** To keep the same IP after reboots, assign a static IP to your machine in your router's DHCP settings (or in macOS System Settings > Network > Wi-Fi > Details > TCP/IP > Configure IPv4 > Manually).

## 3. Database setup

```bash
cd backend
uv run alembic upgrade head        # run migrations
uv run python -m app.seed          # optional: seed demo data (--reset to wipe first)
cd ..
```

## 4. Start backend (Terminal 1)

```bash
cd backend
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Health check: `http://YOUR_IP:8000/health`

## 5. Build & serve frontend (Terminal 2)

```bash
npm run build      # optimized production bundle → dist/
npm run preview    # serve on http://YOUR_IP:4173
```

Open `http://YOUR_IP:4173` from any device on your network.

---

## Access from other devices

Both servers bind to `0.0.0.0` (all network interfaces), so any device on your LAN can reach them:

| Service  | URL from any device             |
| -------- | ------------------------------- |
| Frontend | `http://YOUR_IP:4173`           |
| Backend  | `http://YOUR_IP:8000`           |
| Health   | `http://YOUR_IP:8000/health`    |

## Demo credentials

| Role     | PIN                    |
| -------- | ---------------------- |
| Admin    | `1234`                 |
| Operator | `0000`, `1111`, `2222` |

---

## Quick reference

| What                  | Where to change        |
| --------------------- | ---------------------- |
| Network IP            | `.env.local` (root)    |
| JWT secret            | `backend/.env`         |
| Database path         | `backend/.env`         |
| CORS (already `*`)    | `backend/.env`         |
| Gemini AI key         | `.env.local` (root)    |
