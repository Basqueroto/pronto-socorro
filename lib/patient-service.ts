import { supabase, isSupabaseConfigured } from "./supabase"
import type { Database } from "./database.types"

// Tipos para o serviço de pacientes
export type Patient = {
  id: string
  name: string
  age: number
  gender: string
  symptoms: string
  priority: "Vermelho" | "Laranja" | "Amarelo" | "Verde" | "Azul"
  registeredAt: Date
  waitTime: string
  currentStep: string
  completedSteps: string[]
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

type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"]
type PatientUpdate = Database["public"]["Tables"]["patients"]["Update"]
type ArchivedPatientInsert = Database["public"]["Tables"]["archived_patients"]["Insert"]

// Verificar se o Supabase está configurado antes de usar
const ensureSupabaseConfigured = () => {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase não está configurado. Usando dados mock.")
    return false
  }
  return true
}

// Função para converter dados do Supabase para o formato do sistema
function dbToPatient(dbPatient: any): Patient {
  return {
    id: dbPatient.id,
    name: dbPatient.name,
    age: dbPatient.age,
    gender: dbPatient.gender,
    symptoms: dbPatient.symptoms,
    priority: dbPatient.priority as "Vermelho" | "Laranja" | "Amarelo" | "Verde" | "Azul",
    registeredAt: new Date(dbPatient.registered_at),
    waitTime: dbPatient.wait_time || "",
    currentStep: dbPatient.current_step,
    completedSteps: Array.isArray(dbPatient.completed_steps) ? dbPatient.completed_steps : [],
    temperature: dbPatient.temperature,
    bloodPressure: dbPatient.blood_pressure,
    heartRate: dbPatient.heart_rate,
    oxygenSaturation: dbPatient.oxygen_saturation,
    painLevel: dbPatient.pain_level,
    allergies: dbPatient.allergies,
    medications: dbPatient.medications,
    reevaluationRequest: dbPatient.reevaluation_requested
      ? {
          requested: dbPatient.reevaluation_requested,
          reason: dbPatient.reevaluation_reason || "",
          timestamp: new Date(dbPatient.reevaluation_timestamp || new Date()),
          seen: dbPatient.reevaluation_seen,
        }
      : undefined,
  }
}

// Função para converter dados do sistema para o formato do Supabase
function patientToDb(patient: Patient): PatientInsert {
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
    temperature: patient.temperature,
    blood_pressure: patient.bloodPressure,
    heart_rate: patient.heartRate,
    oxygen_saturation: patient.oxygenSaturation,
    pain_level: patient.painLevel,
    allergies: patient.allergies,
    medications: patient.medications,
    reevaluation_requested: patient.reevaluationRequest?.requested || false,
    reevaluation_reason: patient.reevaluationRequest?.reason,
    reevaluation_timestamp: patient.reevaluationRequest?.timestamp?.toISOString(),
    reevaluation_seen: patient.reevaluationRequest?.seen || false,
  }
}

// Dados mock para quando o Supabase não estiver configurado
const mockPatients: Patient[] = [
  {
    id: "PS12345",
    name: "João Silva",
    age: 45,
    gender: "Masculino",
    symptoms: "Dor no peito e falta de ar",
    priority: "Vermelho",
    registeredAt: new Date(Date.now() - 15 * 60 * 1000),
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
    registeredAt: new Date(Date.now() - 45 * 60 * 1000),
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
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      seen: false,
    },
  },
]

// Função para calcular a prioridade com base nos sintomas e sinais vitais
export function calculatePriority(data: any): "Vermelho" | "Laranja" | "Amarelo" | "Verde" | "Azul" {
  if (data.hasEmergencySigns) {
    return "Vermelho"
  }

  const temp = Number.parseFloat(data.temperature || "36.5")
  if (temp > 39.5 || temp < 35) {
    return "Laranja"
  }

  const bp = data.bloodPressure || "120/80"
  const systolic = Number.parseInt(bp.split("/")[0])
  if (systolic > 180 || systolic < 90) {
    return "Laranja"
  }

  const pain = Number.parseInt(data.painLevel || "0")
  if (pain >= 8) {
    return "Laranja"
  } else if (pain >= 5) {
    return "Amarelo"
  } else if (pain >= 3) {
    return "Verde"
  }

  const o2 = Number.parseInt(data.oxygenSaturation || "98")
  if (o2 < 92) {
    return "Laranja"
  } else if (o2 < 95) {
    return "Amarelo"
  }

  const hr = Number.parseInt(data.heartRate || "70")
  if (hr > 120 || hr < 50) {
    return "Amarelo"
  }

  return "Verde"
}

// Função para calcular o tempo estimado de espera
export function calculateWaitTime(priority: string): string {
  switch (priority) {
    case "Vermelho":
      return "Imediato"
    case "Laranja":
      return "10 minutos"
    case "Amarelo":
      return "30 minutos"
    case "Verde":
      return "1 hora"
    case "Azul":
      return "2 horas"
    default:
      return "1 hora"
  }
}

