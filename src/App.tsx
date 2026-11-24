/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { ModerationItem } from './components/ModerationQueue';
import VideoPreviewModal from './components/VideoPreviewModal';
import { UsersPage, VideosPage, MonetizationPage } from './components/FirestorePages';
import FirestoreDashboard from './components/FirestoreDashboard';
import FirestoreRestrictedAccounts from './components/FirestoreRestrictedAccounts';
import FirestoreReports from './components/FirestoreReports';
import FirestoreSupport from './components/FirestoreSupport';
import FirestoreNotifications from './components/FirestoreNotifications';
import { initFirestoreSeedIfNeeded } from './lib/firestoreSeeder';
import { useAdminActivityNotifications } from './lib/useAdminActivityNotifications';
import { auth, signOut, onAuthStateChanged } from '../lib/firebase';
import { enforceHttpsTransport, initSecurityKeystore, secureStorage } from './lib/security';
import { AlertTriangle, CheckCircle2, Trash2, Send } from 'lucide-react';
import AdminLogin from './components/AdminLogin';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [, setAdminEmail] = useState<string>('');

  const [activeView, setActiveView] = useState('Dashboard');
  const [externalPreviewVideo, setExternalPreviewVideo] = useState<ModerationItem | null>(null);
  const [warningModalVideo, setWarningModalVideo] = useState<ModerationItem | null>(null);
  const [deleteModalVideo, setDeleteModalVideo] = useState<ModerationItem | null>(null);
  const [warningReason, setWarningReason] = useState<string>('');
  const [actionNoticeToast, setActionNoticeToast] = useState<string | null>(null);

  const {
    notifications: liveNotifications,
    unreadCount: liveUnreadCount,
    loading: notificationsLoading,
    toggleRead,
    markAsReadById,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
  } = useAdminActivityNotifications(isAuthenticated);

  // Track real Firebase Auth session over TLS and initialize AES-256-GCM keystore
  useEffect(() => {
    enforceHttpsTransport();
    initSecurityKeystore();
    initFirestoreSeedIfNeeded();

    // Remove any legacy plaintext admin flags from localStorage
    secureStorage.removeItem('yousnap_admin_auth');
    secureStorage.removeItem('yousnap_admin_email');

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const identifier = user.email || user.uid;
        setIsAuthenticated(true);
        setAdminEmail(identifier);
        initSecurityKeystore();
      } else {
        setIsAuthenticated(false);
        setAdminEmail('');
      }
      setAuthChecking(false);
    });

    return () => unsubAuth();
  }, []);

  const handleAdminLogin = (email: string) => {
    setIsAuthenticated(true);
    setAdminEmail(email);
    initSecurityKeystore();
  };

  const handleAdminLogout = () => {
    signOut(auth).catch(() => {});
    setIsAuthenticated(false);
    setAdminEmail('');
    secureStorage.clearSecurityKeystore().catch(() => {});
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleAdminLogin} />;
  }

  const showActionNotice = (msg: string) => {
    setActionNoticeToast(msg);
    setTimeout(() => setActionNoticeToast(null), 4500);
  };

  const handleSendWarning = () => {
    if (!warningModalVideo) return;
    if (!warningReason.trim()) {
      alert('Please enter a warning reason.');
      return;
    }

    showActionNotice(`Warning notice sent to @${warningModalVideo.username} regarding "${warningModalVideo.title}"`);
    setWarningModalVideo(null);
    setExternalPreviewVideo(null);
    setWarningReason('');
  };

  const handleConfirmDeleteVideo = () => {
    if (!deleteModalVideo) return;

    showActionNotice("Video deleted successfully!");
    setDeleteModalVideo(null);
    setExternalPreviewVideo(null);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'Dashboard':
        return <FirestoreDashboard onNavigate={setActiveView} />;
      case 'Users':
        return <UsersPage />;
      case 'Videos':
        return <VideosPage />;
      case 'Reports':
        return <FirestoreReports />;
      case 'Restricted Accounts':
        return <FirestoreRestrictedAccounts />;
      case 'Monetization':
        return <MonetizationPage />;
      case 'Support':
        return <FirestoreSupport />;
      case 'Notifications':
        return (
          <FirestoreNotifications
            onNavigate={setActiveView}
            notifications={liveNotifications}
            loading={notificationsLoading}
            onToggleRead={toggleRead}
            onMarkAsReadById={markAsReadById}
            onMarkAllAsRead={markAllAsRead}
            onDeleteNotification={deleteNotification}
            onClearRead={clearReadNotifications}
          />
        );
      default:
        return (
          <div className="text-2xl font-bold p-10 bg-white rounded-2xl shadow-sm border border-slate-100">
            {activeView} module is coming soon!
          </div>
        );
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar activeView={activeView} onNavigate={setActiveView} onLogout={handleAdminLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          unreadCount={liveUnreadCount} 
          onBellClick={() => setActiveView('Notifications')} 
        />
        <main className="p-6 relative flex-1">
          {renderContent()}

          {/* Action Notice Toast Notification */}
          {actionNoticeToast && (
            <div className="fixed top-6 right-6 z-[100] bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-bounce">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">System Action Notice</p>
                <p className="text-sm font-bold text-slate-100">{actionNoticeToast}</p>
              </div>
            </div>
          )}

          {/* Interactive Video Preview Modal Popup for Dashboard Feed */}
          <VideoPreviewModal 
            video={externalPreviewVideo}
            isOpen={Boolean(externalPreviewVideo)}
            onClose={() => setExternalPreviewVideo(null)}
            showToast={(msg) => showActionNotice(msg)}
            onVideoDeleted={() => {
              setExternalPreviewVideo(null);
            }}
          />

          {/* Warning Reason Modal */}
          {warningModalVideo && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[90] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in duration-150">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-100">
                  <AlertTriangle size={24} />
                </div>

                <h3 className="text-base font-bold text-center text-slate-900">Send Warning Notice to @{warningModalVideo.username}</h3>
                <p className="text-xs text-slate-500 text-center mt-1">
                  Provide violation reason for "{warningModalVideo.title}":
                </p>

                <textarea 
                  rows={3}
                  placeholder="Enter violation reason (e.g., Copyright violation, Community guidelines, Spam content)..."
                  value={warningReason}
                  onChange={(e) => setWarningReason(e.target.value)}
                  className="w-full mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />

                <div className="flex items-center justify-end gap-2 mt-5">
                  <button 
                    onClick={() => { setWarningModalVideo(null); setWarningReason(''); }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSendWarning}
                    className="px-4 py-2 bg-amber-600 text-white font-bold rounded-xl text-xs hover:bg-amber-700 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Send size={13} /> Send Warning Notice
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Popup Modal */}
          {deleteModalVideo && (
            <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs z-[95] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in duration-150">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
                  <Trash2 size={26} />
                </div>

                <h3 className="text-lg font-extrabold text-center text-slate-900">Confirm Media Deletion</h3>
                <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed px-2 font-medium">
                  Are you sure you want to permanently delete this video from YouSnap for violating platform rules?
                </p>

                {/* Target Media Snapshot */}
                <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                  <img 
                    src={deleteModalVideo.thumbnail} 
                    alt={deleteModalVideo.title} 
                    className="w-16 h-11 rounded-xl object-cover bg-slate-900 shrink-0" 
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{deleteModalVideo.title}</p>
                    <p className="text-[11px] text-slate-500">by @{deleteModalVideo.username} • {deleteModalVideo.category}</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 mt-6">
                  <button 
                    onClick={() => setDeleteModalVideo(null)}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmDeleteVideo}
                    className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={14} /> Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

