-- ==============================================================================
-- VOLTARA EV Mobility Intelligence Platform
-- Migration: 00004_profile_on_signup.sql
-- Description: Membuat baris public.profiles secara otomatis saat pengguna
--              mendaftar, sehingga aplikasi menampilkan identitas pengguna yang
--              sebenarnya (bukan persona demo).
-- ==============================================================================
--
-- CATATAN KEAMANAN
--   authService.signUp() mengirim metadata { full_name, role } dari browser.
--   Metadata itu BERASAL DARI CLIENT dan bisa dipalsukan, jadi trigger di bawah
--   SENGAJA mengabaikannya untuk kolom `role` dan selalu memakai 'USER'.
--   Tanpa penjagaan ini, siapa pun bisa mendaftar sebagai ADMIN/SUPER_ADMIN.
--   Promosi role dilakukan manual oleh admin lewat database.
-- ==============================================================================

-- 1. Fungsi pembuat profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
            split_part(COALESCE(NEW.email, 'pengguna'), '@', 1)
        ),
        'USER'
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- 2. Trigger pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill: lengkapi profil untuk pengguna yang sudah ada tetapi belum punya baris
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
    u.id,
    u.email,
    COALESCE(
        NULLIF(u.raw_user_meta_data ->> 'full_name', ''),
        split_part(COALESCE(u.email, 'pengguna'), '@', 1)
    ),
    'USER'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