// Função para gerar um ID único para o paciente
export function generatePatientId(): string {
  const prefix = "PS"
  const randomNum = Math.floor(10000 + Math.random() * 90000)
  return `${prefix}${randomNum}`
}

// Função para registrar um novo paciente
export async function registerPatient(data: any): Promise<Patient> {
  try {
    if (!ensureSupabaseConfigured()) {
      // Usar dados mock se o Supabase não estiver configurado
      const calculatedPriority = calculatePriority(data)
      const patientId = generatePatientId()

      const newPatient: Patient = {
        id: patientId,
        name: data.name,
        age: Number.parseInt(data.age),
        gender: data.gender,
        symptoms: data.symptoms,
        priority: calculatedPriority,
        registeredAt: new Date(),
        waitTime: calculateWaitTime(calculatedPriority),
        currentStep: "recepcao",
        completedSteps: ["recepcao"],
        temperature: data.temperature,
        bloodPressure: data.bloodPressure,
        heartRate: data.heartRate,
        oxygenSaturation: data.oxygenSaturation,
        painLevel: data.painLevel,
        allergies: data.allergies,
        medications: data.medications,
      }

      mockPatients.push(newPatient)
      return newPatient
    }

    const calculatedPriority = calculatePriority(data)
    const patientId = generatePatientId()

    const newPatient: Patient = {
      id: patientId,
      name: data.name,
      age: Number.parseInt(data.age),
      gender: data.gender,
      symptoms: data.symptoms,
      priority: calculatedPriority,
      registeredAt: new Date(),
      waitTime: calculateWaitTime(calculatedPriority),
      currentStep: "recepcao",
      completedSteps: ["recepcao"],
      temperature: data.temperature,
      bloodPressure: data.bloodPressure,
      heartRate: data.heartRate,
      oxygenSaturation: data.oxygenSaturation,
      painLevel: data.painLevel,
      allergies: data.allergies,
      medications: data.medications,
    }

    const { error } = await supabase.from("patients").insert(patientToDb(newPatient))

    if (error) {
      console.error("Erro ao registrar paciente:", error)
      throw new Error("Erro ao registrar paciente no banco de dados")
    }

    return newPatient
  } catch (error) {
    console.error("Erro ao registrar paciente:", error)
    throw error
  }
}

// Função para obter todos os pacientes
export async function getAllPatients(): Promise<Patient[]> {
  try {
    if (!ensureSupabaseConfigured()) {
      return mockPatients
    }

    const { data, error } = await supabase.from("patients").select("*").order("registered_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar pacientes:", error)
      return mockPatients
    }

    return Array.isArray(data) ? data.map(dbToPatient) : mockPatients
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error)
    return mockPatients
  }
}

// Função para obter um paciente pelo ID
export async function getPatientById(id: string): Promise<Patient | undefined> {
  try {
    if (!ensureSupabaseConfigured()) {
      return mockPatients.find((p) => p.id === id)
    }

    const { data, error } = await supabase.from("patients").select("*").eq("id", id).single()

    if (error) {
      console.error("Erro ao buscar paciente:", error)
      return mockPatients.find((p) => p.id === id)
    }

    return data ? dbToPatient(data) : undefined
  } catch (error) {
    console.error("Erro ao buscar paciente:", error)
    return mockPatients.find((p) => p.id === id)
  }
}

// Função para atualizar um paciente
export async function updatePatient(patient: Patient): Promise<void> {
  try {
    if (!ensureSupabaseConfigured()) {
      const index = mockPatients.findIndex((p) => p.id === patient.id)
      if (index !== -1) {
        mockPatients[index] = patient
      }
      return
    }

    const updateData: PatientUpdate = {
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      symptoms: patient.symptoms,
      priority: patient.priority,
      wait_time: patient.waitTime,
      current_step: patient.currentStep,
      completed_steps: patient.completedSteps || [],
      temperature: patient.temperature,
      blood_pressure: patient.bloodPressure,
      heart_rate: patient.heartRate,
      oxygen_saturation: patient.oxygenSaturation,
      pain_level: patient.painLevel,
      allergies: patient.allergies,
      medications: patient.medications,
      reevaluation_requested: patient.reevaluationRequest?.requested || false,
      reevaluation_reason: patient.reevaluationRequest?.reason,
      reevaluation_timestamp: patient.reevaluationRequest?.timestamp?.toISOString(),
      reevaluation_seen: patient.reevaluationRequest?.seen || false,
    }

    const { error } = await supabase.from("patients").update(updateData).eq("id", patient.id)

    if (error) {
      console.error("Erro ao atualizar paciente:", error)
      throw new Error("Erro ao atualizar paciente no banco de dados")
    }
  } catch (error) {
    console.error("Erro ao atualizar paciente:", error)
    throw error
  }
}

