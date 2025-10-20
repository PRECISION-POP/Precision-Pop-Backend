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
      accepted_offers: {
        Row: {
          accepted_at: string
          check_in_id: string | null
          created_at: string
          customer_id: string
          id: string
          offer_id: string
          redeemed: boolean | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string
          check_in_id?: string | null
          created_at?: string
          customer_id: string
          id?: string
          offer_id: string
          redeemed?: boolean | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string
          check_in_id?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          offer_id?: string
          redeemed?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accepted_offers_check_in_id_fkey"
            columns: ["check_in_id"]
            isOneToOne: false
            referencedRelation: "check_ins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accepted_offers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accepted_offers_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          contact_email: string
          created_at: string
          id: string
          name: string
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          total_spend: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contact_email: string
          created_at?: string
          id?: string
          name: string
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          total_spend?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contact_email?: string
          created_at?: string
          id?: string
          name?: string
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          total_spend?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          bid_amount: number
          bid_type: Database["public"]["Enums"]["bid_type"] | null
          brand_id: string
          budget_spent: number | null
          budget_total: number
          clicks_delivered: number | null
          conversions_delivered: number | null
          created_at: string
          creative_url: string | null
          daily_budget_cap: number | null
          discount_value: number | null
          end_date: string
          id: string
          impressions_delivered: number | null
          name: string
          start_date: string
          status: Database["public"]["Enums"]["campaign_status"] | null
          target_segments: string[] | null
          updated_at: string
        }
        Insert: {
          bid_amount: number
          bid_type?: Database["public"]["Enums"]["bid_type"] | null
          brand_id: string
          budget_spent?: number | null
          budget_total: number
          clicks_delivered?: number | null
          conversions_delivered?: number | null
          created_at?: string
          creative_url?: string | null
          daily_budget_cap?: number | null
          discount_value?: number | null
          end_date: string
          id?: string
          impressions_delivered?: number | null
          name: string
          start_date: string
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_segments?: string[] | null
          updated_at?: string
        }
        Update: {
          bid_amount?: number
          bid_type?: Database["public"]["Enums"]["bid_type"] | null
          brand_id?: string
          budget_spent?: number | null
          budget_total?: number
          clicks_delivered?: number | null
          conversions_delivered?: number | null
          created_at?: string
          creative_url?: string | null
          daily_budget_cap?: number | null
          discount_value?: number | null
          end_date?: string
          id?: string
          impressions_delivered?: number | null
          name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_segments?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
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
      coupon_bids: {
        Row: {
          bid_amount: number
          bid_type: string | null
          brand_id: string
          clicks_delivered: number | null
          conversions_delivered: number | null
          coupon_id: string | null
          created_at: string | null
          daily_budget: number | null
          id: string
          impressions_delivered: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          bid_amount: number
          bid_type?: string | null
          brand_id: string
          clicks_delivered?: number | null
          conversions_delivered?: number | null
          coupon_id?: string | null
          created_at?: string | null
          daily_budget?: number | null
          id?: string
          impressions_delivered?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          bid_amount?: number
          bid_type?: string | null
          brand_id?: string
          clicks_delivered?: number | null
          conversions_delivered?: number | null
          coupon_id?: string | null
          created_at?: string | null
          daily_budget?: number | null
          id?: string
          impressions_delivered?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_bids_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          bidding_enabled: boolean | null
          brand: string
          category: string
          created_at: string | null
          description: string | null
          expiration: string | null
          id: string
          image_url: string | null
          impressions: number | null
          max_uses: number | null
          min_purchase: number | null
          redemptions: number | null
          retailer_id: string
          status: string | null
          title: string
          updated_at: string | null
          value: number
        }
        Insert: {
          bidding_enabled?: boolean | null
          brand: string
          category: string
          created_at?: string | null
          description?: string | null
          expiration?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          max_uses?: number | null
          min_purchase?: number | null
          redemptions?: number | null
          retailer_id: string
          status?: string | null
          title: string
          updated_at?: string | null
          value: number
        }
        Update: {
          bidding_enabled?: boolean | null
          brand?: string
          category?: string
          created_at?: string | null
          description?: string | null
          expiration?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          max_uses?: number | null
          min_purchase?: number | null
          redemptions?: number | null
          retailer_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: []
      }
      customer_segments: {
        Row: {
          avg_basket_value: number | null
          created_at: string
          customer_count: number | null
          definition: Json
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          avg_basket_value?: number | null
          created_at?: string
          customer_count?: number | null
          definition: Json
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          avg_basket_value?: number | null
          created_at?: string
          customer_count?: number | null
          definition?: Json
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          id: string
          loyalty_card_number: string | null
          phone_number: string | null
          purchase_history: Json | null
          retailer_id: string
          segments: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          loyalty_card_number?: string | null
          phone_number?: string | null
          purchase_history?: Json | null
          retailer_id: string
          segments?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          loyalty_card_number?: string | null
          phone_number?: string | null
          purchase_history?: Json | null
          retailer_id?: string
          segments?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      flash_promos: {
        Row: {
          accept_count: number | null
          auto_disable_at_zero: boolean | null
          category: string | null
          created_at: string
          created_by: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          discounted_price: number | null
          end_time: string
          id: string
          image_url: string | null
          impressions_count: number | null
          metrics: Json | null
          priority: Database["public"]["Enums"]["promo_priority"] | null
          product_name: string
          redemption_count: number | null
          regular_price: number | null
          retailer_id: string
          revenue_impact: number | null
          show_to_all: boolean | null
          sku: string
          start_time: string | null
          status: Database["public"]["Enums"]["promo_status"] | null
          stock_initial: number | null
          stock_remaining: number | null
          target_segments: string[] | null
          type: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          accept_count?: number | null
          auto_disable_at_zero?: boolean | null
          category?: string | null
          created_at?: string
          created_by: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          discounted_price?: number | null
          end_time: string
          id?: string
          image_url?: string | null
          impressions_count?: number | null
          metrics?: Json | null
          priority?: Database["public"]["Enums"]["promo_priority"] | null
          product_name: string
          redemption_count?: number | null
          regular_price?: number | null
          retailer_id: string
          revenue_impact?: number | null
          show_to_all?: boolean | null
          sku: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["promo_status"] | null
          stock_initial?: number | null
          stock_remaining?: number | null
          target_segments?: string[] | null
          type?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          accept_count?: number | null
          auto_disable_at_zero?: boolean | null
          category?: string | null
          created_at?: string
          created_by?: string
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          discounted_price?: number | null
          end_time?: string
          id?: string
          image_url?: string | null
          impressions_count?: number | null
          metrics?: Json | null
          priority?: Database["public"]["Enums"]["promo_priority"] | null
          product_name?: string
          redemption_count?: number | null
          regular_price?: number | null
          retailer_id?: string
          revenue_impact?: number | null
          show_to_all?: boolean | null
          sku?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["promo_status"] | null
          stock_initial?: number | null
          stock_remaining?: number | null
          target_segments?: string[] | null
          type?: string | null
          updated_at?: string
          video_url?: string | null
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
      ingredient_bids: {
        Row: {
          accepted: number | null
          bid_amount: number
          bid_type: string | null
          brand_id: string
          created_at: string | null
          daily_budget: number | null
          id: string
          ingredient_category_id: string | null
          ingredient_keyword: string | null
          placements_delivered: number | null
          product_image: string | null
          product_name: string
          product_price: number | null
          purchased: number | null
          status: string | null
          swapped: number | null
          updated_at: string | null
        }
        Insert: {
          accepted?: number | null
          bid_amount: number
          bid_type?: string | null
          brand_id: string
          created_at?: string | null
          daily_budget?: number | null
          id?: string
          ingredient_category_id?: string | null
          ingredient_keyword?: string | null
          placements_delivered?: number | null
          product_image?: string | null
          product_name: string
          product_price?: number | null
          purchased?: number | null
          status?: string | null
          swapped?: number | null
          updated_at?: string | null
        }
        Update: {
          accepted?: number | null
          bid_amount?: number
          bid_type?: string | null
          brand_id?: string
          created_at?: string | null
          daily_budget?: number | null
          id?: string
          ingredient_category_id?: string | null
          ingredient_keyword?: string | null
          placements_delivered?: number | null
          product_image?: string | null
          product_name?: string
          product_price?: number | null
          purchased?: number | null
          status?: string | null
          swapped?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_bids_ingredient_category_id_fkey"
            columns: ["ingredient_category_id"]
            isOneToOne: false
            referencedRelation: "ingredient_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_categories: {
        Row: {
          avg_weekly_imports: number | null
          created_at: string | null
          id: string
          name: string
          parent_category: string | null
          search_terms: string[] | null
        }
        Insert: {
          avg_weekly_imports?: number | null
          created_at?: string | null
          id?: string
          name: string
          parent_category?: string | null
          search_terms?: string[] | null
        }
        Update: {
          avg_weekly_imports?: number | null
          created_at?: string | null
          id?: string
          name?: string
          parent_category?: string | null
          search_terms?: string[] | null
        }
        Relationships: []
      }
      ingredient_placements: {
        Row: {
          alternative_chosen: string | null
          bid_amount_paid: number | null
          created_at: string | null
          id: string
          ingredient_category_id: string | null
          ingredient_normalized: string | null
          ingredient_raw: string | null
          recipe_import_id: string | null
          user_action: string | null
          winning_bid_id: string | null
          winning_brand: string | null
          winning_product_name: string | null
          winning_product_price: number | null
        }
        Insert: {
          alternative_chosen?: string | null
          bid_amount_paid?: number | null
          created_at?: string | null
          id?: string
          ingredient_category_id?: string | null
          ingredient_normalized?: string | null
          ingredient_raw?: string | null
          recipe_import_id?: string | null
          user_action?: string | null
          winning_bid_id?: string | null
          winning_brand?: string | null
          winning_product_name?: string | null
          winning_product_price?: number | null
        }
        Update: {
          alternative_chosen?: string | null
          bid_amount_paid?: number | null
          created_at?: string | null
          id?: string
          ingredient_category_id?: string | null
          ingredient_normalized?: string | null
          ingredient_raw?: string | null
          recipe_import_id?: string | null
          user_action?: string | null
          winning_bid_id?: string | null
          winning_brand?: string | null
          winning_product_name?: string | null
          winning_product_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_placements_ingredient_category_id_fkey"
            columns: ["ingredient_category_id"]
            isOneToOne: false
            referencedRelation: "ingredient_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_placements_recipe_import_id_fkey"
            columns: ["recipe_import_id"]
            isOneToOne: false
            referencedRelation: "recipe_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_placements_winning_bid_id_fkey"
            columns: ["winning_bid_id"]
            isOneToOne: false
            referencedRelation: "ingredient_bids"
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
      offer_accepts: {
        Row: {
          accepted_at: string
          check_in_id: string | null
          created_at: string
          customer_id: string
          id: string
          impression_id: string | null
          offer_id: string
        }
        Insert: {
          accepted_at?: string
          check_in_id?: string | null
          created_at?: string
          customer_id: string
          id?: string
          impression_id?: string | null
          offer_id: string
        }
        Update: {
          accepted_at?: string
          check_in_id?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          impression_id?: string | null
          offer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_accepts_check_in_id_fkey"
            columns: ["check_in_id"]
            isOneToOne: false
            referencedRelation: "check_ins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_accepts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_accepts_impression_id_fkey"
            columns: ["impression_id"]
            isOneToOne: false
            referencedRelation: "offer_impressions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_accepts_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_declines: {
        Row: {
          created_at: string
          customer_id: string
          declined_at: string
          id: string
          impression_id: string | null
          offer_id: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          declined_at?: string
          id?: string
          impression_id?: string | null
          offer_id: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          declined_at?: string
          id?: string
          impression_id?: string | null
          offer_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_declines_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_declines_impression_id_fkey"
            columns: ["impression_id"]
            isOneToOne: false
            referencedRelation: "offer_impressions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_declines_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_impressions: {
        Row: {
          campaign_id: string | null
          check_in_id: string | null
          created_at: string
          customer_id: string
          flash_promo_id: string | null
          id: string
          offer_id: string
          position_in_feed: number | null
          retailer_id: string
          shown_at: string
        }
        Insert: {
          campaign_id?: string | null
          check_in_id?: string | null
          created_at?: string
          customer_id: string
          flash_promo_id?: string | null
          id?: string
          offer_id: string
          position_in_feed?: number | null
          retailer_id: string
          shown_at?: string
        }
        Update: {
          campaign_id?: string | null
          check_in_id?: string | null
          created_at?: string
          customer_id?: string
          flash_promo_id?: string | null
          id?: string
          offer_id?: string
          position_in_feed?: number | null
          retailer_id?: string
          shown_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_impressions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_impressions_check_in_id_fkey"
            columns: ["check_in_id"]
            isOneToOne: false
            referencedRelation: "check_ins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_impressions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_impressions_flash_promo_id_fkey"
            columns: ["flash_promo_id"]
            isOneToOne: false
            referencedRelation: "flash_promos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_impressions_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_impressions_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_redemptions: {
        Row: {
          accept_id: string
          basket_total: number | null
          campaign_id: string | null
          created_at: string
          customer_id: string
          discount_applied: number
          flash_promo_id: string | null
          id: string
          offer_id: string
          redeemed_at: string
          retailer_id: string
          revenue_impact: number | null
        }
        Insert: {
          accept_id: string
          basket_total?: number | null
          campaign_id?: string | null
          created_at?: string
          customer_id: string
          discount_applied: number
          flash_promo_id?: string | null
          id?: string
          offer_id: string
          redeemed_at?: string
          retailer_id: string
          revenue_impact?: number | null
        }
        Update: {
          accept_id?: string
          basket_total?: number | null
          campaign_id?: string | null
          created_at?: string
          customer_id?: string
          discount_applied?: number
          flash_promo_id?: string | null
          id?: string
          offer_id?: string
          redeemed_at?: string
          retailer_id?: string
          revenue_impact?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_redemptions_accept_id_fkey"
            columns: ["accept_id"]
            isOneToOne: false
            referencedRelation: "offer_accepts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_redemptions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_redemptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_redemptions_flash_promo_id_fkey"
            columns: ["flash_promo_id"]
            isOneToOne: false
            referencedRelation: "flash_promos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_redemptions_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_redemptions_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          campaign_id: string | null
          created_at: string
          discount_value: number
          flash_promo_id: string | null
          id: string
          image_url: string | null
          product_name: string
          sku: string | null
          type: Database["public"]["Enums"]["offer_type"]
          updated_at: string
          valid_until: string
          video_url: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          discount_value: number
          flash_promo_id?: string | null
          id?: string
          image_url?: string | null
          product_name: string
          sku?: string | null
          type: Database["public"]["Enums"]["offer_type"]
          updated_at?: string
          valid_until: string
          video_url?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          discount_value?: number
          flash_promo_id?: string | null
          id?: string
          image_url?: string | null
          product_name?: string
          sku?: string | null
          type?: Database["public"]["Enums"]["offer_type"]
          updated_at?: string
          valid_until?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_flash_promo_id_fkey"
            columns: ["flash_promo_id"]
            isOneToOne: false
            referencedRelation: "flash_promos"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_imports: {
        Row: {
          created_at: string | null
          id: string
          ingredients_parsed: Json | null
          recipe_source: string | null
          recipe_title: string
          recipe_url: string | null
          retailer_id: string
          servings: number | null
          sponsored_ingredients: number | null
          total_ingredients: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ingredients_parsed?: Json | null
          recipe_source?: string | null
          recipe_title: string
          recipe_url?: string | null
          retailer_id: string
          servings?: number | null
          sponsored_ingredients?: number | null
          total_ingredients?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ingredients_parsed?: Json | null
          recipe_source?: string | null
          recipe_title?: string
          recipe_url?: string | null
          retailer_id?: string
          servings?: number | null
          sponsored_ingredients?: number | null
          total_ingredients?: number | null
          user_id?: string
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          accepted_offer_id: string
          basket_total: number | null
          created_at: string
          customer_id: string
          discount_applied: number
          id: string
          redeemed_at: string
          retailer_id: string
          updated_at: string
        }
        Insert: {
          accepted_offer_id: string
          basket_total?: number | null
          created_at?: string
          customer_id: string
          discount_applied: number
          id?: string
          redeemed_at?: string
          retailer_id: string
          updated_at?: string
        }
        Update: {
          accepted_offer_id?: string
          basket_total?: number | null
          created_at?: string
          customer_id?: string
          discount_applied?: number
          id?: string
          redeemed_at?: string
          retailer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_accepted_offer_id_fkey"
            columns: ["accepted_offer_id"]
            isOneToOne: false
            referencedRelation: "accepted_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_retailer_id_fkey"
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
      stores: {
        Row: {
          address: string | null
          beacon_ids: string[] | null
          created_at: string
          geofence_coordinates: Json | null
          id: string
          name: string
          retailer_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          beacon_ids?: string[] | null
          created_at?: string
          geofence_coordinates?: Json | null
          id?: string
          name: string
          retailer_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          beacon_ids?: string[] | null
          created_at?: string
          geofence_coordinates?: Json | null
          id?: string
          name?: string
          retailer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      bid_type: "cpm" | "cpc" | "cpa"
      campaign_status: "draft" | "active" | "paused" | "completed"
      check_in_method: "geofence" | "BLE" | "manual" | "NFC"
      discount_type: "fixed" | "percentage"
      offer_type: "campaign" | "flash" | "standard"
      promo_priority: "high" | "normal"
      promo_status: "active" | "completed" | "autoDisabled"
      subscription_tier: "free" | "basic" | "premium" | "enterprise"
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
      bid_type: ["cpm", "cpc", "cpa"],
      campaign_status: ["draft", "active", "paused", "completed"],
      check_in_method: ["geofence", "BLE", "manual", "NFC"],
      discount_type: ["fixed", "percentage"],
      offer_type: ["campaign", "flash", "standard"],
      promo_priority: ["high", "normal"],
      promo_status: ["active", "completed", "autoDisabled"],
      subscription_tier: ["free", "basic", "premium", "enterprise"],
    },
  },
} as const
