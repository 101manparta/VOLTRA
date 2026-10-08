import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

/**
 * Konfigurasi khusus test.
 *
 * Test VOLTARA harus hermetik: tidak boleh menembak backend Supabase sungguhan
 * (lokal maupun cloud). Seluruh service memang punya fallback ke data mock,
 * tetapi fallback itu hanya terpakai saat `isSupabaseConfigured === false`.
 *
 * `envDir` sengaja diarahkan ke folder `tests/` yang tidak berisi file `.env`,
 * sehingga `.env` di root proyek (yang menunjuk Supabase lokal yang sedang
 * berjalan) tidak ikut dimuat. Tanpa ini, `isSupabaseConfigured` menjadi true,
 * test melakukan panggilan jaringan nyata, lalu gagal karena timeout.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(rootDir, '.'),
    },
  },
  envDir: path.resolve(rootDir, 'tests'),
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
