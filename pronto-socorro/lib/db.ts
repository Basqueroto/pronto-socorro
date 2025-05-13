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
}

// Função para inicializar o banco de dados
function initializeDatabase(): Database {
  try {
    // Verificar se já existe um banco de dados no localStorage
    const storedDb = localStorage.getItem("hospital_db")
    if (storedDb) {
      // Converter as strings de data de volta para objetos Date
      const parsedDb = JSON.parse(storedDb, (key, value) => {
        // Converter strings de data para objetos Date
        if (key === "registeredAt" || (key === "timestamp" && typeof value === "string")) {
          return new Date(value)
        }
        return value
      })
      return parsedDb
    }
    // Se não existir, inicializar com os dados padrão
    localStorage.setItem("hospital_db", JSON.stringify(initialDatabase))
    return initialDatabase
  } catch (error) {
    console.error("Erro ao inicializar banco de dados:", error)
    return initialDatabase
  }
}

// Função para salvar o banco de dados no localStorage
function saveDatabase(db: Database): void {
  try {
    localStorage.setItem("hospital_db", JSON.stringify(db))
  } catch (error) {
    console.error("Erro ao salvar banco de dados:", error)
  }
}

// Classe para gerenciar o banco de dados
class DatabaseManager {
  private db: Database

  constructor() {
    this.db = initializeDatabase()
  }

  // Métodos para pacientes
  getAllPatients(): Patient[] {
    return this.db.patients.map((patient) => ({
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

  getPatientById(id: string): Patient | undefined {
    const patient = this.db.patients.find((p) => p.id === id)
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

  addPatient(patient: Patient): void {
    this.db.patients.push(patient)
    saveDatabase(this.db)
  }

  updatePatient(updatedPatient: Patient): void {
    const index = this.db.patients.findIndex((p) => p.id === updatedPatient.id)
    if (index !== -1) {
      this.db.patients[index] = updatedPatient
      saveDatabase(this.db)
    }
  }

  deletePatient(id: string): void {
    this.db.patients = this.db.patients.filter((p) => p.id !== id)
    saveDatabase(this.db)
  }

  // Métodos para funcionários
  getAllStaff(): Staff[] {
    return [...this.db.staff]
  }

  getStaffByUsername(username: string): Staff | undefined {
    return this.db.staff.find((s) => s.username === username)
  }

  addStaff(staff: Staff): void {
    this.db.staff.push(staff)
    saveDatabase(this.db)
  }

  updateStaff(updatedStaff: Staff): void {
    const index = this.db.staff.findIndex((s) => s.id === updatedStaff.id)
    if (index !== -1) {
      this.db.staff[index] = updatedStaff
      saveDatabase(this.db)
    }
  }

  deleteStaff(id: string): void {
    this.db.staff = this.db.staff.filter((s) => s.id !== id)
    saveDatabase(this.db)
  }

  // Métodos para pacientes arquivados
  getAllArchivedPatients(): Patient[] {
    return this.db.archivedPatients.map((patient) => ({
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

  archivePatient(patient: Patient): void {
    // Remover da lista de pacientes ativos
    this.db.patients = this.db.patients.filter((p) => p.id !== patient.id)
    // Adicionar à lista de arquivados
    this.db.archivedPatients.push(patient)
    saveDatabase(this.db)
  }

  // Método para verificar credenciais de funcionário
  verifyStaffCredentials(username: string, password: string): Staff | undefined {
    return this.db.staff.find((s) => s.username === username && s.password === password)
  }
}

// Exportar uma instância única do gerenciador de banco de dados
export const dbManager = new DatabaseManager()
