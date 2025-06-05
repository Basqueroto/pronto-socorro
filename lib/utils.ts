import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para verificar se o código está rodando no cliente (navegador)
export function isClient(): boolean {
  return typeof window !== "undefined"
}
