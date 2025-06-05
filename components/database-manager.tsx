"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
import { Textarea } from "@/components/ui/textarea"
import { Database, Download, Upload, RefreshCw, AlertCircle, CheckCircle, Trash2 } from "lucide-react"
import { localDbManager } from "@/lib/local-db"

export function DatabaseManager() {
  const [stats, setStats] = useState(() => localDbManager.getDatabaseStats())
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
  const [exportData, setExportData] = useState("")
  const [importData, setImportData] = useState("")
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null)

  // Função para atualizar estatísticas
  const refreshStats = () => {
    setStats(localDbManager.getDatabaseStats())
  }

  // Função para exportar dados
  const handleExport = () => {
    const data = localDbManager.exportDatabase()
    setExportData(data)
    setIsExportDialogOpen(true)
  }

  // Função para importar dados
  const handleImport = () => {
    setImportData("")
    setImportResult(null)
    setIsImportDialogOpen(true)
  }

  // Função para confirmar importação
  const confirmImport = () => {
    try {
      if (!importData.trim()) {
        setImportResult({
          success: false,
          message: "Dados de importação vazios",
        })
        return
      }

      const success = localDbManager.importDatabase(importData)
      if (success) {
        setImportResult({
          success: true,
          message: "Dados importados com sucesso",
        })
        refreshStats()
      } else {
        setImportResult({
          success: false,
          message: "Erro ao importar dados. Formato inválido.",
        })
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: "Erro ao importar dados: " + (error instanceof Error ? error.message : String(error)),
      })
    }
  }

  // Função para limpar banco de dados
  const handleClear = () => {
    setIsClearDialogOpen(true)
  }

  // Função para confirmar limpeza
  const confirmClear = () => {
    localDbManager.clearDatabase()
    refreshStats()
    setIsClearDialogOpen(false)
  }

  // Função para copiar dados exportados
  const copyExportData = () => {
    navigator.clipboard.writeText(exportData)
  }

  // Função para fazer download dos dados
  const downloadExportData = () => {
    const blob = new Blob([exportData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hospital_db_backup_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Gerenciamento de Dados
        </CardTitle>
        <CardDescription>Gerencie os dados do sistema armazenados localmente</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stats">
          <TabsList className="mb-4">
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            <TabsTrigger value="actions">Ações</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Estatísticas do Banco de Dados</h3>
                <Button variant="outline" size="sm" onClick={refreshStats}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Atualizar
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="text-xs text-blue-500 mb-1">Pacientes Ativos</div>
                  <div className="text-2xl font-bold text-blue-700">{stats.patientsCount}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-md">
                  <div className="text-xs text-green-500 mb-1">Pacientes Arquivados</div>
                  <div className="text-2xl font-bold text-green-700">{stats.archivedPatientsCount}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-md">
                  <div className="text-xs text-purple-500 mb-1">Funcionários</div>
                  <div className="text-2xl font-bold text-purple-700">{stats.staffCount}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-xs text-gray-500 mb-1">Versão</div>
                  <div className="text-lg font-bold text-gray-700">{stats.version}</div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground mt-2">
                Última atualização: {stats.lastUpdated.toLocaleString()}
              </div>

              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Os dados são armazenados localmente no seu navegador. Recomendamos exportar regularmente para evitar
                  perda de dados.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="actions">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Dados
                </Button>
                <Button onClick={handleImport} className="bg-green-600 hover:bg-green-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Dados
                </Button>
                <Button onClick={handleClear} variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Dados
                </Button>
              </div>

              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mt-4">
                <h4 className="font-medium text-yellow-800 mb-2">Importante</h4>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-5">
                  <li>A exportação salva todos os dados do sistema em formato JSON</li>
                  <li>A importação substitui todos os dados atuais pelos dados importados</li>
                  <li>Limpar dados restaura o banco para o estado inicial com dados de exemplo</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          Armazenamento: <Badge variant="outline">Local Storage</Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          Status: <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Conectado</Badge>
        </div>
      </CardFooter>

      {/* Diálogo de exportação */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exportar Dados</DialogTitle>
            <DialogDescription>
              Copie os dados abaixo ou faça o download para backup. Guarde este arquivo em um local seguro.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={exportData}
              readOnly
              className="min-h-[200px] font-mono text-xs"
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={copyExportData}>
              Copiar para Área de Transferência
            </Button>
            <Button onClick={downloadExportData}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de importação */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importar Dados</DialogTitle>
            <DialogDescription>
              Cole os dados exportados anteriormente para restaurar o banco de dados.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="min-h-[200px] font-mono text-xs"
              placeholder="Cole os dados JSON aqui..."
            />
            {importResult && (
              <Alert variant={importResult.success ? "default" : "destructive"}>
                {importResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{importResult.message}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmImport}>Importar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação para limpar dados */}
      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar Banco de Dados</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá restaurar o banco de dados para o estado inicial com dados de exemplo. Todos os dados atuais
              serão perdidos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClear} className="bg-red-600 hover:bg-red-700">
              Limpar Dados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
