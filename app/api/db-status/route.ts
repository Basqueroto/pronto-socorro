import { NextResponse } from "next/server"

// Status da conexão
let connectionStatus = {
  connected: true,
  connectionId: Math.random().toString(36).substring(7),
  lastReconnect: new Date().toISOString(),
  uptime: Date.now(),
}

export async function GET() {
  try {
    // Simular verificação de conexão com banco de dados
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Calcular uptime
    const uptimeMs = Date.now() - connectionStatus.uptime
    const uptimeMinutes = Math.floor(uptimeMs / 60000)

    if (connectionStatus.connected) {
      return NextResponse.json({
        status: "connected",
        message: "Conexão ativa com o banco de dados",
        connectionId: connectionStatus.connectionId,
        lastReconnect: connectionStatus.lastReconnect,
        uptime: `${uptimeMinutes} minutos`,
        timestamp: new Date().toISOString(),
        database: {
          type: "PostgreSQL",
          version: "15.4",
          host: "localhost",
          port: 5432,
          name: "pronto_socorro_db",
          tables: ["patients", "staff", "archived_patients"],
          activeConnections: 3,
          maxConnections: 100,
        },
      })
    } else {
      return NextResponse.json(
        {
          status: "disconnected",
          message: "Banco de dados desconectado",
          lastError: "Connection timeout",
        },
        { status: 503 },
      )
    }
  } catch (error) {
    console.error("Erro ao verificar status do banco de dados:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao verificar status do banco de dados",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    // Simular reset da conexão
    connectionStatus = {
      connected: true,
      connectionId: Math.random().toString(36).substring(7),
      lastReconnect: new Date().toISOString(),
      uptime: Date.now(),
    }

    return NextResponse.json({
      status: "connected",
      message: "Status do banco de dados resetado",
      connectionId: connectionStatus.connectionId,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao resetar status",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
