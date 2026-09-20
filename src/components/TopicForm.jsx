import { useState } from 'react'
import { X } from 'lucide-react'
import { topicStatuses } from '../lib/topics'

const inputClass = 'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100'

export function TopicForm({ topic, parentTopic, onSave, onCancel }) {
  const [values, setValues] = useState({
    title: topic?.title || '',
    description: topic?.description || '',
    status: topic?.status || 'NOT_STARTED',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(topic)

  function updateField(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const title = values.title.trim()
    if (!title) {
      setError('Give this topic a title before saving.')
      return
    }
    setError('')
    setIsSubmitting(true)
    try {
      await onSave({ ...values, title, description: values.description.trim() })
    } catch (saveError) {
      setError(saveError.message || 'We could not save this topic. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="topic-form-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-indigo-600">Roadmap topic</p><h2 id="topic-form-title" className="mt-1 text-xl font-bold text-slate-900">{isEditing ? 'Edit topic' : parentTopic ? 'Create subtopic' : 'Create topic'}</h2>{parentTopic && <p className="mt-1 text-sm text-slate-600">This will be added under {parentTopic.title}.</p>}</div><button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close topic form"><X size={18} aria-hidden="true" /></button></div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">{error}</p>}
          <div><label htmlFor="topic-title" className="mb-1.5 block text-sm font-medium text-slate-700">Title</label><input id="topic-title" name="title" value={values.title} onChange={updateField} maxLength="120" required autoFocus className={inputClass} placeholder="e.g. Learn the fundamentals" /></div>
          <div><label htmlFor="topic-description" className="mb-1.5 block text-sm font-medium text-slate-700">Description <span className="font-normal text-slate-400">(optional)</span></label><textarea id="topic-description" name="description" value={values.description} onChange={updateField} rows="4" maxLength="1000" className={inputClass} placeholder="Add a short description" /></div>
          <div><label htmlFor="topic-status" className="mb-1.5 block text-sm font-medium text-slate-700">Status</label><select id="topic-status" name="status" value={values.status} onChange={updateField} className={inputClass}>{topicStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60">Cancel</button><button type="submit" disabled={isSubmitting} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create topic'}</button></div>
        </form>
      </section>
    </div>
  )
}
