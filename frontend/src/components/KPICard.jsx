export default function KPICard({ label, value, icon: Icon, color = 'violet' }) {
  const palette = {
    violet: { wrap: 'border-violet-500/20 bg-violet-500/[0.06]', icon: 'bg-violet-500/15 border-violet-500/25 text-violet-400' },
    blue:   { wrap: 'border-blue-500/20   bg-blue-500/[0.06]',   icon: 'bg-blue-500/15   border-blue-500/25   text-blue-400'   },
    emerald:{ wrap: 'border-emerald-500/20 bg-emerald-500/[0.06]',icon: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'},
    amber:  { wrap: 'border-amber-500/20  bg-amber-500/[0.06]',  icon: 'bg-amber-500/15  border-amber-500/25  text-amber-400'  },
  }
  const c = palette[color] ?? palette.violet

  const formatted =
    typeof value === 'number'
      ? value.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : (value ?? '—')

  return (
    <div className={`rounded-2xl border p-5 fade-in ${c.wrap}`}>
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-4 ${c.icon}`}>
        {Icon && <Icon size={16} />}
      </div>
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">{label}</p>
      <p className="text-xl font-bold text-white leading-tight truncate" title={String(formatted)}>
        {formatted}
      </p>
    </div>
  )
}
