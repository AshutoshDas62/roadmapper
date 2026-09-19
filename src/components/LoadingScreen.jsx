export function LoadingScreen({ label = 'Loading Roadmapper...' }) {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center">
      <div>
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
    </div>
  )
}
