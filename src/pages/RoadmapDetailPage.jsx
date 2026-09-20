import { useEffect, useState } from 'react'
import { Archive, ArchiveRestore, ArrowLeft, Copy, Globe2, Lock, Pencil, RefreshCw, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { RoadmapForm } from '../components/RoadmapForm'
import { deleteRoadmap, duplicateRoadmap, updateRoadmap } from '../lib/roadmaps'
import { RoadmapIcon } from '../components/RoadmapIcon'
import { RoadmapEditor } from '../components/RoadmapEditor'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/useAuth'

export function RoadmapDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [roadmap, setRoadmap] = useState(null)
  const [state, setState] = useState('loading')
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isActing, setIsActing] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function loadRoadmap() {
      setState('loading')
      const { data, error: loadError } = await supabase
        .from('roadmaps')
        .select('id, title, description, category, icon, visibility, archived, created_at, updated_at')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle()
      if (!isMounted) return
      if (loadError) {
        setError(loadError.message)
        setState('error')
      } else if (!data) {
        setState('missing')
      } else {
        setRoadmap(data)
        setState('ready')
      }
    }
    loadRoadmap()
    return () => { isMounted = false }
  }, [id, user.id])

  async function saveEdit(values) {
    const { data, error: updateError } = await updateRoadmap(id, values)
    if (updateError) throw updateError
    setRoadmap(data)
    setIsEditing(false)
  }

  async function runAction(action) {
    setActionError('')
    setIsActing(true)
    try {
      await action()
    } catch (operationError) {
      setActionError(operationError.message || 'We could not update this roadmap. Please try again.')
    } finally {
      setIsActing(false)
    }
  }

  function handleArchive() {
    return runAction(async () => {
      const { data, error: archiveError } = await updateRoadmap(id, { archived: !roadmap.archived })
      if (archiveError) throw archiveError
      setRoadmap(data)
    })
  }

  function handleDuplicate() {
    return runAction(async () => {
      const { data, error: duplicateError } = await duplicateRoadmap(roadmap, user.id)
      if (duplicateError) throw duplicateError
      navigate(`/roadmaps/${data.id}`)
    })
  }

  function handleDelete() {
    if (!window.confirm(`Delete “${roadmap.title}”? This cannot be undone.`)) return
    return runAction(async () => {
      const { error: deleteError } = await deleteRoadmap(id)
      if (deleteError) throw deleteError
      navigate('/roadmaps', { replace: true })
    })
  }

  if (state === 'loading') return <div className="mx-auto max-w-3xl animate-pulse rounded-2xl border border-slate-200 bg-white p-8"><div className="h-5 w-32 rounded bg-slate-200" /><div className="mt-5 h-10 w-2/3 rounded bg-slate-200" /><div className="mt-5 h-20 rounded bg-slate-100" /></div>
  if (state === 'missing') return <MessagePage title="Roadmap not found" description="It may have been deleted, or you do not have permission to view it." />
  if (state === 'error') return <MessagePage title="We could not load this roadmap" description={error} retry />

  const isPublic = roadmap.visibility === 'PUBLIC'
  return (
    <div className="mx-auto max-w-6xl">
      <Link to="/roadmaps" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"><ArrowLeft size={16} aria-hidden="true" /> Back to roadmaps</Link>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {isEditing ? <>
          <div className="mb-7"><p className="text-sm font-medium text-indigo-600">Roadmap details</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Edit roadmap</h1></div>
          <RoadmapForm roadmap={roadmap} onSave={saveEdit} onCancel={() => setIsEditing(false)} submitLabel="Save changes" />
        </> : <>
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div className="flex min-w-0 gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><RoadmapIcon name={roadmap.icon} size={24} /></span><div className="min-w-0"><p className="text-sm font-medium text-indigo-600">{roadmap.category}</p><h1 className="mt-1 break-words text-3xl font-bold tracking-tight text-slate-900">{roadmap.title}</h1></div></div>
            <button type="button" onClick={() => setIsEditing(true)} disabled={isActing} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60"><Pencil size={16} aria-hidden="true" /> Edit</button>
          </div>
          <p className="mt-7 whitespace-pre-wrap text-sm leading-7 text-slate-600">{roadmap.description || 'No description yet.'}</p>
          <div className="mt-7 flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">{isPublic ? <Globe2 size={14} aria-hidden="true" /> : <Lock size={14} aria-hidden="true" />}{isPublic ? 'Public' : 'Private'}</span>{roadmap.archived && <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700"><Archive size={14} aria-hidden="true" /> Archived</span>}</div>
          {actionError && <p className="mt-6 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">{actionError}</p>}
          <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
            <button type="button" onClick={handleDuplicate} disabled={isActing} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><Copy size={16} aria-hidden="true" /> Duplicate</button>
            <button type="button" onClick={handleArchive} disabled={isActing} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">{roadmap.archived ? <ArchiveRestore size={16} aria-hidden="true" /> : <Archive size={16} aria-hidden="true" />}{roadmap.archived ? 'Restore' : 'Archive'}</button>
            <button type="button" onClick={handleDelete} disabled={isActing} className="ml-auto inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"><Trash2 size={16} aria-hidden="true" /> Delete</button>
          </div>
        </>}
      </div>
      {!isEditing && <RoadmapEditor roadmapId={roadmap.id} />}
    </div>
  )
}

function MessagePage({ title, description, retry }) {
  return <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center"><h1 className="text-2xl font-bold text-slate-900">{title}</h1><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>{retry ? <button type="button" onClick={() => window.location.reload()} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700"><RefreshCw size={16} aria-hidden="true" /> Try again</button> : <Link to="/roadmaps" className="mt-5 inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">Back to roadmaps</Link>}</div>
}
