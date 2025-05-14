import { dbManager, type Patient } from "./db"

// Função para calcular a prioridade com base nos sintomas e sinais vitais
export function calculatePriority(data: any): "Vermelho" | "Laranja" | "Amarelo" | "Verde" | "Azul" {
  // Verificar sinais de emergência
  if (data.hasEmergencySigns) {
    return "Vermelho"
  }

  // Verificar temperatura
  const temp = Number.parseFloat(data.temperature || "36.5")
  if (temp > 39.5 || temp < 35) {
    return "Laranja"
  }

  // Verificar pressão arterial
  const bp = data.bloodPressure || "120/80"
  const systolic = Number.parseInt(bp.split("/")[0])
  if (systolic > 180 || systolic < 90) {
    return "Laranja"
  }

  // Verificar nível de dor
  const pain = Number.parseInt(data.painLevel || "0")
  if (pain >= 8) {
    return "Laranja"
  } else if (pain >= 5) {
    return "Amarelo"
  } else if (pain >= 3) {
    return "Verde"
  }

  // Verificar saturação de oxigênio
  const o2 = Number.parseInt(data.oxygenSaturation || "98")
  if (o2 < 92) {
    return "Laranja"
  } else if (o2 < 95) {
    return "Amarelo"
  }

  // Verificar frequência cardíaca
  const hr = Number.parseInt(data.heartRate || "70")
  if (hr > 120 || hr < 50) {
    return "Amarelo"
  }

  // Padrão para casos não urgentes
  return "Verde"
}

// Função para calcular o tempo estimado de espera com base na prioridade
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
  const randomNum = Math.floor(10000 + Math.random() * 90000) // Número de 5 dígitos
  return `${prefix}${randomNum}`
}

// Função para registrar um novo paciente
export async function registerPatient(data: any): Promise<Patient> {
  // Simular um atraso de rede
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Calcular prioridade com base nos dados
  const calculatedPriority = calculatePriority(data)

  // Gerar ID único para o paciente
  const patientId = generatePatientId()

  // Criar objeto do paciente
  const newPatient: Patient = {
    id: patientId,
    name: data.name,
    age: Number.parseInt(data.age),
    gender: data.gender,
    symptoms: data.symptoms,
    priority: calculatedPriority as "Vermelho" | "Laranja" | "Amarelo" | "Verde" | "Azul",
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

  // Adicionar paciente ao banco de dados
  dbManager.addPatient(newPatient)

  return newPatient
}

// Função para obter todos os pacientes
export function getAllPatients(): Patient[] {
  return dbManager.getAllPatients()
}

// Função para obter um paciente pelo ID
export function getPatientById(id: string): Patient | undefined {
  return dbManager.getPatientById(id)
}

// Função para atualizar um paciente
export function updatePatient(patient: Patient): void {
  dbManager.updatePatient(patient)
}

// Função para arquivar um paciente
export function archivePatient(patient: Patient): void {
  dbManager.archivePatient(patient)
}

// Função para obter todos os pacientes arquivados
export function getAllArchivedPatients(): Patient[] {
  return dbManager.getAllArchivedPatients()
}

// Função para solicitar reavaliação
export function requestReevaluation(patientId: string, reason: string): Patient | undefined {
  const patient = dbManager.getPatientById(patientId)

  if (!patient) return undefined

  const updatedPatient = {
    ...patient,
    reevaluationRequest: {
      requested: true,
      reason,
      timestamp: new Date(),
      seen: false,
    },
  }

  dbManager.updatePatient(updatedPatient)
  return updatedPatient
}

// Função para marcar uma solicitação de reavaliação como vista
export function markReevaluationAsSeen(patientId: string): Patient | undefined {
  const patient = dbManager.getPatientById(patientId)

  if (!patient || !patient.reevaluationRequest) return undefined

  const updatedPatient = {
    ...patient,
    reevaluationRequest: {
      ...patient.reevaluationRequest,
      seen: true,
    },
  }

  dbManager.updatePatient(updatedPatient)
  return updatedPatient
}

// Função para atualizar a etapa atual de um paciente
export function updatePatientStep(patientId: string, step: string, completedSteps: string[]): Patient | undefined {
  const patient = dbManager.getPatientById(patientId)

  if (!patient) return undefined

  const updatedPatient = {
    ...patient,
    currentStep: step,
    completedSteps,
  }

  dbManager.updatePatient(updatedPatient)
  return updatedPatient
}
