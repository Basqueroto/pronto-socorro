"use client"

import { useState, type FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertCircle, UserRound } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { verifyPatientId, savePatientSession } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [patientId, setPatientId] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Garantir que o componente só renderize completamente no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Verificar ID do paciente usando o serviço de autenticação
      const result = await verifyPatientId(patientId)

      if (result.success && result.patientId) {
        // Salvar sessão do paciente
        savePatientSession(result.patientId)
        // Redirecionar para a página do paciente
        router.push(`/paciente/${result.patientId}`)
      } else {
        setError(result.message || "ID de paciente inválido")
      }
    } catch (error) {
      console.error("Erro ao verificar paciente:", error)
      setError("Ocorreu um erro durante a verificação. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  // Não renderizar o conteúdo completo até que o componente esteja montado no cliente
  if (!mounted) {
    return (
      <div className="patient-theme min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="patient-theme min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Pronto-Socorro de Birigui</h1>
          <p className="text-blue-600 mt-2">Sistema de Acompanhamento de Pacientes</p>
        </div>

        <Card className="border-2 border-blue-100 shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="p-2 rounded-full bg-blue-100">
                <UserRound className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Acesso do Paciente</CardTitle>
            <CardDescription className="text-center">
              Digite o número de identificação do paciente fornecido na recepção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientId">Número do Paciente</Label>
                  <Input
                    id="patientId"
                    placeholder="Ex: PS12345"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    required
                    className="text-lg py-6"
                  />
                  <p className="text-xs text-muted-foreground">
                    O número do paciente está no comprovante de atendimento
                  </p>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full py-6" disabled={loading}>
                  {loading ? "Verificando..." : "Acessar"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-xs text-center text-muted-foreground mt-2">
              Para fins de demonstração, use: PS12345, PS67890, PS54321
            </p>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="link" onClick={() => router.push("/")} className="text-blue-600">
            Voltar para a página inicial
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-blue-600">
          <p>Em caso de dificuldades, procure o balcão de atendimento</p>
          <p className="mt-1">© {new Date().getFullYear()} Secretaria de Saúde de Birigui</p>
        </div>
      </div>
    </div>
  )
}
