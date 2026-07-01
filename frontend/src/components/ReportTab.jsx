import { useState } from 'react'
import { FileText, Loader2, Download, Sparkles, CheckCircle2 } from 'lucide-react'
import { generateReport, exportPDF } from '../api'

const TYPES = [
  { value: 'Executive Summary', label: 'Executive Summary', icon: '📋', desc: 'High-level overview for leadership' },
  { value: 'Business Analysis', label: 'Business Analysis', icon: '📊', desc: 'In-depth data breakdown'           },
  { value: 'Performance',       label: 'Performance',       icon: '🏆', desc: 'KPIs and metrics review'           },
  { value: 'Recommendations',   label: 'Recommendations',   icon: '💡', desc: 'AI-driven action plan'             },
]

export default function ReportTab({ files, language, analysisContext, samplesContext }) {
  const [reportType,  setType]    = useState('Executive Summary')
  const [report,      setReport]  = useState('')
  const [loading,     setLoad]    = useState(false)
  const [pdfLoading,  setPdfLoad] = useState(false)

  const isReady = files.length > 0 && !!analysisContext

  const generate = async () => {
    if (!isReady) return
    setLoad(true); setReport('')
    try {
      const res = await generateReport(analysisContext, reportType, samplesContext, language)
      setReport(res.data.report)
    } catch (e) {
      setReport(
        e.code === 'ECONNABORTED'
          ? '⏱️ Timed out. Please try again.'
          : '⚠️ Could not generate. Make sure the backend server is running.'
      )
    } finally {
      setLoad(false)
    }
  }

  const downloadTxt = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([report], { type: 'text/plain' }))
    a.download = `${reportType.replace(/\s+/g, '_')}_Report.txt`
    a.click()
  }

  const downloadPDF = async () => {
    setPdfLoad(true)
    try {
      const res = await exportPDF(report, reportType)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a   = document.createElement('a')
      a.href     = url
      a.download = `${reportType.replace(/\s+/g, '_')}_Report.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('PDF generation failed. Make sure the backend is running.')
    } finally {
      setPdfLoad(false)
    }
  }

  return (
    <div className="space-y-7 max-w-4xl">

      {/* Report type selector */}
      <div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Report Type
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {TYPES.map((t) => {
            const active = reportType === t.value
            return (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`relative rounded-2xl p-4 text-left transition-all duration-200 border ${
                  active
                    ? 'border-violet-500/35 bg-violet-500/[0.07]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                }`}
              >
                {active && (
                  <CheckCircle2
                    size={13}
                    className="absolute top-3 right-3 text-violet-400"
                  />
                )}
                <span className="text-2xl mb-3 block">{t.icon}</span>
                <p className={`text-[13px] font-semibold mb-1 ${active ? 'text-white' : 'text-slate-300'}`}>
                  {t.label}
                </p>
                <p className="text-[11px] text-slate-600 leading-snug">{t.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={!isReady || loading}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-30 shadow-lg shadow-violet-500/15"
      >
        {loading
          ? <><Loader2 size={15} className="animate-spin" /> Generating report…</>
          : <><Sparkles size={15} /> Generate AI Report</>
        }
      </button>

      {/* Status */}
      {!files.length && (
        <p className="text-center text-slate-600 text-sm py-2">Upload Excel files first</p>
      )}
      {files.length > 0 && !analysisContext && (
        <div className="flex items-center justify-center gap-2 py-2 text-violet-400 text-sm">
          <Loader2 size={13} className="animate-spin" /> Analyzing files…
        </div>
      )}

      {/* Report output */}
      {report && (
        <div className="fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-violet-400" />
              <p className="text-sm font-semibold text-slate-200">{reportType}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadTxt}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06]"
              >
                <Download size={12} /> TXT
              </button>
              <button
                onClick={downloadPDF}
                disabled={pdfLoading}
                className="flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {pdfLoading
                  ? <Loader2 size={12} className="animate-spin" />
                  : <Download size={12} />
                }
                PDF
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-6 text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap max-h-[540px] overflow-y-auto">
            {report}
          </div>
        </div>
      )}

    </div>
  )
}
