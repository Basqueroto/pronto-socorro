import { NextResponse } from "next/server"

// Simulação de dados de pacientes
// Em um ambiente real, estes dados viriam do banco de dados
let patients: any[] = [
  {
    id: "PS12345",
    name: "João Silva",
    age: 45,
    gender: "Masculino",
    symptoms: "Dor no peito e falta de ar",
    priority: "Vermelho",
    registered_at: new Date(Date.now() - 15 * 60000).toISOString(),
    wait_time: "Imediato",
    current_step: "consulta",
    completed_steps: ["recepcao", "triagem"],
    temperature: "37.8",
    blood_pressure: "150/90",
    heart_rate: "95",
    oxygen_saturation: "94",
    pain_level: "8",
    allergies: "Penicilina",
    medications: "Losartana",
    reevaluation_requested: false,
    reevaluation_reason: null,
    reevaluation_timestamp: null,
    reevaluation_seen: false,
  },
  {
    id: "PS67890",
    name: "Maria Oliveira",
    age: 32,
    gender: "Feminino",
    symptoms: "Febre alta e dor de cabeça intensa",
    priority: "Laranja",
    registered_at: new Date(Date.now() - 45 * 60000).toISOString(),
    wait_time: "10 minutos",
    current_step: "triagem",
    completed_steps: ["recepcao"],
    temperature: "39.2",
    blood_pressure: "120/80",
    heart_rate: "88",
    oxygen_saturation: "97",
    pain_level: "7",
    allergies: "Nenhuma",
    medications: "Nenhum",
    reevaluation_requested: true,
    reevaluation_reason: "Minha dor de cabeça piorou muito e estou com náuseas",
    reevaluation_timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    reevaluation_seen: false,
  },
  {
    id: "PS54321",
    name: "Pedro Santos",
    age: 28,
    gender: "Masculino",
    symptoms: "Corte profundo no braço",
    priority: "Amarelo",
    registered_at: new Date(Date.now() - 60 * 60000).toISOString(),
    wait_time: "30 minutos",
    current_step: "espera",
    completed_steps: ["recepcao", "triagem"],
    temperature: "36.5",
    blood_pressure: "130/85",
    heart_rate: "75",
    oxygen_saturation: "98",
    pain_level: "6",
    allergies: "Nenhuma",
    medications: "Nenhum",
    reevaluation_requested: false,
    reevaluation_reason: null,
    reevaluation_timestamp: null,
    reevaluation_seen: false,
  },
  {
    id: "PS24680",
    name: "Ana Souza",
    age: 65,
    gender: "Feminino",
    symptoms: "Dor nas costas",
    priority: "Verde",
    registered_at: new Date(Date.now() - 90 * 60000).toISOString(),
    wait_time: "1 hora",
    current_step: "espera",
    completed_steps: ["recepcao", "triagem"],
    temperature: "36.2",
    blood_pressure: "140/90",
    heart_rate: "72",
    oxygen_saturation: "98",
    pain_level: "4",
    allergies: "Nenhuma",
    medications: "Nenhum",
    reevaluation_requested: false,
    reevaluation_reason: null,
    reevaluation_timestamp: null,
    reevaluation_seen: false,
  },
  {
    id: "PS13579",
    name: "Carlos Ferreira",
    age: 18,
    gender: "Masculino",
    symptoms: "Dor de garganta leve",
    priority: "Azul",
    registered_at: new Date(Date.now() - 120 * 60000).toISOString(),
    wait_time: "2 horas",
    current_step: "recepcao",
    completed_steps: ["recepcao"],
    temperature: "36.8",
    blood_pressure: "110/70",
    heart_rate: "68",
    oxygen_saturation: "99",
    pain_level: "2",
    allergies: "Nenhuma",
    medications: "Nenhum",
    reevaluation_requested: false,
    reevaluation_reason: null,
    reevaluation_timestamp: null,
    reevaluation_seen: false,
  },
]

export async function GET() {
  try {
    // Garantir que sempre retornamos um array
    const safePatients = Array.isArray(patients) ? patients : []

    return NextResponse.json({
      status: "success",
      patients: safePatients,
    })
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao buscar pacientes",
        patients: [], // Retornar array vazio em caso de erro
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { patient } = await request.json()

    // Garantir que patients é um array
    if (!Array.isArray(patients)) {
      patients = []
    }

    // Adicionar o paciente à lista
    patients.push(patient)

    return NextResponse.json({
      status: "success",
      message: "Paciente adicionado com sucesso",
      patient: patient,
    })
  } catch (error) {
    console.error("Erro ao adicionar paciente:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao adicionar paciente",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
