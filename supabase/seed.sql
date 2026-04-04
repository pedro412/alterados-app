-- ============================================
-- Seed: Admin user
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- DESPUÉS de haber corrido migration.sql
-- ============================================

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- 1. Crear usuario en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, role, aud,
    confirmation_token, recovery_token
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'pedro.alvarez412@outlook.com',
    crypt('Admin2024!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Pedro Alvarez"}',
    now(), now(),
    'authenticated', 'authenticated',
    '', ''
  );

  -- 2. Crear identity (necesario para login con email/password)
  INSERT INTO auth.identities (
    id, user_id, provider_id, provider,
    identity_data, last_sign_in_at, created_at, updated_at
  ) VALUES (
    new_user_id, new_user_id,
    'pedro.alvarez412@outlook.com', 'email',
    jsonb_build_object(
      'sub', new_user_id::text,
      'email', 'pedro.alvarez412@outlook.com',
      'email_verified', true
    ),
    now(), now(), now()
  );

  -- 3. El trigger on_auth_user_created ya creó el profile, ahora lo hacemos admin
  UPDATE public.profiles SET role = 'admin' WHERE id = new_user_id;
END;
$$;
