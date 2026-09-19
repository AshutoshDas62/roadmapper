import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AuthCard } from '../components/AuthCard'
import { FormField, FormMessage } from '../components/AuthFormFields'
import { LoadingScreen } from '../components/LoadingScreen'
import { useAuth } from '../context/useAuth'

export function SignupPage() {
  const { user, isLoading, authError, signUp } = useAuth()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  if (isLoading) return <LoadingScreen />
  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const password = form.get('password')
    if (password !== form.get('confirmPassword')) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setSuccess('')
    setIsSubmitting(true)
    try {
      const data = await signUp({ email: form.get('email'), password, username: form.get('username'), fullName: form.get('fullName') })
      setSuccess(data.session ? 'Account created. You are now signed in.' : 'Account created. Check your email to confirm your address, then sign in.')
      event.currentTarget.reset()
    } catch (submissionError) {
      setError(submissionError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return <AuthCard title="Create your account" description="Start organizing the skills you want to learn." footer={<><span>Already have an account? </span><Link className="font-semibold text-indigo-600 hover:text-indigo-700" to="/login">Sign in</Link></>}>
    <form className="space-y-4" onSubmit={handleSubmit}>
      <FormMessage error={error || authError} success={success} />
      <FormField id="fullName" name="fullName" label="Full name" autoComplete="name" />
      <FormField id="username" name="username" label="Username" autoComplete="username" pattern="[A-Za-z0-9_-]{3,30}" title="Use 3–30 letters, numbers, underscores, or hyphens." />
      <FormField id="email" name="email" label="Email address" type="email" autoComplete="email" />
      <FormField id="password" name="password" label="Password" type="password" autoComplete="new-password" minLength="6" />
      <FormField id="confirmPassword" name="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" minLength="6" />
      <button disabled={isSubmitting} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Creating account...' : 'Create account'}</button>
    </form>
  </AuthCard>
}
