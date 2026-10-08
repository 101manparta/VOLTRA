# VOLTARA — Backend lokal (Supabase)

Backend VOLTARA adalah **Supabase** (Postgres + PostGIS, PostgREST, GoTrue Auth,
Realtime, Storage, Studio). Tidak ada server Express terpisah: seluruh akses data
dilakukan klien lewat `@supabase/supabase-js`, dan struktur database didefinisikan
di `supabase/migrations/`.

---

## Menjalankan

```powershell
# Semua tahap: dependency -> Docker -> stack -> migrasi -> .env -> verifikasi
powershell -ExecutionPolicy Bypass -File scripts/backend-up.ps1

# Varian lain
... -StatusOnly     # lihat status stack + key
... -VerifyOnly     # hanya verifikasi HTTP
... -Reset          # hapus DB lalu jalankan migrasi ulang dari nol
... -Stop           # hentikan stack (data tetap di volume Docker)
... -SkipInstall    # lewati npm install
... -NoBridge       # pakai named pipe Docker langsung (tanpa jembatan TCP)
```

Lalu jalankan frontend:

```powershell
npm run dev          # http://localhost:3000
```

Verifikasi mandiri:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-backend.ps1
```

---

## Endpoint & kredensial

| Layanan      | URL / Nilai                                        |
| ------------ | -------------------------------------------------- |
| REST API     | `http://127.0.0.1:54321/rest/v1`                    |
| Auth         | `http://127.0.0.1:54321/auth/v1`                    |
| Realtime     | `ws://127.0.0.1:54321/realtime/v1`                  |
| Studio       | `http://127.0.0.1:54323`                            |
| Mailpit      | `http://127.0.0.1:54324`                            |
| Database     | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |

API key **asli** (di-generate otomatis oleh Supabase CLI) tersimpan di **`.env`**:

| Variabel                   | Isi                                        | Boleh di client? |
| -------------------------- | ------------------------------------------ | ---------------- |
| `VITE_SUPABASE_URL`        | `http://127.0.0.1:54321`                   | Ya               |
| `VITE_SUPABASE_ANON_KEY`   | JWT role `anon`                            | Ya (dilindungi RLS) |
| `SUPABASE_SERVICE_ROLE_KEY`| JWT role `service_role` — **rahasia**      | **TIDAK**        |
| `DATABASE_URL`             | koneksi Postgres langsung                  | Tidak            |

> `.env` diblokir `.gitignore` dan tidak boleh di-commit.
> Kunci `service_role` **jangan pernah** diberi prefix `VITE_` — akan bocor ke
> bundle browser. Ada test khusus yang menjaga hal ini
> (`tests/security/secrets_exposure.test.ts`).

---

## Isi database

| Tabel                | Baris | Akses anon (RLS) |
| -------------------- | ----: | ---------------- |
| `organizations`      |     4 | boleh baca       |
| `chargers`           |     8 | boleh baca       |
| `charger_connectors` |    11 | boleh baca       |
| `ai_agent_states`    |     6 | boleh baca       |
| `vehicles`           |     4 | **ditolak**      |
| `actionable_alerts`  |     2 | **ditolak**      |

RPC PostGIS `get_nearby_chargers(user_lat, user_lng, radius_meters, filter_connector, min_power)`
mengembalikan charger terdekat beserta jarak (meter) dan connector dalam bentuk JSONB.

---

## Catatan lingkungan (penting di Windows)

Beberapa hal ini sudah ditangani otomatis oleh `backend-up.ps1`, tetapi perlu
diketahui bila menjalankannya manual:

1. **Supabase CLI tidak bisa memakai named pipe Docker Desktop.**
   Docker Desktop di Windows hanya menyediakan API lewat
   `npipe:////./pipe/dockerDesktopLinuxEngine`, dan binary Bun milik Supabase CLI
   selalu gagal membukanya (`permission denied`) walau `docker` CLI, Node, dan
   PowerShell berhasil. `scripts/docker-npipe-bridge.mjs` menjembatani
   pipe tersebut ke TCP `127.0.0.1:2375`, lalu `DOCKER_HOST` diarahkan ke sana.

2. **Telemetri CLI harus dimatikan.** CLI menulis `%USERPROFILE%\.supabase\telemetry.json`
   dan bisa gagal dengan `EPERM`. Skrip menyetel
   `SUPABASE_TELEMETRY_DISABLED=1` dan membersihkan sisa file `.tmp`.

3. **`TMP`/`TEMP` harus di dalam project.** Saat inisialisasi database, CLI memanggil
   `makeTempDirectoryScoped` dan gagal bila diarahkan ke `%TEMP%` pengguna.
   Skrip mengarahkannya ke `.tmp/` di dalam project.

4. **Cache npm di dalam project.** Jalankan npm dengan
   `--cache .npm-cache` bila sandbox membatasi direktori cache global.

5. **PowerShell 5.1.** Tidak ada PowerShell 7 di mesin ini. Skrip memakai helper
   `Invoke-Native` karena PowerShell 5.1 mengubah tulisan native command ke stderr
   menjadi error yang menghentikan skrip. Selain itu
   `ConvertFrom-Json` tidak meng-enumerasi array, jadi hasilnya harus ditampung ke
   variabel dulu sebelum dibungkus `@()`.

6. **`npm install` memblokir lifecycle script** (kebijakan `install-scripts` npm 11.19).
   Ini tidak masalah: `esbuild` tetap berfungsi lewat paket platform
   `@esbuild/win32-x64`, dan `supabase` CLI dijalankan via `npx`.
