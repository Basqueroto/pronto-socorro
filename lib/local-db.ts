// Tipos para os dados do banco
export interface Patient {
  id: string
  name: string
  age: number
  gender: string
  symptoms: string
  priority: "Vermelho" | "Laranja" | "Amarelo" | "Verde" | "Azul"
  registeredAt: Date
  waitTime: string
  currentStep: string
  completedSteps?: string[]
  temperature?: string
  bloodPressure?: string
  heartRate?: string
  oxygenSaturation?: string
  painLevel?: string
  allergies?: string
  medications?: string
  reevaluationRequest?: {
    requested: boolean
    reason: string
    timestamp: Date
    seen: boolean
  }
}

export interface Staff {
  id: string
  username: string
  password: string
  name: string
  role: "medico" | "enfermeiro" | "admin"
}

// Estrutura do banco de dados
interface Database {
  patients: Patient[]
  staff: Staff[]
  archivedPatients: Patient[]
  version: string
  lastUpdated: Date
}

// Inicialização do banco de dados com dados de exemplo
const initialDatabase: Database = {
  patients: [
    {
      id: "PS12345",
      name: "João Silva",
      age: 45,
      gender: "Masculino",
      symptoms: "Dor no peito e falta de ar",
      priority: "Vermelho",
      registeredAt: new Date(Date.now() - 15 * 60000), // 15 minutos atrás
      waitTime: "Imediato",
      currentStep: "consulta",
      completedSteps: ["recepcao", "triagem"],
      temperature: "37.8",
      bloodPressure: "150/90",
      heartRate: "95",
      oxygenSaturation: "94",
      painLevel: "8",
      allergies: "Penicilina",
      medications: "Losartana",
    },
    {
      id: "PS67890",
      name: "Maria Oliveira",
      age: 32,
      gender: "Feminino",
      symptoms: "Febre alta e dor de cabeça intensa",
      priority: "Laranja",
      registeredAt: new Date(Date.now() - 45 * 60000), // 45 minutos atrás
      waitTime: "10 minutos",
      currentStep: "triagem",
      completedSteps: ["recepcao"],
      temperature: "39.2",
      bloodPressure: "120/80",
      heartRate: "88",
      oxygenSaturation: "97",
      painLevel: "7",
      allergies: "Nenhuma",
      medications: "Nenhum",
      reevaluationRequest: {
        requested: true,
        reason: "Minha dor de cabeça piorou muito e estou com náuseas",
        timestamp: new Date(Date.now() - 10 * 60000), // 10 minutos atrás
        seen: false,
      },
    },
    {
      id: "PS54321",
      name: "Pedro Santos",
      age: 28,
      gender: "Masculino",
      symptoms: "Corte profundo no braço",
      priority: "Amarelo",
      registeredAt: new Date(Date.now() - 60 * 60000), // 1 hora atrás
      waitTime: "30 minutos",
      currentStep: "espera",
      completedSteps: ["recepcao", "triagem"],
      temperature: "36.5",
      bloodPressure: "130/85",
      heartRate: "75",
      oxygenSaturation: "98",
      painLevel: "6",
      allergies: "Nenhuma",
      medications: "Nenhum",
    },
    {
      id: "PS24680",
      name: "Ana Souza",
      age: 65,
      gender: "Feminino",
      symptoms: "Dor nas costas",
      priority: "Verde",
      registeredAt: new Date(Date.now() - 90 * 60000), // 1.5 horas atrás
      waitTime: "1 hora",
      currentStep: "espera",
      completedSteps: ["recepcao", "triagem"],
    },
    {
      id: "PS13579",
      name: "Carlos Ferreira",
      age: 18,
      gender: "Masculino",
      symptoms: "Dor de garganta leve",
      priority: "Azul",
      registeredAt: new Date(Date.now() - 120 * 60000), // 2 horas atrás
      waitTime: "2 horas",
      currentStep: "recepcao",
      completedSteps: ["recepcao"],
    },
  ],
  staff: [
    {
      id: "STF001",
      username: "enfermeiro",
      password: "123456",
      name: "Ana Enfermeira",
      role: "enfermeiro",
    },
    {
      id: "STF002",
      username: "medico",
      password: "123456",
      name: "Dr. Carlos Silva",
      role: "medico",
    },
    {
      id: "STF003",
      username: "admin",
      password: "admin",
      name: "Administrador",
      role: "admin",
    },
  ],
  archivedPatients: [],
  version: "1.0.0",
  lastUpdated: new Date(),
}

// Função para verificar se o código está rodando no cliente (navegador)
export function isClient(): boolean {
  return typeof window !== "undefined"
}

