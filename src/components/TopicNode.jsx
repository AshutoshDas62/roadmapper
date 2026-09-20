import { CheckCircle2, Circle, MoreHorizontal, SkipForward } from 'lucide-react'
import { Handle, Position } from 'reactflow'
import { getTopicStatus } from '../lib/topics'

function StatusIcon({ status }) {
  if (status === 'COMPLETED') return <CheckCircle2 size={15} aria-hidden="true" />
  if (status === 'SKIPPED') return <SkipForward size={15} aria-hidden="true" />
  if (status === 'IN_PROGRESS') return <MoreHorizontal size={15} aria-hidden="true" />
  return <Circle size={15} aria-hidden="true" />
}

export function TopicNode({ data }) {
  const { topic, onEdit, onAddSubtopic, onDelete } = data
  const status = getTopicStatus(topic.status)

  return (
    <div className="w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-md">
      <Handle type="target" position={Position.Top} className="!h-2.5 !w-2.5 !border-2 !border-white !bg-indigo-500" />
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">{topic.title}</p>
        <div className="nodrag flex shrink-0 gap-0.5">
          <button type="button" onClick={() => onEdit(topic)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={`Edit ${topic.title}`}><MoreHorizontal size={15} aria-hidden="true" /></button>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${status.className}`}><StatusIcon status={topic.status} />{status.label}</span>
        {topic.parent_id && <span className="text-[11px] font-medium text-slate-400">Subtopic</span>}
      </div>
      <div className="nodrag mt-3 flex gap-2 border-t border-slate-100 pt-2.5">
        <button type="button" onClick={() => onAddSubtopic(topic)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Add subtopic</button>
        <button type="button" onClick={() => onDelete(topic)} className="ml-auto text-xs font-semibold text-red-600 hover:text-red-700">Delete</button>
      </div>
      <Handle type="source" position={Position.Bottom} className="!h-2.5 !w-2.5 !border-2 !border-white !bg-indigo-500" />
    </div>
  )
}
