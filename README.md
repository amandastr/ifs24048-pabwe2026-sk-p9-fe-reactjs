# ifs24048-pabwe2026-sk-p9-fe-reactjs

Frontend Delcom Blog (React + Vite + Tailwind). Backend: `ifs24048-pabwe2026-sk-p9-be-golang-gin` (port 8081).

## Menjalankan
```
npm install
npm run dev      # http://localhost:5174, proxy /api -> :8081
npm test         # Vitest + coverage 100%
npm run build    # hasil di dist/
```

## Rute
Publik: `/`, `/public`, `/posts/:slug`, `/login`, `/register`
Login: `/author` (member/admin), `/admin` (admin)

## Deploy (untuk Check UI)
- Server wajib mengembalikan `index.html` untuk semua path (SPA fallback), lihat `nginx.conf.template`.
- Jika API beda domain, set `VITE_API_URL` saat build; jika satu origin, set `API_UPSTREAM` pada container nginx.
- Audit memakai build produksi (`dist/`), bukan `npm run dev`.