// Função para inicializar o banco de dados
function initializeDatabase(): Database {
  if (!isClient()) {
    return initialDatabase
  }

  // Verificar se já existe um banco de dados no localStorage
  const storedDb = localStorage.getItem("hospital_db")
  if (storedDb) {
    try {
      // Converter as strings de data de volta para objetos Date
      const parsedDb = JSON.parse(storedDb, (key, value) => {
        // Converter strings de data para objetos Date
        if ((key === "registeredAt" || key === "timestamp" || key === "lastUpdated") && typeof value === "string") {
          return new Date(value)
        }
        return value
      })

      // Garantir que as credenciais de enfermeiro existam
      const hasEnfermeiro = parsedDb.staff.some((s: Staff) => s.username === "enfermeiro")
      if (!hasEnfermeiro) {
        parsedDb.staff.push({
          id: "STF001",
          username: "enfermeiro",
          password: "123456",
          name: "Ana Enfermeira",
          role: "enfermeiro",
        })
        // Salvar o banco de dados atualizado
        localStorage.setItem("hospital_db", JSON.stringify(parsedDb))
        console.log("Credenciais de enfermeiro adicionadas ao banco de dados")
      }

      return parsedDb
    } catch (error) {
      console.error("Erro ao parsear banco de dados do localStorage:", error)
      // Se houver erro, inicializar com dados padrão
      localStorage.setItem("hospital_db", JSON.stringify(initialDatabase))
      return initialDatabase
    }
  }

  // Se não existir, inicializar com os dados padrão
  localStorage.setItem("hospital_db", JSON.stringify(initialDatabase))
  console.log("Banco de dados inicializado com dados padrão")
  return initialDatabase
}

// Função para salvar o banco de dados no localStorage
function saveDatabase(db: Database): void {
  if (!isClient()) return

  try {
    // Atualizar timestamp
    db.lastUpdated = new Date()
    localStorage.setItem("hospital_db", JSON.stringify(db))
  } catch (error) {
    console.error("Erro ao salvar banco de dados:", error)
  }
}

// Classe para gerenciar o banco de dados
class LocalDatabaseManager {
  private db: Database
  private initialized = false

  constructor() {
    this.db = initialDatabase
    // Inicialização assíncrona
    this.initialize()
  }

  private initialize() {
    if (isClient()) {
      this.db = initializeDatabase()
      this.initialized = true
    }
  }

  // Métodos para pacientes
  async getAllPatients(): Promise<Patient[]> {
    // Garantir que o banco está inicializado
    if (!this.initialized && isClient()) {
      this.db = initializeDatabase()
      this.initialized = true
    }

    // Garantir que sempre retornamos um array
    const patients = this.db.patients || []
    return patients.map((patient) => ({
      ...patient,
      registeredAt: new Date(patient.registeredAt),
      reevaluationRequest: patient.reevaluationRequest
        ? {
            ...patient.reevaluationRequest,
            timestamp: new Date(patient.reevaluationRequest.timestamp),
          }
        : undefined,
    }))
  }

  async getPatientById(id: string): Promise<Patient | undefined> {
    // Garantir que o banco está inicializado
    if (!this.initialized && isClient()) {
      this.db = initializeDatabase()
      this.initialized = true
    }

    const patients = this.db.patients || []
    const patient = patients.find((p) => p.id === id)
    if (!patient) return undefined

    return {
      ...patient,
      registeredAt: new Date(patient.registeredAt),
      reevaluationRequest: patient.reevaluationRequest
        ? {
            ...patient.reevaluationRequest,
            timestamp: new Date(patient.reevaluationRequest.timestamp),
          }
        : undefined,
    }
  }

  async addPatient(patient: Patient): Promise<void> {
    // Garantir que o banco está inicializado
    if (!this.initialized && isClient()) {
      this.db = initializeDatabase()
      this.initialized = true
    }

    // Garantir que patients é um array
    if (!Array.isArray(this.db.patients)) {
      this.db.patients = []
    }

    this.db.patients.push(patient)
    saveDatabase(this.db)
  }

  async updatePatient(updatedPatient: Patient): Promise<void> {
    // Garantir que o banco está inicializado
    if (!this.initialized && isClient()) {
      this.db = initializeDatabase()
      this.initialized = true
    }

    // Garantir que patients é um array
    if (!Array.isArray(this.db.patients)) {
      this.db.patients = []
    }

    const index = this.db.patients.findIndex((p) => p.id === updatedPatient.id)
    if (index !== -1) {
      this.db.patients[index] = updatedPatient
      saveDatabase(this.db)
    }
  }

  async deletePatient(id: string): Promise<void> {
    // Garantir que o banco está inicializado
    if (!this.initialized && isClient()) {
      this.db = initializeDatabase()
      this.initialized = true
    }

    // Garantir que patients é um array
    if (!Array.isArray(this.db.patients)) {
      this.db.patients = []
    }

    this.db.patients = this.db.patients.filter((p) => p.id !== id)
    saveDatabase(this.db)
  }

  // Métodos para funcionários
  async getAllStaff(): Promise<Staff[]> {
    // Garantir que o banco está inicializado
    if (!this.initialized && isClient()) {
      this.db = initializeDatabase()
      this.initialized = true
    }

    // Garantir que sempre retornamos um array
    return Array.isArray(this.db.staff) ? [...this.db.staff] : []
  }

