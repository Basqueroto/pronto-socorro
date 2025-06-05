// Configurações do Supabase
export interface SupabaseConfig {
  url: string
  anonKey: string
  serviceKey?: string
  projectRef: string
  region?: string
}

// Função para obter configurações do Supabase
export function getSupabaseConfig(): SupabaseConfig | null {
  // Verificar se estamos no cliente
  if (typeof window === "undefined") {
    // No servidor, usar variáveis de ambiente
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_KEY

    if (url && anonKey) {
      return {
        url,
        anonKey,
        serviceKey,
        projectRef: url.split("//")[1]?.split(".")[0] || "",
        region: "us-east-1",
      }
    }
    return null
  }

  // No cliente, verificar localStorage
  const storedConfig = localStorage.getItem("supabase_config")
  if (storedConfig) {
    try {
      return JSON.parse(storedConfig)
    } catch (error) {
      console.error("Erro ao parsear configuração do Supabase:", error)
      return null
    }
  }

  return null
}

// Função para salvar configurações do Supabase
export function saveSupabaseConfig(config: SupabaseConfig): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("supabase_config", JSON.stringify(config))
  }
}

// Função para limpar configurações do Supabase
export function clearSupabaseConfig(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("supabase_config")
    localStorage.removeItem("supabase_session")
    localStorage.removeItem("sb-*") // Limpar todas as chaves do Supabase
  }
}

// Função para verificar se as configurações estão completas
export function isSupabaseConfigComplete(config: SupabaseConfig | null): boolean {
  if (!config) return false
  return !!(config.url && config.anonKey && config.projectRef)
}

// Função para extrair project ref da URL
export function extractProjectRef(url: string): string {
  try {
    const match = url.match(/https:\/\/([^.]+)\.supabase\.co/)
    return match ? match[1] : ""
  } catch {
    return ""
  }
}

// Função para validar URL do Supabase
export function validateSupabaseUrl(url: string): boolean {
  const pattern = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/
  return pattern.test(url)
}

// Função para validar chave anônima
export function validateAnonKey(key: string): boolean {
  // Chaves do Supabase geralmente começam com 'eyJ' (JWT)
  return key.length > 100 && key.startsWith("eyJ")
}
