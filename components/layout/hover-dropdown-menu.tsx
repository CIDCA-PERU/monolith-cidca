"use client"

import { useState, useRef, type ReactNode, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface HoverDropdownMenuProps {
  trigger: string
  children: ReactNode
  isActive?: boolean
}

export function HoverDropdownMenu({ trigger, children, isActive = false }: HoverDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Función para manejar clics fuera del menú
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={menuRef} className="relative" onMouseEnter={() => setIsOpen(true)}>
      <button
        className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary hover:scale-105 transition-transform duration-200 focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)} // Toggle on click también
      >
        <span className="relative">
          {trigger}
          <span
            className={`absolute left-0 right-0 bottom-0 h-0.5 bg-primary ${isActive || isOpen ? "scale-x-100" : "scale-x-0"} group-hover:scale-x-100 transition-transform duration-300 origin-left`}
          ></span>
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-black/70 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in-80 zoom-in-95"
          onMouseLeave={() => setIsOpen(false)} // Solo se cierra cuando el cursor sale del menú desplegable
        >
          <div className="p-2 grid gap-1">{children}</div>
        </div>
      )}
    </div>
  )
}
