import { supabase, isSupabaseConfigured } from "./supabase"
import type { Database } from "./database.types"

// Tipos para o serviço de funcionários
export type Staff = {
  id: string
  username: string
  password: string
  name: string
  role: "medico" | "enfermeiro" | "admin"
}

type StaffInsert = Database["public"]["Tables"]["staff"]["Insert"]
type StaffUpdate = Database["public"]["Tables"]["staff"]["Update"]

// Verificar se o Supabase está configurado antes de usar
const ensureSupabaseConfigured = () => {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase não está configurado. Verifique as variáveis de ambiente.")
  }
}

// Função para gerar um ID único para o funcionário
export function generateStaffId(): string {
  const prefix = "STF"
  const randomNum = Math.floor(100 + Math.random() * 900)
  return `${prefix}${randomNum}`
}

// Função para verificar se um nome de usuário já existe
export async function usernameExists(username: string): Promise<boolean> {
  try {
    ensureSupabaseConfigured()

    const { data, error } = await supabase.from("staff").select("id").eq("username", username).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Erro ao verificar username:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Erro ao verificar username:", error)
    return false
  }
}

// Função para verificar credenciais de funcionário
export async function verifyStaffCredentials(username: string, password: string): Promise<Staff | undefined> {
  try {
    ensureSupabaseConfigured()

    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Erro ao verificar credenciais:", error)
      return undefined
    }

    return data
      ? {
          id: data.id,
          username: data.username,
          password: data.password,
          name: data.name,
          role: data.role as "medico" | "enfermeiro" | "admin",
        }
      : undefined
  } catch (error) {
    console.error("Erro ao verificar credenciais:", error)
    return undefined
  }
}

// Função para obter um funcionário pelo username
export async function getStaffByUsername(username: string): Promise<Staff | undefined> {
  try {
    ensureSupabaseConfigured()

    const { data, error } = await supabase.from("staff").select("*").eq("username", username).single()

    if (error && error.code !== "PGRST116") {
      console.error("Erro ao buscar funcionário por username:", error)
      return undefined
    }

    return data
      ? {
          id: data.id,
          username: data.username,
          password: data.password,
          name: data.name,
          role: data.role as "medico" | "enfermeiro" | "admin",
        }
      : undefined
  } catch (error) {
    console.error("Erro ao buscar funcionário por username:", error)
    return undefined
  }
}

// Função para registrar um novo funcionário
export async function registerStaff(data: any): Promise<Staff> {
  try {
    ensureSupabaseConfigured()

    // Verificar se o nome de usuário já existe
    if (await usernameExists(data.username)) {
      throw new Error("Nome de usuário já existe. Por favor, escolha outro.")
    }

    const staffId = generateStaffId()

    const newStaff: Staff = {
      id: staffId,
      username: data.username,
      password: data.password,
      name: data.name,
      role: data.role as "medico" | "enfermeiro" | "admin",
    }

    const { error } = await supabase.from("staff").insert(newStaff)

    if (error) {
      console.error("Erro ao registrar funcionário:", error)
      throw new Error("Erro ao registrar funcionário no banco de dados")
    }

    return newStaff
  } catch (error) {
    console.error("Erro ao registrar funcionário:", error)
    throw error
  }
}

// Função para obter todos os funcionários
export async function getAllStaff(): Promise<Staff[]> {
  try {
    ensureSupabaseConfigured()

    const { data, error } = await supabase.from("staff").select("*").order("name")

    if (error) {
      console.error("Erro ao buscar funcionários:", error)
      return []
    }

    return Array.isArray(data)
      ? data.map((staff) => ({
          id: staff.id,
          username: staff.username,
          password: staff.password,
          name: staff.name,
          role: staff.role as "medico" | "enfermeiro" | "admin",
        }))
      : []
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error)
    return []
  }
}

// Função para obter um funcionário pelo ID
export async function getStaffById(id: string): Promise<Staff | undefined> {
  try {
    ensureSupabaseConfigured()

    const { data, error } = await supabase.from("staff").select("*").eq("id", id).single()

    if (error) {
      console.error("Erro ao buscar funcionário:", error)
      return undefined
    }

    return data
      ? {
          id: data.id,
          username: data.username,
          password: data.password,
          name: data.name,
          role: data.role as "medico" | "enfermeiro" | "admin",
        }
      : undefined
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error)
    return undefined
  }
}

// Função para atualizar um funcionário
export async function updateStaff(staff: Staff): Promise<void> {
  try {
    ensureSupabaseConfigured()

    // Verificar se o nome de usuário já existe (exceto para o próprio funcionário)
    const { data: existingStaff } = await supabase
      .from("staff")
      .select("id")
      .eq("username", staff.username)
      .neq("id", staff.id)
      .single()

    if (existingStaff) {
      throw new Error("Nome de usuário já existe. Por favor, escolha outro.")
    }

    const updateData: StaffUpdate = {
      username: staff.username,
      password: staff.password,
      name: staff.name,
      role: staff.role,
    }

    const { error } = await supabase.from("staff").update(updateData).eq("id", staff.id)

    if (error) {
      console.error("Erro ao atualizar funcionário:", error)
      throw new Error("Erro ao atualizar funcionário no banco de dados")
    }
  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error)
    throw error
  }
}

// Função para excluir um funcionário
export async function deleteStaff(id: string): Promise<void> {
  try {
    ensureSupabaseConfigured()

    // Verificar se não é o admin principal
    const staff = await getStaffById(id)
    if (staff?.username === "admin") {
      throw new Error("Não é possível excluir o administrador principal")
    }

    const { error } = await supabase.from("staff").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir funcionário:", error)
      throw new Error("Erro ao excluir funcionário do banco de dados")
    }
  } catch (error) {
    console.error("Erro ao excluir funcionário:", error)
    throw error
  }
}
