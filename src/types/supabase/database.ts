export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      conversation_participants: {
        Row: {
          conversation_id: string
          last_read_timestamp: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          last_read_timestamp: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          last_read_timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          avatar: string | null
          created_at: string
          id: string
          last_message_timestamp: string
          name: string | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          id?: string
          last_message_timestamp: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          id?: string
          last_message_timestamp?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      draft_messages: {
        Row: {
          conversation_id: string
          created_at: string
          message_id: string
          timestamp: string
          type: Database["public"]["Enums"]["message_type"]
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          conversation_id: string
          created_at?: string
          message_id: string
          timestamp: string
          type: Database["public"]["Enums"]["message_type"]
          updated_at?: string
          user_id: string
          version: number
        }
        Update: {
          conversation_id?: string
          created_at?: string
          message_id?: string
          timestamp?: string
          type?: Database["public"]["Enums"]["message_type"]
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "draft_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      file_messages: {
        Row: {
          file_name: string
          file_size: number
          message_id: string
          mime_type: string
          url: string
        }
        Insert: {
          file_name: string
          file_size: number
          message_id: string
          mime_type: string
          url: string
        }
        Update: {
          file_name?: string
          file_size?: number
          message_id?: string
          mime_type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: true
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      media_messages: {
        Row: {
          duration: number | null
          file_name: string
          file_size: number
          height: number | null
          message_id: string
          mime_type: string
          thumbnail_url: string | null
          url: string
          width: number | null
        }
        Insert: {
          duration?: number | null
          file_name: string
          file_size: number
          height?: number | null
          message_id: string
          mime_type: string
          thumbnail_url?: string | null
          url: string
          width?: number | null
        }
        Update: {
          duration?: number | null
          file_name?: string
          file_size?: number
          height?: number | null
          message_id?: string
          mime_type?: string
          thumbnail_url?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: true
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          parent_message_id: string | null
          sender_id: string
          status: Database["public"]["Enums"]["message_status"]
          timestamp: string
          type: Database["public"]["Enums"]["message_type"]
          updated_at: string
          version: number
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          parent_message_id?: string | null
          sender_id: string
          status: Database["public"]["Enums"]["message_status"]
          timestamp: string
          type: Database["public"]["Enums"]["message_type"]
          updated_at?: string
          version: number
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          parent_message_id?: string | null
          sender_id?: string
          status?: Database["public"]["Enums"]["message_status"]
          timestamp?: string
          type?: Database["public"]["Enums"]["message_type"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reactions: {
        Row: {
          id: string
          message_id: string
          reaction: string
          timestamp: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          reaction: string
          timestamp: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          reaction?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      send_message_requests: {
        Row: {
          created_at: string
          fail_count: number
          id: string
          last_sent_at: string
          message_id: string
          status: Database["public"]["Enums"]["send_message_request_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          fail_count?: number
          id?: string
          last_sent_at: string
          message_id: string
          status: Database["public"]["Enums"]["send_message_request_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          fail_count?: number
          id?: string
          last_sent_at?: string
          message_id?: string
          status?: Database["public"]["Enums"]["send_message_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "send_message_requests_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      text_messages: {
        Row: {
          content: string
          message_id: string
        }
        Insert: {
          content: string
          message_id: string
        }
        Update: {
          content?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "text_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: true
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          created_at: string
          id: string
          last_seen: string
          name: string
          status: Database["public"]["Enums"]["user_presence_status"]
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          id?: string
          last_seen: string
          name: string
          status: Database["public"]["Enums"]["user_presence_status"]
        }
        Update: {
          avatar?: string | null
          created_at?: string
          id?: string
          last_seen?: string
          name?: string
          status?: Database["public"]["Enums"]["user_presence_status"]
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
      message_status: "sending" | "sent" | "delivered" | "read" | "failed"
      message_type: "text" | "image" | "file" | "audio" | "video"
      send_message_request_status: "pending" | "in_flight" | "fail" | "success"
      user_presence_status: "online" | "offline" | "away"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

