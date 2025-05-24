export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      simulations: {
        Row: {
          id: string
          created_at: string
          user_id: string
          destination: string
          start_date: string
          end_date: string
          adults: number
          children: number
          selected_flight: Json | null
          selected_hotel: Json | null
          selected_activities: Json[] | null
          total_cost: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          destination: string
          start_date: string
          end_date: string
          adults: number
          children: number
          selected_flight?: Json | null
          selected_hotel?: Json | null
          selected_activities?: Json[] | null
          total_cost: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          destination?: string
          start_date?: string
          end_date?: string
          adults?: number
          children?: number
          selected_flight?: Json | null
          selected_hotel?: Json | null
          selected_activities?: Json[] | null
          total_cost?: number
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string
          full_name: string
          avatar_url: string | null
        }
        Insert: {
          id: string
          updated_at?: string
          full_name: string
          avatar_url?: string | null
        }
        Update: {
          id?: string
          updated_at?: string
          full_name?: string
          avatar_url?: string | null
        }
      }
    }
  }
}