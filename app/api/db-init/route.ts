import { NextResponse } from "next/server"

// Simulação de inicialização do banco de dados
let isInitialized = false
let initializationTime: Date | null = null

export async function POST() {
  try {
    console.log("Inicializando estrutura do banco de dados...")

    // Simular criação das tabelas
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simular criação da tabela de pacientes
    console.log("Criando tabela 'patients'...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Simular criação da tabela de funcionários
    console.log("Criando tabela 'staff'...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Simular criação da tabela de pacientes arquivados
    console.log("Criando tabela 'archived_patients'...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Simular inserção de dados iniciais
    console.log("Inserindo dados iniciais...")
    await new Promise((resolve) => setTimeout(resolve, 1000))

    isInitialized = true
    initializationTime = new Date()

    return NextResponse.json({
      status: "success",
      message: "Banco de dados inicializado com sucesso",
      timestamp: initializationTime.toISOString(),
      tables: {
        patients: {
          created: true,
          columns: [
            "id",
            "name",
            "age",
            "gender",
            "symptoms",
            "priority",
            "registered_at",
            "wait_time",
            "current_step",
            "completed_steps",
            "temperature",
            "blood_pressure",
            "heart_rate",
            "oxygen_saturation",
            "pain_level",
            "allergies",
            "medications",
            "reevaluation_requested",
            "reevaluation_reason",
            "reevaluation_timestamp",
            "reevaluation_seen",
          ],
          initialRecords: 5,
        },
        staff: {
          created: true,
          columns: ["id", "username", "password", "name", "role"],
          initialRecords: 3,
        },
        archived_patients: {
          created: true,
          columns: [
            "id",
            "name",
            "age",
            "gender",
            "symptoms",
            "priority",
            "registered_at",
            "wait_time",
            "current_step",
            "completed_steps",
            "temperature",
            "blood_pressure",
            "heart_rate",
            "oxygen_saturation",
            "pain_level",
            "allergies",
            "medications",
            "archived_at",
          ],
          initialRecords: 0,
        },
      },
    })
  } catch (error) {
    console.error("Erro ao inicializar banco de dados:", error)
    isInitialized = false

    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao inicializar banco de dados",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    initialized: isInitialized,
    initializationTime: initializationTime?.toISOString() || null,
    status: isInitialized ? "ready" : "not_initialized",
  })
}
