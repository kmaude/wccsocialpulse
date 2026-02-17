export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          target: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      competitor_profiles: {
        Row: {
          created_at: string
          display_name: string | null
          follower_count: number | null
          handle: string
          id: string
          last_scanned_at: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          scan_data: Json | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          follower_count?: number | null
          handle: string
          id?: string
          last_scanned_at?: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          scan_data?: Json | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          follower_count?: number | null
          handle?: string
          id?: string
          last_scanned_at?: string | null
          platform?: Database["public"]["Enums"]["platform_type"]
          scan_data?: Json | null
        }
        Relationships: []
      }
      connections: {
        Row: {
          access_token_encrypted: string | null
          created_at: string
          data_active_date: string | null
          id: string
          platform: Database["public"]["Enums"]["platform_type"]
          refresh_token_encrypted: string | null
          status: Database["public"]["Enums"]["connection_status"]
          token_version: number
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string
          data_active_date?: string | null
          id?: string
          platform: Database["public"]["Enums"]["platform_type"]
          refresh_token_encrypted?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          token_version?: number
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string
          data_active_date?: string | null
          id?: string
          platform?: Database["public"]["Enums"]["platform_type"]
          refresh_token_encrypted?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          token_version?: number
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          ai_analysis: string | null
          ai_score: number | null
          content_snippet: string | null
          content_type: Database["public"]["Enums"]["content_type"] | null
          created_at: string
          external_id: string | null
          id: string
          metrics: Json | null
          platform: Database["public"]["Enums"]["platform_type"]
          published_at: string | null
          user_id: string
        }
        Insert: {
          ai_analysis?: string | null
          ai_score?: number | null
          content_snippet?: string | null
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string
          external_id?: string | null
          id?: string
          metrics?: Json | null
          platform: Database["public"]["Enums"]["platform_type"]
          published_at?: string | null
          user_id: string
        }
        Update: {
          ai_analysis?: string | null
          ai_score?: number | null
          content_snippet?: string | null
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string
          external_id?: string | null
          id?: string
          metrics?: Json | null
          platform?: Database["public"]["Enums"]["platform_type"]
          published_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_name: string | null
          created_at: string
          email: string | null
          id: string
          last_email_opened_at: string | null
          last_login: string | null
          marketing_consent: boolean
          name: string | null
          plan_tier: Database["public"]["Enums"]["plan_tier"]
          stripe_customer_id: string | null
          subscription_status: string | null
          tos_accepted_at: string | null
          tos_version_id: string | null
          updated_at: string
          vertical: Database["public"]["Enums"]["vertical_type"] | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          email?: string | null
          id: string
          last_email_opened_at?: string | null
          last_login?: string | null
          marketing_consent?: boolean
          name?: string | null
          plan_tier?: Database["public"]["Enums"]["plan_tier"]
          stripe_customer_id?: string | null
          subscription_status?: string | null
          tos_accepted_at?: string | null
          tos_version_id?: string | null
          updated_at?: string
          vertical?: Database["public"]["Enums"]["vertical_type"] | null
        }
        Update: {
          business_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_email_opened_at?: string | null
          last_login?: string | null
          marketing_consent?: boolean
          name?: string | null
          plan_tier?: Database["public"]["Enums"]["plan_tier"]
          stripe_customer_id?: string | null
          subscription_status?: string | null
          tos_accepted_at?: string | null
          tos_version_id?: string | null
          updated_at?: string
          vertical?: Database["public"]["Enums"]["vertical_type"] | null
        }
        Relationships: []
      }
      scores: {
        Row: {
          ai_recommendations: Json | null
          ai_summary: string | null
          created_at: string
          data_source: Database["public"]["Enums"]["data_source_type"] | null
          id: string
          overall: number
          period_end: string | null
          period_start: string | null
          sub_scores: Json | null
          user_id: string
        }
        Insert: {
          ai_recommendations?: Json | null
          ai_summary?: string | null
          created_at?: string
          data_source?: Database["public"]["Enums"]["data_source_type"] | null
          id?: string
          overall: number
          period_end?: string | null
          period_start?: string | null
          sub_scores?: Json | null
          user_id: string
        }
        Update: {
          ai_recommendations?: Json | null
          ai_summary?: string | null
          created_at?: string
          data_source?: Database["public"]["Enums"]["data_source_type"] | null
          id?: string
          overall?: number
          period_end?: string | null
          period_start?: string | null
          sub_scores?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_competitors: {
        Row: {
          competitor_profile_id: string
          confirmed: boolean
          created_at: string
          id: string
          source: Database["public"]["Enums"]["competitor_source"]
          user_id: string
        }
        Insert: {
          competitor_profile_id: string
          confirmed?: boolean
          created_at?: string
          id?: string
          source?: Database["public"]["Enums"]["competitor_source"]
          user_id: string
        }
        Update: {
          competitor_profile_id?: string
          confirmed?: boolean
          created_at?: string
          id?: string
          source?: Database["public"]["Enums"]["competitor_source"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_competitors_competitor_profile_id_fkey"
            columns: ["competitor_profile_id"]
            isOneToOne: false
            referencedRelation: "competitor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      competitor_source: "ai_suggested" | "manual"
      connection_status: "connected" | "collecting" | "active" | "error"
      content_type:
        | "image"
        | "video"
        | "carousel"
        | "story"
        | "reel"
        | "short"
        | "text"
      data_source_type: "analytics_db" | "real_time_scrape" | "oauth"
      plan_tier: "free" | "premium"
      platform_type: "instagram" | "facebook" | "tiktok" | "youtube"
      vertical_type: "CPG" | "Local Services" | "Other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      competitor_source: ["ai_suggested", "manual"],
      connection_status: ["connected", "collecting", "active", "error"],
      content_type: [
        "image",
        "video",
        "carousel",
        "story",
        "reel",
        "short",
        "text",
      ],
      data_source_type: ["analytics_db", "real_time_scrape", "oauth"],
      plan_tier: ["free", "premium"],
      platform_type: ["instagram", "facebook", "tiktok", "youtube"],
      vertical_type: ["CPG", "Local Services", "Other"],
    },
  },
} as const
