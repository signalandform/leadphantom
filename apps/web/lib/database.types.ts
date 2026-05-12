export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/** Satisfies `never[]` pitfalls from bare `[]` relationship arrays for Supabase generics. */
type Rel = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

/** Multitenant namespace: all Lead Phantom tables use `_lp` suffix in Postgres. */
export type Database = {
  public: {
    Tables: {
      profiles_lp: {
        Row: {
          id: string;
          company_name: string | null;
          industry: string | null;
          sheet_url: string | null;
          google_api_key: string | null;
          onboarded: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          company_name?: string | null;
          industry?: string | null;
          sheet_url?: string | null;
          google_api_key?: string | null;
          onboarded?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          company_name?: string | null;
          industry?: string | null;
          sheet_url?: string | null;
          google_api_key?: string | null;
          onboarded?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: Rel[];
      };
      lead_searches_lp: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          query_text: string;
          location_bias: string | null;
          radius_meters: number | null;
          status: string;
          last_run_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          query_text: string;
          location_bias?: string | null;
          radius_meters?: number | null;
          status?: string;
          last_run_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          query_text?: string;
          location_bias?: string | null;
          radius_meters?: number | null;
          status?: string;
          last_run_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: Rel[];
      };
      lead_locations_lp: {
        Row: {
          id: string;
          search_id: string;
          place_id: string;
          name: string | null;
          address: string | null;
          phone: string | null;
          website: string | null;
          rating: number | null;
          status: string;
          last_seen_at: string;
        };
        Insert: {
          id?: string;
          search_id: string;
          place_id: string;
          name?: string | null;
          address?: string | null;
          phone?: string | null;
          website?: string | null;
          rating?: number | null;
          status?: string;
          last_seen_at?: string;
        };
        Update: {
          name?: string | null;
          address?: string | null;
          phone?: string | null;
          website?: string | null;
          rating?: number | null;
          status?: string;
          last_seen_at?: string;
        };
        Relationships: Rel[];
      };
      lead_exports_lp: {
        Row: {
          id: string;
          search_id: string;
          sheet_url: string;
          row_count: number;
          status: string;
          ran_at: string;
          payload: Json | null;
        };
        Insert: {
          id?: string;
          search_id: string;
          sheet_url: string;
          row_count?: number;
          status?: string;
          ran_at?: string;
          payload?: Json | null;
        };
        Update: {
          sheet_url?: string;
          row_count?: number;
          status?: string;
          ran_at?: string;
          payload?: Json | null;
        };
        Relationships: Rel[];
      };
      api_credentials_lp: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          encrypted_key: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          encrypted_key: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          encrypted_key?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: Rel[];
      };
    };
    Views: {};
    Functions: {};
  };
};
