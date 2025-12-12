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
    PostgrestVersion: "13.0.4"
  }
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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      activity_logs: {
        Row: {
          action_type: Database["public"]["Enums"]["action_type_enum"]
          component_name: string | null
          element_id: string | null
          entity_id: string | null
          entity_type: string | null
          error_message: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          page_url: string | null
          session_id: string | null
          success: boolean | null
          tenant_id: string
          timestamp: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["action_type_enum"]
          component_name?: string | null
          element_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          page_url?: string | null
          session_id?: string | null
          success?: boolean | null
          tenant_id: string
          timestamp?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["action_type_enum"]
          component_name?: string | null
          element_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          page_url?: string | null
          session_id?: string | null
          success?: boolean | null
          tenant_id?: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action_enum"]
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string | null
          error_message: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          success: boolean | null
          tenant_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action_enum"]
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          success?: boolean | null
          tenant_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action_enum"]
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          success?: boolean | null
          tenant_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contaazul_pessoas: {
        Row: {
          active: boolean | null
          business_phone: string | null
          city_name: string | null
          cnpj: string | null
          codigo: string | null
          complement: string | null
          conta_azul_id: string
          country_name: string | null
          cpf: string | null
          created_at: string | null
          data_nascimento: string | null
          email: string | null
          home_phone: string | null
          id: string
          id_legado: number | null
          indicador_ie: string | null
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          inscricao_suframa: string | null
          is_accountant: boolean | null
          is_customer: boolean | null
          is_partner: boolean | null
          is_supplier: boolean | null
          last_synced_at: string | null
          mobile_phone: string | null
          name: string
          neighborhood: string | null
          nome_fantasia: string | null
          number: string | null
          observacao: string | null
          optante_simples_nacional: boolean | null
          orgao_publico: boolean | null
          person_type: string | null
          postal_code: string | null
          rg: string | null
          state: string | null
          street: string | null
          sync_error: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          business_phone?: string | null
          city_name?: string | null
          cnpj?: string | null
          codigo?: string | null
          complement?: string | null
          conta_azul_id: string
          country_name?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          home_phone?: string | null
          id?: string
          id_legado?: number | null
          indicador_ie?: string | null
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          inscricao_suframa?: string | null
          is_accountant?: boolean | null
          is_customer?: boolean | null
          is_partner?: boolean | null
          is_supplier?: boolean | null
          last_synced_at?: string | null
          mobile_phone?: string | null
          name: string
          neighborhood?: string | null
          nome_fantasia?: string | null
          number?: string | null
          observacao?: string | null
          optante_simples_nacional?: boolean | null
          orgao_publico?: boolean | null
          person_type?: string | null
          postal_code?: string | null
          rg?: string | null
          state?: string | null
          street?: string | null
          sync_error?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          business_phone?: string | null
          city_name?: string | null
          cnpj?: string | null
          codigo?: string | null
          complement?: string | null
          conta_azul_id?: string
          country_name?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          home_phone?: string | null
          id?: string
          id_legado?: number | null
          indicador_ie?: string | null
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          inscricao_suframa?: string | null
          is_accountant?: boolean | null
          is_customer?: boolean | null
          is_partner?: boolean | null
          is_supplier?: boolean | null
          last_synced_at?: string | null
          mobile_phone?: string | null
          name?: string
          neighborhood?: string | null
          nome_fantasia?: string | null
          number?: string | null
          observacao?: string | null
          optante_simples_nacional?: boolean | null
          orgao_publico?: boolean | null
          person_type?: string | null
          postal_code?: string | null
          rg?: string | null
          state?: string | null
          street?: string | null
          sync_error?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contaazul_pessoas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contaazul_services: {
        Row: {
          codigo: string | null
          codigo_cnae: string | null
          contaazul_id: string
          cost_rate: number | null
          created_at: string | null
          id: string
          id_servico: number | null
          name: string
          rate: number
          status: string | null
          synced_at: string
          tenant_id: string
          tipo_servico: string | null
          updated_at: string | null
        }
        Insert: {
          codigo?: string | null
          codigo_cnae?: string | null
          contaazul_id: string
          cost_rate?: number | null
          created_at?: string | null
          id?: string
          id_servico?: number | null
          name: string
          rate: number
          status?: string | null
          synced_at?: string
          tenant_id: string
          tipo_servico?: string | null
          updated_at?: string | null
        }
        Update: {
          codigo?: string | null
          codigo_cnae?: string | null
          contaazul_id?: string
          cost_rate?: number | null
          created_at?: string | null
          id?: string
          id_servico?: number | null
          name?: string
          rate?: number
          status?: string | null
          synced_at?: string
          tenant_id?: string
          tipo_servico?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contaazul_services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_types: {
        Row: {
          active: boolean | null
          base_price: number | null
          category: string | null
          code: string
          created_at: string | null
          id: string
          name: string
          requires_cleaning: boolean | null
          requires_transport: boolean | null
          tenant_id: string
        }
        Insert: {
          active?: boolean | null
          base_price?: number | null
          category?: string | null
          code: string
          created_at?: string | null
          id?: string
          name: string
          requires_cleaning?: boolean | null
          requires_transport?: boolean | null
          tenant_id: string
        }
        Update: {
          active?: boolean | null
          base_price?: number | null
          category?: string | null
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          requires_cleaning?: boolean | null
          requires_transport?: boolean | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attachments: {
        Row: {
          created_at: string | null
          description: string | null
          email_extraction_id: string | null
          event_id: string
          file_name: string
          file_size: number
          file_type: string
          gmail_attachment_id: string | null
          id: string
          order_fulfillment_id: string | null
          storage_path: string
          tenant_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          email_extraction_id?: string | null
          event_id: string
          file_name: string
          file_size: number
          file_type: string
          gmail_attachment_id?: string | null
          id?: string
          order_fulfillment_id?: string | null
          storage_path: string
          tenant_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          email_extraction_id?: string | null
          event_id?: string
          file_name?: string
          file_size?: number
          file_type?: string
          gmail_attachment_id?: string | null
          id?: string
          order_fulfillment_id?: string | null
          storage_path?: string
          tenant_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attachments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_change_logs: {
        Row: {
          action: Database["public"]["Enums"]["event_log_action_enum"]
          changed_by: string | null
          changed_by_name: string | null
          context: Json | null
          created_at: string
          entity: Database["public"]["Enums"]["event_log_entity_enum"]
          event_id: string
          field: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          operation_id: string | null
          source: string | null
          tenant_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["event_log_action_enum"]
          changed_by?: string | null
          changed_by_name?: string | null
          context?: Json | null
          created_at?: string
          entity: Database["public"]["Enums"]["event_log_entity_enum"]
          event_id: string
          field?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          operation_id?: string | null
          source?: string | null
          tenant_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["event_log_action_enum"]
          changed_by?: string | null
          changed_by_name?: string | null
          context?: Json | null
          created_at?: string
          entity?: Database["public"]["Enums"]["event_log_entity_enum"]
          event_id?: string
          field?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          operation_id?: string | null
          source?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_change_logs_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_change_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "new_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_change_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_events_financial_summary"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_change_logs_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "new_operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_change_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      event_locations: {
        Row: {
          city: string | null
          complement: string | null
          created_at: string | null
          event_id: string
          formatted_address: string | null
          geocoded_address: string | null
          geocoded_at: string | null
          geocoding_error: string | null
          geocoding_status: string | null
          id: string
          is_primary: boolean
          latitude: number | null
          location_role: Database["public"]["Enums"]["event_location_role_enum"]
          longitude: number | null
          neighborhood: string | null
          number: string | null
          order_id: string | null
          participant_id: string | null
          place_id: string | null
          postal_code: string | null
          raw_address: string
          state: string | null
          street: string | null
          tenant_id: string
        }
        Insert: {
          city?: string | null
          complement?: string | null
          created_at?: string | null
          event_id: string
          formatted_address?: string | null
          geocoded_address?: string | null
          geocoded_at?: string | null
          geocoding_error?: string | null
          geocoding_status?: string | null
          id?: string
          is_primary?: boolean
          latitude?: number | null
          location_role?: Database["public"]["Enums"]["event_location_role_enum"]
          longitude?: number | null
          neighborhood?: string | null
          number?: string | null
          order_id?: string | null
          participant_id?: string | null
          place_id?: string | null
          postal_code?: string | null
          raw_address: string
          state?: string | null
          street?: string | null
          tenant_id: string
        }
        Update: {
          city?: string | null
          complement?: string | null
          created_at?: string | null
          event_id?: string
          formatted_address?: string | null
          geocoded_address?: string | null
          geocoded_at?: string | null
          geocoding_error?: string | null
          geocoding_status?: string | null
          id?: string
          is_primary?: boolean
          latitude?: number | null
          location_role?: Database["public"]["Enums"]["event_location_role_enum"]
          longitude?: number | null
          neighborhood?: string | null
          number?: string | null
          order_id?: string | null
          participant_id?: string | null
          place_id?: string | null
          postal_code?: string | null
          raw_address?: string
          state?: string | null
          street?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_locations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "new_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_locations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_events_financial_summary"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          connected_by: string | null
          created_at: string
          credentials: Json
          encrypted_credentials: string | null
          encrypted_credentials_vault_id: string | null
          id: string
          integration_type: string
          is_active: boolean | null
          last_sync_at: string | null
          settings: Json | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          connected_by?: string | null
          created_at?: string
          credentials?: Json
          encrypted_credentials?: string | null
          encrypted_credentials_vault_id?: string | null
          id?: string
          integration_type: string
          is_active?: boolean | null
          last_sync_at?: string | null
          settings?: Json | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          connected_by?: string | null
          created_at?: string
          credentials?: Json
          encrypted_credentials?: string | null
          encrypted_credentials_vault_id?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          settings?: Json | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_generation_logs: {
        Row: {
          additional_fees: number | null
          business_notes: string | null
          created_at: string
          currency: string | null
          discount_amount: number | null
          discount_percentage: number | null
          error_message: string | null
          event_id: string | null
          id: string
          installments_paid: number | null
          installments_total: number | null
          invoice_id_conta_azul: string | null
          invoice_number: number | null
          invoice_path: string | null
          new_event_id: string | null
          new_order_id: string | null
          of_number: string | null
          of_numbers: string[] | null
          order_fulfillment_id: string | null
          payload_sent: Json | null
          payment_date: string | null
          payment_due_date: string | null
          payment_method: string | null
          payment_notes: string | null
          payment_status: string | null
          response_payload: Json | null
          subtotal: number | null
          success: boolean
          tax_amount: number | null
          tenant_id: string
          total_value: number | null
          user_id: string | null
        }
        Insert: {
          additional_fees?: number | null
          business_notes?: string | null
          created_at?: string
          currency?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          error_message?: string | null
          event_id?: string | null
          id?: string
          installments_paid?: number | null
          installments_total?: number | null
          invoice_id_conta_azul?: string | null
          invoice_number?: number | null
          invoice_path?: string | null
          new_event_id?: string | null
          new_order_id?: string | null
          of_number?: string | null
          of_numbers?: string[] | null
          order_fulfillment_id?: string | null
          payload_sent?: Json | null
          payment_date?: string | null
          payment_due_date?: string | null
          payment_method?: string | null
          payment_notes?: string | null
          payment_status?: string | null
          response_payload?: Json | null
          subtotal?: number | null
          success?: boolean
          tax_amount?: number | null
          tenant_id: string
          total_value?: number | null
          user_id?: string | null
        }
        Update: {
          additional_fees?: number | null
          business_notes?: string | null
          created_at?: string
          currency?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          error_message?: string | null
          event_id?: string | null
          id?: string
          installments_paid?: number | null
          installments_total?: number | null
          invoice_id_conta_azul?: string | null
          invoice_number?: number | null
          invoice_path?: string | null
          new_event_id?: string | null
          new_order_id?: string | null
          of_number?: string | null
          of_numbers?: string[] | null
          order_fulfillment_id?: string | null
          payload_sent?: Json | null
          payment_date?: string | null
          payment_due_date?: string | null
          payment_method?: string | null
          payment_notes?: string | null
          payment_status?: string | null
          response_payload?: Json | null
          subtotal?: number | null
          success?: boolean
          tax_amount?: number | null
          tenant_id?: string
          total_value?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_generation_logs_new_event_id_fkey"
            columns: ["new_event_id"]
            isOneToOne: false
            referencedRelation: "new_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_generation_logs_new_event_id_fkey"
            columns: ["new_event_id"]
            isOneToOne: false
            referencedRelation: "v_events_financial_summary"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "invoice_generation_logs_new_order_id_fkey"
            columns: ["new_order_id"]
            isOneToOne: false
            referencedRelation: "new_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_generation_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_generation_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      new_emails: {
        Row: {
          created_at: string | null
          extracted_data: Json
          id: string
          raw_content: string
          received_at: string
          sender: string
          status: string | null
          subject: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          extracted_data: Json
          id: string
          raw_content: string
          received_at: string
          sender: string
          status?: string | null
          subject: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          extracted_data?: Json
          id?: string
          raw_content?: string
          received_at?: string
          sender?: string
          status?: string | null
          subject?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "new_emails_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      new_events: {
        Row: {
          cleaning_rule: Json | null
          contract: string | null
          created_at: string | null
          daily_list: string[] | null
          date: string
          demobilization_datetime: string | null
          email_id: string | null
          end_date: string | null
          end_time: string | null
          event_type: Database["public"]["Enums"]["event_type_enum"] | null
          id: string
          is_cancelled: boolean | null
          is_intermittent: boolean | null
          is_night_event: boolean | null
          location: string | null
          mobilization_datetime: string | null
          name: string
          number: string
          periodic_exchange_rule: Json | null
          post_cleaning_datetime: string | null
          pre_cleaning_datetime: string | null
          received_date: string | null
          recurrence_rule: Json | null
          source: Database["public"]["Enums"]["event_source"] | null
          start_date: string
          start_time: string | null
          status: Database["public"]["Enums"]["event_status_enum"] | null
          tenant_id: string
          total_value: number | null
          updated_at: string | null
          year: number
        }
        Insert: {
          cleaning_rule?: Json | null
          contract?: string | null
          created_at?: string | null
          daily_list?: string[] | null
          date: string
          demobilization_datetime?: string | null
          email_id?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type?: Database["public"]["Enums"]["event_type_enum"] | null
          id: string
          is_cancelled?: boolean | null
          is_intermittent?: boolean | null
          is_night_event?: boolean | null
          location?: string | null
          mobilization_datetime?: string | null
          name: string
          number: string
          periodic_exchange_rule?: Json | null
          post_cleaning_datetime?: string | null
          pre_cleaning_datetime?: string | null
          received_date?: string | null
          recurrence_rule?: Json | null
          source?: Database["public"]["Enums"]["event_source"] | null
          start_date: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status_enum"] | null
          tenant_id: string
          total_value?: number | null
          updated_at?: string | null
          year: number
        }
        Update: {
          cleaning_rule?: Json | null
          contract?: string | null
          created_at?: string | null
          daily_list?: string[] | null
          date?: string
          demobilization_datetime?: string | null
          email_id?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type?: Database["public"]["Enums"]["event_type_enum"] | null
          id?: string
          is_cancelled?: boolean | null
          is_intermittent?: boolean | null
          is_night_event?: boolean | null
          location?: string | null
          mobilization_datetime?: string | null
          name?: string
          number?: string
          periodic_exchange_rule?: Json | null
          post_cleaning_datetime?: string | null
          pre_cleaning_datetime?: string | null
          received_date?: string | null
          recurrence_rule?: Json | null
          source?: Database["public"]["Enums"]["event_source"] | null
          start_date?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status_enum"] | null
          tenant_id?: string
          total_value?: number | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "new_events_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "new_emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      new_events_contaazul_pessoas: {
        Row: {
          event_id: string
          pessoa_id: string
          tenant_id: string | null
        }
        Insert: {
          event_id: string
          pessoa_id: string
          tenant_id?: string | null
        }
        Update: {
          event_id?: string
          pessoa_id?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "new_events_contaazul_pessoas_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "new_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_events_contaazul_pessoas_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_events_financial_summary"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "new_events_contaazul_pessoas_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "contaazul_pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_events_contaazul_pessoas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      new_events_contaazul_services: {
        Row: {
          event_id: string
          service_id: string
          tenant_id: string | null
        }
        Insert: {
          event_id: string
          service_id: string
          tenant_id?: string | null
        }
        Update: {
          event_id?: string
          service_id?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "new_events_contaazul_services_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "new_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_events_contaazul_services_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_events_financial_summary"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "new_events_contaazul_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "contaazul_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_events_contaazul_services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      new_issues: {
        Row: {
          created_at: string | null
          current_value: string | null
          event_id: string
          field_affected: string | null
          id: string
          message: string
          resolved_at: string | null
          severity: Database["public"]["Enums"]["issue_severity_enum"]
          status: Database["public"]["Enums"]["issue_status_enum"] | null
          suggested_value: string | null
          tenant_id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          current_value?: string | null
          event_id: string
          field_affected?: string | null
          id: string
          message: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["issue_severity_enum"]
          status?: Database["public"]["Enums"]["issue_status_enum"] | null
          suggested_value?: string | null
          tenant_id: string
          type: string
        }
        Update: {
          created_at?: string | null
          current_value?: string | null
          event_id?: string
          field_affected?: string | null
          id?: string
          message?: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["issue_severity_enum"]
          status?: Database["public"]["Enums"]["issue_status_enum"] | null
          suggested_value?: string | null
          tenant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "new_issues_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "new_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_issues_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_events_financial_summary"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "new_issues_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      new_operations: {
        Row: {
          created_at: string | null
          date: string
          driver: string | null
          duration: number | null
          event_id: string
          helper: string | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["molide_status_enum"] | null
          subtype: string | null
          tenant_id: string
          time: string
          type: Database["public"]["Enums"]["molide_operation_enum"]
          updated_at: string | null
          vehicle: string | null
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          driver?: string | null
          duration?: number | null
          event_id: string
          helper?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["molide_status_enum"] | null
          subtype?: string | null
          tenant_id: string
          time: string
          type: Database["public"]["Enums"]["molide_operation_enum"]
          updated_at?: string | null
          vehicle?: string | null
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          driver?: string | null
          duration?: number | null
          event_id?: string
          helper?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["molide_status_enum"] | null
          subtype?: string | null
          tenant_id?: string
          time?: string
          type?: Database["public"]["Enums"]["molide_operation_enum"]
          updated_at?: string | null
          vehicle?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "new_operations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "new_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_operations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_events_financial_summary"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "new_operations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      new_order_items: {
        Row: {
          created_at: string | null
          days: number
          description: string
          id: string
          item_total: number
          order_id: string
          quantity: number
          tenant_id: string
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days: number
          description: string
          id: string
          item_total: number
          order_id: string
          quantity: number
          tenant_id: string
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days?: number
          description?: string
          id?: string
          item_total?: number
          order_id?: string
          quantity?: number
          tenant_id?: string
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "new_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "new_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_order_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      new_order_items_contaazul_services: {
        Row: {
          order_item_id: string
          service_id: string
          tenant_id: string | null
        }
        Insert: {
          order_item_id: string
          service_id: string
          tenant_id?: string | null
        }
        Update: {
          order_item_id?: string
          service_id?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "new_order_items_contaazul_services_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "new_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_order_items_contaazul_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "contaazul_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_order_items_contaazul_services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      new_orders: {
        Row: {
          cancellation_reason: string | null
          created_at: string | null
          date: string | null
          event_id: string
          id: string
          is_cancelled: boolean | null
          number: string
          status: string | null
          tenant_id: string
          total_value: number | null
          updated_at: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          created_at?: string | null
          date?: string | null
          event_id: string
          id: string
          is_cancelled?: boolean | null
          number: string
          status?: string | null
          tenant_id: string
          total_value?: number | null
          updated_at?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          created_at?: string | null
          date?: string | null
          event_id?: string
          id?: string
          is_cancelled?: boolean | null
          number?: string
          status?: string | null
          tenant_id?: string
          total_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "new_orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "new_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_events_financial_summary"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "new_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      new_people: {
        Row: {
          created_at: string | null
          document: string | null
          event_id: string
          id: string
          is_primary: boolean | null
          name: string
          organization: string | null
          phone: string | null
          role: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document?: string | null
          event_id: string
          id: string
          is_primary?: boolean | null
          name: string
          organization?: string | null
          phone?: string | null
          role: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document?: string | null
          event_id?: string
          id?: string
          is_primary?: boolean | null
          name?: string
          organization?: string | null
          phone?: string | null
          role?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "new_people_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "new_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_people_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_events_financial_summary"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "new_people_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          is_deleted: boolean
          is_pinned: boolean
          operation_id: string
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_pinned?: boolean
          operation_id: string
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_pinned?: boolean
          operation_id?: string
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_operation_comments_operation"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "new_operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_operation_comments_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_operation_comments_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operation_comments_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "new_operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operation_comments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operation_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      parties: {
        Row: {
          active: boolean | null
          birth_date: string | null
          cnpj: string | null
          company_size: string | null
          cpf: string | null
          created_at: string | null
          created_by: string | null
          display_name: string
          external_ids: Json | null
          full_name: string | null
          gender: string | null
          id: string
          industry: string | null
          is_external: boolean | null
          last_synced_at: string | null
          legal_name: string | null
          metadata: Json | null
          municipal_registration: string | null
          notes: string | null
          observations: string | null
          party_type: string
          payment_observations: string | null
          state_registration: string | null
          state_tax_indicator: string | null
          state_tax_status: string | null
          sync_error: string | null
          sync_status: string | null
          tax_id_type: string | null
          tax_regime: string | null
          tenant_id: string
          trade_name: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          active?: boolean | null
          birth_date?: string | null
          cnpj?: string | null
          company_size?: string | null
          cpf?: string | null
          created_at?: string | null
          created_by?: string | null
          display_name: string
          external_ids?: Json | null
          full_name?: string | null
          gender?: string | null
          id?: string
          industry?: string | null
          is_external?: boolean | null
          last_synced_at?: string | null
          legal_name?: string | null
          metadata?: Json | null
          municipal_registration?: string | null
          notes?: string | null
          observations?: string | null
          party_type: string
          payment_observations?: string | null
          state_registration?: string | null
          state_tax_indicator?: string | null
          state_tax_status?: string | null
          sync_error?: string | null
          sync_status?: string | null
          tax_id_type?: string | null
          tax_regime?: string | null
          tenant_id: string
          trade_name?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          active?: boolean | null
          birth_date?: string | null
          cnpj?: string | null
          company_size?: string | null
          cpf?: string | null
          created_at?: string | null
          created_by?: string | null
          display_name?: string
          external_ids?: Json | null
          full_name?: string | null
          gender?: string | null
          id?: string
          industry?: string | null
          is_external?: boolean | null
          last_synced_at?: string | null
          legal_name?: string | null
          metadata?: Json | null
          municipal_registration?: string | null
          notes?: string | null
          observations?: string | null
          party_type?: string
          payment_observations?: string | null
          state_registration?: string | null
          state_tax_indicator?: string | null
          state_tax_status?: string | null
          sync_error?: string | null
          sync_status?: string | null
          tax_id_type?: string | null
          tax_regime?: string | null
          tenant_id?: string
          trade_name?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parties_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parties_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parties_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      party_contacts: {
        Row: {
          active: boolean | null
          allow_marketing: boolean | null
          allow_notifications: boolean | null
          contact_type: Database["public"]["Enums"]["contact_type"]
          contact_value: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          is_verified: boolean | null
          label: string | null
          notes: string | null
          party_id: string
          tenant_id: string
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          active?: boolean | null
          allow_marketing?: boolean | null
          allow_notifications?: boolean | null
          contact_type: Database["public"]["Enums"]["contact_type"]
          contact_value: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          label?: string | null
          notes?: string | null
          party_id: string
          tenant_id: string
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          active?: boolean | null
          allow_marketing?: boolean | null
          allow_notifications?: boolean | null
          contact_type?: Database["public"]["Enums"]["contact_type"]
          contact_value?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          label?: string | null
          notes?: string | null
          party_id?: string
          tenant_id?: string
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "party_contacts_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      party_documents: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          document_category: Database["public"]["Enums"]["document_category"]
          document_number: string | null
          expiry_date: string | null
          file_name: string
          file_path: string
          file_size_bytes: number | null
          file_type: string | null
          id: string
          is_verified: boolean | null
          issue_date: string | null
          party_id: string
          party_role_id: string | null
          tenant_id: string
          title: string | null
          uploaded_by: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          document_category: Database["public"]["Enums"]["document_category"]
          document_number?: string | null
          expiry_date?: string | null
          file_name: string
          file_path: string
          file_size_bytes?: number | null
          file_type?: string | null
          id?: string
          is_verified?: boolean | null
          issue_date?: string | null
          party_id: string
          party_role_id?: string | null
          tenant_id: string
          title?: string | null
          uploaded_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          document_category?: Database["public"]["Enums"]["document_category"]
          document_number?: string | null
          expiry_date?: string | null
          file_name?: string
          file_path?: string
          file_size_bytes?: number | null
          file_type?: string | null
          id?: string
          is_verified?: boolean | null
          issue_date?: string | null
          party_id?: string
          party_role_id?: string | null
          tenant_id?: string
          title?: string | null
          uploaded_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "party_documents_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_documents_party_role_id_fkey"
            columns: ["party_role_id"]
            isOneToOne: false
            referencedRelation: "party_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      party_employees: {
        Row: {
          active: boolean | null
          cnh_expiration_date: string | null
          cnh_number: string | null
          cnh_type: string | null
          created_at: string | null
          created_by: string | null
          employee_number: string
          employment_status: string | null
          hire_date: string | null
          id: string
          identifier: string | null
          is_driver: boolean | null
          is_helper: boolean | null
          party_id: string
          tenant_id: string
          termination_date: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          active?: boolean | null
          cnh_expiration_date?: string | null
          cnh_number?: string | null
          cnh_type?: string | null
          created_at?: string | null
          created_by?: string | null
          employee_number: string
          employment_status?: string | null
          hire_date?: string | null
          id?: string
          identifier?: string | null
          is_driver?: boolean | null
          is_helper?: boolean | null
          party_id: string
          tenant_id: string
          termination_date?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          active?: boolean | null
          cnh_expiration_date?: string | null
          cnh_number?: string | null
          cnh_type?: string | null
          created_at?: string | null
          created_by?: string | null
          employee_number?: string
          employment_status?: string | null
          hire_date?: string | null
          id?: string
          identifier?: string | null
          is_driver?: boolean | null
          is_helper?: boolean | null
          party_id?: string
          tenant_id?: string
          termination_date?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "party_employees_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_employees_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_employees_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_employees_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      party_roles: {
        Row: {
          active: boolean | null
          client_category: string | null
          client_segment: string | null
          created_at: string | null
          created_by: string | null
          credit_limit: number | null
          department: string | null
          driver_license_category: string | null
          driver_license_expiry: string | null
          driver_license_issue_date: string | null
          driver_license_number: string | null
          driver_license_types: string[] | null
          employee_code: string | null
          ended_at: string | null
          hire_date: string | null
          hourly_rate: number | null
          id: string
          is_driver: boolean | null
          is_helper: boolean | null
          is_primary: boolean | null
          notes: string | null
          party_id: string
          payment_terms: string | null
          position: string | null
          role_metadata: Json | null
          role_type: Database["public"]["Enums"]["party_role_type"]
          specialization: string[] | null
          started_at: string | null
          tenant_id: string
          termination_date: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          client_category?: string | null
          client_segment?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          department?: string | null
          driver_license_category?: string | null
          driver_license_expiry?: string | null
          driver_license_issue_date?: string | null
          driver_license_number?: string | null
          driver_license_types?: string[] | null
          employee_code?: string | null
          ended_at?: string | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_driver?: boolean | null
          is_helper?: boolean | null
          is_primary?: boolean | null
          notes?: string | null
          party_id: string
          payment_terms?: string | null
          position?: string | null
          role_metadata?: Json | null
          role_type: Database["public"]["Enums"]["party_role_type"]
          specialization?: string[] | null
          started_at?: string | null
          tenant_id: string
          termination_date?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          client_category?: string | null
          client_segment?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          department?: string | null
          driver_license_category?: string | null
          driver_license_expiry?: string | null
          driver_license_issue_date?: string | null
          driver_license_number?: string | null
          driver_license_types?: string[] | null
          employee_code?: string | null
          ended_at?: string | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_driver?: boolean | null
          is_helper?: boolean | null
          is_primary?: boolean | null
          notes?: string | null
          party_id?: string
          payment_terms?: string | null
          position?: string | null
          role_metadata?: Json | null
          role_type?: Database["public"]["Enums"]["party_role_type"]
          specialization?: string[] | null
          started_at?: string | null
          tenant_id?: string
          termination_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "party_roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_roles_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      service_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assignment_role: string
          id: string
          molide_operation_id: string
          party_id: string
          tenant_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assignment_role: string
          id?: string
          molide_operation_id: string
          party_id: string
          tenant_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assignment_role?: string
          id?: string
          molide_operation_id?: string
          party_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_assignments_molide_operation_id_fkey"
            columns: ["molide_operation_id"]
            isOneToOne: false
            referencedRelation: "new_operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_assignments_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          active: boolean | null
          banner_storage_path: string | null
          business_config: Json | null
          business_domain: Database["public"]["Enums"]["business_domain_enum"]
          cnpj: string | null
          company_name: string
          created_at: string | null
          id: string
          logo_storage_path: string | null
          subdomain: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          banner_storage_path?: string | null
          business_config?: Json | null
          business_domain: Database["public"]["Enums"]["business_domain_enum"]
          cnpj?: string | null
          company_name: string
          created_at?: string | null
          id?: string
          logo_storage_path?: string | null
          subdomain: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          banner_storage_path?: string | null
          business_config?: Json | null
          business_domain?: Database["public"]["Enums"]["business_domain_enum"]
          cnpj?: string | null
          company_name?: string
          created_at?: string | null
          id?: string
          logo_storage_path?: string | null
          subdomain?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_invites: {
        Row: {
          accepted_at: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string | null
          email: string
          expires_at: string
          full_name: string | null
          id: string
          invite_token: string
          invited_by: string
          role: Database["public"]["Enums"]["user_role_enum"]
          status: Database["public"]["Enums"]["invite_status_enum"]
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          full_name?: string | null
          id?: string
          invite_token: string
          invited_by: string
          role: Database["public"]["Enums"]["user_role_enum"]
          status?: Database["public"]["Enums"]["invite_status_enum"]
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          full_name?: string | null
          id?: string
          invite_token?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["user_role_enum"]
          status?: Database["public"]["Enums"]["invite_status_enum"]
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_invites_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active: boolean | null
          created_at: string | null
          email: string
          full_name: string
          google_id: string | null
          id: string
          last_activity_at: string | null
          last_login_at: string | null
          picture_url: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          email: string
          full_name: string
          google_id?: string | null
          id?: string
          last_activity_at?: string | null
          last_login_at?: string | null
          picture_url?: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          email?: string
          full_name?: string
          google_id?: string | null
          id?: string
          last_activity_at?: string | null
          last_login_at?: string | null
          picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          fuel_added_liters: number | null
          fuel_level_end: number | null
          fuel_level_start: number | null
          id: string
          issues_reported: string | null
          km_end: number | null
          km_start: number | null
          molide_operation_id: string
          tenant_id: string
          vehicle_condition_end: string | null
          vehicle_condition_start: string | null
          vehicle_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          fuel_added_liters?: number | null
          fuel_level_end?: number | null
          fuel_level_start?: number | null
          id?: string
          issues_reported?: string | null
          km_end?: number | null
          km_start?: number | null
          molide_operation_id: string
          tenant_id: string
          vehicle_condition_end?: string | null
          vehicle_condition_start?: string | null
          vehicle_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          fuel_added_liters?: number | null
          fuel_level_end?: number | null
          fuel_level_start?: number | null
          id?: string
          issues_reported?: string | null
          km_end?: number | null
          km_start?: number | null
          molide_operation_id?: string
          tenant_id?: string
          vehicle_condition_end?: string | null
          vehicle_condition_start?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_assignments_molide_operation_id_fkey"
            columns: ["molide_operation_id"]
            isOneToOne: false
            referencedRelation: "new_operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          active: boolean | null
          brand: string
          cobli_number: string | null
          created_at: string | null
          fuel_consumption_km_per_liter: number | null
          fuel_type: string | null
          id: string
          license_plate: string
          model: string
          module_capacity: number
          notes: string | null
          size_category: string | null
          speed_limit_kmh: number | null
          tags: string[] | null
          tenant_id: string
          updated_at: string | null
          year: number
        }
        Insert: {
          active?: boolean | null
          brand: string
          cobli_number?: string | null
          created_at?: string | null
          fuel_consumption_km_per_liter?: number | null
          fuel_type?: string | null
          id?: string
          license_plate: string
          model: string
          module_capacity: number
          notes?: string | null
          size_category?: string | null
          speed_limit_kmh?: number | null
          tags?: string[] | null
          tenant_id: string
          updated_at?: string | null
          year: number
        }
        Update: {
          active?: boolean | null
          brand?: string
          cobli_number?: string | null
          created_at?: string | null
          fuel_consumption_km_per_liter?: number | null
          fuel_type?: string | null
          id?: string
          license_plate?: string
          model?: string
          module_capacity?: number
          notes?: string | null
          size_category?: string | null
          speed_limit_kmh?: number | null
          tags?: string[] | null
          tenant_id?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_events_financial_summary: {
        Row: {
          event_date: string | null
          event_id: string | null
          event_name: string | null
          event_number: string | null
          event_year: number | null
          invoices_paid: number | null
          overall_status: string | null
          source: Database["public"]["Enums"]["event_source"] | null
          total_invoiced: number | null
          total_invoices: number | null
          total_paid: number | null
          total_pending: number | null
        }
        Relationships: []
      }
      v_latest_successful_invoices: {
        Row: {
          created_at: string | null
          id: string | null
          invoice_id_conta_azul: string | null
          invoice_number: number | null
          new_event_id: string | null
          new_order_id: string | null
          of_numbers: string[] | null
          payment_date: string | null
          payment_due_date: string | null
          payment_status: string | null
          total_value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_generation_logs_new_event_id_fkey"
            columns: ["new_event_id"]
            isOneToOne: false
            referencedRelation: "new_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_generation_logs_new_event_id_fkey"
            columns: ["new_event_id"]
            isOneToOne: false
            referencedRelation: "v_events_financial_summary"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "invoice_generation_logs_new_order_id_fkey"
            columns: ["new_order_id"]
            isOneToOne: false
            referencedRelation: "new_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      v_pending_payments: {
        Row: {
          days_overdue: number | null
          event_name: string | null
          event_number: string | null
          event_year: number | null
          id: string | null
          invoice_id_conta_azul: string | null
          invoice_number: number | null
          invoiced_at: string | null
          new_event_id: string | null
          new_order_id: string | null
          of_numbers: string[] | null
          payment_due_date: string | null
          payment_method: string | null
          payment_status: string | null
          total_value: number | null
          urgency: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_generation_logs_new_event_id_fkey"
            columns: ["new_event_id"]
            isOneToOne: false
            referencedRelation: "new_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_generation_logs_new_event_id_fkey"
            columns: ["new_event_id"]
            isOneToOne: false
            referencedRelation: "v_events_financial_summary"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "invoice_generation_logs_new_order_id_fkey"
            columns: ["new_order_id"]
            isOneToOne: false
            referencedRelation: "new_orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      apply_tenant_storage_policies: { Args: never; Returns: string }
      calculate_event_dates: {
        Args: {
          demobilization_dt?: string
          mobilization_dt?: string
          post_cleaning_dt?: string
          pre_cleaning_dt?: string
          recurrence_end_dt?: string
          recurrence_start_dt?: string
        }
        Returns: Record<string, unknown>
      }
      calculate_event_total: {
        Args: { event_id_param: string }
        Returns: number
      }
      calculate_order_total: {
        Args: { order_id_param: string }
        Returns: number
      }
      find_or_create_client: {
        Args: {
          p_address_city?: string
          p_address_complement?: string
          p_address_neighborhood?: string
          p_address_number?: string
          p_address_state?: string
          p_address_street?: string
          p_address_zipcode?: string
          p_bank_account?: string
          p_bank_agency?: string
          p_bank_name?: string
          p_billing_days?: number
          p_cnpj?: string
          p_company_name: string
          p_contact_email?: string
          p_contact_name?: string
          p_contact_phone?: string
          p_pix_key?: string
          p_tenant_id: string
        }
        Returns: string
      }
      get_conta_azul_id: { Args: { party_uuid: string }; Returns: string }
      get_current_user_tenant_id: { Args: never; Returns: string }
      get_decrypted_credentials: {
        Args: { p_integration_type: string; p_tenant_id: string }
        Returns: Json
      }
      get_party_roles: {
        Args: { p_party_id: string }
        Returns: {
          active: boolean
          ended_at: string
          is_primary: boolean
          role_type: Database["public"]["Enums"]["party_role_type"]
          started_at: string
        }[]
      }
      get_primary_contact: {
        Args: {
          p_contact_type: Database["public"]["Enums"]["contact_type"]
          p_party_id: string
        }
        Returns: string
      }
      get_user_tenant_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          p_party_id: string
          p_role: Database["public"]["Enums"]["party_role_type"]
        }
        Returns: boolean
      }
      is_admin_or_operator: { Args: never; Returns: boolean }
      process_unread_emails: { Args: never; Returns: undefined }
      set_conta_azul_id: {
        Args: { ca_id: string; party_uuid: string }
        Returns: undefined
      }
      store_encrypted_credentials: {
        Args: {
          p_connected_by?: string
          p_credentials: Json
          p_integration_type: string
          p_tenant_id: string
        }
        Returns: undefined
      }
      upsert_contaazul_pessoas: { Args: { p_data: Json[] }; Returns: undefined }
    }
    Enums: {
      action_type_enum:
        | "LOGIN"
        | "LOGOUT"
        | "CREATE_EVENT"
        | "UPDATE_EVENT"
        | "DELETE_EVENT"
        | "CREATE_CLIENT"
        | "UPDATE_CLIENT"
        | "DELETE_CLIENT"
        | "CREATE_EMPLOYEE"
        | "UPDATE_EMPLOYEE"
        | "DELETE_EMPLOYEE"
        | "CREATE_USER"
        | "UPDATE_USER"
        | "DELETE_USER"
        | "CREATE_MOLIDE_OPERATION"
        | "UPDATE_MOLIDE_OPERATION"
        | "DELETE_MOLIDE_OPERATION"
        | "ASSIGN_DRIVER"
        | "ASSIGN_VEHICLE"
        | "EXPORT_DATA"
        | "IMPORT_DATA"
        | "GENERATE_INVOICE"
        | "REQUEST_MOLIDE_GENERATION"
        | "MOLIDE_GENERATION_SUCCESS"
        | "SYNC_CONTAAZUL_PESSOAS"
        | "SYNC_CONTAAZUL_SERVICOS"
      address_type:
        | "BILLING"
        | "SHIPPING"
        | "EVENT"
        | "HEADQUARTERS"
        | "BRANCH"
        | "RESIDENTIAL"
        | "COMMERCIAL"
      audit_action_enum:
        | "LOGIN"
        | "LOGOUT"
        | "CREATE"
        | "UPDATE"
        | "DELETE"
        | "STATUS_CHANGE"
        | "GENERATE"
        | "EXPORT"
        | "IMPORT"
        | "OTHER"
      business_domain_enum:
        | "BATHROOM_RENTAL"
        | "CATERING"
        | "SECURITY"
        | "STAGE_SETUP"
        | "GENERAL_SERVICES"
      contact_type:
        | "EMAIL"
        | "PHONE"
        | "MOBILE"
        | "FAX"
        | "WHATSAPP"
        | "WEBSITE"
        | "LINKEDIN"
        | "INSTAGRAM"
      document_category:
        | "CONTRACT"
        | "PROPOSAL"
        | "INVOICE"
        | "RECEIPT"
        | "IDENTITY"
        | "LICENSE"
        | "CERTIFICATE"
        | "OTHER"
      event_history_action_enum:
        | "CREATE"
        | "UPDATE"
        | "DELETE"
        | "STATUS_CHANGE"
      event_history_entity_enum:
        | "EVENT"
        | "EVENT_ORDER"
        | "EVENT_ORDER_ITEM"
        | "EVENT_SERVICE"
        | "EVENT_SERVICE_OCCURRENCE"
        | "EVENT_OPERATION"
        | "EVENT_NOTE"
        | "EVENT_PARTICIPANT"
        | "EVENT_LOCATION"
        | "EVENT_ATTACHMENT"
        | "EVENT_EMAIL"
      event_invoice_status_enum:
        | "PENDING"
        | "QUEUED"
        | "SENT"
        | "ERROR"
        | "CANCELLED"
      event_location_role_enum:
        | "VENUE"
        | "CLIENT_ADDRESS"
        | "SUPPLIER_ADDRESS"
        | "WAREHOUSE"
        | "OTHER"
      event_log_action_enum:
        | "CREATED"
        | "UPDATED"
        | "STATUS_CHANGED"
        | "DELETED"
      event_log_entity_enum: "EVENT" | "OPERATION"
      event_note_category_enum:
        | "GENERAL"
        | "LOGISTICS"
        | "BILLING"
        | "INSTRUCTIONS"
        | "RISK"
        | "OTHER"
      event_operation_type_enum:
        | "MOBILIZATION"
        | "OPERATION"
        | "DEMOBILIZATION"
        | "CLEANING_PRE"
        | "CLEANING_POST"
        | "CLEANING"
        | "OTHER"
      event_participant_contact_type_enum:
        | "EMAIL"
        | "PHONE"
        | "WHATSAPP"
        | "OTHER"
      event_participant_role_enum:
        | "CLIENT_CONTACT"
        | "PRODUCER"
        | "COORDINATOR"
        | "SUPPLIER"
        | "SUPPLIER_CONTACT"
        | "OTHER"
      event_sale_status_enum:
        | "PENDING"
        | "QUEUED"
        | "SENT"
        | "CONFIRMED"
        | "ERROR"
        | "CANCELLED"
      event_source: "AUTO" | "MANUAL" | "NOT_LISTABLE"
      event_status_enum:
        | "RECEIVED"
        | "VERIFIED"
        | "SCHEDULED"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "BILLED"
        | "CANCELLED"
        | "INCOMPLETE"
        | "DRAFT"
        | "CONFIRMED"
        | "ACTIVE"
        | "TIME_ERROR"
      event_type_enum: "UNICO" | "INTERMITENTE" | "SINGLE_OCCURRENCE"
      interaction_type_enum:
        | "PAGE_VIEW"
        | "TAB_SWITCH"
        | "MENU_CLICK"
        | "LIST_VIEW"
        | "DETAIL_VIEW"
        | "SEARCH"
        | "FILTER"
        | "SORT"
        | "CREATE"
        | "UPDATE"
        | "DELETE"
        | "APPROVE"
        | "REJECT"
        | "EXPORT"
        | "IMPORT"
        | "PRINT"
        | "SHARE"
        | "LOGIN"
        | "LOGOUT"
        | "TIMEOUT"
        | "ERROR"
      invite_status_enum: "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED"
      issue_severity_enum:
        | "LOW"
        | "MEDIUM"
        | "HIGH"
        | "CRITICAL"
        | "low"
        | "medium"
        | "high"
        | "critical"
      issue_status_enum:
        | "OPEN"
        | "IN_PROGRESS"
        | "RESOLVED"
        | "CLOSED"
        | "IN_REVIEW"
        | "IGNORED"
        | "open"
        | "in_progress"
        | "resolved"
        | "closed"
        | "ignored"
        | "in_review"
      molide_operation_enum:
        | "MOBILIZATION"
        | "CLEANING"
        | "DEMOBILIZATION"
        | "SUCTION"
      molide_status_enum:
        | "SCHEDULED"
        | "RECEIVED"
        | "VERIFIED"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "CANCELLED"
        | "INCOMPLETE"
        | "TIME_ERROR"
        | "NOT_FULFILLED"
      of_status_enum: "ACTIVE" | "CANCELLED" | "MERGED" | "COMPLETED"
      operation_status_enum:
        | "PENDING"
        | "SCHEDULED"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "CANCELLED"
        | "NOT_FULFILLED"
        | "RECEIVED"
        | "VERIFIED"
        | "INCOMPLETE"
        | "TIME_ERROR"
      operation_type_enum:
        | "MOBILIZATION"
        | "DEMOBILIZATION"
        | "CLEANING"
        | "EXCHANGE"
        | "MAINTENANCE"
      party_role_type:
        | "CLIENT"
        | "SUPPLIER"
        | "PARTNER"
        | "COORDINATOR"
        | "PRODUCER"
        | "EMPLOYEE"
        | "CONTACT"
      relationship_type:
        | "PARENT_COMPANY"
        | "SUBSIDIARY"
        | "PARTNER"
        | "COMPETITOR"
        | "EMPLOYEE_OF"
        | "CONTRACTOR_OF"
        | "REFERRED_BY"
        | "CONTACT_PERSON_FOR"
      user_role_enum: "ADMIN" | "OPERATOR" | "VIEWER"
      vehicle_type_enum: "CARGA" | "TANQUE"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      action_type_enum: [
        "LOGIN",
        "LOGOUT",
        "CREATE_EVENT",
        "UPDATE_EVENT",
        "DELETE_EVENT",
        "CREATE_CLIENT",
        "UPDATE_CLIENT",
        "DELETE_CLIENT",
        "CREATE_EMPLOYEE",
        "UPDATE_EMPLOYEE",
        "DELETE_EMPLOYEE",
        "CREATE_USER",
        "UPDATE_USER",
        "DELETE_USER",
        "CREATE_MOLIDE_OPERATION",
        "UPDATE_MOLIDE_OPERATION",
        "DELETE_MOLIDE_OPERATION",
        "ASSIGN_DRIVER",
        "ASSIGN_VEHICLE",
        "EXPORT_DATA",
        "IMPORT_DATA",
        "GENERATE_INVOICE",
        "REQUEST_MOLIDE_GENERATION",
        "MOLIDE_GENERATION_SUCCESS",
        "SYNC_CONTAAZUL_PESSOAS",
        "SYNC_CONTAAZUL_SERVICOS",
      ],
      address_type: [
        "BILLING",
        "SHIPPING",
        "EVENT",
        "HEADQUARTERS",
        "BRANCH",
        "RESIDENTIAL",
        "COMMERCIAL",
      ],
      audit_action_enum: [
        "LOGIN",
        "LOGOUT",
        "CREATE",
        "UPDATE",
        "DELETE",
        "STATUS_CHANGE",
        "GENERATE",
        "EXPORT",
        "IMPORT",
        "OTHER",
      ],
      business_domain_enum: [
        "BATHROOM_RENTAL",
        "CATERING",
        "SECURITY",
        "STAGE_SETUP",
        "GENERAL_SERVICES",
      ],
      contact_type: [
        "EMAIL",
        "PHONE",
        "MOBILE",
        "FAX",
        "WHATSAPP",
        "WEBSITE",
        "LINKEDIN",
        "INSTAGRAM",
      ],
      document_category: [
        "CONTRACT",
        "PROPOSAL",
        "INVOICE",
        "RECEIPT",
        "IDENTITY",
        "LICENSE",
        "CERTIFICATE",
        "OTHER",
      ],
      event_history_action_enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "STATUS_CHANGE",
      ],
      event_history_entity_enum: [
        "EVENT",
        "EVENT_ORDER",
        "EVENT_ORDER_ITEM",
        "EVENT_SERVICE",
        "EVENT_SERVICE_OCCURRENCE",
        "EVENT_OPERATION",
        "EVENT_NOTE",
        "EVENT_PARTICIPANT",
        "EVENT_LOCATION",
        "EVENT_ATTACHMENT",
        "EVENT_EMAIL",
      ],
      event_invoice_status_enum: [
        "PENDING",
        "QUEUED",
        "SENT",
        "ERROR",
        "CANCELLED",
      ],
      event_location_role_enum: [
        "VENUE",
        "CLIENT_ADDRESS",
        "SUPPLIER_ADDRESS",
        "WAREHOUSE",
        "OTHER",
      ],
      event_log_action_enum: [
        "CREATED",
        "UPDATED",
        "STATUS_CHANGED",
        "DELETED",
      ],
      event_log_entity_enum: ["EVENT", "OPERATION"],
      event_note_category_enum: [
        "GENERAL",
        "LOGISTICS",
        "BILLING",
        "INSTRUCTIONS",
        "RISK",
        "OTHER",
      ],
      event_operation_type_enum: [
        "MOBILIZATION",
        "OPERATION",
        "DEMOBILIZATION",
        "CLEANING_PRE",
        "CLEANING_POST",
        "CLEANING",
        "OTHER",
      ],
      event_participant_contact_type_enum: [
        "EMAIL",
        "PHONE",
        "WHATSAPP",
        "OTHER",
      ],
      event_participant_role_enum: [
        "CLIENT_CONTACT",
        "PRODUCER",
        "COORDINATOR",
        "SUPPLIER",
        "SUPPLIER_CONTACT",
        "OTHER",
      ],
      event_sale_status_enum: [
        "PENDING",
        "QUEUED",
        "SENT",
        "CONFIRMED",
        "ERROR",
        "CANCELLED",
      ],
      event_source: ["AUTO", "MANUAL", "NOT_LISTABLE"],
      event_status_enum: [
        "RECEIVED",
        "VERIFIED",
        "SCHEDULED",
        "IN_PROGRESS",
        "COMPLETED",
        "BILLED",
        "CANCELLED",
        "INCOMPLETE",
        "DRAFT",
        "CONFIRMED",
        "ACTIVE",
        "TIME_ERROR",
      ],
      event_type_enum: ["UNICO", "INTERMITENTE", "SINGLE_OCCURRENCE"],
      interaction_type_enum: [
        "PAGE_VIEW",
        "TAB_SWITCH",
        "MENU_CLICK",
        "LIST_VIEW",
        "DETAIL_VIEW",
        "SEARCH",
        "FILTER",
        "SORT",
        "CREATE",
        "UPDATE",
        "DELETE",
        "APPROVE",
        "REJECT",
        "EXPORT",
        "IMPORT",
        "PRINT",
        "SHARE",
        "LOGIN",
        "LOGOUT",
        "TIMEOUT",
        "ERROR",
      ],
      invite_status_enum: ["PENDING", "ACCEPTED", "EXPIRED", "CANCELLED"],
      issue_severity_enum: [
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
        "low",
        "medium",
        "high",
        "critical",
      ],
      issue_status_enum: [
        "OPEN",
        "IN_PROGRESS",
        "RESOLVED",
        "CLOSED",
        "IN_REVIEW",
        "IGNORED",
        "open",
        "in_progress",
        "resolved",
        "closed",
        "ignored",
        "in_review",
      ],
      molide_operation_enum: [
        "MOBILIZATION",
        "CLEANING",
        "DEMOBILIZATION",
        "SUCTION",
      ],
      molide_status_enum: [
        "SCHEDULED",
        "RECEIVED",
        "VERIFIED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "INCOMPLETE",
        "TIME_ERROR",
        "NOT_FULFILLED",
      ],
      of_status_enum: ["ACTIVE", "CANCELLED", "MERGED", "COMPLETED"],
      operation_status_enum: [
        "PENDING",
        "SCHEDULED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "NOT_FULFILLED",
        "RECEIVED",
        "VERIFIED",
        "INCOMPLETE",
        "TIME_ERROR",
      ],
      operation_type_enum: [
        "MOBILIZATION",
        "DEMOBILIZATION",
        "CLEANING",
        "EXCHANGE",
        "MAINTENANCE",
      ],
      party_role_type: [
        "CLIENT",
        "SUPPLIER",
        "PARTNER",
        "COORDINATOR",
        "PRODUCER",
        "EMPLOYEE",
        "CONTACT",
      ],
      relationship_type: [
        "PARENT_COMPANY",
        "SUBSIDIARY",
        "PARTNER",
        "COMPETITOR",
        "EMPLOYEE_OF",
        "CONTRACTOR_OF",
        "REFERRED_BY",
        "CONTACT_PERSON_FOR",
      ],
      user_role_enum: ["ADMIN", "OPERATOR", "VIEWER"],
      vehicle_type_enum: ["CARGA", "TANQUE"],
    },
  },
} as const