-- ============================================
-- Alterados MC - Supabase Migration
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- ============================================

-- 1. Tabla chapters
CREATE TABLE public.chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  state text,
  logo_url text,
  foundation_date date,
  expected_members integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Tabla profiles (extiende auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  nickname text,
  date_of_birth date,
  chapter_id uuid REFERENCES public.chapters ON DELETE SET NULL,
  role text NOT NULL DEFAULT 'member',
  member_type text NOT NULL DEFAULT 'pilot',
  blood_type text,
  emergency_contact_name text,
  emergency_contact_phone text,
  profile_photo_url text,
  is_active boolean DEFAULT true,
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Trigger: crear profile automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, chapter_id)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    CASE
      WHEN new.raw_user_meta_data->>'chapter_id' IS NOT NULL
        AND new.raw_user_meta_data->>'chapter_id' != ''
      THEN (new.raw_user_meta_data->>'chapter_id')::uuid
      ELSE NULL
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Helper: verificar si el usuario actual es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 5. Helper: verificar si es presidente de un chapter específico
CREATE OR REPLACE FUNCTION public.is_president_of(_chapter_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'president' AND chapter_id = _chapter_id
  );
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 6. Habilitar RLS
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies: chapters
-- ============================================

-- Todos pueden leer chapters
CREATE POLICY "chapters_select_public"
  ON public.chapters FOR SELECT
  USING (true);

-- Solo admin puede insertar chapters
CREATE POLICY "chapters_insert_admin"
  ON public.chapters FOR INSERT
  WITH CHECK (public.is_admin());

-- Admin puede editar cualquier chapter, presidente solo el suyo
CREATE POLICY "chapters_update"
  ON public.chapters FOR UPDATE
  USING (public.is_admin() OR public.is_president_of(id));

-- Solo admin puede eliminar chapters
CREATE POLICY "chapters_delete_admin"
  ON public.chapters FOR DELETE
  USING (public.is_admin());

-- ============================================
-- RLS Policies: profiles
-- ============================================

-- Todos pueden leer profiles (necesario para vista pública QR)
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (true);

-- Insert solo vía trigger (SECURITY DEFINER), no directo
CREATE POLICY "profiles_insert_self"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Cada usuario puede editar su propio perfil (excepto role)
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin puede editar cualquier perfil (incluido role)
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Presidente puede editar miembros de su chapter (para desactivar)
CREATE POLICY "profiles_update_president"
  ON public.profiles FOR UPDATE
  USING (
    public.is_president_of(chapter_id)
    AND auth.uid() != id
  );

-- Admin puede eliminar perfiles
CREATE POLICY "profiles_delete_admin"
  ON public.profiles FOR DELETE
  USING (public.is_admin());

-- ============================================
-- Trigger: actualizar updated_at automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chapters_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
