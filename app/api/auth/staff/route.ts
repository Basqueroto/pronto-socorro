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

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Buscar funcionário por username e password
    const foundStaff = staff.find((s) => s.username === username && s.password === password)

    if (!foundStaff) {
      return NextResponse.json(
        {
          status: "error",
          message: "Credenciais inválidas",
        },
        { status: 401 },
      )
    }

    return NextResponse.json({
      status: "success",
      message: "Autenticação bem-sucedida",
      staff: foundStaff,
    })
  } catch (error) {
    console.error("Erro na autenticação:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Erro na autenticação",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
