import { NextResponse } from "next/server"

// Esta seria a mesma lista de pacientes da rota principal
// Em um ambiente real, você acessaria o banco de dados
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
]

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Garantir que patients é um array
    const safePatients = Array.isArray(patients) ? patients : []
    const patient = safePatients.find((p) => p.id === params.id)

    if (!patient) {
      return NextResponse.json(
        {
          status: "error",
          message: "Paciente não encontrado",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      status: "success",
      patient: patient,
    })
  } catch (error) {
    console.error("Erro ao buscar paciente:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao buscar paciente",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { patient } = await request.json()

    // Garantir que patients é um array
    if (!Array.isArray(patients)) {
      patients = []
    }

    const index = patients.findIndex((p) => p.id === params.id)
    if (index === -1) {
      return NextResponse.json(
        {
          status: "error",
          message: "Paciente não encontrado",
        },
        { status: 404 },
      )
    }

    patients[index] = patient

    return NextResponse.json({
      status: "success",
      message: "Paciente atualizado com sucesso",
      patient: patient,
    })
  } catch (error) {
    console.error("Erro ao atualizar paciente:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao atualizar paciente",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Garantir que patients é um array
    if (!Array.isArray(patients)) {
      patients = []
    }

    const index = patients.findIndex((p) => p.id === params.id)
    if (index === -1) {
      return NextResponse.json(
        {
          status: "error",
          message: "Paciente não encontrado",
        },
        { status: 404 },
      )
    }

    patients.splice(index, 1)

    return NextResponse.json({
      status: "success",
      message: "Paciente excluído com sucesso",
    })
  } catch (error) {
    console.error("Erro ao excluir paciente:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao excluir paciente",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
