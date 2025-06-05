export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          name: string
          age: number
          gender: string
          symptoms: string
          priority: string
          registered_at: string
          wait_time: string | null
          current_step: string
          completed_steps: Json
          temperature: string | null
          blood_pressure: string | null
          heart_rate: string | null
          oxygen_saturation: string | null
          pain_level: string | null
          allergies: string | null
          medications: string | null
          reevaluation_requested: boolean
          reevaluation_reason: string | null
          reevaluation_timestamp: string | null
          reevaluation_seen: boolean
        }
        Insert: {
          id: string
          name: string
          age: number
          gender: string
          symptoms: string
          priority: string
          registered_at?: string
          wait_time?: string | null
          current_step: string
          completed_steps?: Json
          temperature?: string | null
          blood_pressure?: string | null
          heart_rate?: string | null
          oxygen_saturation?: string | null
          pain_level?: string | null
          allergies?: string | null
          medications?: string | null
          reevaluation_requested?: boolean
          reevaluation_reason?: string | null
          reevaluation_timestamp?: string | null
          reevaluation_seen?: boolean
        }
        Update: {
          id?: string
          name?: string
          age?: number
          gender?: string
          symptoms?: string
          priority?: string
          registered_at?: string
          wait_time?: string | null
          current_step?: string
          completed_steps?: Json
          temperature?: string | null
          blood_pressure?: string | null
          heart_rate?: string | null
          oxygen_saturation?: string | null
          pain_level?: string | null
          allergies?: string | null
          medications?: string | null
          reevaluation_requested?: boolean
          reevaluation_reason?: string | null
          reevaluation_timestamp?: string | null
          reevaluation_seen?: boolean
        }
      }
      staff: {
        Row: {
          id: string
          username: string
          password: string
          name: string
          role: string
        }
        Insert: {
          id: string
          username: string
          password: string
          name: string
          role: string
        }
        Update: {
          id?: string
          username?: string
          password?: string
          name?: string
          role?: string
        }
      }
      archived_patients: {
        Row: {
          id: string
          name: string
          age: number
          gender: string
          symptoms: string
          priority: string
          registered_at: string | null
          wait_time: string | null
          current_step: string
          completed_steps: Json
          temperature: string | null
          blood_pressure: string | null
          heart_rate: string | null
          oxygen_saturation: string | null
          pain_level: string | null
          allergies: string | null
          medications: string | null
          archived_at: string
        }
        Insert: {
          id: string
          name: string
          age: number
          gender: string
          symptoms: string
          priority: string
          registered_at?: string | null
          wait_time?: string | null
          current_step: string
          completed_steps?: Json
          temperature?: string | null
          blood_pressure?: string | null
          heart_rate?: string | null
          oxygen_saturation?: string | null
          pain_level?: string | null
          allergies?: string | null
          medications?: string | null
          archived_at?: string
        }
        Update: {
          id?: string
          name?: string
          age?: number
          gender?: string
          symptoms?: string
          priority?: string
          registered_at?: string | null
          wait_time?: string | null
          current_step?: string
          completed_steps?: Json
          temperature?: string | null
          blood_pressure?: string | null
          heart_rate?: string | null
          oxygen_saturation?: string | null
          pain_level?: string | null
          allergies?: string | null
          medications?: string | null
          archived_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Insertable<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type Updateable<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
