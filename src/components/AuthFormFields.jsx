export function FormField({ id, label, type = 'text', autoComplete, required = true, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
        {...props}
      />
    </div>
  )
}

export function FormMessage({ error, success }) {
  if (!error && !success) return null
  return <p className={`rounded-lg px-3 py-2.5 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`} role={error ? 'alert' : 'status'}>{error || success}</p>
}
