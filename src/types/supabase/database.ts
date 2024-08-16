export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      chat_attachments: {
        Row: {
          file_name: string;
          file_size: number;
          id: string;
          message_id: string;
          mime_type: string;
          thumbnail_url: string | null;
          type: string;
          url: string;
        };
        Insert: {
          file_name: string;
          file_size: number;
          id?: string;
          message_id: string;
          mime_type: string;
          thumbnail_url?: string | null;
          type: string;
          url: string;
        };
        Update: {
          file_name?: string;
          file_size?: number;
          id?: string;
          message_id?: string;
          mime_type?: string;
          thumbnail_url?: string | null;
          type?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_attachments_message_id_fkey";
            columns: ["message_id"];
            isOneToOne: false;
            referencedRelation: "chat_messages";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_conversation_participants: {
        Row: {
          conversation_id: string;
          last_read_timestamp: string;
          user_id: string;
        };
        Insert: {
          conversation_id: string;
          last_read_timestamp: string;
          user_id: string;
        };
        Update: {
          conversation_id?: string;
          last_read_timestamp?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_conversation_participants_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "chat_conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_conversation_participants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "chat_users";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_conversations: {
        Row: {
          avatar: string | null;
          created_at: string;
          id: string;
          last_message_timestamp: string;
          name: string | null;
          updated_at: string;
        };
        Insert: {
          avatar?: string | null;
          created_at?: string;
          id?: string;
          last_message_timestamp: string;
          name?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar?: string | null;
          created_at?: string;
          id?: string;
          last_message_timestamp?: string;
          name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      chat_message_metadata: {
        Row: {
          duration: unknown | null;
          file_name: string | null;
          file_size: number | null;
          height: number | null;
          message_id: string;
          width: number | null;
        };
        Insert: {
          duration?: unknown | null;
          file_name?: string | null;
          file_size?: number | null;
          height?: number | null;
          message_id: string;
          width?: number | null;
        };
        Update: {
          duration?: unknown | null;
          file_name?: string | null;
          file_size?: number | null;
          height?: number | null;
          message_id?: string;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "chat_message_metadata_message_id_fkey";
            columns: ["message_id"];
            isOneToOne: true;
            referencedRelation: "chat_messages";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_messages: {
        Row: {
          content: string;
          conversation_id: string;
          id: string;
          parent_message_id: string | null;
          sender_id: string;
          status: string;
          timestamp: string;
          type: string;
          version: number;
        };
        Insert: {
          content: string;
          conversation_id: string;
          id?: string;
          parent_message_id?: string | null;
          sender_id: string;
          status: string;
          timestamp?: string;
          type: string;
          version?: number;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          id?: string;
          parent_message_id?: string | null;
          sender_id?: string;
          status?: string;
          timestamp?: string;
          type?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "chat_conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_messages_parent_message_id_fkey";
            columns: ["parent_message_id"];
            isOneToOne: false;
            referencedRelation: "chat_messages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "chat_users";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_reactions: {
        Row: {
          id: string;
          message_id: string;
          reaction: string;
          timestamp: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          reaction: string;
          timestamp?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          reaction?: string;
          timestamp?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_reactions_message_id_fkey";
            columns: ["message_id"];
            isOneToOne: false;
            referencedRelation: "chat_messages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_reactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "chat_users";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_users: {
        Row: {
          avatar: string | null;
          created_at: string;
          id: string;
          last_seen: string;
          name: string;
          status: string;
        };
        Insert: {
          avatar?: string | null;
          created_at?: string;
          id?: string;
          last_seen: string;
          name: string;
          status: string;
        };
        Update: {
          avatar?: string | null;
          created_at?: string;
          id?: string;
          last_seen?: string;
          name?: string;
          status?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

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
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

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
    : never;
