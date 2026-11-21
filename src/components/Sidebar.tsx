/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { LayoutDashboard, Users, Video, Flag, ShieldAlert, DollarSign, Headphones, Settings, Bell, LogOut } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout?: () => void;
}

export default function Sidebar({ activeView, onNavigate, onLogout }: SidebarProps) {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Users', icon: Users },
    { name: 'Videos', icon: Video },
    { name: 'Reports', icon: Flag },
    { name: 'Restricted Accounts', icon: ShieldAlert },
    { name: 'Monetization', icon: DollarSign },
    { name: 'Support', icon: Headphones },
    { name: 'Settings', icon: Settings },
    { name: 'Notifications', icon: Bell },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-white">Y</div>
          <span className="text-xl font-bold">YouSnap</span>
        </div>
        <nav className="space-y-4">
          {menuItems.map((item) => (
            <button 
              key={item.name} 
              onClick={() => onNavigate(item.name)}
              className={`w-full flex items-center gap-3 transition p-2.5 rounded-xl text-sm font-medium ${activeView === item.name ? 'bg-slate-800 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}`}
            >
              <item.icon size={20} />
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      {onLogout && (
        <div className="pt-6 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition"
          >
            <LogOut size={18} />
            Sign Out Admin
          </button>
        </div>
      )}
    </aside>
  );
}

