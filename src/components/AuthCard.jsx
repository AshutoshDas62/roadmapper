import { Link } from 'react-router-dom'

export function AuthCard({ title, description, children, footer }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link to="/login" className="mb-8 inline-flex items-center gap-2 font-bold tracking-tight text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-sm text-white">R</span>
          Roadmapper
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        <div className="mt-7">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
      </section>
    </main>
  )
}
