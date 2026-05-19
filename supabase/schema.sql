-- ====================================================================
-- AUDIOFORGE IDEMPOTENT DATABASE SCHEMA FOR SUPABASE
-- Safe to run at any time; will not drop tables or alter existing data.
-- Includes explicit role permissions to fix 'permission denied' errors.
-- Updated: purchase_beat now deletes the beat entirely from the database.
-- ====================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Explicit Table Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO anon, authenticated, service_role;

-- Idempotent Profile Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Service role and admins can view all profiles') THEN
        CREATE POLICY "Service role and admins can view all profiles" ON public.profiles FOR SELECT USING (TRUE);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Service role can insert profiles') THEN
        CREATE POLICY "Service role can insert profiles" ON public.profiles FOR INSERT WITH CHECK (TRUE);
    END IF;
END $$;

-- ============================================
-- 3. BEATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.beats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL DEFAULT 'AudioForge',
    genre TEXT NOT NULL CHECK (genre IN ('Trap', 'Drill', 'Boom Bap', 'Synthwave', 'R&B')),
    bpm INTEGER NOT NULL CHECK (bpm >= 60 AND bpm <= 200),
    key_signature TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    description TEXT,
    duration TEXT DEFAULT '3:00',
    cover_gradient TEXT DEFAULT 'from-orange-500 to-red-600',
    audio_url TEXT, -- URL to the audio file in Supabase Storage
    stems_url TEXT, -- URL to the stems zip file in Supabase Storage
    is_sold BOOLEAN DEFAULT FALSE,
    sold_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure RLS is enabled
ALTER TABLE public.beats ENABLE ROW LEVEL SECURITY;

-- Explicit Table Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.beats TO anon, authenticated, service_role;

-- Idempotent Beats Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'beats' AND policyname = 'Anyone can view unsold beats') THEN
        CREATE POLICY "Anyone can view unsold beats" ON public.beats FOR SELECT USING (is_sold = FALSE);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'beats' AND policyname = 'Admins can view all beats') THEN
        CREATE POLICY "Admins can view all beats" ON public.beats FOR SELECT USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'beats' AND policyname = 'Admins can insert beats') THEN
        CREATE POLICY "Admins can insert beats" ON public.beats FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'beats' AND policyname = 'Admins can update beats') THEN
        CREATE POLICY "Admins can update beats" ON public.beats FOR UPDATE USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'beats' AND policyname = 'Admins can delete beats') THEN
        CREATE POLICY "Admins can delete beats" ON public.beats FOR DELETE USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
        );
    END IF;
END $$;

-- ============================================
-- 4. SALES TABLE (tracks purchases)
-- ============================================
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    beat_id UUID REFERENCES public.beats(id) ON DELETE SET NULL,
    beat_title TEXT NOT NULL,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    buyer_email TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    payment_method TEXT DEFAULT 'card',
    payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure RLS is enabled
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Explicit Table Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sales TO anon, authenticated, service_role;

-- Idempotent Sales Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales' AND policyname = 'Buyers can view own purchases') THEN
        CREATE POLICY "Buyers can view own purchases" ON public.sales FOR SELECT USING (buyer_id = auth.uid());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales' AND policyname = 'Admins can view all sales') THEN
        CREATE POLICY "Admins can view all sales" ON public.sales FOR SELECT USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales' AND policyname = 'Service role can insert sales') THEN
        CREATE POLICY "Service role can insert sales" ON public.sales FOR INSERT WITH CHECK (TRUE);
    END IF;
END $$;

-- ============================================
-- 5. USER PURCHASES TABLE (what users own)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    beat_id UUID REFERENCES public.beats(id) ON DELETE SET NULL,
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    download_count INTEGER DEFAULT 0,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, beat_id)
);

-- Ensure RLS is enabled
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- Explicit Table Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_purchases TO anon, authenticated, service_role;

-- Idempotent User Purchases Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_purchases' AND policyname = 'Users can view own purchases') THEN
        CREATE POLICY "Users can view own purchases" ON public.user_purchases FOR SELECT USING (user_id = auth.uid());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_purchases' AND policyname = 'Admins can view all purchases') THEN
        CREATE POLICY "Admins can view all purchases" ON public.user_purchases FOR SELECT USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
        );
    END IF;
