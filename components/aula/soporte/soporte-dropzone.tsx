'use client'

import { useCallback, useState, useEffect } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface SoporteDropzoneProps {
  onFileSelected: (file: File) => void
  onFileRemoved: () => void
  selectedFile?: File | null
  isDisabled?: boolean
}

export function SoporteDropzone({
  onFileSelected,
  onFileRemoved,
  selectedFile,
  isDisabled,
}: SoporteDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader()
      reader.onloadend = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(selectedFile)
    } else {
      setPreviewUrl(null)
    }
  }, [selectedFile])

  const validateAndSelect = (file: File) => {
    const allowed = ['image/jpeg', 'image/png']
    if (!allowed.includes(file.type)) {
      toast.error('Formato inválido. Solo se permiten imágenes JPG o PNG.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe exceder los 5MB.')
      return
    }
    onFileSelected(file)
  }

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (isDisabled) return
      e.preventDefault()
      setIsDragging(true)
    },
    [isDisabled]
  )

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (isDisabled) return
      e.preventDefault()
      setIsDragging(false)
      const files = e.dataTransfer.files
      if (files.length > 0) validateAndSelect(files[0])
    },
    [isDisabled, onFileSelected]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.currentTarget.files
      if (files && files.length > 0) validateAndSelect(files[0])
    },
    [onFileSelected]
  )

  const handleClick = () => {
    document.getElementById('soporte-file-input')?.click()
  }

  return (
    <div className={`space-y-3 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {!selectedFile ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer select-none ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/10'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
              <Upload className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-white">
                Arrastra tu captura de pantalla aquí
              </p>
              <p className="text-xs text-slate-500 dark:text-white mt-1">
                o haz clic para seleccionar
              </p>
              <p className="text-xs text-slate-400 dark:text-white mt-1">
                JPG / PNG — máx. 5MB · <span className="font-medium text-white">Opcional</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {previewUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
              <img
                src={previewUrl}
                alt="Vista previa"
                className="w-full h-auto object-cover max-h-52"
              />
            </div>
          )}

          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg flex-shrink-0">
              <ImageIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 dark:text-green-300 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-green-600 dark:text-green-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · ✓ Listo para enviar
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onFileRemoved}
              disabled={isDisabled}
              className="flex-shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <input
        type="file"
        id="soporte-file-input"
        accept="image/jpeg,image/png"
        onChange={handleFileInput}
        className="hidden"
        disabled={isDisabled}
      />
    </div>
  )
}
