import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  doc, 
  deleteDoc, 
  updateDoc, 
  setDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  Bell, 
  Upload, 
  AlertTriangle, 
  DollarSign, 
  ShieldCheck, 
  CheckCheck, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  ExternalLink,
  Filter,
  X
} from 'lucide-react';
import { FirebaseStatusBar } from './FirestorePages';

export default function FirestoreNotifications({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    setLoading(true);
    const path = 'admin_notifications';
    const q = query(collection(db, path));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setNotifications(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('insufficient')) {
          setNotifications([]);
          setError('Collection "/admin_notifications" is not yet enabled in your YouSnap Firestore Rules. Add admin read/write rule for admin_notifications to enable alerts here.');
        } else {
          const errInfo = handleFirestoreError(err, OperationType.GET, path);
          setError(errInfo.error || 'Failed to load notifications from Firestore');
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Action: Mark single notification as read
  const handleToggleRead = async (id: string, currentUnread: boolean) => {
    try {
      await updateDoc(doc(db, 'admin_notifications', id), {
        unread: !currentUnread
      });
      showToast(currentUnread ? 'Notification marked as read' : 'Notification marked as unread');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `admin_notifications/${id}`);
      showToast('Error updating notification');
    }
  };

  // Action: Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const unreadList = notifications.filter(n => n.unread);
      if (unreadList.length === 0) return;

      const batch = writeBatch(db);
      unreadList.forEach(n => {
        batch.update(doc(db, 'admin_notifications', n.id), { unread: false });
      });
      await batch.commit();
      showToast('All notifications marked as read!');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, 'admin_notifications');
      showToast('Failed to mark all as read');
    }
  };

  // Action: Delete notification
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'admin_notifications', id));
      showToast('Notification removed');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `admin_notifications/${id}`);
      showToast('Failed to delete notification');
    }
  };

  // Action: Clear all read notifications
  const handleClearRead = async () => {
    try {
      const readList = notifications.filter(n => !n.unread);
      if (readList.length === 0) {
        showToast('No read notifications to clear');
        return;
      }
      const batch = writeBatch(db);
      readList.forEach(n => {
        batch.delete(doc(db, 'admin_notifications', n.id));
      });
      await batch.commit();
      showToast('Read notifications cleared!');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, 'admin_notifications');
      showToast('Failed to clear read notifications');
    }
  };

  const filtered = notifications.filter(n => {
    if (filterType === 'All') return true;
    if (filterType === 'Unread') return n.unread;
    return n.type === filterType;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Uploads':
        return <Upload size={14} className="text-emerald-500" />;
      case 'Reports':
        return <AlertTriangle size={14} className="text-rose-500" />;
      case 'Monetization':
        return <DollarSign size={14} className="text-amber-500" />;
      case 'Security':
        return <ShieldCheck size={14} className="text-sky-500" />;
      default:
        return <Bell size={14} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="text-emerald-600" /> Notifications & Event Stream
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time administrative alerts listening on Cloud Firestore <code className="text-emerald-600 font-bold">/admin_notifications</code>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <CheckCheck size={14} /> Mark All as Read
          </button>
          <button
            onClick={handleClearRead}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            title="Clear read alerts"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Stat Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Notifications</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{notifications.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-emerald-500 uppercase">Unread Alerts</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {notifications.filter(n => n.unread).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-rose-500 uppercase">Report Warnings</p>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {notifications.filter(n => n.type === 'Reports').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-amber-500 uppercase">Monetization Actions</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {notifications.filter(n => n.type === 'Monetization').length}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500">Filter Notifications:</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {['All', 'Unread', 'Uploads', 'Reports', 'Monetization', 'Security'].map(st => (
            <button
              key={st}
              onClick={() => setFilterType(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === st 
                  ? 'bg-slate-900 text-white shadow-2xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="animate-spin mx-auto text-emerald-500 mb-2" size={24} />
            <p className="text-xs font-bold text-slate-600">Connecting to Firestore notifications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Bell className="mx-auto text-slate-300 mb-3" size={40} />
            <h3 className="text-sm font-bold text-slate-700">No Notifications Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are currently no alerts matching this filter in Firestore <code className="text-emerald-600">/admin_notifications</code>.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(notif => (
              <div 
                key={notif.id}
                className={`p-4 hover:bg-slate-50/70 transition flex items-start justify-between gap-4 ${
                  notif.unread ? 'bg-emerald-50/20' : ''
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0 mt-0.5">
                    <img 
                      src={notif.targetAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                      alt={notif.targetUser} 
                      className="w-10 h-10 rounded-2xl object-cover border border-slate-200" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                      {getIconForType(notif.type)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">
                        {notif.targetUser || 'System User'}
                      </span>
                      {notif.unread && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        notif.type === 'Uploads' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        notif.type === 'Reports' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        notif.type === 'Monetization' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}>
                        {notif.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mt-1 font-medium">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                      <span>{notif.timeStr || 'Recently'}</span>
                      {notif.linkTo && (
                        <button
                          onClick={() => onNavigate?.(notif.linkTo)}
                          className="font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
                        >
                          View in {notif.linkTo} <ExternalLink size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggleRead(notif.id, notif.unread)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition"
                    title={notif.unread ? "Mark as Read" : "Mark as Unread"}
                  >
                    <CheckCheck size={14} className={notif.unread ? "text-slate-400" : "text-emerald-600"} />
                  </button>

                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs transition"
                    title="Delete Notification"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
