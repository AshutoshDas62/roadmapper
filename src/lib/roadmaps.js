import { supabase } from './supabase'

export const roadmapCategories = ['General', 'Programming', 'Design', 'Career', 'Languages', 'Personal']

export const roadmapIconOptions = [
  { value: 'map', label: 'Map' },
  { value: 'code', label: 'Code' },
  { value: 'design', label: 'Design' },
  { value: 'career', label: 'Career' },
  { value: 'learning', label: 'Learning' },
  { value: 'book', label: 'Book' },
  { value: 'compass', label: 'Compass' },
]

export function createRoadmap(values) {
  return supabase
    .from('roadmaps')
    .insert(values)
    .select()
    .single()
}

export function updateRoadmap(id, values) {
  return supabase
    .from('roadmaps')
    .update(values)
    .eq('id', id)
    .select()
    .single()
}

export function deleteRoadmap(id) {
  return supabase.from('roadmaps').delete().eq('id', id)
}

export function duplicateRoadmap(roadmap, userId) {
  return createRoadmap({
    user_id: userId,
    title: `Copy of ${roadmap.title}`.slice(0, 120),
    description: roadmap.description,
    category: roadmap.category,
    icon: roadmap.icon,
    visibility: roadmap.visibility,
    archived: false,
  })
}
