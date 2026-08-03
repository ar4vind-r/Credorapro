import React from 'react';
import {
  Home,
  LayoutGrid,
  GitMerge,
  Clock,
  ShieldCheck,
  Settings,
  HelpCircle,
  Crown,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'certificates', label: 'Certificates', icon: Home },
    { id: 'templates', label: 'Templates', icon: LayoutGrid },
    { id: 'mappings', label: 'Mappings', icon: GitMerge },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'verification', label: 'Verification', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Docs', icon: HelpCircle },
  ];

  return (
    <aside className="w-72 shrink-0 hidden lg:flex flex-col justify-between p-4 space-y-6">
      <div className="credora-card p-6 flex flex-col space-y-6">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            {/* Sparkle / Asterisk icon matching reference logo */}
            <Sparkles className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
              Credora
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Certificates, generated in seconds.
            </p>
          </div>
        </div>

        {/* Navigation Item Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'nav-link-active shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-lime-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Cards Area */}
      <div className="space-y-4">
        
        {/* Unlock More Power Lavender Card */}
        <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
            <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Unlock More Power</span>
          </div>
          <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 leading-relaxed">
            Remove limits, export in high quality & more.
          </p>
          <button className="w-full py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-transform hover:scale-[1.02] flex items-center justify-center gap-1.5">
            <Crown className="w-3.5 h-3.5 fill-white" />
            <span>Go Premium</span>
          </button>
        </div>

        {/* 100% Private Card */}
        <div className="credora-card p-4 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">100% Private</h4>
            <p className="text-[11px] text-slate-400 leading-tight">
              All processing happens locally in your browser.
            </p>
          </div>
        </div>

      </div>
    </aside>
  );
};
