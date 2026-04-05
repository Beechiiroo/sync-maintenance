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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          module: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          module: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          module?: string
          user_id?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          compliance_score: number | null
          created_at: string
          created_by: string | null
          document_url: string | null
          end_date: string
          id: string
          penalties: number | null
          sla_resolution_hours: number | null
          sla_response_hours: number | null
          start_date: string
          status: Database["public"]["Enums"]["contract_status"]
          supplier: string
          title: string
          type: Database["public"]["Enums"]["contract_type"]
          updated_at: string
          value: number | null
        }
        Insert: {
          compliance_score?: number | null
          created_at?: string
          created_by?: string | null
          document_url?: string | null
          end_date: string
          id?: string
          penalties?: number | null
          sla_resolution_hours?: number | null
          sla_response_hours?: number | null
          start_date: string
          status?: Database["public"]["Enums"]["contract_status"]
          supplier: string
          title: string
          type?: Database["public"]["Enums"]["contract_type"]
          updated_at?: string
          value?: number | null
        }
        Update: {
          compliance_score?: number | null
          created_at?: string
          created_by?: string | null
          document_url?: string | null
          end_date?: string
          id?: string
          penalties?: number | null
          sla_resolution_hours?: number | null
          sla_response_hours?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"]
          supplier?: string
          title?: string
          type?: Database["public"]["Enums"]["contract_type"]
          updated_at?: string
          value?: number | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          health_score: number | null
          id: string
          image_url: string | null
          last_maintenance: string | null
          location: string
          manufacturer: string | null
          model: string | null
          mtbf_hours: number | null
          name: string
          next_maintenance: string | null
          purchase_date: string | null
          serial_number: string | null
          specifications: Json | null
          status: Database["public"]["Enums"]["equipment_status"]
          updated_at: string
          warranty_expires: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          health_score?: number | null
          id?: string
          image_url?: string | null
          last_maintenance?: string | null
          location?: string
          manufacturer?: string | null
          model?: string | null
          mtbf_hours?: number | null
          name: string
          next_maintenance?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["equipment_status"]
          updated_at?: string
          warranty_expires?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          health_score?: number | null
          id?: string
          image_url?: string | null
          last_maintenance?: string | null
          location?: string
          manufacturer?: string | null
          model?: string | null
          mtbf_hours?: number | null
          name?: string
          next_maintenance?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["equipment_status"]
          updated_at?: string
          warranty_expires?: string | null
        }
        Relationships: []
      }
      interventions: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          cost: number | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          equipment_id: string | null
          id: string
          notes: string | null
          photos: string[] | null
          priority: Database["public"]["Enums"]["intervention_priority"]
          scheduled_date: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["intervention_status"]
          title: string
          type: Database["public"]["Enums"]["intervention_type"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          equipment_id?: string | null
          id?: string
          notes?: string | null
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["intervention_priority"]
          scheduled_date?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["intervention_status"]
          title: string
          type?: Database["public"]["Enums"]["intervention_type"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          equipment_id?: string | null
          id?: string
          notes?: string | null
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["intervention_priority"]
          scheduled_date?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["intervention_status"]
          title?: string
          type?: Database["public"]["Enums"]["intervention_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interventions_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_schedules: {
        Row: {
          assigned_to: string | null
          created_at: string
          equipment_id: string
          frequency: Database["public"]["Enums"]["schedule_frequency"]
          id: string
          last_performed: string | null
          next_due: string
          status: string
          task: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          equipment_id: string
          frequency?: Database["public"]["Enums"]["schedule_frequency"]
          id?: string
          last_performed?: string | null
          next_due: string
          status?: string
          task: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          equipment_id?: string
          frequency?: Database["public"]["Enums"]["schedule_frequency"]
          id?: string
          last_performed?: string | null
          next_due?: string
          status?: string
          task?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_schedules_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: string[] | null
          content: string
          created_at: string
          id: string
          read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          attachments?: string[] | null
          content: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          attachments?: string[] | null
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      spare_parts: {
        Row: {
          category: string | null
          compatible_equipment: string[] | null
          created_at: string
          id: string
          image_url: string | null
          location: string | null
          min_stock: number
          name: string
          price: number | null
          quantity: number
          reference: string
          status: Database["public"]["Enums"]["stock_status"]
          supplier: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          compatible_equipment?: string[] | null
          created_at?: string
          id?: string
          image_url?: string | null
          location?: string | null
          min_stock?: number
          name: string
          price?: number | null
          quantity?: number
          reference: string
          status?: Database["public"]["Enums"]["stock_status"]
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          compatible_equipment?: string[] | null
          created_at?: string
          id?: string
          image_url?: string | null
          location?: string | null
          min_stock?: number
          name?: string
          price?: number | null
          quantity?: number
          reference?: string
          status?: Database["public"]["Enums"]["stock_status"]
          supplier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          intervention_id: string | null
          notes: string | null
          performed_by: string | null
          quantity: number
          spare_part_id: string
          type: Database["public"]["Enums"]["movement_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          intervention_id?: string | null
          notes?: string | null
          performed_by?: string | null
          quantity: number
          spare_part_id: string
          type: Database["public"]["Enums"]["movement_type"]
        }
        Update: {
          created_at?: string
          id?: string
          intervention_id?: string | null
          notes?: string | null
          performed_by?: string | null
          quantity?: number
          spare_part_id?: string
          type?: Database["public"]["Enums"]["movement_type"]
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_intervention_id_fkey"
            columns: ["intervention_id"]
            isOneToOne: false
            referencedRelation: "interventions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_spare_part_id_fkey"
            columns: ["spare_part_id"]
            isOneToOne: false
            referencedRelation: "spare_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          equipment_id: string | null
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolution: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          equipment_id?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          equipment_id?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "technician" | "assistant" | "client"
      contract_status: "active" | "expiring" | "expired" | "cancelled"
      contract_type: "maintenance" | "service" | "warranty" | "lease"
      equipment_status:
        | "operational"
        | "maintenance"
        | "critical"
        | "warning"
        | "decommissioned"
      intervention_priority: "low" | "medium" | "high" | "critical"
      intervention_status: "planned" | "in_progress" | "completed" | "cancelled"
      intervention_type:
        | "preventive"
        | "corrective"
        | "predictive"
        | "emergency"
      movement_type: "in" | "out" | "adjustment"
      notification_type: "info" | "warning" | "alert" | "task" | "system"
      schedule_frequency:
        | "daily"
        | "weekly"
        | "biweekly"
        | "monthly"
        | "quarterly"
        | "semi_annual"
        | "annual"
      stock_status: "ok" | "low" | "critical" | "out_of_stock"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
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
      app_role: ["admin", "technician", "assistant", "client"],
      contract_status: ["active", "expiring", "expired", "cancelled"],
      contract_type: ["maintenance", "service", "warranty", "lease"],
      equipment_status: [
        "operational",
        "maintenance",
        "critical",
        "warning",
        "decommissioned",
      ],
      intervention_priority: ["low", "medium", "high", "critical"],
      intervention_status: ["planned", "in_progress", "completed", "cancelled"],
      intervention_type: [
        "preventive",
        "corrective",
        "predictive",
        "emergency",
      ],
      movement_type: ["in", "out", "adjustment"],
      notification_type: ["info", "warning", "alert", "task", "system"],
      schedule_frequency: [
        "daily",
        "weekly",
        "biweekly",
        "monthly",
        "quarterly",
        "semi_annual",
        "annual",
      ],
      stock_status: ["ok", "low", "critical", "out_of_stock"],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
    },
  },
} as const
