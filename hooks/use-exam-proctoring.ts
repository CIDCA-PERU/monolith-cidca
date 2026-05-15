'use client'

import { useEffect, useRef, useState } from 'react'

interface ProctorConfig {
  intentoId: string
  duracionMinutos: number
  onInfraction?: (type: 'TAB_CHANGE' | 'FOCUS_LOSS' | 'PAGE_UNLOAD' | 'TIMEOUT') => void
  onTimeout?: () => void
}

export function useExamProctoring({
  intentoId,
  duracionMinutos,
  onInfraction,
  onTimeout,
}: ProctorConfig) {
  const [infractions, setInfractions] = useState<Array<{
    type: 'TAB_CHANGE' | 'FOCUS_LOSS' | 'PAGE_UNLOAD' | 'TIMEOUT'
    timestamp: number
  }>>([])

  const [timeRemaining, setTimeRemaining] = useState(duracionMinutos * 60)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const timerIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const tabSwitchCountRef = useRef(0)
  const lastHeartbeatRef = useRef(Date.now())

  // Monitorear cambios de pestaña
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Usuario cambió de pestaña
        tabSwitchCountRef.current++
        setInfractions((prev) => [
          ...prev,
          { type: 'TAB_CHANGE', timestamp: Date.now() },
        ])
        onInfraction?.('TAB_CHANGE')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [onInfraction])

  // Monitorear pérdida de foco
  useEffect(() => {
    const handleBlur = () => {
      setInfractions((prev) => [
        ...prev,
        { type: 'FOCUS_LOSS', timestamp: Date.now() },
      ])
      onInfraction?.('FOCUS_LOSS')
    }

    const handleFocus = () => {
      // Opcional: registrar cuando vuelve el foco
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [onInfraction])

  // Monitorear descarga de página
  useEffect(() => {
    const handleBeforeUnload = () => {
      setInfractions((prev) => [
        ...prev,
        { type: 'PAGE_UNLOAD', timestamp: Date.now() },
      ])
      onInfraction?.('PAGE_UNLOAD')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [onInfraction])

  // Timer para tiempo restante
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onTimeout?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [onTimeout])

  // Heartbeat para mantener sesión activa
  useEffect(() => {
    heartbeatIntervalRef.current = setInterval(() => {
      lastHeartbeatRef.current = Date.now()
      console.log('[v0] Heartbeat enviado para intento:', intentoId)

      // Aquí iría el envío de heartbeat al servidor
      // await updateHeartbeat(intentoId)
    }, 30000) // Cada 30 segundos

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
    }
  }, [intentoId])

  // Bloquear comportamientos maliciosos comunes
  useEffect(() => {
    // Bloquear clic derecho
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      console.log('[v0] Clic derecho bloqueado')
      return false
    }

    // Bloquear DevTools comunes
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C')
      ) {
        e.preventDefault()
        console.log('[v0] Intento de abrir DevTools bloqueado')
        return false
      }
    }

    // Bloquear seleccionar texto (opcional)
    const handleSelectStart = (e: Event) => {
      // Comentar si se permite selección
      // e.preventDefault()
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('selectstart', handleSelectStart)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('selectstart', handleSelectStart)
    }
  }, [])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`
    }

    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return {
    infractions,
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    infractionCount: infractions.length,
    isTimeUp: timeRemaining <= 0,
  }
}
