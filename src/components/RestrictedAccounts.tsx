import { useState } from 'react';
import { 
  ShieldAlert, 
  Ban, 
  AlertTriangle, 
  Unlock, 
  Eye, 
  Search, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Smartphone,
  Calendar,
  X
} from 'lucide-react';
import { UserAccount } from './UsersManagement';

interface RestrictedAccountsProps {
  users: UserAccount[];
  onUpdateUserStatus: (userId: string, newStatus: UserAccount['status']) => void;
  onViewUserProfile: (user: UserAccount) => void;
}

export default function RestrictedAccounts({ users, onUpdateUserStatus, onViewUserProfile }: RestrictedAccountsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const restrictedUsers = users.filter(u => u.status === 'Banned' || u.status === 'Suspended');

  const filteredUsers = restrictedUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.banReason && u.banReason.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.suspensionReason && u.suspensionReason.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4500);
  };

  const handleLiftRestriction = (user: UserAccount) => {
    onUpdateUserStatus(user.id, 'Active');
    showToast(`Account successfully reactivated for @${user.username}! Restrictions lifted.`);

    // Dispatch automated in-app notification to localStorage database for reactivation
    try {
      const userNotifsKey = 'yousnap_user_app_notifications';
      const existingNotifs = localStorage.getItem(userNotifsKey);
      let userNotifs = [];
      if (existingNotifs) {
        userNotifs = JSON.parse(existingNotifs);
      }

      const newAppNotification = {
        id: 'UN-' + Math.floor(10000 + Math.random() * 90000),
        userId: user.id,
        username: user.username,
        title: '🎉 Account Reactivated',
        message: 'Your account restrictions have been successfully lifted by the Trust & Safety team. All features are now fully operational.',
        category: 'Account Restored',
        timestamp: new Date().toLocaleString(),
        actionLink: 'Dashboard'
      };

      userNotifs.unshift(newAppNotification);
      localStorage.setItem(userNotifsKey, JSON.stringify(userNotifs));
    } catch (err) {
      console.error('Failed to dispatch user reactivation notification:', err);
    }
  };

  return (
    <div className="p-6 relative space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-bounce">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Restriction Lifted</p>
            <p className="text-sm font-bold text-slate-100">{toastMsg}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="text-rose-600" size={26} /> Banned & Suspended Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-1">Dedicated trust & safety directory containing all restricted and policy-violation accounts</p>
        </div>

        <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-2xl border border-rose-200 text-xs font-bold text-rose-700">
          <Ban size={16} />
          <span>{restrictedUsers.length} Restricted Accounts Active</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Search by creator name, @username, User ID, or violation reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
        />
      </div>

      {/* Restricted Users Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-3xl border border-slate-100 text-center text-slate-400">
            <ShieldAlert size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No restricted accounts found</p>
            <p className="text-xs text-slate-400 mt-1">All user accounts are currently in good standing or active.</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isBanned = user.status === 'Banned';
            const reasonText = isBanned 
              ? (user.banReason || 'Severe violation of YouSnap Terms of Service and safety policies.') 
              : (user.suspensionReason || 'Account flagged for community guidelines violation.');

            return (
              <div 
                key={user.id} 
                className={`bg-white rounded-3xl p-6 shadow-sm border transition flex flex-col justify-between ${
                  isBanned ? 'border-rose-200 hover:border-rose-300' : 'border-amber-200 hover:border-amber-300'
                }`}
              >
                <div>
                  {/* Top Creator Info & Status Badge */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">{user.name}</h3>
                        <p className="text-xs text-slate-500 font-mono">@{user.username} • <span className="font-bold text-slate-700">{user.id}</span></p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} /> {user.location} • <Smartphone size={11} /> {user.device}
                        </p>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-xs ${
                      isBanned ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {isBanned ? <Ban size={13} /> : <AlertTriangle size={13} />}
                      {user.status}
                    </span>
                  </div>

                  {/* Restriction Details Box */}
                  <div className={`p-4 rounded-2xl border mb-4 space-y-2 ${
                    isBanned ? 'bg-rose-50/70 border-rose-100' : 'bg-amber-50/70 border-amber-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        isBanned ? 'text-rose-900' : 'text-amber-900'
                      }`}>
                        {isBanned ? <Ban size={14} /> : <Clock size={14} />}
                        {isBanned ? 'Permanent Ban Notice' : `Temporary Suspension (${user.suspensionDurationDays || 30} Days)`}
                      </p>
                      {!isBanned && user.suspensionUntil && (
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-lg">
                          Expires: {user.suspensionUntil}
                        </span>
                      )}
                    </div>

                    <p className={`text-xs leading-relaxed ${isBanned ? 'text-rose-800' : 'text-amber-800'}`}>
                      <span className="font-semibold">Reason:</span> "{reasonText}"
                    </p>
                  </div>
                </div>

                {/* Quick Actions Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button 
                    onClick={() => onViewUserProfile(user)}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Eye size={15} /> View User Profile
                  </button>

                  <button 
                    onClick={() => handleLiftRestriction(user)}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  >
                    <Unlock size={15} /> Reactivate / Lift
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
