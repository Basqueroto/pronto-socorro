import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Verificar se as variáveis de ambiente estão disponíveis
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is required")
}

if (!supabaseAnonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required")
}

// Cliente para operações do lado do cliente
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Cliente para operações administrativas (server-side apenas)
export const getServerSupabase = () => {
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for server operations")
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Função para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Tipos para o banco de dados
export type Patient = Database["public"]["Tables"]["patients"]["Row"]
export type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"]
export type PatientUpdate = Database["public"]["Tables"]["patients"]["Update"]

export type Staff = Database["public"]["Tables"]["staff"]["Row"]
export type StaffInsert = Database["public"]["Tables"]["staff"]["Insert"]
export type StaffUpdate = Database["public"]["Tables"]["staff"]["Update"]

export type ArchivedPatient = Database["public"]["Tables"]["archived_patients"]["Row"]
export type ArchivedPatientInsert = Database["public"]["Tables"]["archived_patients"]["Insert"]
