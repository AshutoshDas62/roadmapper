import { useEffect, useState } from 'react'
import { ArrowRight, Map, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { supabase } from '../lib/supabase'

export function DashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileState, setProfileState] = useState('loading')

  useEffect(() => {
    let isMounted = true
    async function loadProfile() {
      const { data, error } = await supabase.from('profiles').select('username, full_name, created_at').eq('id', user.id).maybeSingle()
      if (!isMounted) return
      if (error) {
        setProfileState('error')
        return
      }
      setProfile(data)
      setProfileState(data ? 'ready' : 'empty')
    }
    loadProfile()
    return () => { isMounted = false }
  }, [user.id])

  const name = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0]
  return <div>
    <div className="rounded-2xl bg-slate-900 px-6 py-8 text-white sm:px-8">
      <p className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-indigo-200"><Sparkles size={16} aria-hidden="true" /> Your learning space</p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome, {name}.</h1>
      <p className="mt-3 max-w-xl text-slate-300">Turn the subjects you care about into a focused learning journey, one roadmap at a time.</p>
      <Link to="/roadmaps" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-indigo-50">Explore roadmaps <ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
    <section className="mt-8">
      <h2 className="text-lg font-bold text-slate-900">Getting started</h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5"><Map className="mb-4 text-indigo-600" size={22} aria-hidden="true" /><h3 className="font-semibold text-slate-900">No roadmaps yet</h3><p className="mt-1 text-sm leading-6 text-slate-600">Roadmap creation arrives in the next phase. Your dashboard is ready for it.</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-slate-900">Account status</p>{profileState === 'loading' && <p className="mt-2 text-sm text-slate-600">Loading your profile…</p>}{profileState === 'ready' && <p className="mt-2 text-sm text-emerald-700">Your profile is ready.</p>}{profileState === 'empty' && <p className="mt-2 text-sm text-amber-700">Your profile is being set up. Refresh in a moment.</p>}{profileState === 'error' && <p className="mt-2 text-sm text-amber-700">We could not load your profile yet. Check that the Phase 1 Supabase migration has been applied.</p>}</div>
      </div>
    </section>
  </div>
}
