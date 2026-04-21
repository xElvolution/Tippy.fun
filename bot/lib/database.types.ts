/**
 * Supabase Postgres typings for Tippy.
 * Regenerate later: `supabase gen types typescript --project-id <ref>`
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          discord_id: string;
          username: string;
          global_name: string | null;
          avatar_url: string | null;
          evm_address: string;
          encrypted_private_key: string;
          key_iv: string;
          key_tag: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          discord_id: string;
          username: string;
          global_name?: string | null;
          avatar_url?: string | null;
          evm_address: string;
          encrypted_private_key: string;
          key_iv: string;
          key_tag: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
        Relationships: [];
      };
      tips: {
        Row: {
          id: string;
          from_user_id: string;
          to_user_id: string;
          denom: string;
          amount: string;
          tx_hash: string | null;
          status: string;
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_user_id: string;
          to_user_id: string;
          denom?: string;
          amount: string;
          tx_hash?: string | null;
          status: string;
          error?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tips']['Insert']>;
        Relationships: [];
      };
      withdrawals: {
        Row: {
          id: string;
          user_id: string;
          to_address: string;
          denom: string;
          amount: string;
          tx_hash: string | null;
          status: string;
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          to_address: string;
          denom: string;
          amount: string;
          tx_hash?: string | null;
          status: string;
          error?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['withdrawals']['Insert']>;
        Relationships: [];
      };
      point_currencies: {
        Row: {
          id: string;
          guild_id: string;
          channel_id: string | null;
          owner_discord_id: string;
          name: string;
          symbol: string;
          cap: string;
          minted_total: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          guild_id: string;
          channel_id?: string | null;
          owner_discord_id: string;
          name: string;
          symbol: string;
          cap: string;
          minted_total?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['point_currencies']['Insert']>;
        Relationships: [];
      };
      point_balances: {
        Row: {
          id: string;
          point_currency_id: string;
          user_id: string;
          balance: string;
        };
        Insert: {
          id?: string;
          point_currency_id: string;
          user_id: string;
          balance?: string;
        };
        Update: Partial<Database['public']['Tables']['point_balances']['Insert']>;
        Relationships: [];
      };
      airdrop_rules: {
        Row: {
          id: string;
          point_currency_id: string;
          template: string;
          params_json: string;
          published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          point_currency_id: string;
          template: string;
          params_json?: string;
          published?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['airdrop_rules']['Insert']>;
        Relationships: [];
      };
      user_dashboard_tokens: {
        Row: {
          id: string;
          user_id: string;
          token_type: string;
          ref: string;
          label: string;
          decimals: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_type: string;
          ref: string;
          label?: string;
          decimals?: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_dashboard_tokens']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
