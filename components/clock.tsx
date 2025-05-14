"use client"

import { useEffect, useState } from "react"
import { useInterval } from "@/hooks/use-interval"

interface ClockProps {
  startTime: Date
  estimatedDuration?: number // in minutes
  className?: string
  displayRemaining?: boolean
}

export function Clock({ startTime, estimatedDuration, className, displayRemaining = false }: ClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [elapsedTime, setElapsedTime] = useState<string>("")
  const [remainingTime, setRemainingTime] = useState<string>("")

  // Update time every second
  useInterval(() => {
    setCurrentTime(new Date())
  }, 1000)

  useEffect(() => {
    // Calculate elapsed time
    const elapsed = Math.floor((currentTime.getTime() - new Date(startTime).getTime()) / 1000)
    const hours = Math.floor(elapsed / 3600)
    const minutes = Math.floor((elapsed % 3600) / 60)
    const seconds = elapsed % 60

    setElapsedTime(`${hours > 0 ? hours + "h " : ""}${minutes > 0 || hours > 0 ? minutes + "m " : ""}${seconds}s`)

    // Calculate remaining time if an estimated duration is provided
    if (estimatedDuration) {
      const totalDurationInSeconds = estimatedDuration * 60
      const remainingSeconds = Math.max(0, totalDurationInSeconds - elapsed)

      if (remainingSeconds > 0) {
        const remainingHours = Math.floor(remainingSeconds / 3600)
        const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60)
        const remainingSecs = remainingSeconds % 60

        setRemainingTime(
          `${remainingHours > 0 ? remainingHours + "h " : ""}${remainingMinutes > 0 || remainingHours > 0 ? remainingMinutes + "m " : ""}${remainingSecs}s`,
        )
      } else {
        setRemainingTime("Excedido")
      }
    }
  }, [currentTime, startTime, estimatedDuration])

  return (
    <div className={className}>
      {displayRemaining && estimatedDuration ? (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Tempo Restante:</span>
          <span className="font-mono">{remainingTime}</span>
        </div>
      ) : (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Tempo Decorrido:</span>
          <span className="font-mono">{elapsedTime}</span>
        </div>
      )}
    </div>
  )
}