  async getStaffByUsername(username: string): Promise<Staff | undefined> {
    // Garantir que o banco está inicializado
    if (!this.initialized && isClient()) {
      this.db = initializeDatabase()
      this.initialized = true
    }

    const staff = Array.isArray(this.db.staff) ? this.db.staff : []
    return staff.find((s) => s.username === username)
  }

  async addStaff(staff: Staff): Promise<void> {
    // Garantir que o banco está inicializado
    if (!this.initialized && isClient()) {
      this.db = initializeDatabase()
      this.initialized = true
    }

    // Garantir que staff é um array
    if (!Array.isArray(this.db.staff)) {
      this.db.staff = []
    }

    this.db.staff.push(staff)
    saveDatabase(this.db)
  }

  async updateStaff(updatedStaff: Staff): Promise<void> {
    // Garantir que o banco está inicializado
    if (!this.initialized && isClient()) {
      this.db = initializeDatabase()
      this.initialized = true
    }

    // Garantir que staff é um array
    if (!Array.isArray(this.db.staff)) {
      this.db.staff = []
    }

    const index = this.db.staff.findIndex((s) => s.id === updatedStaff.id)
    if (index !== -1) {
      this.db.staff[index] = updatedStaff
      saveDatabase(this.db)
    }
  }

  async deleteStaff(id: string): Promise<void> {
    // Garantir que o banco está inicializado
    if (!this.initialized && isClient()) {
      this.db = initializeDatabase()
      this.initialized = true
    }

    // Garantir que staff é um array
    if (!Array.isArray(this.db.staff)) {
      this.db.staff = []
    }

    this.db.staff = this.db.staff.filter((s) => s.id !== id)
    saveDatabase(this.db)
  }

  // Métodos para pacientes arquivados
  async getAllArchivedPatients(): Promise<Patient[]> {
    // Garantir que o banco está inicializado
    if (!this.initialized && isClient()) {
      this.db = initializeDatabase()
      this.initialized = true
    }

    // Garantir que sempre retornamos um array
    const archivedPatients = this.db.archivedPatients || []
    return archivedPatients.map((patient) => ({
      ...patient,
      registeredAt: new Date(patient.registeredAt),
      reevaluationRequest: patient.reevaluationRequest
        ? {
            ...patient.reevaluationRequest,
            timestamp: new Date(patient.reevaluationRequest.timestamp),
          }
        : undefined,
    }))
  }

  async archivePatient(patient: Patient): Promise<void> {
    // Garantir que o banco está inicializado
    if (!this.initialized && isClient()) {
      this.db = initializeDatabase()
      this.initialized = true
    }

    // Garantir que os arrays existem
    if (!Array.isArray(this.db.patients)) {
      this.db.patients = []
    }
    if (!Array.isArray(this.db.archivedPatients)) {
      this.db.archivedPatients = []
    }

    // Remover da lista de pacientes ativos
    this.db.patients = this.db.patients.filter((p) => p.id !== patient.id)
    // Adicionar à lista de arquivados
    this.db.archivedPatients.push(patient)
    saveDatabase(this.db)
  }

  // Método para verificar credenciais de funcionário
  async verifyStaffCredentials(username: string, password: string): Promise<Staff | undefined> {
    // Garantir que o banco está inicializado
    if (!this.initialized && isClient()) {
      this.db = initializeDatabase()
      this.initialized = true
    }

    const staff = Array.isArray(this.db.staff) ? this.db.staff : []
    return staff.find((s) => s.username === username && s.password === password)
  }

  // Método para exportar o banco de dados
  exportDatabase(): string {
    return JSON.stringify(this.db)
  }

  // Método para importar o banco de dados
  importDatabase(jsonData: string): boolean {
    try {
      const importedDb = JSON.parse(jsonData, (key, value) => {
        if ((key === "registeredAt" || key === "timestamp" || key === "lastUpdated") && typeof value === "string") {
          return new Date(value)
        }
        return value
      })

      // Validar estrutura básica
      if (!importedDb.patients || !importedDb.staff || !importedDb.archivedPatients || !importedDb.version) {
        throw new Error("Estrutura de dados inválida")
      }

      this.db = importedDb
      saveDatabase(this.db)
      return true
    } catch (error) {
      console.error("Erro ao importar banco de dados:", error)
      return false
    }
  }

  // Método para limpar o banco de dados
  clearDatabase(): void {
    this.db = {
      ...initialDatabase,
      lastUpdated: new Date(),
    }
    saveDatabase(this.db)
  }

  // Método para obter estatísticas do banco de dados
  getDatabaseStats(): {
    patientsCount: number
    staffCount: number
    archivedPatientsCount: number
    lastUpdated: Date
    version: string
  } {
    return {
      patientsCount: Array.isArray(this.db.patients) ? this.db.patients.length : 0,
      staffCount: Array.isArray(this.db.staff) ? this.db.staff.length : 0,
      archivedPatientsCount: Array.isArray(this.db.archivedPatients) ? this.db.archivedPatients.length : 0,
      lastUpdated: this.db.lastUpdated,
      version: this.db.version,
    }
  }
}

// Exportar uma instância única do gerenciador de banco de dados
export const localDbManager = new LocalDatabaseManager()
