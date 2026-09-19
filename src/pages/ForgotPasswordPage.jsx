import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthCard } from '../components/AuthCard'
import { FormField, FormMessage } from '../components/AuthFormFields'
import { useAuth } from '../context/useAuth'

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const email = new FormData(event.currentTarget).get('email')
    setError('')
    setSuccess('')
    setIsSubmitting(true)
    try {
      await resetPassword(email)
      setSuccess('If an account exists for that email, we sent password reset instructions.')
    } catch (submissionError) {
      setError(submissionError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return <AuthCard title="Reset your password" description="Enter your email and we’ll send a secure reset link." footer={<Link className="font-semibold text-indigo-600 hover:text-indigo-700" to="/login">Back to sign in</Link>}>
    <form className="space-y-4" onSubmit={handleSubmit}>
      <FormMessage error={error} success={success} />
      <FormField id="email" name="email" label="Email address" type="email" autoComplete="email" />
      <button disabled={isSubmitting} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Sending link...' : 'Send reset link'}</button>
    </form>
  </AuthCard>
}
