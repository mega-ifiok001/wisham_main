'use client';

import { Music, LogOut, RefreshCw, LayoutDashboard, ShoppingBag, AlertCircle } from 'lucide-react';

export type Tab = 'overview' | 'beats' | 'sales';

const TABS: [Tab, string, typeof LayoutDashboard][] = [
  ['overview', 'Overview', LayoutDashboard],
  ['beats', 'Beats', Music],
  ['sales', 'Sales', ShoppingBag],
];

interface Props {
  email?: string;
  tab: Tab;
  onTab: (tab: Tab) => void;
  isLoading: boolean;
  onRefresh: () => void;
  onLogout: () => void;
  notice: string | null;
  error: string;
}

export function DashboardHeader({
  email,
  tab,
  onTab,
  isLoading,
  onRefresh,
  onLogout,
  notice,
  error,
}: Props) {
  return (
    <>
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
       <div className="logo flex">
         <img src="/logo.png" width={130}  alt="wisham official logo" />
        <span className="text-xs text-gray-500 font-bold">Admin panel</span>
       </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl border border-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <span className="hidden sm:block text-xs text-neutral-400 font-medium">{email}</span>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </header>

      <div className="px-6 pt-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          {TABS.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => onTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                tab === id ? 'bg-red-600 text-white' : 'text-neutral-500 hover:bg-neutral-100'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {notice && (
          <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
            {notice}
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
      </div>
    </>
  );
}

export default DashboardHeader;