import { NextResponse } from "next/server"

// Simulação de dados de funcionários
const staff: any[] = [
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
]

export async function GET() {
  try {
    return NextResponse.json({
      status: "success",
      staff: staff,
    })
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao buscar funcionários",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { staff: newStaff } = await request.json()

    // Verificar se o username já existe
    const existingStaff = staff.find((s) => s.username === newStaff.username)
    if (existingStaff) {
      return NextResponse.json(
        {
          status: "error",
          message: "Nome de usuário já existe",
        },
        { status: 400 },
      )
    }

    // Adicionar o funcionário à lista
    staff.push(newStaff)

    return NextResponse.json({
      status: "success",
      message: "Funcionário adicionado com sucesso",
      staff: newStaff,
    })
  } catch (error) {
    console.error("Erro ao adicionar funcionário:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao adicionar funcionário",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
