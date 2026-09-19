import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { RoadmapForm } from '../components/RoadmapForm'
import { createRoadmap } from '../lib/roadmaps'
import { useAuth } from '../context/useAuth'

export function RoadmapNewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleSave(values) {
    const { data, error } = await createRoadmap({ ...values, user_id: user.id })
    if (error) throw error
    navigate(`/roadmaps/${data.id}`, { replace: true })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/roadmaps" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"><ArrowLeft size={16} aria-hidden="true" /> Back to roadmaps</Link>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-indigo-600">Roadmap setup</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Create a roadmap</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Start with the basics. You can add topics when the visual editor arrives in Phase 3.</p>
        <div className="mt-7"><RoadmapForm onSave={handleSave} onCancel={() => navigate('/roadmaps')} submitLabel="Create roadmap" /></div>
      </div>
    </div>
  )
}
