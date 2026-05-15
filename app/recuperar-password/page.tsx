import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export default async function RecuperarPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="w-full px-4 flex justify-center">
        <ForgotPasswordForm token={token} />
      </div>
    </div>
  )
}
