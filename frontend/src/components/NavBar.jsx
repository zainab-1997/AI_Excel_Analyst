import { BarChart3, LayoutDashboard, Bot, MessageSquare, Clock, GitCompare, Loader2 } from 'lucide-react'

const TABS = [
  { id: 'dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { id: 'report',     label: 'AI Report', icon: Bot             },
  { id: 'chat',       label: 'Chat',      icon: MessageSquare   },
  { id: 'comparison', label: 'Compare',   icon: GitCompare      },
  { id: 'history',    label: 'History',   icon: Clock           },
]

export default function NavBar({ tab, setTab, language, setLanguage, analyzing, filesCount }) {
  return (
    <header className="sticky top-0 z-50 bg-[#07070f]/90 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-screen-xl mx-auto flex items-center h-[54px] px-6 gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0 w-36">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <BarChart3 size={15} className="text-white" />
          </div>
          <div className="leading-none select-none">
            <span className="text-[13px] font-bold text-white tracking-tight">AI Excel</span>
            <span className="text-[8.5px] font-bold text-violet-400 tracking-[0.25em] uppercase ml-1.5 opacity-80">PRO</span>
          </div>
        </div>

        {/* Tabs — centered */}
        <nav className="flex-1 flex justify-center">
          <div className="flex items-center gap-0.5 bg-white/[0.028] border border-white/[0.065] rounded-[13px] p-[3px]">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-3 py-[6px] rounded-[10px] text-[11.5px] font-medium transition-all duration-150 ${
                  tab === id
                    ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md shadow-violet-500/25'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                <Icon size={12} strokeWidth={tab === id ? 2.2 : 1.8} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Right — status + language */}
        <div className="flex items-center gap-3 shrink-0 w-36 justify-end">
          {filesCount > 0 && (
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500">
              {analyzing
                ? <Loader2 size={9} className="animate-spin text-violet-400" />
                : <span className="w-[6px] h-[6px] rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60 inline-block" />
              }
              <span>{analyzing ? 'Analyzing…' : `${filesCount} file${filesCount > 1 ? 's' : ''}`}</span>
            </div>
          )}

          {/* Language toggle */}
          <div className="flex gap-0.5 bg-white/[0.028] border border-white/[0.065] rounded-[10px] p-[3px]">
            {['English', 'Arabic'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-[5px] rounded-[7px] text-[11px] font-semibold tracking-wide transition-all ${
                  language === lang
                    ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {lang === 'English' ? 'EN' : 'AR'}
              </button>
            ))}
          </div>
        </div>

      </div>
    </header>
  )
}
