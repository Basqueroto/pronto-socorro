"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserCog, ArrowLeft, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { isStaffAuthenticated, getCurrentStaffRole } from "@/lib/auth"
import { registerStaff } from "@/lib/staff-service-supabase"

// Esquema de validação do formulário
const formSchema = z.object({
  username: z.string().min(3, { message: "Nome de usuário deve ter pelo menos 3 caracteres" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  role: z.enum(["medico", "enfermeiro", "admin"], {
    required_error: "Selecione o cargo",
  }),
})

type FormValues = z.infer<typeof formSchema>

export default function CadastroFuncionarioPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [newStaffId, setNewStaffId] = useState("")

  // Configuração do formulário com React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      role: "enfermeiro",
    },
  })

  // Verificar se o funcionário está autenticado e é admin
  useEffect(() => {
    if (!isStaffAuthenticated()) {
      router.push("/login-funcionario")
    } else {
      setIsAuthenticated(true)
      const role = getCurrentStaffRole()
      if (role !== "admin") {
        router.push("/dashboard-funcionario")
      } else {
        setIsAdmin(true)
      }
    }
  }, [router])

  // Função para lidar com a submissão do formulário
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      // Registrar novo funcionário usando o serviço
      const newStaff = await registerStaff(data)
      setNewStaffId(newStaff.id)
      setIsSuccess(true)

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/dashboard-funcionario")
      }, 2000)
    } catch (error) {
      console.error("Erro ao cadastrar funcionário:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para voltar ao dashboard
  const handleBack = () => {
    router.push("/dashboard-funcionario")
  }

  if (!isAuthenticated || !isAdmin) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <UserCog className="h-6 w-6 mr-2" />
            <h1 className="text-xl md:text-2xl font-bold">Pronto-Socorro de Birigui - Cadastro de Funcionário</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleBack} className="text-white hover:text-blue-200">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-blue-800">Cadastro de Novo Funcionário</h2>
          <p className="text-blue-600">Preencha os dados para cadastrar um novo funcionário no sistema</p>
        </div>

        {isSuccess ? (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Funcionário cadastrado com sucesso!</AlertTitle>
            <AlertDescription className="text-green-700">
              <p>
                O funcionário foi cadastrado com o ID: <strong>{newStaffId}</strong>
              </p>
              <p>Redirecionando para o dashboard...</p>
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Informações do Funcionário</CardTitle>
                <CardDescription>Dados de acesso e identificação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" {...form.register("name")} placeholder="Nome do funcionário" />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input id="username" {...form.register("username")} placeholder="Nome de usuário para login" />
                  {form.formState.errors.username && (
                    <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" {...form.register("password")} placeholder="Senha para acesso" />
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Cargo</Label>
                  <Select
                    defaultValue={form.getValues("role")}
                    onValueChange={(value) => form.setValue("role", value as "medico" | "enfermeiro" | "admin")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medico">Médico</SelectItem>
                      <SelectItem value="enfermeiro">Enfermeiro</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.role && (
                    <p className="text-sm text-red-500">{form.formState.errors.role.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleBack}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  {isSubmitting ? "Cadastrando..." : "Cadastrar Funcionário"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </main>

      <footer className="mt-8 py-6 text-center text-blue-600 text-sm">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Secretaria de Saúde de Birigui</p>
        </div>
      </footer>
    </div>
  )
}
