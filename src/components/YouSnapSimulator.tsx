import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query 
} from 'firebase/firestore';
import { 
  Smartphone, 
  Wifi, 
  Battery, 
  Lock, 
  Home, 
  Wallet, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Send, 
  X, 
  ShieldAlert, 
  Play,
  RotateCcw
} from 'lucide-react';

interface YouSnapSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onNewSupportTicket?: () => void;
}

export default function YouSnapSimulator({ isOpen, onClose, onNewSupportTicket }: YouSnapSimulatorProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'wallet' | 'notifications'>('feed');
  const [selectedUserId, setSelectedUserId] = useState<string>('USR-9021'); // Default to Sakin Yesmin
  const [userState, setUserState] = useState<any>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [userNotifications, setUserNotifications] = useState<any[]>([]);
  const [appealMessage, setAppealMessage] = useState('');
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const [boostedVideos, setBoostedVideos] = useState<any[]>([]);

  // 1. Live listener for list of users from Firestore for persona selector
  useEffect(() => {
    if (!isOpen) return;

    const unsub = onSnapshot(
      query(collection(db, 'users')),
      (snapshot) => {
        const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        if (users.length > 0) {
          setAvailableUsers(users);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'users')
    );

    return () => unsub();
  }, [isOpen]);

  // 2. Real-time Firestore sync for the selected user and their targeted notifications
  useEffect(() => {
    if (!isOpen || !selectedUserId) return;

    // A. Listen directly to Firestore document for selected user
    const unsubUser = onSnapshot(
      doc(db, 'users', selectedUserId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data: any = docSnap.data();
          setUserState((prev: any) => ({
            ...prev,
            id: docSnap.id,
            uid: data.uid || docSnap.id,
            name: data.displayName || data.name || 'User',
            username: data.username || (data.displayName ? data.displayName.toLowerCase().replace(/\s+/g, '_') : 'user'),
            avatar: data.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            status: data.status || 'Active',
            suspensionReason: data.suspendReason || data.suspensionReason || data.banReason || '',
            balance: data.balance || (docSnap.id === 'USR-9021' ? '$1,240.00' : docSnap.id === 'USR-6520' ? '$4,850.00' : '$0.00'),
            payoutStatus: data.payoutStatus || 'Scheduled'
          }));
        } else {
          // Fallback if document does not exist yet
          fallbackUserSetup();
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, `users/${selectedUserId}`);
        fallbackUserSetup();
      }
    );

    // B. Listen directly to Firestore notifications collection targeted to this user
    const unsubNotifs = onSnapshot(
      query(collection(db, 'notifications')),
      (snapshot) => {
        const firestoreNotifs = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter((n: any) => n.userId === selectedUserId || n.userId === userState?.uid);

        // Also check any local notifications
        const notifsRaw = localStorage.getItem('yousnap_user_app_notifications');
        let localNotifs: any[] = [];
        if (notifsRaw) {
          try {
            localNotifs = JSON.parse(notifsRaw).filter((n: any) => n.userId === selectedUserId);
          } catch (e) {}
        }

        // Combine and dedup by id or title+timestamp
        const combined = [...firestoreNotifs, ...localNotifs];
        setUserNotifications(combined);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'notifications')
    );

    const fallbackUserSetup = () => {
      if (selectedUserId === 'USR-9021') {
        setUserState({
          id: 'USR-9021',
          name: 'Sakin Yesmin',
          username: 'sakin_y',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          status: 'Active',
          balance: '$1,240.00',
          payoutStatus: 'Scheduled'
        });
      } else if (selectedUserId === 'USR-8842') {
        setUserState({
          id: 'USR-8842',
          name: 'John Doe',
          username: 'john_creator',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          status: 'Suspended',
          balance: '$0.00',
          payoutStatus: 'Scheduled',
          suspensionReason: 'Flagged for uploading copyrighted audio and deceptive metadata tags.'
        });
      } else {
        setUserState({
          id: selectedUserId,
          name: 'Rahul Sharma',
          username: 'rahul_official',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          status: 'Active',
          balance: '$4,850.00',
          payoutStatus: 'Scheduled'
        });
      }
    };

    // Boosted sample video in feed
    setBoostedVideos([
      {
        id: 'vid-1',
        title: 'Amazing Guwahati Street Food Vlog',
        uploader: 'Sakin Yesmin',
        views: '636.3K',
        boosted: true
      }
    ]);

    return () => {
      unsubUser();
      unsubNotifs();
    };
  }, [isOpen, selectedUserId]);

  if (!isOpen) return null;

  const handleSendAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealMessage.trim() || !userState) return;

    try {
      const ticketsKey = 'yousnap_support_tickets_v2';
      const existingRaw = localStorage.getItem(ticketsKey);
      let tickets = [];
      if (existingRaw) {
        tickets = JSON.parse(existingRaw);
      }

      const newTicket = {
        id: 'TCK-' + Math.floor(1000 + Math.random() * 9000),
        creatorName: userState.name,
        creatorUsername: userState.username,
        creatorAvatar: userState.avatar,
        category: 'Suspension Appeal',
        subject: `Appeal against Account Restriction (${userState.suspensionCategory || 'Guideline Violation'})`,
        message: appealMessage.trim(),
        status: 'Open',
        timestamp: 'Just now',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      tickets.unshift(newTicket);
      localStorage.setItem(ticketsKey, JSON.stringify(tickets));

      window.dispatchEvent(new Event('yousnap_tickets_updated'));
      if (onNewSupportTicket) onNewSupportTicket();

      setAppealSubmitted(true);
      setAppealMessage('');
      setTimeout(() => setAppealSubmitted(false), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const isUserRestricted = userState?.status === 'Suspended' || userState?.status === 'Banned';

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-slate-900 border-l border-slate-800 shadow-2xl z-[100] flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Simulator Control Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="text-emerald-500 animate-pulse" size={20} />
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">YouSnap Client Simulator</h2>
            <p className="text-[10px] text-slate-400">Live mobile companion connected to Firestore</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1.5 bg-slate-900 rounded-xl hover:bg-slate-850"
        >
          <X size={18} />
        </button>
      </div>

      {/* Simulator Persona Selector */}
      <div className="p-3 bg-slate-950/50 border-b border-slate-850 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Simulate As:</span>
        <select 
          value={selectedUserId}
          onChange={(e) => {
            setSelectedUserId(e.target.value);
            setAppealSubmitted(false);
          }}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold text-white outline-none cursor-pointer"
        >
          {availableUsers.length > 0 ? (
            availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.displayName || u.name} ({u.status || 'Active'})
              </option>
            ))
          ) : (
            <>
              <option value="USR-9021">Sakin Yesmin (Active)</option>
              <option value="USR-8842">John Doe (Suspended)</option>
              <option value="USR-6520">Rahul Sharma (Active)</option>
            </>
          )}
        </select>
      </div>

      {/* Active Device Simulator Body */}
      <div className="flex-1 overflow-y-auto p-6 flex justify-center items-center bg-slate-950">
        
        {/* Device Frame */}
        <div className="w-[310px] h-[610px] bg-slate-900 rounded-[48px] border-[8px] border-slate-850 shadow-2xl relative flex flex-col overflow-hidden ring-4 ring-slate-800/50">
          
          {/* Notch Speaker Area */}
          <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 z-50 flex justify-between items-center px-6">
            <span className="text-[10px] font-extrabold text-white">10:47 AM</span>
            <div className="w-20 h-4 bg-slate-900 rounded-b-xl mx-auto absolute left-1/2 -translate-x-1/2 top-0"></div>
            <div className="flex items-center gap-1 text-white">
              <Wifi size={10} />
              <Battery size={10} className="fill-white" />
            </div>
          </div>

          {/* Screen Content Wrapper */}
          <div className="flex-1 pt-6 pb-4 bg-slate-950 text-white flex flex-col relative overflow-hidden">
            
            {/* A. BLOCK / RESTRICTION LOCK OVERLAY - Shown when status is Suspended or Banned */}
            {isUserRestricted ? (
              <div className="absolute inset-0 bg-slate-950/95 z-40 p-5 flex flex-col justify-between items-center text-center animate-in fade-in duration-300">
                
                <div className="space-y-3 mt-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto animate-bounce border ${
                    userState?.status === 'Banned' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                  }`}>
                    <ShieldAlert size={32} />
                  </div>
                  <h3 className={`text-base font-black uppercase tracking-wide ${
                    userState?.status === 'Banned' ? 'text-rose-500' : 'text-amber-500'
                  }`}>
                    {userState?.status === 'Banned' ? 'Account Banned' : 'Account Suspended'}
                  </h3>
                  <p className="text-[10px] text-slate-400 px-2 leading-relaxed">
                    Your access to YouSnap App has been restricted due to trust, safety, or community guideline policies.
                  </p>
                </div>

                <div className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-left">
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={12} /> Violation Notice (কাৰণ):
                  </p>
                  <p className="text-xs text-slate-200 leading-relaxed font-semibold italic">
                    "{userState?.suspensionReason || 'Violation of platform terms of service.'}"
                  </p>
                </div>

                <div className="w-full space-y-3">
                  {appealSubmitted ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs space-y-1 animate-in zoom-in duration-200">
                      <CheckCircle2 size={16} className="mx-auto" />
                      <p className="font-bold">Appeal Submitted Successfully</p>
                      <p className="text-[9px] text-slate-400">The trust & safety team has received your ticket and will evaluate it shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSendAppeal} className="space-y-2.5 text-left">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Submit Support Appeal:</label>
                      <textarea 
                        rows={2}
                        required
                        value={appealMessage}
                        onChange={(e) => setAppealMessage(e.target.value)}
                        placeholder="Explain why your account restriction should be lifted..."
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-rose-500 focus:bg-slate-850 outline-none resize-none leading-relaxed"
                      />
                      <button 
                        type="submit"
                        className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition flex items-center justify-center gap-1 shadow-md"
                      >
                        <Send size={11} /> Send Appeal Request
                      </button>
                    </form>
                  )}
                </div>

                <div className="text-[9px] text-slate-500 font-bold tracking-widest mt-2">
                  YOUSNAP TRUST & SAFETY
                </div>

              </div>
            ) : null}

            {/* B. ACTIVE CLIENT VIEWS */}
            <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-850 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <img 
                  src={userState?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                  alt="User" 
                  className="w-6 h-6 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <p className="text-[11px] font-bold leading-tight">{userState?.name || 'Loading...'}</p>
                  <p className="text-[9px] text-slate-400">@{userState?.username || 'user'}</p>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                userState?.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {userState?.status || 'Active'}
              </span>
            </div>

            {/* Main Phone Tab Views */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* 1. FEED TAB */}
              {activeTab === 'feed' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">🔥 Trending For You</p>
                    <span className="text-[9px] text-emerald-400 font-bold">Algorithm Feed</span>
                  </div>

                  {boostedVideos.map((vid) => (
                    <div 
                      key={vid.id} 
                      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg relative group"
                    >
                      {vid.boosted && (
                        <div className="absolute top-2 left-2 z-10 bg-amber-500 text-white text-[8px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                          <Sparkles size={9} /> VIRAL BOOST 10X
                        </div>
                      )}
                      
                      <div className="h-32 bg-slate-800 relative flex items-center justify-center overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80" 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                            <Play size={18} className="fill-white ml-0.5" />
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5">
                        <p className="text-xs font-bold text-slate-100 truncate">{vid.title}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">by {vid.uploader} • {vid.views} views</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. WALLET TAB */}
              {activeTab === 'wallet' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-4 text-white shadow-xl relative overflow-hidden">
                    <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Creator Balance</p>
                    <h2 className="text-2xl font-black mt-1 font-mono">{userState?.balance || '$1,240.00'}</h2>
                    
                    <div className="flex items-center justify-between text-[10px] mt-4 pt-3 border-t border-emerald-500/30">
                      <span className="text-emerald-100">Disbursal:</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-md font-bold">{userState?.payoutStatus || 'Scheduled'}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-2xl p-3 border border-slate-850 space-y-2 text-[10px]">
                    <p className="font-black text-slate-400 uppercase tracking-wider text-[9px]">Registered Payment Accounts</p>
                    
                    <div className="bg-slate-950 p-2.5 rounded-xl space-y-1.5 border border-slate-800">
                      <p className="text-slate-400 flex justify-between">
                        <span>Method:</span> 
                        <span className="text-slate-200 font-bold">UPI Payment</span>
                      </p>
                      <p className="text-slate-400 flex justify-between">
                        <span>UPI Address:</span>
                        <span className="text-slate-200 font-mono font-bold">sakin.yesmin@oksbi</span>
                      </p>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl space-y-1.5 border border-slate-800">
                      <p className="text-slate-400 flex justify-between">
                        <span>Transfer Split:</span> 
                        <span className="text-amber-400 font-bold">50% Admin / 50% Creator</span>
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* 3. NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">🔔 Dispatched App Alerts</p>
                  
                  {userNotifications.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 space-y-1.5">
                      <Bell size={24} className="mx-auto text-slate-700" />
                      <p className="text-xs font-bold text-slate-400">No notifications received</p>
                      <p className="text-[9px] text-slate-600">Dispatched safety notices or warnings will appear here.</p>
                    </div>
                  ) : (
                    userNotifications.map((notif: any, idx: number) => (
                      <div 
                        key={notif.id || idx}
                        className={`p-3 bg-slate-900 rounded-2xl border space-y-1.5 relative overflow-hidden ${
                          notif.title?.includes('Banned') ? 'border-rose-500/40' : notif.title?.includes('Suspended') ? 'border-amber-500/40' : 'border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <span className={`text-[10px] font-extrabold uppercase flex items-center gap-1 shrink-0 ${
                            notif.title?.includes('Banned') ? 'text-rose-400' : notif.title?.includes('Suspended') ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            <AlertTriangle size={11} /> {notif.title || 'Notification'}
                          </span>
                          <span className="text-[8px] text-slate-500 shrink-0 font-mono">
                            {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (notif.timestamp || 'Just now')}
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                          {notif.message}
                        </p>

                        <div className="flex justify-between items-center text-[9px] pt-1 border-t border-slate-850 text-slate-400">
                          <span>Target User</span>
                          <span className="text-emerald-400 font-bold">{userState?.name || selectedUserId}</span>
                        </div>
                      </div>
                    ))
                  )}

                </div>
              )}

            </div>

            {/* Phone Footer Tabs Navigation */}
            <div className="mt-auto px-6 py-2 bg-slate-900 border-t border-slate-850 flex items-center justify-between shrink-0">
              <button 
                onClick={() => setActiveTab('feed')}
                className={`p-2 flex flex-col items-center gap-0.5 transition ${
                  activeTab === 'feed' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Home size={18} />
                <span className="text-[8px]">Feed</span>
              </button>

              <button 
                onClick={() => setActiveTab('wallet')}
                className={`p-2 flex flex-col items-center gap-0.5 transition ${
                  activeTab === 'wallet' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Wallet size={18} />
                <span className="text-[8px]">Wallet</span>
              </button>

              <button 
                onClick={() => setActiveTab('notifications')}
                className={`p-2 flex flex-col items-center gap-0.5 transition relative ${
                  activeTab === 'notifications' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Bell size={18} />
                <span className="text-[8px]">Alerts</span>
                {userNotifications.length > 0 && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
