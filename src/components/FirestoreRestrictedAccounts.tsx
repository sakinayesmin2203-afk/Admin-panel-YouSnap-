import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  doc, 
  updateDoc, 
  setDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  Sparkles, 
  UserCheck, 
  Lock, 
  Video,
  DollarSign,
  UserX,
  Trash2,
  Check,
  X,
  Filter
} from 'lucide-react';
import UserDetailsModal from './UserDetailsModal';
import {
  MEDIA_COLLECTIONS,
  MediaSourceCollection,
  buildUsersLookupMap,
  deleteMediaFromFirestore,
  getUserMonetizationApplicationStatus,
  isMediaRestricted,
  isUserRestricted,
  normalizeMediaDoc,
  normalizeUserDoc,
} from '../lib/firestoreAdapters';

export default function FirestoreRestrictedAccounts() {
  const [restrictedUsers, setRestrictedUsers] = useState<any[]>([]);
  const [blockedMediaByCol, setBlockedMediaByCol] = useState<Record<string, any[]>>({});
  const [revokedMonetization, setRevokedMonetization] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Accounts' | 'Media' | 'Monetization'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedUserForModal, setSelectedUserForModal] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Listen to users, media collections, and monetization requests in real-time
  useEffect(() => {
    setLoading(true);

    const unsubUsers = onSnapshot(
      query(collection(db, 'users')),
      (snapshot) => {
        const normalized = snapshot.docs.map((d) => normalizeUserDoc(d));
        const suspended = normalized.filter((u) => isUserRestricted(u));
        setUsersMap(buildUsersLookupMap(normalized));
        setRestrictedUsers(suspended);
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'users');
        setLoading(false);
      }
    );

    const unsubMedia = MEDIA_COLLECTIONS.map((colName: MediaSourceCollection) =>
      onSnapshot(
        query(collection(db, colName)),
        (snapshot) => {
          const blocked = snapshot.docs
            .map((d) => normalizeMediaDoc(d, colName))
            .filter((v) => !v.isDeleted && isMediaRestricted(v));
          setBlockedMediaByCol((prev) => ({ ...prev, [colName]: blocked }));
        },
        () => {}
      )
    );

    const unsubMonetization = onSnapshot(
      query(collection(db, 'monetization_requests')),
      (snapshot) => {
        const revoked = snapshot.docs
          .map((docSnap) => ({ ...docSnap.data(), id: docSnap.id }))
          .filter((m: any) => m.status === 'Rejected' || m.status === 'Revoked');
        setRevokedMonetization(revoked);
      },
      () => {}
    );

    return () => {
      unsubUsers();
      unsubMedia.forEach((u) => u());
      unsubMonetization();
    };
  }, []);

  const allRevokedMonetization = React.useMemo(() => {
    const merged = [...revokedMonetization];
    const existingIds = new Set(
      merged.flatMap((m: any) => [m.userId, m.uid].filter(Boolean).map(String))
    );
    const seen = new Set<string>();
    Object.values(usersMap).forEach((u: any) => {
      if (!u?.docId || seen.has(u.docId)) return;
      seen.add(u.docId);
      if (existingIds.has(u.docId) || (u.uid && existingIds.has(String(u.uid)))) return;
      if (getUserMonetizationApplicationStatus(u) === 'Rejected') {
        merged.push({
          id: u.docId,
          userId: u.docId,
          followersCount: u.followersCount || 0,
          earnings: parseFloat(String(u.totalEarnings || '0').replace(/[^0-9.]/g, '')) || 0,
          status: 'Rejected',
          fromUserDoc: true,
        });
      }
    });
    return merged;
  }, [revokedMonetization, usersMap]);

  const blockedVideos = React.useMemo(() => {
    const merged: any[] = [];
    MEDIA_COLLECTIONS.forEach((colName) => {
      merged.push(...(blockedMediaByCol[colName] || []));
    });
    return merged;
  }, [blockedMediaByCol]);

  // Action 1: Lift User Account Restriction (Unsuspend / Unban)
  const handleLiftUserRestriction = async (user: any) => {
    if (!window.confirm(`Unsuspend and reactivate account for ${user.displayName || user.username || user.id}?`)) return;
    const uid = user.docId || user.id || user.uid;
    try {
      await updateDoc(doc(db, 'users', uid), {
        status: 'Active',
        accountStatus: 'Active',
        isSuspended: false,
        isBanned: false,
        isRestricted: false,
        suspendReason: '',
        suspensionReason: null,
        banReason: null,
        restrictionReason: null,
        suspendedAt: null,
        bannedAt: null,
        reactivatedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Notify User (optional if notifications rules exist)
      try {
        await setDoc(doc(collection(db, 'notifications'), `notif_${Date.now()}`), {
          userId: uid,
          title: 'Account Restored to Active 🎉',
          message: 'Your account restrictions have been lifted by Trust & Safety admin.',
          createdAt: serverTimestamp(),
          read: false
        });
      } catch {
        // ignore if notifications rules are not added yet
      }

      showToast(`Account for ${user.displayName || user.username} restored to Active!`);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
      showToast('Failed to lift account restriction — check Admin Rules');
    }
  };

  // Action 2: Restore / Unblock Media
  const handleRestoreMedia = async (video: any) => {
    const col = video.sourceCollection || 'videos';
    const docId = video.docId || video.id;
    try {
      await updateDoc(doc(db, col, docId), {
        isBlocked: false,
        isBanned: false,
        isSuspended: false,
        isRestricted: false,
        status: 'Active',
        blockReason: null,
        banReason: null,
        suspensionReason: null,
        suspendReason: null,
        restrictionReason: null,
        restoredAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (video.userId) {
        try {
          await setDoc(doc(collection(db, 'notifications'), `notif_${Date.now()}`), {
            userId: video.userId,
            title: 'Media Restored',
            message: `Your media "${video.caption || video.videoId}" has been unblocked and restored.`,
            createdAt: serverTimestamp(),
            read: false
          });
        } catch {
          // ignore if notifications rules are not added yet
        }
      }

      showToast(`Media ${video.videoId || docId} successfully unblocked and restored!`);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `${col}/${docId}`);
      showToast('Failed to restore media');
    }
  };

  // Permanent Delete Media
  const handleDeleteMedia = async (video: any) => {
    const col = video.sourceCollection || 'videos';
    const docId = video.docId || video.id;
    if (!window.confirm('Permanently delete this blocked media from Firestore?')) return;
    try {
      await deleteMediaFromFirestore(db, video);
      showToast('Media permanently deleted');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `${col}/${docId}`);
      showToast('Failed to delete media');
    }
  };

  // Action 3: Restore Monetization
  const handleRestoreMonetization = async (req: any) => {
    const reqId = req.docId || req.id;
    const targetUserId = req.userId || req.uid || (req.fromUserDoc ? reqId : '');
    const resolvedUserDocId = (targetUserId && usersMap[targetUserId]?.docId) || targetUserId;
    try {
      if (!req.fromUserDoc) {
        await updateDoc(doc(db, 'monetization_requests', reqId), {
          status: 'Approved',
          restoredAt: serverTimestamp()
        });
      }

      if (resolvedUserDocId) {
        await updateDoc(doc(db, 'users', resolvedUserDocId), {
          isMonetized: true,
          monetizationStatus: 'Approved',
          monetization: 'Active',
          monetizationApproved: true,
          monetizationRejected: false,
          monetizationApplied: false,
          monetizationRequested: false,
          monetizationReviewedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }).catch(() => {});

        try {
          await setDoc(doc(collection(db, 'notifications'), `notif_${Date.now()}`), {
            userId: resolvedUserDocId,
            title: 'Monetization Restored! 💰',
            message: 'Your creator monetization request has been approved and reinstated.',
            createdAt: serverTimestamp(),
            read: false
          });
        } catch {
          // ignore if notifications rules are not added yet
        }
      }

      showToast('Monetization successfully restored for creator!');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, req.fromUserDoc ? `users/${resolvedUserDocId}` : `monetization_requests/${reqId}`);
      showToast('Failed to restore monetization');
    }
  };

  // Filter items based on active tab and search query
  const matchesSearch = (item: any, fields: string[]) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return fields.some(f => {
      const val = item[f];
      return val && String(val).toLowerCase().includes(q);
    });
  };

  const filteredAccounts = restrictedUsers.filter(u => matchesSearch(u, ['displayName', 'username', 'email', 'id', 'suspensionReason', 'banReason']));
  const filteredMedia = blockedVideos.filter(v => matchesSearch(v, ['videoId', 'caption', 'userId']));
  const filteredMonetization = allRevokedMonetization.filter(m => matchesSearch(m, ['id', 'userId']));

  return (
    <div className="space-y-6">
      {/* Header - Cleaned up: No black banner and no Seed Sample buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-rose-600" /> Restricted Accounts & Moderation Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Trust & Safety moderation directory synced with Cloud Firestore (<code className="text-emerald-600 font-bold">/users</code>, <code className="text-emerald-600 font-bold">/posts</code>, <code className="text-emerald-600 font-bold">/reels</code>, <code className="text-emerald-600 font-bold">/stories</code>)
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Suspended / Banned</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{restrictedUsers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-amber-500 uppercase">Blocked Media</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{blockedVideos.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-purple-500 uppercase">Revoked Monetization</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{allRevokedMonetization.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Restrictions</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {restrictedUsers.length + blockedVideos.length + allRevokedMonetization.length}
          </p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'All', label: 'All Restrictions', count: restrictedUsers.length + blockedVideos.length + allRevokedMonetization.length },
              { id: 'Accounts', label: 'Suspended & Banned Accounts', count: restrictedUsers.length },
              { id: 'Media', label: 'Blocked Photos & Videos', count: blockedVideos.length },
              { id: 'Monetization', label: 'Revoked Monetization', count: allRevokedMonetization.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === tab.id ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search restrictions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Render based on Active Tab */}
      <div className="space-y-6">
        {/* 1. Suspended & Banned Accounts Section */}
        {(activeTab === 'All' || activeTab === 'Accounts') && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <UserX size={15} className="text-rose-600" /> Suspended & Banned Accounts ({filteredAccounts.length})
              </h3>
            </div>

            {filteredAccounts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No suspended or banned accounts found matching current criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4 font-black">Creator Profile</th>
                      <th className="py-3 px-4 font-black">Status</th>
                      <th className="py-3 px-4 font-black">Violation Reason</th>
                      <th className="py-3 px-4 font-black text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAccounts.map(user => (
                      <tr key={user.docId || user.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4">
                          <div 
                            onClick={() => setSelectedUserForModal(user)}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            {user.photoURL || user.avatar ? (
                              <img 
                                src={user.photoURL || user.avatar} 
                                alt={user.displayName}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 group-hover:border-rose-500 transition shadow-2xs" 
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-black text-sm">
                                {(user.displayName || user.username || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-rose-600 transition">
                                {user.displayName || user.name || 'User'}
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono">
                                @{user.username || 'user'} • <span className="text-rose-600">{user.email || user.id}</span>
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            user.status === 'Suspended' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Suspended' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-slate-600 italic text-[11px]">
                            "{user.suspensionReason || user.banReason || 'Community guidelines violation'}"
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleLiftUserRestriction(user)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-2xs flex items-center gap-1.5 ml-auto"
                          >
                            <UserCheck size={13} /> Unsuspend / Unban
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 2. Blocked Photos & Videos Section */}
        {(activeTab === 'All' || activeTab === 'Media') && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Video size={15} className="text-amber-600" /> Blocked Photos & Videos ({filteredMedia.length})
              </h3>
            </div>

            {filteredMedia.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No blocked photos or videos found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4 font-black">Media Thumbnail & Caption</th>
                      <th className="py-3 px-4 font-black">Uploader Creator</th>
                      <th className="py-3 px-4 font-black">Block Reason</th>
                      <th className="py-3 px-4 font-black text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMedia.map(video => {
                      const uploader = usersMap[video.userId] || {
                        displayName: 'Uploader User',
                        username: video.userId || 'creator',
                        avatar: ''
                      };

                      return (
                        <tr key={video.mediaKey || video.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {video.thumbnailURL || video.mediaUrl ? (
                                <img 
                                  src={video.thumbnailURL || video.mediaUrl} 
                                  alt="" 
                                  className="w-12 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs" 
                                />
                              ) : (
                                <div className="w-12 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                  <Video size={16} />
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-slate-900 line-clamp-1">{video.caption || 'Sensitive Media'}</p>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                    video.status === 'Banned'
                                      ? 'bg-rose-100 text-rose-700'
                                      : video.status === 'Suspended'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}>
                                    {video.status || 'Blocked'}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono">/{video.sourceCollection || 'videos'} • {video.videoId || video.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div 
                              onClick={() => setSelectedUserForModal(uploader)}
                              className="flex items-center gap-2.5 cursor-pointer group"
                            >
                              {uploader.photoURL || uploader.avatar ? (
                                <img 
                                  src={uploader.photoURL || uploader.avatar} 
                                  alt="" 
                                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 group-hover:border-emerald-500 transition" 
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-xs">
                                  {(uploader.displayName || uploader.username || 'U').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900 group-hover:text-emerald-600 transition text-xs">
                                  {uploader.displayName || uploader.name}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono">@{uploader.username || 'user'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-slate-600 italic text-[11px]">
                              "{video.blockReason || video.reason || 'Copyright or community standards violation'}"
                            </p>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleRestoreMedia(video)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-2xs flex items-center gap-1"
                              >
                                <Check size={13} /> Unblock / Restore
                              </button>
                              <button
                                onClick={() => handleDeleteMedia(video)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-1"
                                title="Permanent Delete"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. Revoked Monetization Section */}
        {(activeTab === 'All' || activeTab === 'Monetization') && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <DollarSign size={15} className="text-purple-600" /> Revoked & Rejected Monetization ({filteredMonetization.length})
              </h3>
            </div>

            {filteredMonetization.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No revoked monetization requests found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4 font-black">Creator Profile</th>
                      <th className="py-3 px-4 font-black">Followers / Earnings</th>
                      <th className="py-3 px-4 font-black">Status</th>
                      <th className="py-3 px-4 font-black text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMonetization.map(req => {
                      const lookupId = req.userId || req.uid || req.id;
                      const creator = usersMap[lookupId] || {
                        id: lookupId,
                        displayName: 'Creator User',
                        username: lookupId || 'creator',
                        avatar: ''
                      };

                      return (
                        <tr key={req.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4">
                            <div 
                              onClick={() => setSelectedUserForModal(creator)}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              {creator.photoURL || creator.avatar ? (
                                <img 
                                  src={creator.photoURL || creator.avatar} 
                                  alt="" 
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 group-hover:border-purple-500 transition shadow-2xs" 
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-black text-sm flex items-center justify-center border border-purple-200 shrink-0">
                                  {(creator.displayName || creator.name || 'C').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900 group-hover:text-purple-600 transition">
                                  {creator.displayName || creator.name}
                                </p>
                                <p className="text-[11px] text-slate-500 font-mono">@{creator.username || 'user'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-700">{(req.followersCount || 0).toLocaleString()} followers</p>
                            <p className="text-[11px] font-mono text-emerald-600">${parseFloat(req.earnings || 0).toFixed(2)}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleRestoreMonetization(req)}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-2xs flex items-center gap-1.5 ml-auto"
                            >
                              <DollarSign size={13} /> Restore Monetization
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <UserDetailsModal 
        user={selectedUserForModal}
        isOpen={Boolean(selectedUserForModal)}
        onClose={() => setSelectedUserForModal(null)}
        showToast={showToast}
      />

      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
