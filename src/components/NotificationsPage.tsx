import { useState } from 'react';
import { 
  Bell, 
  Video, 
  Image as ImageIcon, 
  AlertTriangle, 
  DollarSign, 
  ShieldAlert, 
  X, 
  Check, 
  Trash2, 
  Eye, 
  ExternalLink,
  Grid,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'Uploads' | 'Reports' | 'Monetization' | 'System';
  message: string;
  targetUser: string;
  targetUsername: string;
  targetAvatar: string;
  reporterName?: string;
  reporterUsername?: string;
  timestamp: string;
  unread: boolean;
  linkTo: 'Dashboard' | 'Support' | 'Monetization' | 'Restricted Accounts';
  meta?: any;
}

interface NotificationsPageProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearRead: () => void;
  onToggleRead: (id: string) => void;
  onDeleteNotification: (id: string) => void;
  onNavigate: (view: any, extraMeta?: any) => void;
}

export default function NotificationsPage({ 
  notifications, 
  onMarkAllAsRead, 
  onClearRead, 
  onToggleRead, 
  onDeleteNotification, 
  onNavigate 
}: NotificationsPageProps) {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    onToggleRead(item.id);
    
    // Navigate and trigger actions
    if (item.linkTo === 'Dashboard' && item.meta) {
      onNavigate('Dashboard', item.meta);
    } else {
      onNavigate(item.linkTo);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Uploads' && n.type === 'Uploads') return true;
    if (activeTab === 'Reports' && n.type === 'Reports') return true;
    if (activeTab === 'Monetization' && n.type === 'Monetization') return true;
    if (activeTab === 'System' && n.type === 'System') return true;
    return false;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="p-6 relative space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-bounce">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">System Action</p>
            <p className="text-sm font-bold text-slate-100">{toast}</p>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              System Notifications Hub
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Real-time alerts, uploads feed, moderation events, and monetization applications</p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button 
            onClick={() => { onMarkAllAsRead(); showToast('All notifications marked as read'); }}
            className="flex-1 md:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Check size={14} /> Mark All Read
          </button>
          <button 
            onClick={() => { onClearRead(); showToast('Cleared read notifications'); }}
            className="flex-1 md:flex-none px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Trash2 size={14} /> Clear Read
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-2.5 border-b border-slate-200 pb-3">
        <button 
          onClick={() => setActiveTab('All')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 ${
            activeTab === 'All' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          All Notifications {unreadCount > 0 && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">{unreadCount}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('Uploads')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 ${
            activeTab === 'Uploads' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Video size={14} /> Uploads Feed
        </button>
        <button 
          onClick={() => setActiveTab('Reports')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 ${
            activeTab === 'Reports' ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <AlertTriangle size={14} /> Reports & Violations
        </button>
        <button 
          onClick={() => setActiveTab('Monetization')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 ${
            activeTab === 'Monetization' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <DollarSign size={14} /> Monetization Apps
        </button>
        <button 
          onClick={() => setActiveTab('System')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 ${
            activeTab === 'System' ? 'bg-amber-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ShieldAlert size={14} /> System Alerts
        </button>
      </div>

      {/* NOTIFICATIONS LIST CONTAINER */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-3.5">
        {filteredNotifications.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Bell size={40} className="mx-auto mb-3 text-slate-300 animate-pulse" />
            <p className="text-sm font-bold text-slate-600">No notifications in this category</p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div 
              key={item.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                item.unread 
                  ? 'bg-slate-50/80 border-slate-200 shadow-xs' 
                  : 'bg-white border-slate-100 opacity-75'
              }`}
            >
              
              {/* Profile, Icon and Message */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <img src={item.targetAvatar} alt={item.targetUser} className="w-12 h-12 rounded-2xl object-cover border border-slate-200" />
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg text-white flex items-center justify-center border-2 border-white shadow-xs ${
                    item.type === 'Uploads' ? 'bg-indigo-600' :
                    item.type === 'Reports' ? 'bg-rose-600' :
                    item.type === 'Monetization' ? 'bg-emerald-600' :
                    'bg-amber-500'
                  }`}>
                    {item.type === 'Uploads' ? <Video size={11} /> :
                     item.type === 'Reports' ? <AlertTriangle size={11} /> :
                     item.type === 'Monetization' ? <DollarSign size={11} /> :
                     <ShieldAlert size={11} />}
                  </div>
                </div>

                {/* Message text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-slate-900 text-sm">{item.targetUser}</p>
                    <p className="text-xs text-slate-500">@{item.targetUsername}</p>
                    {item.unread && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-600 mt-1">
                    {item.reporterName && (
                      <span className="font-bold text-rose-600">Reported by @{item.reporterUsername}: </span>
                    )}
                    {item.message}
                  </p>

                  <p className="text-[10px] text-slate-400 font-mono mt-1">{item.timestamp}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
                <button 
                  onClick={() => onToggleRead(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    item.unread 
                      ? 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-slate-100'
                  }`}
                >
                  {item.unread ? 'Mark Read' : 'Mark Unread'}
                </button>

                <button 
                  onClick={() => handleNotificationClick(item)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition flex items-center gap-1 shadow-sm"
                >
                  <Eye size={13} /> View Details
                </button>

                <button 
                  onClick={() => onDeleteNotification(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                >
                  <X size={15} />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
