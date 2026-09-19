import { useState } from 'react'
import { roadmapCategories, roadmapIconOptions } from '../lib/roadmaps'

const inputClass = 'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100'

export function RoadmapForm({ roadmap, onSave, onCancel, submitLabel = 'Save roadmap' }) {
  const [values, setValues] = useState({
    title: roadmap?.title || '',
    description: roadmap?.description || '',
    category: roadmap?.category || 'General',
    icon: roadmap?.icon || 'map',
    visibility: roadmap?.visibility || 'PRIVATE',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const title = values.title.trim()
    if (!title) {
      setError('Give your roadmap a title before saving.')
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      await onSave({ ...values, title, description: values.description.trim() })
    } catch (saveError) {
      setError(saveError.message || 'We could not save this roadmap. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">{error}</p>}
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
        <input id="title" name="title" value={values.title} onChange={updateField} maxLength="120" required autoFocus className={inputClass} placeholder="e.g. Frontend development" />
      </div>
      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">Description <span className="font-normal text-slate-400">(optional)</span></label>
        <textarea id="description" name="description" value={values.description} onChange={updateField} rows="4" maxLength="1000" className={inputClass} placeholder="What do you want to learn?" />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
          <select id="category" name="category" value={values.category} onChange={updateField} className={inputClass}>
            {roadmapCategories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="icon" className="mb-1.5 block text-sm font-medium text-slate-700">Icon</label>
          <select id="icon" name="icon" value={values.icon} onChange={updateField} className={inputClass}>
            {roadmapIconOptions.map((icon) => <option key={icon.value} value={icon.value}>{icon.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="visibility" className="mb-1.5 block text-sm font-medium text-slate-700">Visibility</label>
          <select id="visibility" name="visibility" value={values.visibility} onChange={updateField} className={inputClass}>
            <option value="PRIVATE">Private</option>
            <option value="PUBLIC">Public</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
        {onCancel && <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60">Cancel</button>}
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Saving...' : submitLabel}</button>
      </div>
    </form>
  )
}
