"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { CheckCircle } from "lucide-react"

interface TimelineProps {
  steps: {
    id: string
    label: string
    icon: LucideIcon
  }[]
  currentStep: string
  completedSteps: string[]
  onToggleStep?: (stepId: string) => void
  className?: string
  readOnly?: boolean
}

export function Timeline({
  steps,
  currentStep,
  completedSteps = [],
  onToggleStep,
  className,
  readOnly = false,
}: TimelineProps) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep)

  return (
    <div className={cn("space-y-4", className)}>
      {/* Barra de progresso */}
      <div className="relative h-2 bg-sky-100 rounded-full">
        <div
          className="absolute top-0 left-0 h-full bg-sky-500 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>

      {/* Etapas */}
      <div className="grid grid-cols-6 gap-1">
        {steps.map((step, index) => {
          const StepIcon = step.icon
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = index === currentStepIndex

          return (
            <div key={step.id} className="flex flex-col items-center text-center">
              {/* Checkmark indicator above the icon */}
              <div className="h-5 mb-1 relative">
                {isCompleted && (
                  <CheckCircle className="h-5 w-5 text-green-500 absolute top-0 left-1/2 transform -translate-x-1/2" />
                )}
              </div>

              {/* Timeline point/icon */}
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full mb-1 transition-all
                  ${
                    isCompleted
                      ? "bg-sky-500 text-white"
                      : isCurrent
                        ? "bg-sky-200 text-sky-700 ring-2 ring-sky-500"
                        : "bg-gray-100 text-gray-400"
                  }
                  ${!readOnly && "cursor-pointer hover:opacity-80"}
                `}
                onClick={() => {
                  if (!readOnly && onToggleStep) {
                    onToggleStep(step.id)
                  }
                }}
              >
                <StepIcon className="w-5 h-5" />
              </div>

              {/* Step label */}
              <span
                className={`text-xs ${
                  isCurrent ? "font-bold text-sky-700" : isCompleted ? "text-sky-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
