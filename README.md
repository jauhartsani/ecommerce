# HealthPro — Landing Page Produk Kesehatan

Full-stack landing page dengan admin panel untuk penjualan produk kesehatan.

## 🚀 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (Mobile-First)
- **Supabase** (Database, Auth, Storage)
- **React Hook Form + Zod** (Validasi form)
- **Netlify** (Hosting)

---

## 📁 Struktur Folder

```
src/
├── app/
│   ├── page.tsx              # Landing page utama
│   ├── success/page.tsx      # Halaman sukses order
│   ├── admin/
│   │   ├── layout.tsx        # Admin layout (auth guard)
│   │   ├── page.tsx          # Dashboard admin
│   │   ├── login/page.tsx    # Halaman login admin
│   │   ├── banners/page.tsx  # Kelola banner
│   │   ├── products/page.tsx # Kelola produk
│   │   ├── orders/page.tsx   # Kelola pesanan
│   │   └── settings/page.tsx # Pengaturan website
│   ├── api/
│   │   ├── banners/route.ts  # CRUD banners
│   │   ├── products/route.ts # CRUD products
│   │   ├── orders/route.ts   # Create & get orders
│   │   ├── orders/[id]/route.ts # Update order status
│   │   ├── settings/route.ts # Get & update settings
│   │   └── upload/route.ts   # Upload ke Supabase Storage
│   ├── sitemap.ts            # Sitemap SEO
│   └── robots.ts             # Robots.txt
├── components/
│   ├── admin/AdminSidebar.tsx
│   └── landing/
│       ├── LandingBanner.tsx
│       ├── OrderForm.tsx
│       └── FooterSection.tsx
├── lib/
│   ├── supabase.ts           # Supabase client (browser)
│   ├── supabase-admin.ts     # Supabase admin (server)
│   ├── validations.ts        # Zod schemas
│   └── utils.ts              # Helper functions
├── types/
│   └── database.ts           # TypeScript types
└── middleware.ts              # Auth middleware
```

---

## 🛠️ Instalasi

### 1. Clone & Install Dependencies

```bash
git clone <repo>
cd healthpro
npm install
```

### 2. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** dan jalankan `supabase-schema.sql`
3. Buka **SQL Editor** lagi dan jalankan `supabase-storage.sql`
4. Buka **Authentication > Users**, tambahkan user admin

### 3. Environment Variables

Buat file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://your-domain.netlify.app
```

Ambil nilai-nilai ini dari:
- Supabase Dashboard > **Project Settings > API**

### 4. Jalankan Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

Admin Panel: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🌐 Deploy ke Netlify

### Via Netlify Dashboard (Recommended)

1. Push code ke GitHub
2. Buka [netlify.com](https://netlify.com) > **Add new site > Import from Git**
3. Pilih repository
4. Build settings sudah otomatis dari `netlify.toml`
5. Tambahkan **Environment Variables** di Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
6. Install plugin: **@netlify/plugin-nextjs** (otomatis dari netlify.toml)
7. Deploy!

### Via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set NEXT_PUBLIC_SUPABASE_URL "your-url"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-key"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "your-service-key"
netlify env:set NEXT_PUBLIC_SITE_URL "https://your-site.netlify.app"
netlify deploy --prod
```

---

## 📊 Google Search Console

1. Setelah deploy, buka [Google Search Console](https://search.google.com/search-console)
2. Add property dengan URL Netlify kamu
3. Verifikasi melalui HTML tag atau DNS
4. Submit sitemap: `https://your-domain.netlify.app/sitemap.xml`

---

## 📱 Admin Panel

URL: `/admin`

### Fitur Admin:
- **Dashboard** — Statistik pesanan, produk, banner
- **Banner** — Upload/hapus/atur urutan banner per section
- **Produk** — CRUD produk dengan foto
- **Pesanan** — Lihat & update status pesanan
- **Pengaturan** — Nama website, nomor WA, info bank

### Login Admin:
Buat user di Supabase **Authentication > Users**

---

## 🎯 Sections Landing Page

| Section | Deskripsi |
|---------|-----------|
| `hero` | Banner utama |
| `masalah` | Banner masalah yang dialami pelanggan |
| `solusi` | Banner solusi produk |
| `manfaat` | Banner manfaat produk |
| `testimoni` | Banner testimoni pelanggan |
| `promo` | Banner promo/penawaran |

Semua banner dikelola dari Admin Panel → **Banner**.

---

## 📋 Order Flow

1. Customer isi form di landing page
2. Data tersimpan ke database Supabase
3. Generate Order ID otomatis (`ORD-YYMMDD-XXXX`)
4. Customer redirect ke halaman sukses
5. Customer klik tombol WhatsApp → form pesan ke admin
6. Admin update status di panel

---

## 🔐 Security

- **RLS (Row Level Security)** aktif di semua tabel Supabase
- **Service Role Key** hanya digunakan di server-side
- **Middleware** proteksi semua route `/admin/*`
- **Zod validation** di client dan server
- **Security headers** di `next.config.js` dan `netlify.toml`

---

## 🐛 Troubleshooting

### Build gagal di Netlify
- Pastikan semua env vars sudah ditambahkan
- Cek Netlify Build Log untuk error detail
- Pastikan `@netlify/plugin-nextjs` terpasang

### Upload gambar gagal
- Cek Storage bucket sudah dibuat dan public
- Cek Storage policies di `supabase-storage.sql` sudah dijalankan
- Pastikan `SUPABASE_SERVICE_ROLE_KEY` benar

### Login admin tidak bisa
- Cek user sudah dibuat di Supabase Authentication
- Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` benar
