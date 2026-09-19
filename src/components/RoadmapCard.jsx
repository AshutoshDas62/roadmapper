import { Archive, ArchiveRestore, Copy, Globe2, Lock, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RoadmapIcon } from './RoadmapIcon'

function IconButton({ label, onClick, disabled, children, danger = false }) {
  return <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} className={`rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>{children}</button>
}

export function RoadmapCard({ roadmap, onDuplicate, onArchive, onDelete, isBusy }) {
  const isPublic = roadmap.visibility === 'PUBLIC'

  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/roadmaps/${roadmap.id}`} className="flex min-w-0 items-start gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-indigo-200">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><RoadmapIcon name={roadmap.icon} /></span>
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-slate-900">{roadmap.title}</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">{roadmap.category}</p>
          </div>
        </Link>
        <div className="flex shrink-0 items-center">
          <Link to={`/roadmaps/${roadmap.id}`} aria-label="Edit roadmap" title="Edit roadmap" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><Pencil size={16} aria-hidden="true" /></Link>
          <IconButton label="Duplicate roadmap" onClick={() => onDuplicate(roadmap)} disabled={isBusy}><Copy size={16} aria-hidden="true" /></IconButton>
          <IconButton label={roadmap.archived ? 'Restore roadmap' : 'Archive roadmap'} onClick={() => onArchive(roadmap)} disabled={isBusy}>{roadmap.archived ? <ArchiveRestore size={16} aria-hidden="true" /> : <Archive size={16} aria-hidden="true" />}</IconButton>
          <IconButton label="Delete roadmap" onClick={() => onDelete(roadmap)} disabled={isBusy} danger><Trash2 size={16} aria-hidden="true" /></IconButton>
        </div>
      </div>
      <Link to={`/roadmaps/${roadmap.id}`} className="mt-4 block flex-1 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-indigo-200">
        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{roadmap.description || 'No description yet.'}</p>
      </Link>
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">{isPublic ? <Globe2 size={14} aria-hidden="true" /> : <Lock size={14} aria-hidden="true" />}{isPublic ? 'Public' : 'Private'}</span>
        <span>{roadmap.archived ? 'Archived' : 'Active'}</span>
      </div>
    </article>
  )
}
