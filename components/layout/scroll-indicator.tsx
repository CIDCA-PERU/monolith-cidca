"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

export default function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 cursor-pointer z-20"
      initial={{ opacity: 0, y: -10 }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{ delay: 1, duration: 0.5 }}
      onClick={() => {
        const servicesSection = document.getElementById("servicios")
        if (servicesSection) {
          servicesSection.scrollIntoView({ behavior: "smooth" })
        }
      }}
    >
      <span className="text-sm font-medium">Deslizar</span>
      <motion.div
        animate={{
          y: [0, 8, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 1.5,
          ease: "easeInOut",
        }}
      >
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </motion.div>
  )
}
