import { useEffect, useMemo, useState } from 'react'
import { Archive, Plus, RefreshCw, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RoadmapCard } from '../components/RoadmapCard'
import { deleteRoadmap, duplicateRoadmap, roadmapCategories, updateRoadmap } from '../lib/roadmaps'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/useAuth'

export function RoadmapsPage() {
  const { user } = useAuth()
  const [roadmaps, setRoadmaps] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('active')
  const [category, setCategory] = useState('ALL')
  const [visibility, setVisibility] = useState('ALL')

  async function loadRoadmaps() {
    setIsLoading(true)
    setError('')
    const { data, error: loadError } = await supabase
      .from('roadmaps')
      .select('id, title, description, category, icon, visibility, archived, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (loadError) {
      setError(loadError.message)
      setRoadmaps([])
    } else {
      setRoadmaps(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    let isMounted = true
    supabase
      .from('roadmaps')
      .select('id, title, description, category, icon, visibility, archived, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .then(({ data, error: loadError }) => {
        if (!isMounted) return
        if (loadError) {
          setError(loadError.message)
          setRoadmaps([])
        } else {
          setRoadmaps(data)
        }
        setIsLoading(false)
      })
    return () => { isMounted = false }
  }, [user.id])

  const filteredRoadmaps = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return roadmaps.filter((roadmap) => {
      const matchesQuery = !normalizedQuery || `${roadmap.title} ${roadmap.description} ${roadmap.category}`.toLowerCase().includes(normalizedQuery)
      const matchesStatus = status === 'all' || (status === 'archived' ? roadmap.archived : !roadmap.archived)
      const matchesCategory = category === 'ALL' || roadmap.category === category
      const matchesVisibility = visibility === 'ALL' || roadmap.visibility === visibility
      return matchesQuery && matchesStatus && matchesCategory && matchesVisibility
    })
  }, [roadmaps, query, status, category, visibility])

  async function runAction(roadmap, action) {
    setActionError('')
    setBusyId(roadmap.id)
    try {
      await action()
      await loadRoadmaps()
    } catch (operationError) {
      setActionError(operationError.message || 'We could not update this roadmap. Please try again.')
    } finally {
      setBusyId('')
    }
  }

  function handleDuplicate(roadmap) {
    return runAction(roadmap, async () => {
      const { error: duplicateError } = await duplicateRoadmap(roadmap, user.id)
      if (duplicateError) throw duplicateError
    })
  }

  function handleArchive(roadmap) {
    return runAction(roadmap, async () => {
      const { error: archiveError } = await updateRoadmap(roadmap.id, { archived: !roadmap.archived })
      if (archiveError) throw archiveError
    })
  }

  function handleDelete(roadmap) {
    if (!window.confirm(`Delete “${roadmap.title}”? This cannot be undone.`)) return
    return runAction(roadmap, async () => {
      const { error: deleteError } = await deleteRoadmap(roadmap.id)
      if (deleteError) throw deleteError
    })
  }

  const activeCount = roadmaps.filter((roadmap) => !roadmap.archived).length
  const archivedCount = roadmaps.length - activeCount

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-indigo-600">Your learning library</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Roadmaps</h1><p className="mt-2 text-sm text-slate-600">Plan what you want to learn and return whenever you are ready.</p></div>
        <Link to="/roadmaps/new" className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"><Plus size={17} aria-hidden="true" /> New roadmap</Link>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <button type="button" onClick={() => setStatus('active')} className={`rounded-xl border p-4 text-left transition ${status === 'active' ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}><p className="text-sm font-medium text-slate-600">Active roadmaps</p><p className="mt-1 text-2xl font-bold text-slate-900">{activeCount}</p></button>
        <button type="button" onClick={() => setStatus('archived')} className={`rounded-xl border p-4 text-left transition ${status === 'archived' ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}><p className="text-sm font-medium text-slate-600">Archived roadmaps</p><p className="mt-1 text-2xl font-bold text-slate-900">{archivedCount}</p></button>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="relative md:col-span-2"><span className="sr-only">Search roadmaps</span><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" placeholder="Search roadmaps" /></label>
          <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category" className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"><option value="ALL">All categories</option>{roadmapCategories.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={visibility} onChange={(event) => setVisibility(event.target.value)} aria-label="Filter by visibility" className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"><option value="ALL">All visibility</option><option value="PRIVATE">Private</option><option value="PUBLIC">Public</option></select>
        </div>
      </div>

      {actionError && <p className="mt-5 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">{actionError}</p>}
      {isLoading && <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white" />)}</div>}
      {!isLoading && error && <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6"><h2 className="font-semibold text-amber-900">We could not load your roadmaps.</h2><p className="mt-1 text-sm text-amber-800">{error}</p><button type="button" onClick={loadRoadmaps} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-amber-900 shadow-sm"><RefreshCw size={16} aria-hidden="true" /> Try again</button></div>}
      {!isLoading && !error && filteredRoadmaps.length > 0 && <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredRoadmaps.map((roadmap) => <RoadmapCard key={roadmap.id} roadmap={roadmap} isBusy={busyId === roadmap.id} onDuplicate={handleDuplicate} onArchive={handleArchive} onDelete={handleDelete} />)}</div>}
      {!isLoading && !error && filteredRoadmaps.length === 0 && <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><Archive className="mx-auto text-slate-400" size={28} aria-hidden="true" /><h2 className="mt-4 font-semibold text-slate-900">{roadmaps.length === 0 ? 'Your roadmap library is empty' : 'No roadmaps match these filters'}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{roadmaps.length === 0 ? 'Create your first roadmap to start outlining a learning journey.' : 'Try clearing a filter or changing your search.'}</p>{roadmaps.length === 0 ? <Link to="/roadmaps/new" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"><Plus size={17} aria-hidden="true" /> Create roadmap</Link> : <button type="button" onClick={() => { setQuery(''); setStatus('all'); setCategory('ALL'); setVisibility('ALL') }} className="mt-5 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700">Clear filters</button>}</div>}
    </div>
  )
}
