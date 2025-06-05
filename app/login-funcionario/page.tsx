"use client"

import { useState, type FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertCircle, UserCog } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authenticateStaff, saveStaffSession } from "@/lib/auth"

export default function LoginFuncionarioPage() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })
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
      // Autenticar funcionário usando o serviço de autenticação
      const result = await authenticateStaff(credentials.username, credentials.password)

      if (result.success && result.staff) {
        // Salvar sessão do funcionário
        saveStaffSession(result.staff)
        // Redirecionar para o dashboard do funcionário
        router.push("/dashboard-funcionario")
      } else {
        setError(result.message || "Erro de autenticação")
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      setError("Ocorreu um erro durante o login. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const isClient = () => typeof window !== "undefined"

  // Adicionar um botão para limpar o banco de dados e reiniciar

  // Não renderizar o conteúdo completo até que o componente esteja montado no cliente
  if (!mounted) {
    return (
      <div className="staff-theme min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="staff-theme min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Pronto-Socorro de Birigui</h1>
          <p className="text-blue-600 mt-2">Acesso de Funcionários</p>
        </div>

        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="p-2 rounded-full bg-blue-100">
                <UserCog className="h-8 w-8 text-blue-700" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Login de Funcionário</CardTitle>
            <CardDescription className="text-center">Digite suas credenciais para acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuário</Label>
                  <Input
                    id="username"
                    placeholder="Seu nome de usuário"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Verificando..." : "Entrar"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-xs text-center text-muted-foreground mt-2">
              Para fins de demonstração, use: enfermeiro/123456 ou medico/123456
            </p>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="link" onClick={() => router.push("/")} className="text-blue-600">
            Voltar para a página inicial
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-blue-600">
          <p>© {new Date().getFullYear()} Secretaria de Saúde de Birigui</p>
        </div>
      </div>
    </div>
  )
}
