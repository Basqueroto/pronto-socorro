import { verifyStaffCredentials, getStaffByUsername, type Staff } from "./staff-service"
import { getPatientById } from "./patient-service"

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

// Função para verificar se estamos no cliente
export function isClient(): boolean {
  return typeof window !== "undefined"
}

// Função para autenticar funcionário
export async function authenticateStaff(username: string, password: string): Promise<AuthResult> {
  // Simular um atraso de rede
  await new Promise((resolve) => setTimeout(resolve, 800))

  try {
    console.log(`Tentando autenticar: ${username}`)
    const staff = await verifyStaffCredentials(username, password)

    if (staff) {
      console.log(`Autenticação bem-sucedida para: ${username}`)
      return {
        success: true,
        staff,
      }
    } else {
      console.log(`Autenticação falhou para: ${username}`)
      // Verificar se o usuário existe mas a senha está errada
      const staffExists = await getStaffByUsername(username)
      if (staffExists) {
        console.log(`Usuário ${username} existe, mas a senha está incorreta`)
        return {
          success: false,
          message: "Senha incorreta. Por favor, verifique sua senha.",
        }
      }

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

    const patient = await getPatientById(patientId)

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
  if (!isClient()) return

  localStorage.setItem("staffId", staff.id)
  localStorage.setItem("staffRole", staff.role)
  localStorage.setItem("staffUsername", staff.username)
  localStorage.setItem("staffName", staff.name)
}

// Função para salvar a sessão do paciente
export function savePatientSession(patientId: string): void {
  if (!isClient()) return

  localStorage.setItem("currentPatientId", patientId)
}

// Função para encerrar a sessão do funcionário
export function clearStaffSession(): void {
  if (!isClient()) return

  localStorage.removeItem("staffId")
  localStorage.removeItem("staffRole")
  localStorage.removeItem("staffUsername")
  localStorage.removeItem("staffName")
}

// Função para encerrar a sessão do paciente
export function clearPatientSession(): void {
  if (!isClient()) return

  localStorage.removeItem("currentPatientId")
}

// Função para verificar se o funcionário está autenticado
export function isStaffAuthenticated(): boolean {
  if (!isClient()) return false

  return !!localStorage.getItem("staffId")
}

// Função para verificar se o paciente está autenticado
export function isPatientAuthenticated(): boolean {
  if (!isClient()) return false

  return !!localStorage.getItem("currentPatientId")
}

// Função para obter o ID do funcionário atual
export function getCurrentStaffId(): string | null {
  if (!isClient()) return null

  return localStorage.getItem("staffId")
}

// Função para obter o papel do funcionário atual
export function getCurrentStaffRole(): string | null {
  if (!isClient()) return null

  return localStorage.getItem("staffRole")
}

// Função para obter o nome do funcionário atual
export function getCurrentStaffName(): string | null {
  if (!isClient()) return null

  return localStorage.getItem("staffName")
}

// Função para obter o ID do paciente atual
export function getCurrentPatientId(): string | null {
  if (!isClient()) return null

  return localStorage.getItem("currentPatientId")
}
