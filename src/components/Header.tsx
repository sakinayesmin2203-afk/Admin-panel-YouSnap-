import { Search, Bell, User } from 'lucide-react';

interface HeaderProps {
  unreadCount?: number;
  onBellClick?: () => void;
}

export default function Header({ unreadCount = 0, onBellClick }: HeaderProps) {
  return (
    <header className="flex justify-between items-center bg-white p-4 shadow-xs border-b border-slate-100 shrink-0">
      <div className="relative w-72 sm:w-96">
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full p-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition" 
        />
        <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
      </div>

      <div className="flex items-center gap-4">
        {/* Clickable Bell Icon with live notification badge counter */}
        <button 
          onClick={onBellClick}
          className="relative p-2 hover:bg-slate-50 rounded-xl transition group shrink-0"
          title="View Notifications"
        >
          <Bell className="text-slate-600 group-hover:text-emerald-600 transition" size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-100">
          <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0">
            AD
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800">YouSnap Admin</p>
            <p className="text-[10px] text-slate-400 font-medium">System Controller</p>
          </div>
        </div>
      </div>
    </header>
  );
}
