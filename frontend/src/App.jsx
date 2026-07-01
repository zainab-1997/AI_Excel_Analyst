import { useState, useEffect } from 'react'
import NavBar        from './components/NavBar'
import UploadZone    from './components/UploadZone'
import Dashboard     from './components/Dashboard'
import ReportTab     from './components/ReportTab'
import ChatTab       from './components/ChatTab'
import HistoryTab    from './components/HistoryTab'
import ComparisonTab from './components/ComparisonTab'
import { analyzeFile } from './api'
import { AlertCircle, X } from 'lucide-react'

export default function App() {
  const [files,           setFiles]       = useState([])
  const [language,        setLanguage]    = useState('English')
  const [tab,             setTab]         = useState('dashboard')
  const [analysisResults, setResults]     = useState([])
  const [analysisContext, setAnalysisCtx] = useState('')
  const [samplesContext,  setSamplesCtx]  = useState('')
  const [analyzing,       setAnalyzing]   = useState(false)
  const [error,           setError]       = useState('')

  useEffect(() => {
    if (!files.length) {
      setResults([]); setAnalysisCtx(''); setSamplesCtx(''); setError('')
      return
    }

    setAnalyzing(true)
    setError('')

    Promise.all(
      files.map((f) =>
        analyzeFile(f)
          .then((r) => {
            const data = r.data
            // Multi-sheet: expand each sheet into its own result row
            if (data.sheets && data.sheets.length > 0) {
              return data.sheets
                .filter((s) => s.analysis && !s.analysis.error)
                .map((s) => ({
                  name:     data.sheets.length > 1 ? `${f.name}  ›  ${s.sheet}` : f.name,
                  profile:  s.profile,
                  analysis: s.analysis,
                }))
            }
            // Fallback: single result (backwards compat)
            return [{ name: f.name, profile: data.profile, analysis: data.analysis }]
          })
          .catch((e) => {
            const msg = e.code === 'ECONNABORTED'
              ? `Timeout analyzing "${f.name}". Try again.`
              : e.response
                ? `Server error (${e.response.status}) for "${f.name}".`
                : `Cannot reach backend. Make sure start.bat is running.`
            return [{ __error: msg }]
          })
      )
    ).then((arrays) => {
      const flat   = arrays.flat()
      const errors = flat.filter((r) => r?.__error).map((r) => r.__error)
      const valid  = flat.filter((r) => r && !r.__error)

      if (errors.length) setError(errors[0])

      setResults(valid)
      setAnalysisCtx(
        valid.map((r) => `\n=== FILE: ${r.name} ===\n${JSON.stringify(r.analysis, null, 2)}`).join('\n')
      )
      setSamplesCtx(
        valid.map((r) => {
          const p = r.profile ?? {}
          return `\n--- ${r.name} ---\nType: ${p.data_type}\nRows: ${p.rows}\nColumns: ${(p.columns ?? []).join(', ')}`
        }).join('\n')
      )
    }).finally(() => setAnalyzing(false))
  }, [files])

  const tabContent = {
    dashboard:  <Dashboard     results={analysisResults} analyzing={analyzing} />,
    report:     <ReportTab     files={files} language={language} analysisContext={analysisContext} samplesContext={samplesContext} />,
    chat:       <ChatTab       files={files} language={language} analysisContext={analysisContext} samplesContext={samplesContext} />,
    comparison: <ComparisonTab files={files} />,
    history:    <HistoryTab />,
  }[tab]

  return (
    <div className="min-h-screen bg-[#07070f]">
      <NavBar
        tab={tab}
        setTab={setTab}
        language={language}
        setLanguage={setLanguage}
        analyzing={analyzing}
        filesCount={files.length}
      />
      <UploadZone files={files} setFiles={setFiles} />

      {/* Error banner */}
      {error && (
        <div className="max-w-screen-xl mx-auto px-6 mt-4">
          <div className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/[0.06] px-4 py-3">
            <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400 flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400/50 hover:text-red-400 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-screen-xl mx-auto px-6 pt-7 pb-14">
        {tabContent}
      </main>
    </div>
  )
}
