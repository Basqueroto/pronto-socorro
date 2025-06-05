"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { UserCog, ArrowLeft, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { isStaffAuthenticated } from "@/lib/auth"
import { registerPatient } from "@/lib/patient-service-supabase"

// Esquema de validação do formulário
const formSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  age: z.string().refine((val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) > 0, {
    message: "Idade deve ser um número positivo",
  }),
  gender: z.enum(["masculino", "feminino", "outro"], {
    required_error: "Selecione o gênero",
  }),
  symptoms: z.string().min(5, { message: "Descreva os sintomas com pelo menos 5 caracteres" }),
  temperature: z.string().optional(),
  bloodPressure: z.string().optional(),
  heartRate: z.string().optional(),
  oxygenSaturation: z.string().optional(),
  painLevel: z.string().optional(),
  priority: z.enum(["Vermelho", "Laranja", "Amarelo", "Verde", "Azul"], {
    required_error: "Selecione a prioridade",
  }),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  hasEmergencySigns: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

export default function CadastroPacientePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [newPatientId, setNewPatientId] = useState("")
  const [selectedPainLevel, setSelectedPainLevel] = useState("0")
  const [hasEmergencySigns, setHasEmergencySigns] = useState(false)

  // Configuração do formulário com React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: "",
      gender: "masculino",
      symptoms: "",
      temperature: "",
      bloodPressure: "",
      heartRate: "",
      oxygenSaturation: "",
      painLevel: "0",
      priority: "Verde",
      allergies: "",
      medications: "",
      hasEmergencySigns: false,
    },
  })

  // Verificar se o funcionário está autenticado
  useEffect(() => {
    if (!isStaffAuthenticated()) {
      router.push("/login-funcionario")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  // Função para lidar com a submissão do formulário
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      // Registrar novo paciente usando o serviço
      const newPatient = await registerPatient(data)
      setNewPatientId(newPatient.id)
      setIsSuccess(true)

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/dashboard-funcionario")
      }, 2000)
    } catch (error) {
      console.error("Erro ao cadastrar paciente:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para voltar ao dashboard
  const handleBack = () => {
    router.push("/dashboard-funcionario")
  }

  // Função para selecionar o nível de dor
  const handlePainLevelSelect = (level: string) => {
    setSelectedPainLevel(level)
    form.setValue("painLevel", level)
  }

  // Função para alternar os sinais de emergência
  const handleEmergencySignsToggle = (checked: boolean) => {
    setHasEmergencySigns(checked)
    form.setValue("hasEmergencySigns", checked)
    if (checked) {
      form.setValue("priority", "Vermelho")
    }
  }

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <header className="bg-emerald-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <UserCog className="h-6 w-6 mr-2" />
            <h1 className="text-xl md:text-2xl font-bold">Pronto-Socorro de Birigui - Cadastro de Paciente</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleBack} className="text-white hover:text-emerald-200">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-emerald-800">Cadastro e Triagem de Paciente</h2>
          <p className="text-emerald-600">Preencha os dados do paciente e realize a classificação de risco</p>
        </div>

        {isSuccess ? (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Paciente cadastrado com sucesso!</AlertTitle>
            <AlertDescription className="text-green-700">
              <p>
                O paciente foi cadastrado e classificado com o ID: <strong>{newPatientId}</strong>
              </p>
              <p>Redirecionando para o dashboard...</p>
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>Dados básicos do paciente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" {...form.register("name")} placeholder="Nome do paciente" />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Idade</Label>
                      <Input id="age" {...form.register("age")} placeholder="Idade" />
                      {form.formState.errors.age && (
                        <p className="text-sm text-red-500">{form.formState.errors.age.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gênero</Label>
                      <Select
                        defaultValue={form.getValues("gender")}
                        onValueChange={(value) => form.setValue("gender", value as "masculino" | "feminino" | "outro")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="symptoms">Queixa Principal / Sintomas</Label>
                    <Textarea
                      id="symptoms"
                      {...form.register("symptoms")}
                      placeholder="Descreva os sintomas e queixas do paciente"
                      className="min-h-[100px]"
                    />
                    {form.formState.errors.symptoms && (
                      <p className="text-sm text-red-500">{form.formState.errors.symptoms.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Checkbox
                          id="emergency-signs"
                          checked={hasEmergencySigns}
                          onCheckedChange={(checked) => handleEmergencySignsToggle(!!checked)}
                          className="h-6 w-6 border-2 border-red-400 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                        {hasEmergencySigns && (
                          <div className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <Label htmlFor="emergency-signs" className="text-red-600 font-medium flex items-center">
                        Sinais de emergência presentes
                        {hasEmergencySigns && (
                          <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">ATIVO</span>
                        )}
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Marque se houver comprometimento de vias aéreas, respiração, circulação ou nível de consciência
                    </p>
                    {hasEmergencySigns && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                        Atenção: Ao marcar esta opção, o paciente será automaticamente classificado como prioridade
                        VERMELHA (Emergência)
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sinais Vitais e Classificação */}
              <Card>
                <CardHeader>
                  <CardTitle>Sinais Vitais e Classificação</CardTitle>
                  <CardDescription>Dados para triagem do paciente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperatura (°C)</Label>
                      <Input id="temperature" {...form.register("temperature")} placeholder="36.5" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bloodPressure">Pressão Arterial (mmHg)</Label>
                      <Input id="bloodPressure" {...form.register("bloodPressure")} placeholder="120/80" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="heartRate">Frequência Cardíaca (bpm)</Label>
                      <Input id="heartRate" {...form.register("heartRate")} placeholder="70" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="oxygenSaturation">Saturação O₂ (%)</Label>
                      <Input id="oxygenSaturation" {...form.register("oxygenSaturation")} placeholder="98" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nível de Dor (0-10)</Label>
                    <div className="flex flex-wrap gap-2">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handlePainLevelSelect(level.toString())}
                          className={`h-12 w-12 rounded-full flex items-center justify-center cursor-pointer border-2 transition-all ${
                            selectedPainLevel === level.toString()
                              ? level >= 8
                                ? "bg-red-500 border-red-700 text-white font-bold shadow-md shadow-red-200 scale-110"
                                : level >= 4
                                  ? "bg-yellow-500 border-yellow-700 text-white font-bold shadow-md shadow-yellow-200 scale-110"
                                  : "bg-green-500 border-green-700 text-white font-bold shadow-md shadow-green-200 scale-110"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {level}
                          {selectedPainLevel === level.toString() && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full"></span>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 text-sm">
                      Nível selecionado:{" "}
                      <span
                        className={`font-bold ${
                          Number.parseInt(selectedPainLevel) >= 8
                            ? "text-red-600"
                            : Number.parseInt(selectedPainLevel) >= 4
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {selectedPainLevel}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Alergias</Label>
                    <Input id="allergies" {...form.register("allergies")} placeholder="Alergias conhecidas" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medications">Medicamentos em uso</Label>
                    <Input
                      id="medications"
                      {...form.register("medications")}
                      placeholder="Medicamentos que o paciente utiliza"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Classificação de Risco</Label>
                    <Select
                      value={form.getValues("priority")}
                      onValueChange={(value) =>
                        form.setValue("priority", value as "Vermelho" | "Laranja" | "Amarelo" | "Verde" | "Azul")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vermelho" className="text-red-600 font-medium">
                          Vermelho - Emergência
                        </SelectItem>
                        <SelectItem value="Laranja" className="text-orange-600 font-medium">
                          Laranja - Muito Urgente
                        </SelectItem>
                        <SelectItem value="Amarelo" className="text-yellow-600 font-medium">
                          Amarelo - Urgente
                        </SelectItem>
                        <SelectItem value="Verde" className="text-green-600 font-medium">
                          Verde - Pouco Urgente
                        </SelectItem>
                        <SelectItem value="Azul" className="text-blue-600 font-medium">
                          Azul - Não Urgente
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      A classificação é sugerida com base nos dados, mas pode ser alterada pelo profissional
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <CardFooter className="flex justify-between mt-6 px-0">
              <Button type="button" variant="outline" onClick={handleBack}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
                {isSubmitting ? "Cadastrando..." : "Cadastrar Paciente"}
              </Button>
            </CardFooter>
          </form>
        )}
      </main>

      <footer className="mt-8 py-6 text-center text-emerald-600 text-sm">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Secretaria de Saúde de Birigui</p>
        </div>
      </footer>
    </div>
  )
}
