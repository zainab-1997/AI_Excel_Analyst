import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, Hash, Trophy, Loader2, FileSpreadsheet, BarChart2, Search } from 'lucide-react'
import KPICard from './KPICard'

const PALETTE = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#0891b2','#be185d','#0d9488','#4f46e5','#b45309']

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

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#11111c] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1 truncate max-w-[160px]">{payload[0]?.name}</p>
      <p className="font-bold" style={{ color: payload[0]?.fill }}>
        {Number(payload[0]?.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
    </div>
  )
}

function SectionDivider() {
  return <div className="border-t border-white/[0.05]" />
}

function FileSection({ result }) {
  const [search, setSearch] = useState('')

  const analysis   = result.analysis ?? {}
  const profile    = result.profile  ?? {}

  const numericKey = Object.keys(analysis).find(
    (k) => typeof analysis[k] === 'object' && 'total' in analysis[k]
  )
  const numData = numericKey ? analysis[numericKey] : null

  const allRanking = numData?.ranking ? Object.entries(numData.ranking) : []
  const filtered   = search.trim()
    ? allRanking.filter(([name]) => name.toLowerCase().includes(search.toLowerCase()))
    : allRanking

  const ranking = filtered
  const barData = ranking.slice(0, 10).map(([name, value]) => ({ name, value: Number(value) }))
  const pieData = ranking.slice(0, 6).map(([name, value]) => ({ name, value: Number(value) }))

  return (
    <div className="space-y-6 fade-in">

      {/* File header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <FileSpreadsheet size={20} className="text-emerald-400" />
        </div>
        <div>
          <p className="font-semibold text-white text-[15px] leading-snug">{result.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {profile.data_type && <span className="mr-2">{profile.data_type}</span>}
            {profile.rows != null && (
              <span className="mr-2">{Number(profile.rows).toLocaleString()} rows</span>
            )}
            {profile.columns?.length && <span>{profile.columns.length} columns</span>}
          </p>
        </div>
      </div>

      {/* Search filter */}
      {allRanking.length > 0 && (
        <div className="relative w-64">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name…"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2 text-xs text-slate-300 placeholder:text-slate-600 outline-none focus:border-violet-500/40 transition-all"
          />
        </div>
      )}

      {/* KPI row */}
      {numData ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Total"      value={numData.total}       icon={TrendingUp}   color="violet"  />
          <KPICard label="Average"    value={numData.average}     icon={Hash}         color="blue"    />
          <KPICard label="Top Item"   value={numData.top_item}    icon={Trophy}       color="emerald" />
          <KPICard label="Lowest Item" value={numData.lowest_item} icon={TrendingDown} color="amber"  />
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-sm text-slate-500">
          No numeric columns found in this file.
        </div>
      )}

      {/* Charts */}
      {barData.length > 1 && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

          {/* Bar chart — wider */}
          <div className="xl:col-span-3 rounded-2xl border border-white/[0.06] bg-white/[0.018] p-5">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-5">
              Top 10 by Value
            </p>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={barData} margin={{ left: -15, right: 0, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#475569' }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={barData.length > 5 ? -30 : 0}
                  textAnchor={barData.length > 5 ? 'end' : 'middle'}
                  height={barData.length > 5 ? 50 : 30}
                />
                <YAxis tick={{ fontSize: 10, fill: '#475569' }} tickLine={false} axisLine={false} width={50} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(124,58,237,0.05)' }} />
                <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                  {barData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="xl:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.018] p-5">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-5">
              Distribution
            </p>
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={78}
                  innerRadius={34}
                  paddingAngle={2}
                >
                  {pieData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{ fontSize: 10, color: '#94a3b8', lineHeight: '1.8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}
    </div>
  )
}

export default function Dashboard({ results, analyzing }) {

  if (analyzing) return (
    <div className="flex flex-col items-center justify-center py-28 gap-4 text-slate-500">
      <Loader2 size={26} className="animate-spin text-violet-400" />
      <p className="text-sm">Analyzing your files…</p>
    </div>
  )

  if (!results?.length) return (
    <div className="flex flex-col items-center justify-center py-28 gap-5 text-slate-600">
      <div className="w-18 h-18 w-[72px] h-[72px] rounded-3xl bg-white/[0.025] border border-white/[0.06] flex items-center justify-center">
        <BarChart2 size={30} className="opacity-20" />
      </div>
      <div className="text-center space-y-1.5">
        <p className="text-sm font-medium text-slate-500">No data yet</p>
        <p className="text-xs text-slate-600">Upload Excel files above to see your analytics dashboard</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-10">
      {results.map((r, i) => (
        <div key={i}>
          <FileSection result={r} />
          {i < results.length - 1 && <div className="mt-10"><SectionDivider /></div>}
        </div>
      ))}
    </div>
  )
}
