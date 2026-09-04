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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      conversations: {
        Row: {
          couple_id: string
          created_at: string
          id: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          id?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_public_listing"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_profiles: {
        Row: {
          budget: number | null
          colors: string[] | null
          created_at: string
          guest_count: number | null
          id: string
          theme: string | null
          updated_at: string
          user_id: string
          wedding_date: string | null
          wedding_location: string | null
        }
        Insert: {
          budget?: number | null
          colors?: string[] | null
          created_at?: string
          guest_count?: number | null
          id?: string
          theme?: string | null
          updated_at?: string
          user_id: string
          wedding_date?: string | null
          wedding_location?: string | null
        }
        Update: {
          budget?: number | null
          colors?: string[] | null
          created_at?: string
          guest_count?: number | null
          id?: string
          theme?: string | null
          updated_at?: string
          user_id?: string
          wedding_date?: string | null
          wedding_location?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_id: string | null
          author_name: string
          comment: string | null
          created_at: string
          id: string
          is_sample: boolean
          rating: number
          vendor_id: string
        }
        Insert: {
          author_id?: string | null
          author_name: string
          comment?: string | null
          created_at?: string
          id?: string
          is_sample?: boolean
          rating: number
          vendor_id: string
        }
        Update: {
          author_id?: string | null
          author_name?: string
          comment?: string | null
          created_at?: string
          id?: string
          is_sample?: boolean
          rating?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_public_listing"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_vendors: {
        Row: {
          couple_id: string
          created_at: string
          id: string
          vendor_id: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          id?: string
          vendor_id: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_vendors_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_vendors_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_public_listing"
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
      vendor_offerings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_offerings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_offerings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_public_listing"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_portfolio: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          title: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          title?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          title?: string | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_portfolio_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_portfolio_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_public_listing"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          business_name: string
          category: string
          created_at: string
          description: string | null
          id: string
          location: string | null
          phone: string | null
          rejection_reason: string | null
          updated_at: string
          user_id: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          business_name: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          rejection_reason?: string | null
          updated_at?: string
          user_id?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          business_name?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          rejection_reason?: string | null
          updated_at?: string
          user_id?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: []
      }
    }
    Views: {
      vendor_public_listing: {
        Row: {
          business_name: string | null
          category: string | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          id: string | null
          location: string | null
          rating: number | null
          review_count: number | null
          starting_price: number | null
        }
        Insert: {
          business_name?: string | null
          category?: string | null
          cover_image?: never
          created_at?: string | null
          description?: string | null
          id?: string | null
          location?: string | null
          rating?: never
          review_count?: never
          starting_price?: never
        }
        Update: {
          business_name?: string | null
          category?: string | null
          cover_image?: never
          created_at?: string | null
          description?: string | null
          id?: string | null
          location?: string | null
          rating?: never
          review_count?: never
          starting_price?: never
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      in_conversation: { Args: { _conversation_id: string }; Returns: boolean }
      owns_vendor: { Args: { _vendor_id: string }; Returns: boolean }
      shares_conversation: { Args: { _other_id: string }; Returns: boolean }
      vendor_is_approved: { Args: { _vendor_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "couple" | "vendor" | "admin"
      verification_status: "pending" | "approved" | "rejected"
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
      app_role: ["couple", "vendor", "admin"],
      verification_status: ["pending", "approved", "rejected"],
    },
  },
} as const
