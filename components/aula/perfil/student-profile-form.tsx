'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Edit } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { updateStudentProfile } from '@/actions/perfil.actions'

interface StudentProfileFormProps {
  initialData?: {
    nombre?: string
    apellidoPaterno?: string
    apellidoMaterno?: string
    email?: string
    genero?: string
    telefono?: string
    tipoDocumento?: string
    numeroDocumento?: string
  }
  tiposDocumento?: Array<{ id: string; nombre: string }>
}

export function StudentProfileForm({
  initialData = {},
  tiposDocumento = [],
}: StudentProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nombre: initialData.nombre || '',
    apellidoPaterno: initialData.apellidoPaterno || '',
    apellidoMaterno: initialData.apellidoMaterno || '',
    email: initialData.email || '',
    genero: initialData.genero || '',
    telefono: initialData.telefono || '',
    tipoDocumento: initialData.tipoDocumento || '',
    numeroDocumento: initialData.numeroDocumento || '',
  })

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    repeat: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      nombre: initialData.nombre || '',
      apellidoPaterno: initialData.apellidoPaterno || '',
      apellidoMaterno: initialData.apellidoMaterno || '',
      email: initialData.email || '',
      genero: initialData.genero || '',
      telefono: initialData.telefono || '',
      tipoDocumento: initialData.tipoDocumento || '',
      numeroDocumento: initialData.numeroDocumento || '',
    })
    setPasswords({
      current: '',
      new: '',
      repeat: '',
    })
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    // Validations
    if (!formData.nombre.trim()) {
      setErrorMessage('El nombre es requerido')
      return
    }

    if (!formData.email.trim()) {
      setErrorMessage('El email es requerido')
      return
    }

    if (!formData.tipoDocumento) {
      setErrorMessage('El tipo de documento es requerido')
      return
    }

    if (!formData.numeroDocumento.trim()) {
      setErrorMessage('El número de documento es requerido')
      return
    }

    // Password validations
    if (passwords.new) {
      if (!passwords.current) {
        setErrorMessage('Debes ingresa tu contraseña actual para cambiar a una nueva')
        return
      }

      if (passwords.new !== passwords.repeat) {
        setErrorMessage('Las nuevas contraseñas no coinciden')
        return
      }

      if (passwords.new.length < 8) {
        setErrorMessage('La nueva contraseña debe tener al menos 8 caracteres')
        return
      }
    }

    setIsLoading(true)

    try {
      const result = await updateStudentProfile(formData, passwords)

      setSuccessMessage(result.message || 'Cambios guardados exitosamente')
      setIsEditing(false)
      setPasswords({
        current: '',
        new: '',
        repeat: '',
      })
      
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
      const errorMsg = error instanceof Error ? error.message : 'Error al guardar los cambios. Intenta de nuevo.'
      setErrorMessage(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
        </div>
        {!isEditing && (
          <Button
            type="button"
            onClick={handleEditClick}
            variant="outline"
            className="cursor-pointer h-10 px-6 rounded-md border border-gray-300 hover:text-white hover:bg-slate-800"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      {/* Main Card */}
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 border border-red-200">
              {errorMessage}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 border border-green-200">
              {successMessage}
            </div>
          )}

          {/* Section 1: Información Personal */}
          <section>
            <h2 className="text-lg font-bold mb-6">Información Personal</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Ingresa tu nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className="rounded-md disabled:opacity-100"
                />
              </div>

              {/* Apellido Paterno */}
              <div className="space-y-2">
                <Label
                  htmlFor="apellidoPaterno"
                  className="text-sm font-medium"
                >
                  Apellido Paterno
                </Label>
                <Input
                  id="apellidoPaterno"
                  name="apellidoPaterno"
                  placeholder="Ingresa tu apellido paterno"
                  value={formData.apellidoPaterno}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="rounded-md disabled:opacity-100"
                />
              </div>

              {/* Apellido Materno */}
              <div className="space-y-2">
                <Label
                  htmlFor="apellidoMaterno"
                  className="text-sm font-medium"
                >
                  Apellido Materno
                </Label>
                <Input
                  id="apellidoMaterno"
                  name="apellidoMaterno"
                  placeholder="Ingresa tu apellido materno"
                  value={formData.apellidoMaterno}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="rounded-md disabled:opacity-100"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu.email@ejemplo.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className="rounded-md disabled:opacity-100"
                />
              </div>

              {/* Género */}
              <div className="space-y-2">
                <Label htmlFor="genero" className="text-sm font-medium">
                  Género
                </Label>
                <Select
                  value={formData.genero}
                  onValueChange={(value) => handleSelectChange('genero', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger
                    id="genero"
                    className="rounded-md disabled:opacity-100"
                    disabled={!isEditing}
                  >
                    <SelectValue placeholder="Selecciona tu género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="prefiero-no-decir">
                      Prefiero no decir
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Número de Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-sm font-medium">
                  Número de Teléfono
                </Label>
                <Input
                  id="telefono"
                  name="telefono"
                  placeholder="+51 999 999 999"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="rounded-md disabled:opacity-100"
                />
              </div>

              {/* Tipo de Documento */}
              <div className="space-y-2">
                <Label htmlFor="tipoDocumento" className="text-sm font-medium">
                  Tipo de Documento <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.tipoDocumento}
                  onValueChange={(value) =>
                    handleSelectChange('tipoDocumento', value)
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger
                    id="tipoDocumento"
                    className="rounded-md disabled:opacity-100"
                    disabled={!isEditing}
                  >
                    <SelectValue placeholder="Selecciona tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposDocumento.length > 0 ? (
                      tiposDocumento.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          {tipo.nombre}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="dni">DNI</SelectItem>
                        <SelectItem value="ce">CE</SelectItem>
                        <SelectItem value="pasaporte">Pasaporte</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Número de Documento */}
              <div className="space-y-2">
                <Label
                  htmlFor="numeroDocumento"
                  className="text-sm font-medium"
                >
                  Número de Documento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="numeroDocumento"
                  name="numeroDocumento"
                  placeholder="12345678"
                  value={formData.numeroDocumento}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className="rounded-md disabled:opacity-100"
                />
              </div>
            </div>
          </section>

          {/* Show password section only when editing */}
          {isEditing && (
            <>
              {/* Separator */}
              <Separator />

              {/* Section 2: Actualizar Contraseña */}
              <section>
                <h3 className="text-sm font-semibold text-white-foreground uppercase mb-2">
                  Actualizar Contraseña
                </h3>
                <p className="text-xs text-white-foreground mb-6">
                  Opcional. Deja estos campos vacíos si no deseas cambiar tu contraseña.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contraseña Actual */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="passwordCurrent"
                      className="text-sm font-medium"
                    >
                      Contraseña Actual
                    </Label>
                    <Input
                      id="passwordCurrent"
                      name="current"
                      type="password"
                      placeholder="Ingresa tu contraseña actual"
                      value={passwords.current}
                      onChange={handlePasswordChange}
                      className="rounded-md"
                    />
                  </div>

                  {/* Nueva Contraseña y Repetir */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="passwordNew"
                        className="text-sm font-medium"
                      >
                        Nueva Contraseña
                      </Label>
                      <Input
                        id="passwordNew"
                        name="new"
                        type="password"
                        placeholder="Ingresa tu nueva contraseña"
                        value={passwords.new}
                        onChange={handlePasswordChange}
                        className="rounded-md"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="passwordRepeat"
                        className="text-sm font-medium"
                      >
                        Repetir Contraseña
                      </Label>
                      <Input
                        id="passwordRepeat"
                        name="repeat"
                        type="password"
                        placeholder="Repite tu nueva contraseña"
                        value={passwords.repeat}
                        onChange={handlePasswordChange}
                        className="rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium h-10 rounded-md"
              >
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                variant="outline"
                className="flex-1 h-10 rounded-md border border-gray-300 hover:text-white"
              >
                Cancelar
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground py-6">
        © 2026 Virtual Classroom. All rights reserved.
      </footer>
    </div>
  )
}
