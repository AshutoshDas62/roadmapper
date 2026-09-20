import { supabase } from './supabase'

export const topicStatuses = [
  { value: 'NOT_STARTED', label: 'Not started', className: 'bg-slate-100 text-slate-700' },
  { value: 'IN_PROGRESS', label: 'In progress', className: 'bg-amber-100 text-amber-800' },
  { value: 'COMPLETED', label: 'Completed', className: 'bg-emerald-100 text-emerald-800' },
  { value: 'SKIPPED', label: 'Skipped', className: 'bg-slate-200 text-slate-600' },
]

export function getTopicStatus(status) {
  return topicStatuses.find((item) => item.value === status) || topicStatuses[0]
}

export function createTopic(values) {
  return supabase.from('roadmap_topics').insert(values).select().single()
}

export function updateTopic(id, values) {
  return supabase.from('roadmap_topics').update(values).eq('id', id).select().single()
}

export function deleteTopic(id) {
  return supabase.from('roadmap_topics').delete().eq('id', id)
}

export function createTopicEdge(values) {
  return supabase.from('roadmap_edges').insert(values).select().single()
}

export function deleteTopicEdge(id) {
  return supabase.from('roadmap_edges').delete().eq('id', id)
}
