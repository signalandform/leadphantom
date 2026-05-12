-- Seed demo data for local development (`supabase db reset`).
-- Demo auth user: founder@leadphantom.com / demo-password-change-me (email+password for local convenience; magic link still works).

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  founder_id UUID := '31ac341d-709d-4cb8-aee8-cde02759e132'::uuid;
  search_dallas UUID := '22222222-2222-4222-8222-222222222222'::uuid;
  search_austin UUID := '33333333-3333-4333-8333-333333333333'::uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = founder_id) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      founder_id,
      'authenticated',
      'authenticated',
      'founder@leadphantom.com',
      crypt('demo-password-change-me', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      ''
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM auth.identities WHERE user_id = founder_id AND provider = 'email'
  ) THEN
    INSERT INTO auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      founder_id::text,
      founder_id,
      json_build_object(
        'sub', founder_id::text,
        'email', 'founder@leadphantom.com'
      ),
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;

  INSERT INTO public.profiles_lp (
    id,
    company_name,
    industry,
    sheet_url,
    google_api_key,
    onboarded
  )
  VALUES (
    founder_id,
    'Phantom Demo Co.',
    'Home services',
    'https://docs.google.com/spreadsheets/d/demo-sheet-id/edit',
    NULL,
    TRUE
  )
  ON CONFLICT (id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    industry = EXCLUDED.industry,
    sheet_url = EXCLUDED.sheet_url,
    onboarded = EXCLUDED.onboarded;

  INSERT INTO public.lead_searches_lp (
    id,
    user_id,
    name,
    query_text,
    location_bias,
    radius_meters,
    status,
    last_run_at
  )
  VALUES
    (
      search_dallas,
      founder_id,
      'Dallas HVAC',
      'HVAC contractors',
      'Dallas, TX',
      25000,
      'idle',
      NOW() - INTERVAL '1 day'
    ),
    (
      search_austin,
      founder_id,
      'Austin Dentists',
      'family dentist',
      'Austin, TX',
      15000,
      'idle',
      NOW() - INTERVAL '2 days'
    )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.lead_locations_lp (
    search_id,
    place_id,
    name,
    address,
    phone,
    website,
    rating,
    status,
    last_seen_at
  )
  VALUES
    (
      search_dallas,
      'demo_place_dallas_1',
      'Neon Cool HVAC',
      '100 Specter Ln, Dallas, TX',
      '214-555-0101',
      'https://example.com/neon-hvac',
      4.8,
      'active',
      NOW()
    ),
    (
      search_dallas,
      'demo_place_dallas_2',
      'Phantom Air Pros',
      '404 Glow Dr, Dallas, TX',
      '214-555-0102',
      NULL,
      4.5,
      'active',
      NOW()
    ),
    (
      search_austin,
      'demo_place_austin_1',
      'Smile Spectrum Dental',
      '9 Circuit Ave, Austin, TX',
      '512-555-0199',
      'https://example.com/smile',
      4.9,
      'active',
      NOW()
    )
  ON CONFLICT (search_id, place_id) DO NOTHING;

  INSERT INTO public.lead_exports_lp (
    search_id,
    sheet_url,
    row_count,
    status,
    ran_at,
    payload
  )
  VALUES
    (
      search_dallas,
      'https://docs.google.com/spreadsheets/d/demo-sheet-id/edit',
      2,
      'completed',
      NOW() - INTERVAL '12 hours',
      '{"demo": true}'::jsonb
    ),
    (
      search_austin,
      'https://docs.google.com/spreadsheets/d/demo-sheet-id/edit',
      1,
      'completed',
      NOW() - INTERVAL '30 hours',
      '{"demo": true}'::jsonb
    );
END $$;
