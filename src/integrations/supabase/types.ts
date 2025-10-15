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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      check_ins: {
        Row: {
          billable_impressions: Json | null
          campaigns_shown: string[] | null
          check_in_method: Database["public"]["Enums"]["check_in_method"] | null
          check_in_time: string
          created_at: string
          customer_id: string
          id: string
          retailer_id: string
          session_duration: number | null
          updated_at: string
        }
        Insert: {
          billable_impressions?: Json | null
          campaigns_shown?: string[] | null
          check_in_method?:
            | Database["public"]["Enums"]["check_in_method"]
            | null
          check_in_time?: string
          created_at?: string
          customer_id: string
          id?: string
          retailer_id: string
          session_duration?: number | null
          updated_at?: string
        }
        Update: {
          billable_impressions?: Json | null
          campaigns_shown?: string[] | null
          check_in_method?:
            | Database["public"]["Enums"]["check_in_method"]
            | null
          check_in_time?: string
          created_at?: string
          customer_id?: string
          id?: string
          retailer_id?: string
          session_duration?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      flash_promos: {
        Row: {
          auto_disable_at_zero: boolean | null
          category: string | null
          created_at: string
          created_by: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          discounted_price: number | null
          end_time: string
          id: string
          metrics: Json | null
          priority: Database["public"]["Enums"]["promo_priority"] | null
          product_name: string
          regular_price: number | null
          retailer_id: string
          show_to_all: boolean | null
          sku: string
          start_time: string | null
          status: Database["public"]["Enums"]["promo_status"] | null
          stock_initial: number | null
          stock_remaining: number | null
          target_segments: string[] | null
          type: string | null
          updated_at: string
        }
        Insert: {
          auto_disable_at_zero?: boolean | null
          category?: string | null
          created_at?: string
          created_by: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          discounted_price?: number | null
          end_time: string
          id?: string
          metrics?: Json | null
          priority?: Database["public"]["Enums"]["promo_priority"] | null
          product_name: string
          regular_price?: number | null
          retailer_id: string
          show_to_all?: boolean | null
          sku: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["promo_status"] | null
          stock_initial?: number | null
          stock_remaining?: number | null
          target_segments?: string[] | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          auto_disable_at_zero?: boolean | null
          category?: string | null
          created_at?: string
          created_by?: string
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          discounted_price?: number | null
          end_time?: string
          id?: string
          metrics?: Json | null
          priority?: Database["public"]["Enums"]["promo_priority"] | null
          product_name?: string
          regular_price?: number | null
          retailer_id?: string
          show_to_all?: boolean | null
          sku?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["promo_status"] | null
          stock_initial?: number | null
          stock_remaining?: number | null
          target_segments?: string[] | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flash_promos_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          campaign_id: string | null
          campaign_type: string | null
          created_at: string
          customer_id: string
          event_type: string
          id: string
          metadata: Json | null
          retailer_id: string
          timestamp: string
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          campaign_type?: string | null
          created_at?: string
          customer_id: string
          event_type: string
          id?: string
          metadata?: Json | null
          retailer_id: string
          timestamp?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          campaign_type?: string | null
          created_at?: string
          customer_id?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          retailer_id?: string
          timestamp?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      retailers: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      check_in_method: "geofence" | "BLE" | "manual" | "NFC"
      discount_type: "fixed" | "percentage"
      promo_priority: "high" | "normal"
      promo_status: "active" | "completed" | "autoDisabled"
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
      check_in_method: ["geofence", "BLE", "manual", "NFC"],
      discount_type: ["fixed", "percentage"],
      promo_priority: ["high", "normal"],
      promo_status: ["active", "completed", "autoDisabled"],
    },
  },
} as const
