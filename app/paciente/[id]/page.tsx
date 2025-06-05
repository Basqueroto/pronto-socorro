"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Timeline } from "@/components/ui/timeline"
import { UserRound, Clock, LogOut, AlertCircle, FileText, Stethoscope, Pill, Home, AlertTriangle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Clock as ClockComponent } from "@/components/clock"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { isPatientAuthenticated, clearPatientSession, getCurrentPatientId } from "@/lib/auth"
import { getPatientById, updatePatientStep, requestReevaluation } from "@/lib/patient-service-supabase"
import { isClient } from "@/lib/utils"

// Interface para os tempos do protocolo de Manchester
interface ManchesterTimes {
  [key: string]: number // minutos para cada prioridade
}

export default function PatientProfilePage() {
  const router = useRouter()
  const params = useParams()
  const patientId = params.id as string

  const [patient, setPatient] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [isReevaluationDialogOpen, setIsReevaluationDialogOpen] = useState(false)
  const [reevaluationReason, setReevaluationReason] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isSubmittingReevaluation, setIsSubmittingReevaluation] = useState(false)

  // Etapas do atendimento
  const steps = [
    { id: "recepcao", label: "Recepção", icon: UserRound },
    { id: "triagem", label: "Triagem", icon: AlertCircle },
    { id: "espera", label: "Espera", icon: Clock },
    { id: "consulta", label: "Consulta", icon: Stethoscope },
    { id: "medicacao", label: "Medicação", icon: Pill },
    { id: "alta", label: "Alta", icon: Home },
  ]

  // Tempos de atendimento conforme protocolo de Manchester
  const manchesterWaitTimes: { [key: string]: ManchesterTimes } = {
    recepcao: { Vermelho: 0, Laranja: 5, Amarelo: 10, Verde: 15, Azul: 20 },
    triagem: { Vermelho: 0, Laranja: 5, Amarelo: 10, Verde: 15, Azul: 20 },
    espera: { Vermelho: 5, Laranja: 15, Amarelo: 30, Verde: 60, Azul: 120 },
    consulta: { Vermelho: 30, Laranja: 30, Amarelo: 30, Verde: 30, Azul: 30 },
    medicacao: { Vermelho: 30, Laranja: 30, Amarelo: 20, Verde: 15, Azul: 10 },
    alta: { Vermelho: 0, Laranja: 0, Amarelo: 0, Verde: 0, Azul: 0 },
  }

  // Garantir que o componente só renderize completamente no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Função para formatar a data
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Data não disponível"

    try {
      const dateObj = typeof date === "string" ? new Date(date) : date
      if (isNaN(dateObj.getTime())) return "Data inválida"

      return dateObj.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Erro ao formatar data:", error)
      return "Data inválida"
    }
  }

  // Carregar dados do paciente
  useEffect(() => {
    if (!isClient()) return

    const storedPatientId = getCurrentPatientId()

    // Verificar se o usuário está autenticado
    if (!isPatientAuthenticated() || storedPatientId !== patientId) {
      router.push("/login")
      return
    }

    // Buscar dados do paciente do banco de dados
    const fetchPatient = async () => {
      try {
        const patientData = await getPatientById(patientId)

        if (patientData) {
          // Garantir que registeredAt seja um objeto Date
          const processedPatient = {
            ...patientData,
            registeredAt:
              typeof patientData.registeredAt === "string"
                ? new Date(patientData.registeredAt)
                : patientData.registeredAt,
            reevaluationRequest: patientData.reevaluationRequest
              ? {
                  ...patientData.reevaluationRequest,
                  timestamp:
                    typeof patientData.reevaluationRequest.timestamp === "string"
                      ? new Date(patientData.reevaluationRequest.timestamp)
                      : patientData.reevaluationRequest.timestamp,
                }
              : undefined,
          }

          setPatient(processedPatient)
          setCompletedSteps(processedPatient.completedSteps || [])
        } else {
          setError("Paciente não encontrado")
        }
      } catch (error) {
        console.error("Erro ao buscar paciente:", error)
        setError("Erro ao carregar dados do paciente")
      }

      setLoading(false)
    }

    fetchPatient()
  }, [patientId, router, mounted])

  // Atualizar o relógio a cada segundo
  useEffect(() => {
    if (!isClient()) return

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Função para fazer logout
  const handleLogout = () => {
    clearPatientSession()
    router.push("/login")
  }

  // Função para obter a cor de fundo baseada na prioridade
  const getPriorityColorClass = (priority: string) => {
    switch (priority) {
      case "Vermelho":
        return "bg-red-100 text-red-800 border-red-200"
      case "Laranja":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Amarelo":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Verde":
        return "bg-green-100 text-green-800 border-green-200"
      case "Azul":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Calcular tempo de espera estimado
  const calculateEstimatedTime = () => {
    if (!patient) return "Indeterminado"

    const currentStepIndex = steps.findIndex((step) => step.id === patient.currentStep)
    if (currentStepIndex === -1) return "Indeterminado"

    // Se estiver na última etapa
    if (currentStepIndex === steps.length - 1) return "Concluído"

    // Calcular tempo restante
    let remainingTime = 0

    // Tempo da etapa atual
    remainingTime += manchesterWaitTimes[patient.currentStep]?.[patient.priority] || 0

    // Tempo das etapas seguintes
    for (let i = currentStepIndex + 1; i < steps.length; i++) {
      const stepId = steps[i].id
      remainingTime += manchesterWaitTimes[stepId]?.[patient.priority] || 0
    }

    if (remainingTime <= 0) return "Imediato"
    if (remainingTime < 60) return `${remainingTime} minutos`
    return `${Math.floor(remainingTime / 60)} hora(s) e ${remainingTime % 60} minutos`
  }

  // Obter o tempo estimado em minutos para o currentStep
  const getCurrentStepEstimatedTime = () => {
    if (!patient) return 0
    return manchesterWaitTimes[patient.currentStep]?.[patient.priority] || 0
  }

  // Função para marcar uma etapa como concluída e atualizar o progresso
  const toggleStepCompletion = async (stepId: string) => {
    if (!patient) return

    // Verificar se a etapa já está concluída
    const isCompleted = completedSteps.includes(stepId)
    let updatedCompletedSteps: string[]
    let updatedCurrentStep = patient.currentStep

    if (isCompleted) {
      // Remover a etapa da lista de concluídas
      updatedCompletedSteps = completedSteps.filter((id) => id !== stepId)

      // Se for a etapa atual, verificar se precisamos voltar
      if (stepId === patient.currentStep) {
        // Encontrar a etapa anterior não concluída
        const stepIndex = steps.findIndex((s) => s.id === stepId)
        if (stepIndex > 0) {
          for (let i = stepIndex - 1; i >= 0; i--) {
            if (!updatedCompletedSteps.includes(steps[i].id)) {
              updatedCurrentStep = steps[i].id
              break
            }
          }
        }
      }
    } else {
      // Adicionar a etapa à lista de concluídas
      updatedCompletedSteps = [...completedSteps, stepId]

      // Se esta etapa for a atual, avançar para a próxima não concluída
      if (stepId === patient.currentStep) {
        const currentIndex = steps.findIndex((s) => s.id === stepId)
        if (currentIndex < steps.length - 1) {
          // Encontrar a próxima etapa não concluída
          updatedCurrentStep = steps[currentIndex + 1].id
        }
      }
    }

    setCompletedSteps(updatedCompletedSteps)

    // Atualizar o paciente no banco de dados
    try {
      const updatedPatient = await updatePatientStep(patient.id, updatedCurrentStep, updatedCompletedSteps)
      if (updatedPatient) {
        setPatient(updatedPatient)
      }
    } catch (error) {
      console.error("Erro ao atualizar etapa do paciente:", error)
    }
  }

  // Função para enviar pedido de reavaliação
  const handleReevaluationRequest = async () => {
    if (!patient || !reevaluationReason.trim()) return

    setIsSubmittingReevaluation(true)
    try {
      // Solicitar reavaliação usando o serviço
      const updatedPatient = await requestReevaluation(patient.id, reevaluationReason)

      if (updatedPatient) {
        setPatient(updatedPatient)
        setIsReevaluationDialogOpen(false)
        setReevaluationReason("")
      } else {
        // Se não conseguiu atualizar, mostrar mensagem de erro
        setError("Não foi possível solicitar a reavaliação. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao solicitar reavaliação:", error)
      setError("Erro ao solicitar reavaliação. Tente novamente.")
    } finally {
      setIsSubmittingReevaluation(false)
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

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  }

  if (error || !patient) {
    return (
      <div className="patient-theme min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Erro</CardTitle>
            <CardDescription>Não foi possível carregar os dados do paciente</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error || "Paciente não encontrado"}</p>
            <Button className="mt-4 w-full" onClick={() => router.push("/login")}>
              Voltar para o login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="patient-theme min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-blue-500 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <UserRound className="h-6 w-6 mr-2" />
            <h1 className="text-xl md:text-2xl font-bold">Pronto-Socorro de Birigui - Área do Paciente</h1>
          </div>
          <div className="flex items-center">
            <div className="flex flex-col mr-4">
              <span className="text-xs text-white/80">Tempo decorrido:</span>
              <ClockComponent
                startTime={patient.registeredAt instanceof Date ? patient.registeredAt : new Date(patient.registeredAt)}
                className="text-sm font-mono"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:text-blue-200">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-blue-800">Acompanhamento de Atendimento</h2>
            <p className="text-blue-600">
              Bem-vindo(a), <span className="font-semibold">{patient.name}</span>
            </p>
          </div>

          <div className="flex flex-col items-end">
            <div className="text-sm text-blue-600">
              ID do Paciente: <span className="font-mono font-bold">{patient.id}</span>
            </div>
            <div className="text-sm text-blue-600">Registrado em: {formatDate(patient.registeredAt)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna da esquerda - Informações do paciente */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <UserRound className="h-5 w-5 mr-2 text-blue-600" />
                  Dados do Paciente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{patient.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Idade</p>
                    <p className="font-medium">{patient.age} anos</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gênero</p>
                    <p className="font-medium">{patient.gender}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Queixa Principal</p>
                  <p className="font-medium">{patient.symptoms}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Classificação de Risco</p>
                  <Badge className={`mt-1 ${getPriorityColorClass(patient.priority)}`}>{patient.priority}</Badge>
                </div>
                {patient.allergies && (
                  <div>
                    <p className="text-sm text-muted-foreground">Alergias</p>
                    <p className="font-medium">{patient.allergies}</p>
                  </div>
                )}
                {patient.medications && (
                  <div>
                    <p className="text-sm text-muted-foreground">Medicamentos em uso</p>
                    <p className="font-medium">{patient.medications}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Sinais Vitais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.temperature && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Temperatura</p>
                      <p className="font-medium">{patient.temperature} °C</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pressão Arterial</p>
                      <p className="font-medium">{patient.bloodPressure || "N/A"} mmHg</p>
                    </div>
                  </div>
                )}
                {patient.heartRate && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Freq. Cardíaca</p>
                      <p className="font-medium">{patient.heartRate} bpm</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saturação O₂</p>
                      <p className="font-medium">{patient.oxygenSaturation || "N/A"} %</p>
                    </div>
                  </div>
                )}
                {patient.painLevel && (
                  <div>
                    <p className="text-sm text-muted-foreground">Nível de Dor (0-10)</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div
                        className={`h-2.5 rounded-full ${
                          Number.parseInt(patient.painLevel) >= 8
                            ? "bg-red-600"
                            : Number.parseInt(patient.painLevel) >= 4
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${Number.parseInt(patient.painLevel) * 10}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs mt-1">{patient.painLevel}/10</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botão para solicitar reavaliação */}
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setIsReevaluationDialogOpen(true)}
              disabled={
                (patient.reevaluationRequest?.requested && !patient.reevaluationRequest?.seen) ||
                isSubmittingReevaluation
              }
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {patient.reevaluationRequest?.requested && !patient.reevaluationRequest?.seen
                ? "Reavaliação solicitada"
                : isSubmittingReevaluation
                  ? "Enviando solicitação..."
                  : "Solicitar Reavaliação"}
            </Button>

            {patient.reevaluationRequest?.requested && !patient.reevaluationRequest?.seen && (
              <div className="text-xs text-center text-muted-foreground">
                Solicitação enviada em {formatDate(patient.reevaluationRequest.timestamp)}
              </div>
            )}
          </div>

          {/* Resto do código permanece igual... */}
          {/* Coluna da direita - Status do atendimento */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Status do Atendimento
                </CardTitle>
                <CardDescription>
                  Acompanhe o progresso do seu atendimento. Clique nos ícones para marcar etapas concluídas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative">
                  <Timeline
                    steps={steps}
                    currentStep={patient.currentStep}
                    completedSteps={completedSteps}
                    onToggleStep={toggleStepCompletion}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="text-sm font-medium text-blue-800 mb-1">Etapa Atual</h3>
                    <p className="text-lg font-bold text-blue-700 capitalize">
                      {steps.find((step) => step.id === patient.currentStep)?.label || patient.currentStep}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="text-sm font-medium text-blue-800 mb-1">Tempo de Atendimento</h3>
                    <div className="flex justify-between">
                      <ClockComponent
                        startTime={
                          patient.registeredAt instanceof Date ? patient.registeredAt : new Date(patient.registeredAt)
                        }
                        className="text-lg font-bold text-blue-700"
                      />
                      <ClockComponent
                        startTime={
                          patient.registeredAt instanceof Date ? patient.registeredAt : new Date(patient.registeredAt)
                        }
                        estimatedDuration={getCurrentStepEstimatedTime()}
                        displayRemaining={true}
                        className="text-lg font-bold text-blue-700"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-blue-800 mb-3">Informações Adicionais</h3>

                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Prioridade de Atendimento:</span> {patient.priority}
                    </p>
                    <p>
                      <span className="font-medium">Tempo de Espera Estimado:</span> {patient.waitTime}
                    </p>
                    <p className="text-muted-foreground italic">
                      Os tempos de espera são estimados e podem variar de acordo com a demanda do pronto-socorro e a
                      gravidade dos casos em atendimento.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Informações Importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    Mantenha-se atento às chamadas dos profissionais de saúde. Seu nome será chamado quando for sua vez.
                  </p>

                  <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    <h4 className="font-medium text-yellow-800">Atenção</h4>
                    <p className="text-sm text-yellow-700">
                      Caso seus sintomas piorem durante a espera, informe imediatamente um profissional de saúde ou
                      solicite uma reavaliação.
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    O atendimento segue o Protocolo de Manchester, que classifica os pacientes por gravidade e não por
                    ordem de chegada. Pacientes com condições mais graves são atendidos primeiro.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="mt-8 py-6 text-center text-blue-600 text-sm">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Secretaria de Saúde de Birigui</p>
          <p className="mt-1">Em caso de emergência, procure imediatamente um profissional de saúde</p>
        </div>
      </footer>

      {/* Diálogo para solicitar reavaliação */}
      <AlertDialog open={isReevaluationDialogOpen} onOpenChange={setIsReevaluationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Solicitar Reavaliação</AlertDialogTitle>
            <AlertDialogDescription>
              Informe o motivo pelo qual você precisa de uma reavaliação. Um profissional de saúde será notificado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Descreva a mudança nos seus sintomas ou o motivo da reavaliação..."
              value={reevaluationReason}
              onChange={(e) => setReevaluationReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmittingReevaluation}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReevaluationRequest}
              disabled={!reevaluationReason.trim() || isSubmittingReevaluation}
            >
              {isSubmittingReevaluation ? "Enviando..." : "Enviar Solicitação"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
