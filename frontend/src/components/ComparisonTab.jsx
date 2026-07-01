import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { GitCompare, Loader2, TrendingUp, TrendingDown, FileSpreadsheet } from 'lucide-react'
import { compareFiles } from '../api'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#11111c] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1 truncate max-w-[160px]">{label}</p>
      <p className="font-bold" style={{ color: payload[0]?.color }}>
        {Number(payload[0]?.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
    </div>
  )
}

export default function ComparisonTab({ files }) {
  const [fileA,    setFileA]  = useState(0)
  const [fileB,    setFileB]  = useState(1)
  const [result,   setResult] = useState(null)
  const [loading,  setLoad]   = useState(false)
  const [error,    setError]  = useState(null)

  const compare = async () => {
    setLoad(true); setResult(null); setError(null)
    try {
      const res = await compareFiles([files[fileA], files[fileB]])
      setResult(res.data)
    } catch (e) {
      setError(e.response?.data?.detail ?? e.message)
    } finally {
      setLoad(false)
    }
  }

  if (files.length < 2) return (
    <div className="flex flex-col items-center justify-center py-28 gap-4 text-slate-600">
      <div className="w-[64px] h-[64px] rounded-2xl bg-white/[0.025] border border-white/[0.06] flex items-center justify-center">
        <GitCompare size={26} className="opacity-25" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-500 mb-1">Upload at least 2 Excel files</p>
        <p className="text-xs text-slate-600">Then compare them side-by-side</p>
      </div>
    </div>
  )

  const growth    = result?.growth_percent ?? 0
  const chartData = [
    { name: files[fileA]?.name.replace('.xlsx','') ?? 'File A', value: result?.totals?.[0] ?? 0 },
    { name: files[fileB]?.name.replace('.xlsx','') ?? 'File B', value: result?.totals?.[1] ?? 0 },
  ]

  return (
    <div className="space-y-6 max-w-2xl">

      {/* File selectors */}
      <div className="grid grid-cols-2 gap-4">
        {[['File A', fileA, setFileA], ['File B', fileB, setFileB]].map(([label, val, setter]) => (
          <div key={label}>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2.5">{label}</p>
            <div className="relative">
              <FileSpreadsheet size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
              <select
                value={val}
                onChange={(e) => setter(Number(e.target.value))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-300 outline-none focus:border-violet-500/40 appearance-none"
              >
                {files.map((f, i) => (
                  <option key={i} value={i} className="bg-[#11111c]">{f.name}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Compare button */}
      <button
        onClick={compare}
        disabled={loading || fileA === fileB}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-30 shadow-lg shadow-violet-500/15"
      >
        {loading
          ? <><Loader2 size={15} className="animate-spin" /> Comparing…</>
          : <><GitCompare size={15} /> Compare Files</>
        }
      </button>

      {fileA === fileB && (
        <p className="text-xs text-amber-400 text-center -mt-2">Select two different files</p>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-5 fade-in">

          {/* Growth card */}
          <div className={`rounded-2xl border p-5 flex items-center gap-4 ${
            growth >= 0
              ? 'border-emerald-500/25 bg-emerald-500/[0.06]'
              : 'border-red-500/25 bg-red-500/[0.06]'
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              growth >= 0 ? 'bg-emerald-500/15' : 'bg-red-500/15'
            }`}>
              {growth >= 0
                ? <TrendingUp size={22} className="text-emerald-400" />
                : <TrendingDown size={22} className="text-red-400" />
              }
            </div>
            <div>
              <p className={`text-3xl font-bold ${growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {growth >= 0 ? '+' : ''}{growth.toFixed(2)}%
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Growth from {files[fileA]?.name} → {files[fileB]?.name}
              </p>
            </div>
          </div>

          {/* Bar comparison */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-5">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-5">
              Total Comparison
            </p>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={chartData} margin={{ left: -10, right: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} tickLine={false} axisLine={false} width={55} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(124,58,237,0.05)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  <Cell fill="#7c3aed" />
                  <Cell fill="#2563eb" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}
    </div>
  )
}
