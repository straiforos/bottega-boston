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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      club_subscribers: {
        Row: {
          consent_at: string
          created_at: string
          email: string
          id: string
          status: string
          unsubscribe_token: string
          unsubscribed_at: string | null
          welcome_sent_at: string | null
        }
        Insert: {
          consent_at?: string
          created_at?: string
          email: string
          id?: string
          status?: string
          unsubscribe_token?: string
          unsubscribed_at?: string | null
          welcome_sent_at?: string | null
        }
        Update: {
          consent_at?: string
          created_at?: string
          email?: string
          id?: string
          status?: string
          unsubscribe_token?: string
          unsubscribed_at?: string | null
          welcome_sent_at?: string | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          blocks: Json
          failed_count: number
          id: string
          preheader: string
          recipient_count: number
          scheduled_for: string | null
          sent_at: string | null
          sent_by: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          blocks?: Json
          failed_count?: number
          id?: string
          preheader?: string
          recipient_count?: number
          scheduled_for?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          blocks?: Json
          failed_count?: number
          id?: string
          preheader?: string
          recipient_count?: number
          scheduled_for?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_events: {
        Row: {
          created_at: string
          delivery_id: string
          id: string
          occurred_at: string
          resend_id: string
          type: string
          url: string | null
        }
        Insert: {
          created_at?: string
          delivery_id: string
          id?: string
          occurred_at?: string
          resend_id: string
          type: string
          url?: string | null
        }
        Update: {
          created_at?: string
          delivery_id?: string
          id?: string
          occurred_at?: string
          resend_id?: string
          type?: string
          url?: string | null
        }
        Relationships: []
      }
      email_sends: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          created_at: string
          email: string
          id: string
          opened_at: string | null
          resend_id: string | null
          status: string
          subscriber_id: string | null
          template_key: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          created_at?: string
          email: string
          id?: string
          opened_at?: string | null
          resend_id?: string | null
          status?: string
          subscriber_id?: string | null
          template_key?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          created_at?: string
          email?: string
          id?: string
          opened_at?: string | null
          resend_id?: string | null
          status?: string
          subscriber_id?: string | null
          template_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sends_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "club_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          blocks: Json
          key: string
          kind: string
          name: string
          preheader: string
          subject: string
          updated_at: string
          variables: string[]
        }
        Insert: {
          blocks?: Json
          key: string
          kind?: string
          name?: string
          preheader?: string
          subject?: string
          updated_at?: string
          variables?: string[]
        }
        Update: {
          blocks?: Json
          key?: string
          kind?: string
          name?: string
          preheader?: string
          subject?: string
          updated_at?: string
          variables?: string[]
        }
        Relationships: []
      }
      event_exceptions: {
        Row: {
          event_id: string
          id: string
          occurrence_date: string
          skipped: boolean
          start_time: string | null
          ticket_url: string | null
        }
        Insert: {
          event_id: string
          id?: string
          occurrence_date: string
          skipped?: boolean
          start_time?: string | null
          ticket_url?: string | null
        }
        Update: {
          event_id?: string
          id?: string
          occurrence_date?: string
          skipped?: boolean
          start_time?: string | null
          ticket_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_exceptions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_requests: {
        Row: {
          address: string
          created_at: string
          dietary: string
          email: string
          event_type: string
          fulfillment: string
          guests: number | null
          id: string
          kind: string
          location_id: string
          name: string
          notes: string
          order_lines: Json
          phone: string
          requested_for: string
          staff_notes: string
          status: string
          updated_at: string
        }
        Insert: {
          address?: string
          created_at?: string
          dietary?: string
          email: string
          event_type?: string
          fulfillment?: string
          guests?: number | null
          id?: string
          kind: string
          location_id?: string
          name: string
          notes?: string
          order_lines?: Json
          phone?: string
          requested_for: string
          staff_notes?: string
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          dietary?: string
          email?: string
          event_type?: string
          fulfillment?: string
          guests?: number | null
          id?: string
          kind?: string
          location_id?: string
          name?: string
          notes?: string
          order_lines?: Json
          phone?: string
          requested_for?: string
          staff_notes?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          card_shape: string
          card_variant: string
          created_at: string
          description: string
          duration_minutes: number
          id: string
          image_url: string | null
          location_id: string
          locations: string[]
          published: boolean
          recurrence: Json | null
          starts_at: string
          ticket_url: string | null
          timezone: string
          title: string
          updated_at: string
        }
        Insert: {
          card_shape?: string
          card_variant?: string
          created_at?: string
          description?: string
          duration_minutes?: number
          id?: string
          image_url?: string | null
          location_id?: string
          locations?: string[]
          published?: boolean
          recurrence?: Json | null
          starts_at: string
          ticket_url?: string | null
          timezone?: string
          title: string
          updated_at?: string
        }
        Update: {
          card_shape?: string
          card_variant?: string
          created_at?: string
          description?: string
          duration_minutes?: number
          id?: string
          image_url?: string | null
          location_id?: string
          locations?: string[]
          published?: boolean
          recurrence?: Json | null
          starts_at?: string
          ticket_url?: string | null
          timezone?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          alt: string
          asset_key: string | null
          caption: string
          id: string
          media_type: string
          media_url: string | null
          poster_url: string | null
          sort_order: number
          updated_at: string
          variants: Json | null
        }
        Insert: {
          alt?: string
          asset_key?: string | null
          caption?: string
          id?: string
          media_type?: string
          media_url?: string | null
          poster_url?: string | null
          sort_order?: number
          updated_at?: string
          variants?: Json | null
        }
        Update: {
          alt?: string
          asset_key?: string | null
          caption?: string
          id?: string
          media_type?: string
          media_url?: string | null
          poster_url?: string | null
          sort_order?: number
          updated_at?: string
          variants?: Json | null
        }
        Relationships: []
      }
      home_content: {
        Row: {
          data: Json
          key: string
          updated_at: string
        }
        Insert: {
          data?: Json
          key: string
          updated_at?: string
        }
        Update: {
          data?: Json
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          description: string
          id: string
          image_url: string | null
          image_variants: Json | null
          name: string
          price: string
          section_id: string
          sort_order: number
          tags: string[]
          updated_at: string
        }
        Insert: {
          description?: string
          id?: string
          image_url?: string | null
          image_variants?: Json | null
          name: string
          price?: string
          section_id: string
          sort_order?: number
          tags?: string[]
          updated_at?: string
        }
        Update: {
          description?: string
          id?: string
          image_url?: string | null
          image_variants?: Json | null
          name?: string
          price?: string
          section_id?: string
          sort_order?: number
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "menu_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_sections: {
        Row: {
          id: string
          name: string
          note: string
          sort_order: number
        }
        Insert: {
          id: string
          name: string
          note?: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          note?: string
          sort_order?: number
        }
        Relationships: []
      }
      staff_allowlist: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
    },
  },
} as const
