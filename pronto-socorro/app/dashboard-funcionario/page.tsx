"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  UserPlus,
  Users,
  Clock,
  AlertCircle,
  LogOut,
  Search,
  RefreshCcw,
  UserCog,
  Download,
  Edit,
  CheckCircle,
  Bell,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Clock as ClockComponent } from "@/components/clock"
import { isStaffAuthenticated, clearStaffSession, getCurrentStaffRole } from "@/lib/auth"
import {
  getAllPatients,
  updatePatient,
  archivePatient as archivePatientService,
  getAllArchivedPatients,
  markReevaluationAsSeen,
  type Patient,
} from "@/lib/patient-service"

// Interface para os tempos do protocolo de Manchester
interface ManchesterTimes {
  [key: string]: number // minutos para cada prioridade
}

export default function DashboardFuncionarioPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [staffRole, setStaffRole] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editedPatient, setEditedPatient] = useState<Partial<Patient>>({})
  const [archivedPatients, setArchivedPatients] = useState<Patient[]>([])
  const [reevaluationPatient, setReevaluationPatient] = useState<Patient | null>(null)
  const [isReevaluationDialogOpen, setIsReevaluationDialogOpen] = useState(false)
  const [hasNewReevaluationRequests, setHasNewReevaluationRequests] = useState(false)

  // Referência para o elemento de download
  const downloadLinkRef = useRef<HTMLAnchorElement>(null)

  // Etapas do atendimento
  const steps = [
    { id: "recepcao", label: "Recepção" },
    { id: "triagem", label: "Triagem" },
    { id: "espera", label: "Espera" },
    { id: "consulta", label: "Consulta" },
    { id: "medicacao", label: "Medicação" },
    { id: "alta", label: "Alta" },
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

  // Verificar se o funcionário está autenticado
  useEffect(() => {
    if (!isStaffAuthenticated()) {
      router.push("/login-funcionario")
    } else {
      setIsAuthenticated(true)
      setStaffRole(getCurrentStaffRole() || "")

      // Carregar pacientes do banco de dados
      loadPatients()

      // Carregar pacientes arquivados
      loadArchivedPatients()
    }
  }, [router])

  // Função para carregar pacientes do banco de dados
  const loadPatients = () => {
    try {
      const allPatients = getAllPatients()
      setPatients(allPatients)

      // Verificar se há novos pedidos de reavaliação
      const hasNewRequests = allPatients.some(
        (p: Patient) => p.reevaluationRequest?.requested && !p.reevaluationRequest?.seen,
      )
      setHasNewReevaluationRequests(hasNewRequests)
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error)
    }
  }

  // Função para carregar pacientes arquivados
  const loadArchivedPatients = () => {
    try {
      const archived = getAllArchivedPatients()
      setArchivedPatients(archived)
    } catch (error) {
      console.error("Erro ao carregar pacientes arquivados:", error)
    }
  }

  // Atualizar o relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Função para fazer logout
  const handleLogout = () => {
    clearStaffSession()
    router.push("/login-funcionario")
  }

  // Função para filtrar pacientes
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  // Função para formatar a data
  const formatDate = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Obter o tempo estimado em minutos para o currentStep do paciente
  const getPatientStepEstimatedTime = (patient: Patient) => {
    return manchesterWaitTimes[patient.currentStep]?.[patient.priority] || 0
  }

  // Função para atualizar a lista de pacientes
  const handleRefresh = () => {
    loadPatients()
    loadArchivedPatients()
  }

  // Função para abrir o diálogo de edição do paciente
  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setEditedPatient({
      ...patient,
      registeredAt: patient.registeredAt,
    })
    setIsEditDialogOpen(true)
  }

  // Função para visualizar o pedido de reavaliação
  const handleViewReevaluation = (patient: Patient) => {
    if (patient.reevaluationRequest?.requested) {
      setReevaluationPatient(patient)
      setIsReevaluationDialogOpen(true)

      // Marcar como visto
      if (!patient.reevaluationRequest.seen) {
        const updatedPatient = markReevaluationAsSeen(patient.id)

        if (updatedPatient) {
          // Atualizar a lista de pacientes
          loadPatients()
        }
      }
    }
  }

  // Função para salvar as alterações do paciente
  const handleSavePatient = () => {
    if (!selectedPatient || !editedPatient) return

    // Criar objeto atualizado do paciente
    const patientToUpdate: Patient = {
      ...selectedPatient,
      ...editedPatient,
      registeredAt: selectedPatient.registeredAt, // Manter a data de registro original
    } as Patient

    // Atualizar o paciente no banco de dados
    updatePatient(patientToUpdate)

    // Atualizar a lista de pacientes
    loadPatients()

    setIsEditDialogOpen(false)

    // Se o paciente foi marcado como "alta", mover para arquivados
    if (editedPatient.currentStep === "alta") {
      archivePatient(patientToUpdate)
    }
  }

  // Função para arquivar um paciente
  const archivePatient = (patient: Patient) => {
    // Arquivar paciente no banco de dados
    archivePatientService(patient)

    // Atualizar as listas
    loadPatients()
    loadArchivedPatients()
  }

  // Função para exportar pacientes para Excel (CSV)
  const exportToExcel = () => {
    // Combinar pacientes ativos e arquivados
    const allPatients = [...patients, ...archivedPatients]

    // Criar cabeçalho
    const headers = [
      "ID",
      "Nome",
      "Idade",
      "Gênero",
      "Sintomas",
      "Prioridade",
      "Data de Registro",
      "Etapa Atual",
      "Temperatura",
      "Pressão Arterial",
      "Freq. Cardíaca",
      "Saturação O₂",
      "Nível de Dor",
    ]

    // Converter pacientes para linhas CSV
    const csvRows = allPatients.map((patient) => {
      return [
        patient.id,
        patient.name,
        patient.age,
        patient.gender,
        patient.symptoms,
        patient.priority,
        new Date(patient.registeredAt).toLocaleString(),
        patient.currentStep,
        patient.temperature || "N/A",
        patient.bloodPressure || "N/A",
        patient.heartRate || "N/A",
        patient.oxygenSaturation || "N/A",
        patient.painLevel || "N/A",
      ]
    })

    // Combinar cabeçalho e linhas
    const csvContent = [headers.join(","), ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    // Criar blob e link para download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    if (downloadLinkRef.current) {
      downloadLinkRef.current.href = url
      downloadLinkRef.current.download = `pacientes_${new Date().toISOString().slice(0, 10)}.csv`
      downloadLinkRef.current.click()
    }
  }

  // Calcular estatísticas
  const urgentCasesCount = patients.filter((p) => p.priority === "Vermelho" || p.priority === "Laranja").length
  const waitingPatientsCount = patients.filter((p) => p.currentStep === "espera").length
  const reevaluationRequestsCount = patients.filter(
    (p) => p.reevaluationRequest?.requested && !p.reevaluationRequest?.seen,
  ).length

  // Calcular tempo médio de espera (simulação)
  const calculateAverageWaitTime = () => {
    const waitTimes = {
      Vermelho: 0,
      Laranja: 10,
      Amarelo: 30,
      Verde: 60,
      Azul: 120,
    }

    if (patients.length === 0) return "0 min"

    const totalMinutes = patients.reduce((sum, patient) => {
      const priorityTime = waitTimes[patient.priority] || 60
      return sum + priorityTime
    }, 0)

    return `${Math.round(totalMinutes / patients.length)} min`
  }

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  }

  return (
    <div className="staff-theme min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <UserCog className="h-6 w-6 mr-2" />
            <h1 className="text-xl md:text-2xl font-bold">Pronto-Socorro de Birigui - Área do Funcionário</h1>
          </div>
          <div className="flex items-center">
            <ClockComponent startTime={new Date()} className="text-sm mr-4 font-mono" />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:text-blue-200">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-blue-800">Painel de Controle</h2>
            <p className="text-blue-600">
              Bem-vindo, <span className="font-semibold capitalize">{staffRole}</span>
            </p>
          </div>

          <div className="flex gap-2">
            {hasNewReevaluationRequests && (
              <Button
                variant="destructive"
                onClick={() => {
                  const patientWithReevaluation = patients.find(
                    (p) => p.reevaluationRequest?.requested && !p.reevaluationRequest?.seen,
                  )
                  if (patientWithReevaluation) {
                    handleViewReevaluation(patientWithReevaluation)
                  }
                }}
              >
                <Bell className="h-4 w-4 mr-2" />
                {reevaluationRequestsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {reevaluationRequestsCount}
                  </span>
                )}
                Reavaliações
              </Button>
            )}
            <Button onClick={() => router.push("/cadastro-paciente")} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Paciente
            </Button>
            <Button variant="outline" className="border-blue-200 text-blue-700" onClick={handleRefresh}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" className="border-blue-200 text-blue-700" onClick={exportToExcel}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <a ref={downloadLinkRef} className="hidden"></a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Total de Pacientes</CardTitle>
              <CardDescription>Pacientes em atendimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <span className="text-3xl font-bold">{patients.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Casos Urgentes</CardTitle>
              <CardDescription>Vermelho e Laranja</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
                <span className="text-3xl font-bold">{urgentCasesCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Tempo Médio de Espera</CardTitle>
              <CardDescription>Todos os pacientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600 mr-3" />
                <span className="text-3xl font-bold">{calculateAverageWaitTime()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <Tabs defaultValue="todos" className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <TabsList className="mb-4 md:mb-0">
                <TabsTrigger value="todos">Todos os Pacientes</TabsTrigger>
                <TabsTrigger value="urgentes">Casos Urgentes</TabsTrigger>
                <TabsTrigger value="espera">Em Espera</TabsTrigger>
                <TabsTrigger value="reavaliacao">
                  Reavaliações
                  {reevaluationRequestsCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center bg-red-100 text-red-800 rounded-full w-5 h-5 text-xs">
                      {reevaluationRequestsCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="arquivados">Arquivados</TabsTrigger>
              </TabsList>

              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar paciente..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <TabsContent value="todos" className="mt-0">
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">ID</th>
                        <th className="py-3 px-4 text-left font-medium">Nome</th>
                        <th className="py-3 px-4 text-left font-medium">Idade/Gênero</th>
                        <th className="py-3 px-4 text-left font-medium">Prioridade</th>
                        <th className="py-3 px-4 text-left font-medium">Entrada</th>
                        <th className="py-3 px-4 text-left font-medium">Tempo Decorrido</th>
                        <th className="py-3 px-4 text-left font-medium">Etapa</th>
                        <th className="py-3 px-4 text-left font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <tr
                            key={patient.id}
                            className={`border-t hover:bg-muted/50 ${
                              patient.reevaluationRequest?.requested && !patient.reevaluationRequest?.seen
                                ? "bg-red-50"
                                : ""
                            }`}
                          >
                            <td className="py-3 px-4">{patient.id}</td>
                            <td className="py-3 px-4 font-medium">
                              {patient.name}
                              {patient.reevaluationRequest?.requested && !patient.reevaluationRequest?.seen && (
                                <span className="ml-2 inline-flex items-center justify-center bg-red-100 text-red-800 rounded-full px-2 text-xs">
                                  Reavaliação
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {patient.age} / {patient.gender}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getPriorityColorClass(patient.priority)}>{patient.priority}</Badge>
                            </td>
                            <td className="py-3 px-4">{formatDate(patient.registeredAt)}</td>
                            <td className="py-3 px-4">
                              <ClockComponent
                                startTime={patient.registeredAt}
                                estimatedDuration={getPatientStepEstimatedTime(patient)}
                              />
                            </td>
                            <td className="py-3 px-4 capitalize">{patient.currentStep}</td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-1">
                                {patient.reevaluationRequest?.requested && (
                                  <Button
                                    variant={patient.reevaluationRequest.seen ? "ghost" : "destructive"}
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleViewReevaluation(patient)}
                                  >
                                    <Bell className="h-4 w-4" />
                                    <span className="sr-only">Ver Reavaliação</span>
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleEditPatient(patient)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => archivePatient(patient)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="sr-only">Arquivar</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-muted-foreground">
                            Nenhum paciente encontrado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="urgentes" className="mt-0">
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">ID</th>
                        <th className="py-3 px-4 text-left font-medium">Nome</th>
                        <th className="py-3 px-4 text-left font-medium">Idade/Gênero</th>
                        <th className="py-3 px-4 text-left font-medium">Prioridade</th>
                        <th className="py-3 px-4 text-left font-medium">Entrada</th>
                        <th className="py-3 px-4 text-left font-medium">Tempo Decorrido</th>
                        <th className="py-3 px-4 text-left font-medium">Etapa</th>
                        <th className="py-3 px-4 text-left font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients
                        .filter((p) => p.priority === "Vermelho" || p.priority === "Laranja")
                        .map((patient) => (
                          <tr
                            key={patient.id}
                            className={`border-t hover:bg-muted/50 ${
                              patient.reevaluationRequest?.requested && !patient.reevaluationRequest?.seen
                                ? "bg-red-50"
                                : ""
                            }`}
                          >
                            <td className="py-3 px-4">{patient.id}</td>
                            <td className="py-3 px-4 font-medium">
                              {patient.name}
                              {patient.reevaluationRequest?.requested && !patient.reevaluationRequest?.seen && (
                                <span className="ml-2 inline-flex items-center justify-center bg-red-100 text-red-800 rounded-full px-2 text-xs">
                                  Reavaliação
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {patient.age} / {patient.gender}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getPriorityColorClass(patient.priority)}>{patient.priority}</Badge>
                            </td>
                            <td className="py-3 px-4">{formatDate(patient.registeredAt)}</td>
                            <td className="py-3 px-4">
                              <ClockComponent
                                startTime={patient.registeredAt}
                                estimatedDuration={getPatientStepEstimatedTime(patient)}
                              />
                            </td>
                            <td className="py-3 px-4 capitalize">{patient.currentStep}</td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-1">
                                {patient.reevaluationRequest?.requested && (
                                  <Button
                                    variant={patient.reevaluationRequest.seen ? "ghost" : "destructive"}
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleViewReevaluation(patient)}
                                  >
                                    <Bell className="h-4 w-4" />
                                    <span className="sr-only">Ver Reavaliação</span>
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleEditPatient(patient)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="espera" className="mt-0">
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">ID</th>
                        <th className="py-3 px-4 text-left font-medium">Nome</th>
                        <th className="py-3 px-4 text-left font-medium">Idade/Gênero</th>
                        <th className="py-3 px-4 text-left font-medium">Prioridade</th>
                        <th className="py-3 px-4 text-left font-medium">Entrada</th>
                        <th className="py-3 px-4 text-left font-medium">Tempo Decorrido</th>
                        <th className="py-3 px-4 text-left font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients
                        .filter((p) => p.currentStep === "espera")
                        .map((patient) => (
                          <tr
                            key={patient.id}
                            className={`border-t hover:bg-muted/50 ${
                              patient.reevaluationRequest?.requested && !patient.reevaluationRequest?.seen
                                ? "bg-red-50"
                                : ""
                            }`}
                          >
                            <td className="py-3 px-4">{patient.id}</td>
                            <td className="py-3 px-4 font-medium">
                              {patient.name}
                              {patient.reevaluationRequest?.requested && !patient.reevaluationRequest?.seen && (
                                <span className="ml-2 inline-flex items-center justify-center bg-red-100 text-red-800 rounded-full px-2 text-xs">
                                  Reavaliação
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {patient.age} / {patient.gender}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getPriorityColorClass(patient.priority)}>{patient.priority}</Badge>
                            </td>
                            <td className="py-3 px-4">{formatDate(patient.registeredAt)}</td>
                            <td className="py-3 px-4">
                              <ClockComponent
                                startTime={patient.registeredAt}
                                estimatedDuration={getPatientStepEstimatedTime(patient)}
                              />
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-1">
                                {patient.reevaluationRequest?.requested && (
                                  <Button
                                    variant={patient.reevaluationRequest.seen ? "ghost" : "destructive"}
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleViewReevaluation(patient)}
                                  >
                                    <Bell className="h-4 w-4" />
                                    <span className="sr-only">Ver Reavaliação</span>
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleEditPatient(patient)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reavaliacao" className="mt-0">
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">ID</th>
                        <th className="py-3 px-4 text-left font-medium">Nome</th>
                        <th className="py-3 px-4 text-left font-medium">Idade/Gênero</th>
                        <th className="py-3 px-4 text-left font-medium">Prioridade</th>
                        <th className="py-3 px-4 text-left font-medium">Solicitação</th>
                        <th className="py-3 px-4 text-left font-medium">Status</th>
                        <th className="py-3 px-4 text-left font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients
                        .filter((p) => p.reevaluationRequest?.requested)
                        .map((patient) => (
                          <tr
                            key={patient.id}
                            className={`border-t hover:bg-muted/50 ${
                              !patient.reevaluationRequest?.seen ? "bg-red-50" : ""
                            }`}
                          >
                            <td className="py-3 px-4">{patient.id}</td>
                            <td className="py-3 px-4 font-medium">{patient.name}</td>
                            <td className="py-3 px-4">
                              {patient.age} / {patient.gender}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getPriorityColorClass(patient.priority)}>{patient.priority}</Badge>
                            </td>
                            <td className="py-3 px-4">{formatDate(patient.reevaluationRequest!.timestamp)}</td>
                            <td className="py-3 px-4">
                              {patient.reevaluationRequest?.seen ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Visualizado
                                </Badge>
                              ) : (
                                <Badge variant="destructive">Não visualizado</Badge>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                variant={patient.reevaluationRequest?.seen ? "outline" : "destructive"}
                                size="sm"
                                onClick={() => handleViewReevaluation(patient)}
                              >
                                {patient.reevaluationRequest?.seen ? "Ver detalhes" : "Atender"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      {filteredPatients.filter((p) => p.reevaluationRequest?.requested).length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-muted-foreground">
                            Nenhuma solicitação de reavaliação
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="arquivados" className="mt-0">
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">ID</th>
                        <th className="py-3 px-4 text-left font-medium">Nome</th>
                        <th className="py-3 px-4 text-left font-medium">Idade/Gênero</th>
                        <th className="py-3 px-4 text-left font-medium">Prioridade</th>
                        <th className="py-3 px-4 text-left font-medium">Entrada</th>
                        <th className="py-3 px-4 text-left font-medium">Etapa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {archivedPatients.length > 0 ? (
                        archivedPatients.map((patient) => (
                          <tr key={patient.id} className="border-t hover:bg-muted/50">
                            <td className="py-3 px-4">{patient.id}</td>
                            <td className="py-3 px-4 font-medium">{patient.name}</td>
                            <td className="py-3 px-4">
                              {patient.age} / {patient.gender}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getPriorityColorClass(patient.priority)}>{patient.priority}</Badge>
                            </td>
                            <td className="py-3 px-4">{formatDate(patient.registeredAt)}</td>
                            <td className="py-3 px-4 capitalize">{patient.currentStep}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-muted-foreground">
                            Nenhum paciente arquivado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="mt-8 py-6 text-center text-blue-600 text-sm">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Secretaria de Saúde de Birigui</p>
        </div>
      </footer>

      {/* Diálogo de edição de paciente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
            <DialogDescription>
              Atualize as informações e o status do paciente {selectedPatient?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient-id" className="text-right">
                ID
              </Label>
              <Input id="patient-id" value={selectedPatient?.id || ""} className="col-span-3" disabled />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient-name" className="text-right">
                Nome
              </Label>
              <Input
                id="patient-name"
                value={editedPatient.name || ""}
                onChange={(e) => setEditedPatient({ ...editedPatient, name: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient-step" className="text-right">
                Etapa Atual
              </Label>
              <Select
                value={editedPatient.currentStep}
                onValueChange={(value) => setEditedPatient({ ...editedPatient, currentStep: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a etapa" />
                </SelectTrigger>
                <SelectContent>
                  {steps.map((step) => (
                    <SelectItem key={step.id} value={step.id}>
                      {step.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient-priority" className="text-right">
                Prioridade
              </Label>
              <Select
                value={editedPatient.priority}
                onValueChange={(value) =>
                  setEditedPatient({
                    ...editedPatient,
                    priority: value as "Vermelho" | "Laranja" | "Amarelo" | "Verde" | "Azul",
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vermelho">Vermelho - Emergência</SelectItem>
                  <SelectItem value="Laranja">Laranja - Muito Urgente</SelectItem>
                  <SelectItem value="Amarelo">Amarelo - Urgente</SelectItem>
                  <SelectItem value="Verde">Verde - Pouco Urgente</SelectItem>
                  <SelectItem value="Azul">Azul - Não Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePatient}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de visualização de reavaliação */}
      <AlertDialog open={isReevaluationDialogOpen} onOpenChange={setIsReevaluationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              Solicitação de Reavaliação
            </AlertDialogTitle>
            <AlertDialogDescription>
              O paciente <strong>{reevaluationPatient?.name}</strong> (ID: {reevaluationPatient?.id}) solicitou uma
              reavaliação em {reevaluationPatient?.reevaluationRequest?.timestamp.toLocaleString()}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Label className="text-sm font-medium">Motivo da solicitação:</Label>
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <p>{reevaluationPatient?.reevaluationRequest?.reason}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Prioridade atual:</Label>
                <div className="mt-1">
                  <Badge className={getPriorityColorClass(reevaluationPatient?.priority || "")}>
                    {reevaluationPatient?.priority}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Etapa atual:</Label>
                <div className="mt-1 capitalize">{reevaluationPatient?.currentStep}</div>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (reevaluationPatient) {
                  handleEditPatient(reevaluationPatient)
                  setIsReevaluationDialogOpen(false)
                }
              }}
            >
              Editar Paciente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
