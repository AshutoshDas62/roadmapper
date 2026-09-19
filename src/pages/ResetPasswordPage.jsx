import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AuthCard } from '../components/AuthCard'
import { FormField, FormMessage } from '../components/AuthFormFields'
import { LoadingScreen } from '../components/LoadingScreen'
import { useAuth } from '../context/useAuth'

export function ResetPasswordPage() {
  const { user, isLoading, updatePassword, signOut } = useAuth()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  if (isLoading) return <LoadingScreen label="Verifying reset link..." />
  if (!user && success) return <Navigate to="/login" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const password = form.get('password')
    if (password !== form.get('confirmPassword')) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setIsSubmitting(true)
    try {
      await updatePassword(password)
      await signOut()
      setSuccess('Your password has been updated. Please sign in with your new password.')
    } catch (submissionError) {
      setError(submissionError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return <AuthCard title="Reset link needed" description="Use the password reset link in your email to choose a new password." footer={<Link className="font-semibold text-indigo-600 hover:text-indigo-700" to="/forgot-password">Request a new link</Link>} />

  return <AuthCard title="Choose a new password" description="Create a new password for your Roadmapper account.">
    <form className="space-y-4" onSubmit={handleSubmit}>
      <FormMessage error={error} success={success} />
      <FormField id="password" name="password" label="New password" type="password" autoComplete="new-password" minLength="6" />
      <FormField id="confirmPassword" name="confirmPassword" label="Confirm new password" type="password" autoComplete="new-password" minLength="6" />
      <button disabled={isSubmitting} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Updating password...' : 'Update password'}</button>
    </form>
  </AuthCard>
}
