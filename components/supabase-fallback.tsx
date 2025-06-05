"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Database, ExternalLink } from "lucide-react"

export function SupabaseFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro de Configuração do Banco de Dados</strong>
            <br />
            As variáveis de ambiente do Supabase não foram encontradas.
          </AlertDescription>
        </Alert>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center mb-4">
            <Database className="h-5 w-5 mr-2 text-blue-600" />
            <h2 className="text-lg font-semibold">Configuração Necessária</h2>
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <p>Para usar este sistema, você precisa configurar as seguintes variáveis de ambiente:</p>

            <div className="bg-gray-50 p-3 rounded font-mono text-xs">
              <div>NEXT_PUBLIC_SUPABASE_URL</div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
              <div>SUPABASE_SERVICE_ROLE_KEY</div>
            </div>

            <p>
              Essas variáveis podem ser encontradas no painel do Supabase em <strong>Settings → API</strong>.
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <Button asChild variant="outline" size="sm">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Abrir Supabase
              </a>
            </Button>

            <Button onClick={() => window.location.reload()} size="sm">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
