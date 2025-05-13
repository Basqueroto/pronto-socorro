import { dbManager, type Staff } from "./db"

// Interface para o resultado da autenticação
export interface AuthResult {
  success: boolean
  message?: string
  staff?: Staff
}

// Interface para o resultado da verificação de paciente
export interface PatientVerificationResult {
  success: boolean
  message?: string
  patientId?: string
}

// Função para autenticar funcionário
export async function authenticateStaff(username: string, password: string): Promise<AuthResult> {
  // Simular um atraso de rede
  await new Promise((resolve) => setTimeout(resolve, 800))

  try {
    const staff = dbManager.verifyStaffCredentials(username, password)

    if (staff) {
      return {
        success: true,
        staff,
      }
    } else {
      return {
        success: false,
        message: "Credenciais inválidas. Por favor, verifique seu usuário e senha.",
      }
    }
  } catch (error) {
    console.error("Erro na autenticação:", error)
    return {
      success: false,
      message: "Ocorreu um erro durante a autenticação. Tente novamente.",
    }
  }
}

// Função para verificar ID do paciente
export async function verifyPatientId(patientId: string): Promise<PatientVerificationResult> {
  // Simular um atraso de rede
  await new Promise((resolve) => setTimeout(resolve, 800))

  try {
    // Verificar se o ID está no formato correto
    if (!patientId.startsWith("PS") || patientId.length < 7) {
      return {
        success: false,
        message: "Formato de ID inválido. O ID deve começar com 'PS' seguido de números.",
      }
    }

    const patient = dbManager.getPatientById(patientId)

    if (patient) {
      return {
        success: true,
        patientId: patient.id,
      }
    } else {
      return {
        success: false,
        message: "ID de paciente não encontrado. Por favor, verifique o número informado.",
      }
    }
  } catch (error) {
    console.error("Erro na verificação do paciente:", error)
    return {
      success: false,
      message: "Ocorreu um erro durante a verificação. Tente novamente.",
    }
  }
}

// Função para salvar a sessão do funcionário
export function saveStaffSession(staff: Staff): void {
  localStorage.setItem("staffId", staff.id)
  localStorage.setItem("staffRole", staff.role)
  localStorage.setItem("staffUsername", staff.username)
}

// Função para salvar a sessão do paciente
export function savePatientSession(patientId: string): void {
  localStorage.setItem("currentPatientId", patientId)
}

// Função para encerrar a sessão do funcionário
export function clearStaffSession(): void {
  localStorage.removeItem("staffId")
  localStorage.removeItem("staffRole")
  localStorage.removeItem("staffUsername")
}

// Função para encerrar a sessão do paciente
export function clearPatientSession(): void {
  localStorage.removeItem("currentPatientId")
}

// Função para verificar se o funcionário está autenticado
export function isStaffAuthenticated(): boolean {
  return !!localStorage.getItem("staffId")
}

// Função para verificar se o paciente está autenticado
export function isPatientAuthenticated(): boolean {
  return !!localStorage.getItem("currentPatientId")
}

// Função para obter o ID do funcionário atual
export function getCurrentStaffId(): string | null {
  return localStorage.getItem("staffId")
}

// Função para obter o papel do funcionário atual
export function getCurrentStaffRole(): string | null {
  return localStorage.getItem("staffRole")
}

// Função para obter o ID do paciente atual
export function getCurrentPatientId(): string | null {
  return localStorage.getItem("currentPatientId")
}
