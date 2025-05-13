"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { UserRound, UserCog } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Pronto-Socorro de Birigui</h1>
          <p className="text-blue-600 mt-2">Sistema de Gerenciamento e Acompanhamento</p>
        </div>

        <Card className="border-2 border-blue-100 shadow-lg mb-6">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Selecione seu perfil</CardTitle>
            <CardDescription className="text-center">Escolha como deseja acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button className="bg-blue-400 hover:bg-blue-500 h-20 text-lg" onClick={() => router.push("/login")}>
              <UserRound className="mr-2 h-6 w-6" />
              Sou Paciente
            </Button>
            <Button
              className="bg-blue-700 hover:bg-blue-800 h-20 text-lg"
              onClick={() => router.push("/login-funcionario")}
            >
              <UserCog className="mr-2 h-6 w-6" />
              Sou Funcionário
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-xs text-center text-muted-foreground mt-2">
              Selecione a opção adequada para acessar o sistema
            </p>
          </CardFooter>
        </Card>

        <div className="text-center text-sm text-blue-600">
          <p>Em caso de emergência, procure imediatamente um atendente</p>
          <p className="mt-1">© {new Date().getFullYear()} Secretaria de Saúde de Birigui</p>
        </div>
      </div>
    </div>
  )
}
