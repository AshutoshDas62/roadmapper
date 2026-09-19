import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthCard } from '../components/AuthCard'
import { FormField, FormMessage } from '../components/AuthFormFields'
import { LoadingScreen } from '../components/LoadingScreen'
import { useAuth } from '../context/useAuth'

export function LoginPage() {
  const { user, isLoading, authError, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  if (isLoading) return <LoadingScreen />
  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError('')
    setIsSubmitting(true)
    try {
      await signIn({ email: form.get('email'), password: form.get('password') })
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (submissionError) {
      setError(submissionError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return <AuthCard title="Welcome back" description="Sign in to continue building your learning journey." footer={<><span>New to Roadmapper? </span><Link className="font-semibold text-indigo-600 hover:text-indigo-700" to="/signup">Create an account</Link></>}>
    <form className="space-y-4" onSubmit={handleSubmit}>
      <FormMessage error={error || authError} />
      <FormField id="email" name="email" label="Email address" type="email" autoComplete="email" />
      <FormField id="password" name="password" label="Password" type="password" autoComplete="current-password" />
      <div className="flex justify-end"><Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Forgot password?</Link></div>
      <button disabled={isSubmitting} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Signing in...' : 'Sign in'}</button>
    </form>
  </AuthCard>
}