// Função para arquivar um paciente
export async function archivePatient(patient: Patient): Promise<void> {
  try {
    if (!ensureSupabaseConfigured()) {
      const index = mockPatients.findIndex((p) => p.id === patient.id)
      if (index !== -1) {
        mockPatients.splice(index, 1)
      }
      return
    }

    // Primeiro, inserir na tabela de arquivados
    const archivedData: ArchivedPatientInsert = {
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
      temperature: patient.temperature,
      blood_pressure: patient.bloodPressure,
      heart_rate: patient.heartRate,
      oxygen_saturation: patient.oxygenSaturation,
      pain_level: patient.painLevel,
      allergies: patient.allergies,
      medications: patient.medications,
      archived_at: new Date().toISOString(),
    }

    const { error: insertError } = await supabase.from("archived_patients").insert(archivedData)

    if (insertError) {
      console.error("Erro ao arquivar paciente:", insertError)
      throw new Error("Erro ao arquivar paciente")
    }

    // Depois, remover da tabela de pacientes ativos
    const { error: deleteError } = await supabase.from("patients").delete().eq("id", patient.id)

    if (deleteError) {
      console.error("Erro ao remover paciente da lista ativa:", deleteError)
      throw new Error("Erro ao remover paciente da lista ativa")
    }
  } catch (error) {
    console.error("Erro ao arquivar paciente:", error)
    throw error
  }
}

// Função para obter todos os pacientes arquivados
export async function getAllArchivedPatients(): Promise<Patient[]> {
  try {
    if (!ensureSupabaseConfigured()) {
      return []
    }

    const { data, error } = await supabase
      .from("archived_patients")
      .select("*")
      .order("archived_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar pacientes arquivados:", error)
      return []
    }

    return Array.isArray(data)
      ? data.map((item) => ({
          id: item.id,
          name: item.name,
          age: item.age,
          gender: item.gender,
          symptoms: item.symptoms,
          priority: item.priority as "Vermelho" | "Laranja" | "Amarelo" | "Verde" | "Azul",
          registeredAt: new Date(item.registered_at || ""),
          waitTime: item.wait_time || "",
          currentStep: item.current_step,
          completedSteps: Array.isArray(item.completed_steps) ? item.completed_steps : [],
          temperature: item.temperature,
          bloodPressure: item.blood_pressure,
          heartRate: item.heart_rate,
          oxygenSaturation: item.oxygen_saturation,
          painLevel: item.pain_level,
          allergies: item.allergies,
          medications: item.medications,
        }))
      : []
  } catch (error) {
    console.error("Erro ao buscar pacientes arquivados:", error)
    return []
  }
}

// Função para solicitar reavaliação
export async function requestReevaluation(patientId: string, reason: string): Promise<Patient | undefined> {
  try {
    if (!ensureSupabaseConfigured()) {
      const patient = mockPatients.find((p) => p.id === patientId)
      if (patient) {
        patient.reevaluationRequest = {
          requested: true,
          reason,
          timestamp: new Date(),
          seen: false,
        }
      }
      return patient
    }

    const { data, error } = await supabase
      .from("patients")
      .update({
        reevaluation_requested: true,
        reevaluation_reason: reason,
        reevaluation_timestamp: new Date().toISOString(),
        reevaluation_seen: false,
      })
      .eq("id", patientId)
      .select()
      .single()

    if (error) {
      console.error("Erro ao solicitar reavaliação:", error)
      return undefined
    }

    return data ? dbToPatient(data) : undefined
  } catch (error) {
    console.error("Erro ao solicitar reavaliação:", error)
    return undefined
  }
}

// Função para marcar uma solicitação de reavaliação como vista
export async function markReevaluationAsSeen(patientId: string): Promise<Patient | undefined> {
  try {
    if (!ensureSupabaseConfigured()) {
      const patient = mockPatients.find((p) => p.id === patientId)
      if (patient && patient.reevaluationRequest) {
        patient.reevaluationRequest.seen = true
      }
      return patient
    }

    const { data, error } = await supabase
      .from("patients")
      .update({
        reevaluation_seen: true,
      })
      .eq("id", patientId)
      .select()
      .single()

    if (error) {
      console.error("Erro ao marcar reavaliação como vista:", error)
      return undefined
    }

    return data ? dbToPatient(data) : undefined
  } catch (error) {
    console.error("Erro ao marcar reavaliação como vista:", error)
    return undefined
  }
}

// Função para atualizar a etapa atual de um paciente
export async function updatePatientStep(
  patientId: string,
  step: string,
  completedSteps: string[],
): Promise<Patient | undefined> {
  try {
    if (!ensureSupabaseConfigured()) {
      const patient = mockPatients.find((p) => p.id === patientId)
      if (patient) {
        patient.currentStep = step
        patient.completedSteps = completedSteps
      }
      return patient
    }

    const { data, error } = await supabase
      .from("patients")
      .update({
        current_step: step,
        completed_steps: completedSteps,
      })
      .eq("id", patientId)
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar etapa do paciente:", error)
      return undefined
    }

    return data ? dbToPatient(data) : undefined
  } catch (error) {
    console.error("Erro ao atualizar etapa do paciente:", error)
    return undefined
  }
}
