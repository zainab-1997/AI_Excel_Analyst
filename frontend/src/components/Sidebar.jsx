import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileSpreadsheet, X, BarChart3 } from 'lucide-react'

export default function Sidebar({ files, setFiles, language, setLanguage }) {
  const onDrop = useCallback(
    (accepted) => setFiles((prev) => [...prev, ...accepted]),
    [setFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    multiple: true,
  })

  return (
    <aside className="w-72 min-h-screen glass border-r border-white/5 flex flex-col p-5 gap-5">
      {/* Logo */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
          <BarChart3 size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">AI Excel</p>
          <p className="text-[10px] text-violet-400 font-medium tracking-widest">INTELLIGENCE PRO</p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`rounded-xl border-2 border-dashed border-white/10 p-5 text-center cursor-pointer transition-all duration-200 hover:border-violet-500/50 hover:bg-violet-500/5 ${isDragActive ? 'drop-zone-active' : ''}`}
      >
        <input {...getInputProps()} />
        <UploadCloud size={28} className="mx-auto mb-2 text-violet-400" />
        <p className="text-xs text-slate-400">
          {isDragActive ? 'Drop here...' : 'Drop Excel files or click'}
        </p>
        <p className="text-[10px] text-slate-600 mt-1">.xlsx only</p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Uploaded Files</p>
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <FileSpreadsheet size={14} className="text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300 truncate flex-1">{f.name}</span>
              <button
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-slate-600 hover:text-red-400 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Language */}
      <div className="mt-auto">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Language</p>
        <div className="flex gap-2">
          {['English', 'Arabic'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                language === lang
                  ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {lang === 'English' ? '🇺🇸 EN' : '🇸🇦 AR'}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
