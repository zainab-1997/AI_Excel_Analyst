import { useEffect, useState } from 'react'
import { Clock, ChevronDown, ChevronUp, Loader2, Inbox, FileText } from 'lucide-react'
import { getHistory } from '../api'

export default function HistoryTab() {
  const [reports,  setReports]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    getHistory()
      .then((r) => setReports(r.data.reports ?? []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center gap-3 py-16 text-slate-500">
      <Loader2 size={16} className="animate-spin text-violet-400" />
      <span className="text-sm">Loading history…</span>
    </div>
  )

  if (!reports.length) return (
    <div className="flex flex-col items-center justify-center py-28 gap-4 text-slate-600">
      <div className="w-[64px] h-[64px] rounded-2xl bg-white/[0.025] border border-white/[0.06] flex items-center justify-center">
        <Inbox size={26} className="opacity-25" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-500 mb-1">No saved reports yet</p>
        <p className="text-xs text-slate-600">Generate a report to see it here</p>
      </div>
    </div>
  )

  const typeColors = {
    'Executive Summary': 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    'Business Analysis': 'text-blue-400   bg-blue-500/10   border-blue-500/20',
    'Performance':       'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    'Recommendations':   'text-amber-400  bg-amber-500/10  border-amber-500/20',
  }

  return (
    <div className="space-y-2.5 max-w-3xl">
      {reports.map((r, i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden fade-in"
        >
          <button
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.025] transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <FileText size={13} className="text-violet-400" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{r.report_type}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">{r.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              <span className={`hidden sm:inline text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${typeColors[r.report_type] ?? 'text-slate-400 bg-white/5 border-white/10'}`}>
                {r.report_type}
              </span>
              {expanded === i
                ? <ChevronUp size={14} className="text-slate-500" />
                : <ChevronDown size={14} className="text-slate-500" />
              }
            </div>
          </button>

          {expanded === i && (
            <div className="px-5 pb-5 pt-0 border-t border-white/[0.05] fade-in">
              <div className="text-[13px] text-slate-400 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto pt-4">
                {r.report}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
