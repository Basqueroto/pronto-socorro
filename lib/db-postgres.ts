import type { Patient, Staff } from "./db"

// Configuração da conexão com o PostgreSQL usando fetch para API routes
const API_BASE_URL = typeof window !== "undefined" ? "" : "http://localhost:3000"

// Status da conexão
const connectionStatus = {
  connected: false,
  lastAttempt: null as Date | null,
  error: null as string | null,
}

// Função para fazer requisições para a API
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}/api${endpoint}`

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error(`Erro na requisição para ${endpoint}:`, error)
    connectionStatus.connected = false
    connectionStatus.error = error instanceof Error ? error.message : String(error)
    throw error
  }
}

// Função para desconectar do banco de dados
export async function disconnectDatabase() {
  try {
    console.log("Desconectando do banco de dados...")

    // Simular desconexão
    await new Promise((resolve) => setTimeout(resolve, 1000))

    connectionStatus.connected = false
    connectionStatus.lastAttempt = new Date()
    connectionStatus.error = null

    console.log("Banco de dados desconectado com sucesso")
    return true
  } catch (error) {
    console.error("Erro ao desconectar:", error)
    return false
  }
}

// Função para reconectar ao banco de dados
export async function reconnectDatabase() {
  try {
    console.log("Reconectando ao banco de dados...")

    // Simular processo de reconexão
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Testar a nova conexão
    const result = await apiRequest("/db-reconnect", { method: "POST" })

    if (result.status === "connected") {
      connectionStatus.connected = true
      connectionStatus.lastAttempt = new Date()
      connectionStatus.error = null

      console.log("Reconexão bem-sucedida!")

      // Reinicializar as tabelas
      await initializeTables()

      return true
    } else {
      throw new Error("Falha na reconexão")
    }
  } catch (error) {
    console.error("Erro ao reconectar:", error)
    connectionStatus.connected = false
    connectionStatus.error = error instanceof Error ? error.message : String(error)
    return false
  }
}

// Função para inicializar as tabelas após reconexão
async function initializeTables() {
  try {
    console.log("Inicializando tabelas...")
    await apiRequest("/db-init", { method: "POST" })
    console.log("Tabelas inicializadas com sucesso")
  } catch (error) {
    console.error("Erro ao inicializar tabelas:", error)
    throw error
  }
}

// Função para testar a conexão com o banco de dados
export async function testConnection() {
  try {
    connectionStatus.lastAttempt = new Date()
    const result = await apiRequest("/db-status")

    connectionStatus.connected = result.status === "connected"
    connectionStatus.error = result.status === "connected" ? null : result.message

    console.log("Status da conexão:", result)
    return connectionStatus.connected
  } catch (error) {
    console.error("Erro ao testar conexão:", error)
    connectionStatus.connected = false
    connectionStatus.error = error instanceof Error ? error.message : String(error)
    return false
  }
}

// Função para obter o status da conexão
export function getConnectionStatus() {
  return { ...connectionStatus }
}

// Função para converter um objeto Patient para o formato do banco de dados
function patientToDbFormat(patient: Patient) {
  return {
    id: patient.id,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    symptoms: patient.symptoms,
    priority: patient.priority,
    registered_at: patient.registeredAt.toISOString(),
    wait_time: patient.waitTime,
    current_step: patient.currentStep,
    completed_steps: patient.completedSteps || [],
    temperature: patient.temperature || null,
    blood_pressure: patient.bloodPressure || null,
    heart_rate: patient.heartRate || null,
    oxygen_saturation: patient.oxygenSaturation || null,
    pain_level: patient.painLevel || null,
    allergies: patient.allergies || null,
    medications: patient.medications || null,
    reevaluation_requested: patient.reevaluationRequest?.requested || false,
    reevaluation_reason: patient.reevaluationRequest?.reason || null,
    reevaluation_timestamp: patient.reevaluationRequest?.timestamp?.toISOString() || null,
    reevaluation_seen: patient.reevaluationRequest?.seen || false,
  }
}

// Função para converter um registro do banco de dados para o formato Patient
function dbToPatientFormat(row: any): Patient {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    gender: row.gender,
    symptoms: row.symptoms,
    priority: row.priority as "Vermelho" | "Laranja" | "Amarelo" | "Verde" | "Azul",
    registeredAt: new Date(row.registered_at),
    waitTime: row.wait_time,
    currentStep: row.current_step,
    completedSteps: row.completed_steps,
    temperature: row.temperature,
    bloodPressure: row.blood_pressure,
    heartRate: row.heart_rate,
    oxygenSaturation: row.oxygen_saturation,
    painLevel: row.pain_level,
    allergies: row.allergies,
    medications: row.medications,
    reevaluationRequest: row.reevaluation_requested
      ? {
          requested: row.reevaluation_requested,
          reason: row.reevaluation_reason,
          timestamp: new Date(row.reevaluation_timestamp),
          seen: row.reevaluation_seen,
        }
      : undefined,
  }
}

// Função para converter um objeto Staff para o formato do banco de dados
function staffToDbFormat(staff: Staff) {
  return {
    id: staff.id,
    username: staff.username,
    password: staff.password,
    name: staff.name,
    role: staff.role,
  }
}

// Função para converter um registro do banco de dados para o formato Staff
function dbToStaffFormat(row: any): Staff {
  return {
    id: row.id,
    username: row.username,
    password: row.password,
    name: row.name,
    role: row.role as "medico" | "enfermeiro" | "admin",
  }
}

// Classe para gerenciar o banco de dados PostgreSQL via API
export class PostgresManager {
  // Verificar se está conectado antes de cada operação
  private async ensureConnection() {
    if (!connectionStatus.connected) {
      const connected = await testConnection()
      if (!connected) {
        throw new Error("Banco de dados não conectado. Tente reconectar.")
      }
    }
  }

  // Métodos para pacientes
  async getAllPatients(): Promise<Patient[]> {
    try {
      await this.ensureConnection()
      const result = await apiRequest("/patients")
      return Array.isArray(result.patients) ? result.patients.map(dbToPatientFormat) : []
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error)
      return []
    }
  }

  async getPatientById(id: string): Promise<Patient | undefined> {
    try {
      await this.ensureConnection()
      const result = await apiRequest(`/patients/${id}`)
      if (!result.patient) return undefined
      return dbToPatientFormat(result.patient)
    } catch (error) {
      console.error(`Erro ao buscar paciente ${id}:`, error)
      return undefined
    }
  }

  async addPatient(patient: Patient): Promise<void> {
    try {
      await this.ensureConnection()
      const patientDb = patientToDbFormat(patient)
      await apiRequest("/patients", {
        method: "POST",
        body: JSON.stringify({ patient: patientDb }),
      })
    } catch (error) {
      console.error("Erro ao adicionar paciente:", error)
      throw error
    }
  }

  async updatePatient(updatedPatient: Patient): Promise<void> {
    try {
      await this.ensureConnection()
      const patientDb = patientToDbFormat(updatedPatient)
      await apiRequest(`/patients/${updatedPatient.id}`, {
        method: "PUT",
        body: JSON.stringify({ patient: patientDb }),
      })
    } catch (error) {
      console.error(`Erro ao atualizar paciente ${updatedPatient.id}:`, error)
      throw error
    }
  }

  async deletePatient(id: string): Promise<void> {
    try {
      await this.ensureConnection()
      await apiRequest(`/patients/${id}`, {
        method: "DELETE",
      })
    } catch (error) {
      console.error(`Erro ao excluir paciente ${id}:`, error)
      throw error
    }
  }

  // Métodos para funcionários
  async getAllStaff(): Promise<Staff[]> {
    try {
      await this.ensureConnection()
      const result = await apiRequest("/staff")
      return Array.isArray(result.staff) ? result.staff.map(dbToStaffFormat) : []
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error)
      return []
    }
  }

  async getStaffByUsername(username: string): Promise<Staff | undefined> {
    try {
      await this.ensureConnection()
      const result = await apiRequest(`/staff/username/${username}`)
      if (!result.staff) return undefined
      return dbToStaffFormat(result.staff)
    } catch (error) {
      console.error(`Erro ao buscar funcionário ${username}:`, error)
      return undefined
    }
  }

  async addStaff(staff: Staff): Promise<void> {
    try {
      await this.ensureConnection()
      const staffDb = staffToDbFormat(staff)
      await apiRequest("/staff", {
        method: "POST",
        body: JSON.stringify({ staff: staffDb }),
      })
    } catch (error) {
      console.error("Erro ao adicionar funcionário:", error)
      throw error
    }
  }

  async updateStaff(updatedStaff: Staff): Promise<void> {
    try {
      await this.ensureConnection()
      const staffDb = staffToDbFormat(updatedStaff)
      await apiRequest(`/staff/${updatedStaff.id}`, {
        method: "PUT",
        body: JSON.stringify({ staff: staffDb }),
      })
    } catch (error) {
      console.error(`Erro ao atualizar funcionário ${updatedStaff.id}:`, error)
      throw error
    }
  }

  async deleteStaff(id: string): Promise<void> {
    try {
      await this.ensureConnection()
      await apiRequest(`/staff/${id}`, {
        method: "DELETE",
      })
    } catch (error) {
      console.error(`Erro ao excluir funcionário ${id}:`, error)
      throw error
    }
  }

  // Métodos para pacientes arquivados
  async getAllArchivedPatients(): Promise<Patient[]> {
    try {
      await this.ensureConnection()
      const result = await apiRequest("/patients/archived")
      return Array.isArray(result.patients) ? result.patients.map(dbToPatientFormat) : []
    } catch (error) {
      console.error("Erro ao buscar pacientes arquivados:", error)
      return []
    }
  }

  async archivePatient(patient: Patient): Promise<void> {
    try {
      await this.ensureConnection()
      const patientDb = patientToDbFormat(patient)
      await apiRequest("/patients/archive", {
        method: "POST",
        body: JSON.stringify({ patient: patientDb }),
      })
    } catch (error) {
      console.error(`Erro ao arquivar paciente ${patient.id}:`, error)
      throw error
    }
  }

  // Método para verificar credenciais de funcionário
  async verifyStaffCredentials(username: string, password: string): Promise<Staff | undefined> {
    try {
      await this.ensureConnection()
      const result = await apiRequest("/auth/staff", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      })
      if (!result.staff) return undefined
      return dbToStaffFormat(result.staff)
    } catch (error) {
      console.error(`Erro ao verificar credenciais para ${username}:`, error)
      return undefined
    }
  }
}

// Exportar uma instância única do gerenciador PostgreSQL
export const postgresManager = new PostgresManager()

// Função para inicializar o banco de dados PostgreSQL
export async function initializePostgresDatabase(): Promise<boolean> {
  try {
    console.log("Iniciando processo de conexão com o banco de dados...")

    // Primeiro, desconectar qualquer conexão existente
    await disconnectDatabase()

    // Aguardar um momento antes de reconectar
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Reconectar ao banco
    const reconnected = await reconnectDatabase()

    if (!reconnected) {
      console.error("Não foi possível reconectar ao banco de dados")
      return false
    }

    console.log("Banco de dados PostgreSQL inicializado com sucesso")
    return true
  } catch (error) {
    console.error("Erro ao inicializar banco de dados PostgreSQL:", error)
    return false
  }
}
