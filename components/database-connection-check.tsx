"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, Database, CheckCircle } from "lucide-react"
import { SupabaseConfigDialog } from "./supabase-config-dialog"

export function DatabaseConnectionCheck({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkConnection = async () => {
    try {
      // Verificar se as variáveis de ambiente estão configuradas
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        setIsConnected(false)
        setError("Variáveis de ambiente do Supabase não configuradas")
        return
      }

      // Testar conexão real
      const response = await fetch("/api/test-supabase-connection")
      const result = await response.json()

      if (result.connected) {
        setIsConnected(true)
        setError(null)
      } else {
        setIsConnected(false)
        setError(result.error || "Erro na conexão com Supabase")
      }
    } catch (err) {
      setIsConnected(false)
      setError("Erro ao verificar conexão: " + (err instanceof Error ? err.message : String(err)))
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  if (isConnected === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Database className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Verificando conexão com banco de dados...</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Banco de dados não conectado</p>
                <p className="text-sm">{error}</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button onClick={() => setShowConfig(true)} className="w-full">
              <Database className="h-4 w-4 mr-2" />
              Configurar Supabase
            </Button>
            <Button variant="outline" onClick={checkConnection} className="w-full">
              Tentar Novamente
            </Button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Como configurar:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Crie uma conta no Supabase</li>
              <li>2. Crie um novo projeto</li>
              <li>3. Copie as credenciais do projeto</li>
              <li>4. Configure usando o botão acima</li>
            </ol>
          </div>
        </div>

        <SupabaseConfigDialog open={showConfig} onOpenChange={setShowConfig} onConfigSaved={checkConnection} />
      </div>
    )
  }

  return (
    <div>
      <div className="bg-green-50 border-green-200 border p-2 mb-4">
        <div className="flex items-center text-green-800">
          <CheckCircle className="h-4 w-4 mr-2" />
          <span className="text-sm">Conectado ao Supabase</span>
        </div>
      </div>
      {children}
    </div>
  )
}
