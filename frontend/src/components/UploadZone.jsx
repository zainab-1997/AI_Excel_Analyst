import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileSpreadsheet, X, Plus } from 'lucide-react'

export default function UploadZone({ files, setFiles }) {
  const onDrop = useCallback(
    (accepted) =>
      setFiles((prev) => [
        ...prev,
        ...accepted.filter((f) => !prev.find((p) => p.name === f.name)),
      ]),
    [setFiles]
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    multiple: true,
    noClick: files.length > 0,
    noKeyboard: true,
  })

  /* ──────────── HERO: no files ──────────── */
  if (!files.length) {
    return (
      <div className="max-w-screen-xl mx-auto px-6 pt-8 pb-2">
        <div
          {...getRootProps()}
          className={`relative rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden transition-all duration-300 ${
            isDragActive
              ? 'border-violet-500 bg-violet-500/[0.08] scale-[1.004]'
              : 'border-white/[0.09] hover:border-violet-500/35 hover:bg-violet-500/[0.025]'
          }`}
        >
          <input {...getInputProps()} />

          {/* Glow blob */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-violet-600/6 rounded-full blur-3xl" />
          </div>

          <div className="relative flex flex-col items-center justify-center py-16 gap-3 select-none">
            <div className={`w-[60px] h-[60px] rounded-2xl flex items-center justify-center mb-1 transition-all duration-300 ${
              isDragActive
                ? 'bg-violet-500/20 border border-violet-500/40 scale-110'
                : 'bg-white/[0.04] border border-white/[0.09] group-hover:scale-105'
            }`}>
              <UploadCloud
                size={26}
                className={`transition-colors ${isDragActive ? 'text-violet-300' : 'text-violet-500'}`}
              />
            </div>

            <p className="text-[15px] font-semibold text-white">
              {isDragActive ? 'Release to upload' : 'Upload Excel Files'}
            </p>
            <p className="text-sm text-slate-500">
              Drag & drop <span className="text-slate-400">.xlsx</span> files here, or{' '}
              <span className="text-violet-400 font-medium">browse your computer</span>
            </p>
            <p className="text-xs text-slate-600 mt-0.5">Multiple files supported · Excel 2007+ format</p>
          </div>
        </div>
      </div>
    )
  }

  /* ──────────── COMPACT STRIP: files uploaded ──────────── */
  return (
    <div
      {...getRootProps()}
      className={`border-b transition-colors duration-200 ${
        isDragActive ? 'border-violet-500/25 bg-violet-500/[0.035]' : 'border-white/[0.05]'
      }`}
      style={{ cursor: 'default' }}
    >
      <input {...getInputProps()} />
      <div className="max-w-screen-xl mx-auto px-6 py-2.5 flex items-center gap-2.5 flex-wrap">

        <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.18em] shrink-0 select-none">
          Files
        </span>

        {files.map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 transition-colors hover:border-white/[0.12]"
          >
            <FileSpreadsheet size={11} className="text-emerald-400 shrink-0" />
            <span className="max-w-[140px] truncate">{f.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setFiles((prev) => prev.filter((_, idx) => idx !== i))
              }}
              className="text-slate-600 hover:text-red-400 transition-colors ml-0.5 shrink-0"
            >
              <X size={11} />
            </button>
          </div>
        ))}

        <button
          onClick={(e) => { e.stopPropagation(); open() }}
          className="flex items-center gap-1 text-[11px] font-medium text-violet-400 hover:text-violet-300 bg-violet-500/[0.07] border border-violet-500/20 hover:border-violet-500/35 rounded-lg px-2.5 py-1.5 transition-all"
        >
          <Plus size={11} />
          Add files
        </button>

      </div>
    </div>
  )
}
