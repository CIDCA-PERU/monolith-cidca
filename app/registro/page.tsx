import { RegisterForm } from '@/components/auth/register-form'
import { getTiposDocumento } from '@/repository/documento.repository'

export default async function RegisterPage() {
  const tiposDocumento = await getTiposDocumento()

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black py-10">
      <div className="w-full px-4 flex justify-center">
        <RegisterForm tiposDocumento={tiposDocumento} />
      </div>
    </div>
  )
}
