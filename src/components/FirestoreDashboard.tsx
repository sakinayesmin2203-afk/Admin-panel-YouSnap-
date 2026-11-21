import React, { useState, useEffect, useMemo } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import {
  collection,
  onSnapshot,
  query,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Users,
  Video,
  Upload,
  AlertTriangle,
  Sparkles,
  Trash2,
  Play,
  RefreshCw,
  CheckCircle2,
  Flame,
  DollarSign,
  Image as ImageIcon,
} from 'lucide-react';
import AnalyticsChart from './AnalyticsChart';
import VideoPreviewModal from './VideoPreviewModal';
import {
  MEDIA_COLLECTIONS,
  MediaSourceCollection,
  buildUsersLookupMap,
  deleteMediaFromFirestore,
  getUserMonetizationApplicationStatus,
  isMediaRestricted,
  normalizeMediaDoc,
  normalizeUserDoc,
} from '../lib/firestoreAdapters';

export default function FirestoreDashboard({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [mediaByCollection, setMediaByCollection] = useState<Record<string, any[]>>({
    posts: [],
    reels: [],
    stories: [],
    videos: [],
    live_uploads: [],
  });
  const [monetizationReqs, setMonetizationReqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [warningModalItem, setWarningModalItem] = useState<any | null>(null);
  const [warningReason, setWarningReason] = useState('');
  const [deleteModalItem, setDeleteModalItem] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    setLoading(true);

    // 1. Live listener for Users collection
    const unsubUsers = onSnapshot(
      query(collection(db, 'users')),
      (snapshot) => {
        const normalizedUsers = snapshot.docs.map((d) => normalizeUserDoc(d));
        setUsersList(normalizedUsers);
        setLoading(false);
        setError(null);
      },
      (err) => {
        const errInfo = handleFirestoreError(err, OperationType.GET, 'users');
        setError(errInfo.error || 'Failed to load users from Firestore');
        setLoading(false);
      }
    );

    // 2. Live listeners across all media collections (posts, reels, stories, videos, live_uploads)
    const unsubMediaList = MEDIA_COLLECTIONS.map((colName: MediaSourceCollection) =>
      onSnapshot(
        query(collection(db, colName)),
        (snapshot) => {
          const items = snapshot.docs
            .map((d) => normalizeMediaDoc(d, colName))
            .filter((item) => !item.isDeleted && !isMediaRestricted(item));
          setMediaByCollection((prev) => ({
            ...prev,
            [colName]: items,
          }));
          setLoading(false);
        },
        () => {
          // Silently ignore collections not enabled in Firestore Rules yet
        }
      )
    );

    // 3. Live listener for Monetization requests (optional collection)
    const unsubMonetization = onSnapshot(
      query(collection(db, 'monetization_requests')),
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMonetizationReqs(docs);
      },
      () => {}
    );

    return () => {
      unsubUsers();
      unsubMediaList.forEach((u) => u());
      unsubMonetization();
    };
  }, []);

  const usersMap = useMemo(() => buildUsersLookupMap(usersList), [usersList]);

  const effectiveMonetizationCount = useMemo(() => {
    const reqUserIds = new Set<string>(
      monetizationReqs
        .flatMap((r: any) => [r.userId, r.uid, r.creatorId, r.applicantId].filter(Boolean).map(String))
    );
    const pendingInCollection = monetizationReqs.filter((r: any) => {
      const s = String(r.status || 'Pending').trim().toLowerCase();
      return s !== 'approved' && s !== 'active' && s !== 'monetized' && s !== 'rejected' && s !== 'revoked' && s !== 'declined';
    }).length;
    const pendingInUsers = usersList.filter((u) => {
      if (reqUserIds.has(u.docId) || (u.uid && reqUserIds.has(String(u.uid)))) return false;
      return getUserMonetizationApplicationStatus(u) === 'Pending';
    }).length;
    return pendingInCollection + pendingInUsers;
  }, [monetizationReqs, usersList]);

  // Merge all uploaded posts, reels, stories, videos, and live_uploads, enriched with uploader profile
  const allUploads = useMemo(() => {
    const merged: any[] = [];
    MEDIA_COLLECTIONS.forEach((colName) => {
      const items = mediaByCollection[colName] || [];
      items.forEach((item) => {
        const owner = usersMap[item.userId] || usersMap[item.username];
        merged.push({
          ...item,
          uploader: item.uploader || owner?.displayName || 'YouSnap Creator',
          username: item.username || owner?.username || item.userId || 'creator',
          avatar: item.avatar || owner?.photoURL || '',
        });
      });
    });

    return merged.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
  }, [mediaByCollection, usersMap]);

  const postsCount = mediaByCollection.posts.length;
  const reelsCount = mediaByCollection.reels.length + mediaByCollection.videos.length;
  const storiesCount = mediaByCollection.stories.length;

  // Action: Toggle Algorithmic Viral Boost in Firestore
  const handleToggleViralBoost = async (item: any) => {
    const col = item.sourceCollection || 'videos';
    const docId = item.docId || item.id;
    try {
      const nextBoost = !item.isViralBoosted;
      await updateDoc(doc(db, col, docId), {
        isViralBoosted: nextBoost,
        boostTarget: nextBoost ? 'Top 1 Feed Priority' : null,
        boostMultiplier: nextBoost ? '10x' : '1x',
      });
      showToast(nextBoost ? `🔥 Viral Boost Activated for "${item.title}"!` : `Boost disabled for "${item.title}"`);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `${col}/${docId}`);
      showToast('Failed to update viral boost — check Firestore Rules for Admin write permission.');
    }
  };

  // Action: Send Warning notice
  const handleSendWarning = async () => {
    if (!warningModalItem || !warningReason.trim()) return;
    const col = warningModalItem.sourceCollection || 'videos';
    const docId = warningModalItem.docId || warningModalItem.id;
    try {
      await updateDoc(doc(db, col, docId), {
        status: 'Warning',
        warningReason: warningReason.trim(),
        warnedAt: serverTimestamp(),
      });
      showToast(`Warning sent to @${warningModalItem.username} for "${warningModalItem.title}"`);
      setWarningModalItem(null);
      setWarningReason('');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `${col}/${docId}`);
      showToast('Error sending warning — check Firestore Rules.');
    }
  };

  // Action: Delete media item from its Firestore collection
  const handleConfirmDelete = async () => {
    if (!deleteModalItem) return;
    const col = deleteModalItem.sourceCollection || 'videos';
    const docId = deleteModalItem.docId || deleteModalItem.id;
    try {
      await deleteMediaFromFirestore(db, deleteModalItem);
      showToast(`"${deleteModalItem.title}" deleted from Firestore /${col}`);
      setDeleteModalItem(null);
      if (previewItem?.mediaKey === deleteModalItem.mediaKey) setPreviewItem(null);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `${col}/${docId}`);
      showToast('Failed to delete media — check Firestore Rules for Admin delete permission.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div
          onClick={() => onNavigate?.('Users')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">App Users</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
              <Users size={18} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">{usersList.length}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live in /users
          </p>
        </div>

        <div
          onClick={() => onNavigate?.('Videos')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Reels & Videos</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition">
              <Video size={18} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">{reelsCount}</p>
          <p className="text-[11px] text-sky-600 font-bold mt-1.5 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" /> Live in /reels & /videos
          </p>
        </div>

        <div
          onClick={() => onNavigate?.('Videos')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Posts & Stories</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
              <Upload size={18} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">{postsCount + storiesCount}</p>
          <p className="text-[11px] text-amber-600 font-bold mt-1.5 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> {postsCount} Posts • {storiesCount} Stories
          </p>
        </div>

        <div
          onClick={() => onNavigate?.('Monetization')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Payout Requests</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">{effectiveMonetizationCount}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Monetization queue
          </p>
        </div>
      </div>

      {/* Live Uploads Feed Panel */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Live App Uploads Stream ({allUploads.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Synced live from <code className="text-emerald-600 font-bold">/posts</code>, <code className="text-emerald-600 font-bold">/reels</code>, <code className="text-emerald-600 font-bold">/stories</code> & <code className="text-emerald-600 font-bold">/videos</code>
            </p>
          </div>
        </div>

        {error && (
          <div className="m-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="animate-spin mx-auto text-emerald-500 mb-2" size={24} />
            <p className="text-xs font-bold text-slate-600">Connecting to YouSnap app Firestore...</p>
          </div>
        ) : allUploads.length === 0 ? (
          <div className="p-12 text-center">
            <Upload className="mx-auto text-slate-300 mb-2" size={36} />
            <p className="text-xs font-bold text-slate-700">No uploads found in Firestore yet</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Posts, Reels, and Stories uploaded from the YouSnap app will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {allUploads.map((item) => {
              const thumbSrc = item.thumbnailURL || item.thumbnail || item.avatar;
              return (
                <div key={item.mediaKey} className="p-4 hover:bg-slate-50/60 transition flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-[280px]">
                    <div
                      onClick={() => setPreviewItem(item)}
                      className="relative w-16 h-12 rounded-xl overflow-hidden bg-slate-900 shrink-0 cursor-pointer group flex items-center justify-center"
                    >
                      {thumbSrc ? (
                        <img src={thumbSrc} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      ) : (
                        <Video size={16} className="text-slate-400" />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                        {item.mediaKind === 'Photo' ? <ImageIcon size={14} /> : <Play size={14} className="fill-white" />}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                          item.sourceCollection === 'reels' || item.sourceCollection === 'videos'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : item.sourceCollection === 'stories'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {item.sourceLabel}
                        </span>
                        <h4
                          onClick={() => setPreviewItem(item)}
                          className="font-bold text-slate-900 text-xs hover:text-emerald-600 cursor-pointer transition"
                        >
                          {item.title}
                        </h4>
                        {item.isViralBoosted && (
                          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs animate-pulse">
                            <Flame size={10} /> 10X VIRAL BOOST
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        by <strong>{item.uploader}</strong> (@{item.username}) • {item.timeLabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleToggleViralBoost(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs ${
                        item.isViralBoosted
                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Sparkles size={12} /> {item.isViralBoosted ? 'Boost Active' : 'Boost Viral'}
                    </button>

                    <button
                      onClick={() => setDeleteModalItem(item)}
                      className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition"
                      title="Delete Media"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Analytics Graph */}
      <AnalyticsChart />

      {/* Video / Photo Preview Modal */}
      <VideoPreviewModal
        video={previewItem}
        isOpen={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        showToast={showToast}
        onVideoDeleted={(id) => {
          setMediaByCollection((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((k) => {
              next[k] = next[k].filter((i) => i.docId !== id && i.id !== id);
            });
            return next;
          });
          setPreviewItem(null);
        }}
      />

      {/* Warning Notice Modal */}
      {warningModalItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">Send Firestore Warning Notice</h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Warn @{warningModalItem.username} regarding "{warningModalItem.title}":
            </p>
            <textarea
              rows={3}
              value={warningReason}
              onChange={(e) => setWarningReason(e.target.value)}
              placeholder="Enter violation reason (e.g. copyright, community guidelines)..."
              className="w-full mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setWarningModalItem(null)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSendWarning}
                className="flex-1 py-2 bg-amber-600 text-white font-bold rounded-xl text-xs hover:bg-amber-700 transition"
              >
                Confirm Warning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">Confirm Deletion</h3>
            <p className="text-xs text-slate-600 text-center mt-1">
              Delete "{deleteModalItem.title}" from Cloud Firestore <code className="text-rose-600">/{deleteModalItem.sourceCollection}</code>?
            </p>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setDeleteModalItem(null)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition"
              >
                Delete from Firestore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