END $$;

-- ============================================
-- 6. CLASSES TABLE (course offerings)
-- ============================================
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    features TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure RLS is enabled
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Explicit Table Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.classes TO anon, authenticated, service_role;

-- Idempotent Classes Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'classes' AND policyname = 'Anyone can view active classes') THEN
        CREATE POLICY "Anyone can view active classes" ON public.classes FOR SELECT USING (is_active = TRUE);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'classes' AND policyname = 'Admins can manage classes') THEN
        CREATE POLICY "Admins can manage classes" ON public.classes FOR ALL USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
        );
    END IF;
END $$;

-- ============================================
-- 7. CLASS ENROLLMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.class_enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(user_id, class_id)
);

-- Ensure RLS is enabled
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;

-- Explicit Table Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.class_enrollments TO anon, authenticated, service_role;

-- Idempotent Class Enrollments Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'class_enrollments' AND policyname = 'Users can view own enrollments') THEN
        CREATE POLICY "Users can view own enrollments" ON public.class_enrollments FOR SELECT USING (user_id = auth.uid());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'class_enrollments' AND policyname = 'Users can enroll themselves') THEN
        CREATE POLICY "Users can enroll themselves" ON public.class_enrollments FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'class_enrollments' AND policyname = 'Admins can manage enrollments') THEN
        CREATE POLICY "Admins can manage enrollments" ON public.class_enrollments FOR ALL USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
        );
    END IF;
END $$;

-- ============================================
-- 8. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to handle beat purchase & delete beat entirely from database
CREATE OR REPLACE FUNCTION public.purchase_beat(
    p_beat_id UUID,
    p_buyer_email TEXT,
    p_payment_method TEXT DEFAULT 'card'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_beat public.beats;
    v_sale_id UUID;
    v_user_id UUID;
BEGIN
    -- Select beat before deleting
    SELECT * INTO v_beat FROM public.beats WHERE id = p_beat_id;
    
    IF v_beat IS NULL THEN
        RETURN json_build_object('success', FALSE, 'error', 'Beat not found or already purchased');
    END IF;
    
    v_user_id := auth.uid();
    
    -- 1. Create sale record first so foreign key references are preserved
    INSERT INTO public.sales (beat_id, beat_title, buyer_id, buyer_email, price, payment_method, payment_status)
    VALUES (p_beat_id, v_beat.title, v_user_id, p_buyer_email, v_beat.price, p_payment_method, 'completed')
    RETURNING id INTO v_sale_id;
    
    -- 2. If user is logged in, add to their purchases referencing the sale
    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.user_purchases (user_id, beat_id, sale_id)
        VALUES (v_user_id, p_beat_id, v_sale_id)
        ON CONFLICT (user_id, beat_id) DO NOTHING;
    END IF;

    -- 3. Delete the beat entirely from the database!
    DELETE FROM public.beats WHERE id = p_beat_id;
    
    RETURN json_build_object(
        'success', TRUE, 
        'sale_id', v_sale_id,
        'beat_title', v_beat.title,
        'audio_url', v_beat.audio_url,
        'stems_url', v_beat.stems_url
    );
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Idempotent Triggers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_beats_updated_at') THEN
        CREATE TRIGGER update_beats_updated_at BEFORE UPDATE ON public.beats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_classes_updated_at') THEN
        CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- ============================================
-- 9. SAFE SEED DATA (Only inserts if empty)
-- ============================================
INSERT INTO public.classes (name, description, price, features)
SELECT 'Beginner''s Class', 'Learn the basics of making beats with Cubase and FL Studio', 15.00, ARRAY['Basic beat making', 'Cubase & FL Studio intro', 'Weekly practice exercises']
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Beginner''s Class');

INSERT INTO public.classes (name, description, price, features)
SELECT 'Arrangements', 'Learn song structure and beat arrangements', 20.00, ARRAY['Song structure & flow', 'Creating drops & builds', 'Advanced arrangement tips']
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Arrangements');
