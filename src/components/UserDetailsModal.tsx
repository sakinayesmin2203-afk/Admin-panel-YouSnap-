import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  doc, 
  updateDoc, 
  collection, 
  addDoc, 
  serverTimestamp, 
  onSnapshot,
  query,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { 
  X, 
  ArrowLeft, 
  Video, 
  DollarSign, 
  Users, 
  Calendar, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Ban, 
  Mail, 
  Sparkles,
  RefreshCw,
  Play,
  Trash2,
  Eye,
  ThumbsUp,
  Image as ImageIcon
} from 'lucide-react';

import {
  MEDIA_COLLECTIONS,
  MediaSourceCollection,
  deleteMediaFromFirestore,
  doesMediaBelongToUser,
  isMediaRestricted,
  isUserDeleted,
  normalizeMediaDoc,
  normalizeUserDoc,
  restrictMediaInFirestore,
} from '../lib/firestoreAdapters';

interface UserDetailsModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export default function UserDetailsModal({ user, isOpen, onClose, showToast }: UserDetailsModalProps) {
  const [currentUserData, setCurrentUserData] = useState<any>(user);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [actionType, setActionType] = useState<'Suspend' | 'Ban'>('Suspend');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User uploaded media state across posts, reels, stories, videos, live_uploads
  const [mediaByCollection, setMediaByCollection] = useState<Record<string, any[]>>({
    posts: [],
    reels: [],
    stories: [],
    videos: [],
    live_uploads: [],
  });
  const [mediaLoading, setMediaLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);

  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [deleteUserMediaAlso, setDeleteUserMediaAlso] = useState(true);

  const userDocId = user?.docId || user?.id;

  // Live real-time listener on this user document in Firestore
  useEffect(() => {
    if (!isOpen || !userDocId) return;
    setCurrentUserData(user);

    const unsub = onSnapshot(
      doc(db, 'users', userDocId),
      (docSnap) => {
        if (docSnap.exists() && !isUserDeleted(docSnap.data())) {
          setCurrentUserData(normalizeUserDoc(docSnap));
        } else {
          showToast('User account deleted from Firestore.');
          onClose();
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `users/${userDocId}`)
    );

    return () => unsub();
  }, [isOpen, userDocId]);

  // Fetch all posts, reels, stories, and videos uploaded by this user
  useEffect(() => {
    if (!isOpen || !user) return;
    setMediaLoading(true);
    setMediaByCollection({
      posts: [],
      reels: [],
      stories: [],
      videos: [],
      live_uploads: [],
    });

    const unsubs = MEDIA_COLLECTIONS.map((colName: MediaSourceCollection) =>
      onSnapshot(
        query(collection(db, colName)),
        (snapshot) => {
          const items = snapshot.docs
            .map((d) => normalizeMediaDoc(d, colName))
            .filter((item) => !item.isDeleted && doesMediaBelongToUser(item, user));
          setMediaByCollection((prev) => ({ ...prev, [colName]: items }));
          setMediaLoading(false);
        },
        () => {
          setMediaLoading(false);
        }
      )
    );

    return () => unsubs.forEach((u) => u());
  }, [isOpen, userDocId]);

  const userMedia = React.useMemo(() => {
    const merged: any[] = [];
    MEDIA_COLLECTIONS.forEach((colName) => {
      merged.push(...(mediaByCollection[colName] || []));
    });
    return merged.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
  }, [mediaByCollection]);

  // Auto-close open media preview if deleted from the App in real time
  useEffect(() => {
    if (!mediaLoading && selectedMedia && !userMedia.some((m) => m.mediaKey === selectedMedia.mediaKey)) {
      setSelectedMedia(null);
    }
  }, [userMedia, selectedMedia, mediaLoading]);

  if (!isOpen || !currentUserData) return null;

  // Preset reasons for quick administrative selection
  const PRESET_REASONS = [
    'Copyright Infringement',
    'Community Guidelines Violation',
    'Spam & Deceptive Metadata',
    'Inappropriate / NSFW Content'
  ];

  const handleOpenReasonModal = (type: 'Suspend' | 'Ban') => {
    setActionType(type);
    setCustomReason('');
    setShowReasonModal(true);
  };

  const handleConfirmRestriction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReason.trim()) {
      alert('Please enter a reason before proceeding.');
      return;
    }

    setIsSubmitting(true);
    try {
      const targetStatus = actionType === 'Ban' ? 'Banned' : 'Suspended';
      const isBan = targetStatus === 'Banned';
      const reasonText = customReason.trim();
      const targetUserId = currentUserData.uid || userDocId;

      // 1. Update status and standard restriction flags in Firestore users collection
      await updateDoc(doc(db, 'users', userDocId), {
        status: targetStatus,
        accountStatus: targetStatus,
        isSuspended: !isBan,
        isBanned: isBan,
        isRestricted: true,
        suspendReason: reasonText,
        suspensionReason: !isBan ? reasonText : null,
        banReason: isBan ? reasonText : null,
        restrictionReason: reasonText,
        suspendedAt: !isBan ? serverTimestamp() : null,
        bannedAt: isBan ? serverTimestamp() : null,
        updatedAt: serverTimestamp()
      });

      // 2. Create targeted notification in Firestore notifications collection (if enabled in rules)
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: targetUserId,
          userDocId,
          recipientId: targetUserId,
          title: isBan ? 'Account Banned' : 'Account Suspended',
          message: `Reason: ${reasonText}`,
          reason: reasonText,
          status: targetStatus,
          createdAt: serverTimestamp(),
          read: false,
          type: isBan ? 'account_banned' : 'account_suspended'
        });
      } catch {
        // ignore if notifications rules are not published yet
      }

      // 3. Multi-channel local notification sync for Simulator
      const notifsKey = 'yousnap_user_app_notifications';
      const existing = JSON.parse(localStorage.getItem(notifsKey) || '[]');
      const newNotif = {
        id: `NTF-USR-${Date.now()}`,
        userId: targetUserId,
        username: currentUserData.username || currentUserData.displayName,
        title: isBan ? 'Account Banned' : 'Account Suspended',
        message: `Reason: ${reasonText}`,
        createdAt: new Date().toISOString(),
        timestamp: 'Just now',
        category: targetStatus
      };
      localStorage.setItem(notifsKey, JSON.stringify([newNotif, ...existing]));
      window.dispatchEvent(new Event('yousnap_user_notification_sent'));

      setShowReasonModal(false);
      setCustomReason('');
      showToast(`User account is now ${targetStatus} in Firestore.`);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userDocId}`);
      showToast('Permission denied in Firestore Rules — publish Admin rules in Firebase Console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnsuspend = async () => {
    setIsSubmitting(true);
    try {
      const targetUserId = currentUserData.uid || userDocId;

      await updateDoc(doc(db, 'users', userDocId), {
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
        unbannedAt: serverTimestamp(),
        reactivatedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      try {
        await addDoc(collection(db, 'notifications'), {
          userId: targetUserId,
          userDocId,
          recipientId: targetUserId,
          title: 'Account Restored',
          message: 'Reason: Your account has been reviewed and reactivated. You now have full access to YouSnap.',
          createdAt: serverTimestamp(),
          read: false,
          type: 'account_restored'
        });
      } catch {
        // ignore if notifications rules are not published yet
      }

      const notifsKey = 'yousnap_user_app_notifications';
      const existing = JSON.parse(localStorage.getItem(notifsKey) || '[]');
      const restoreNotif = {
        id: `NTF-USR-${Date.now()}`,
        userId: targetUserId,
        username: currentUserData.username || currentUserData.displayName,
        title: 'Account Restored',
        message: 'Your account restriction has been lifted.',
        createdAt: new Date().toISOString(),
        timestamp: 'Just now',
        category: 'Restored'
      };
      localStorage.setItem(notifsKey, JSON.stringify([restoreNotif, ...existing]));
      window.dispatchEvent(new Event('yousnap_user_notification_sent'));

      showToast('User account successfully reactivated and unblocked!');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userDocId}`);
      showToast('Error reactivating user account — check Firestore Rules.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMedia = async (mediaItem: any) => {
    const col = mediaItem?.sourceCollection || 'videos';
    const docId = mediaItem?.docId || mediaItem?.id || mediaItem;
    if (!window.confirm('Are you sure you want to delete this media item from Firestore?')) return;
    try {
      await deleteMediaFromFirestore(db, mediaItem);
      showToast(`Media removed successfully from /${col}`);
      setSelectedMedia(null);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `${col}/${docId}`);
      showToast('Failed to delete media — check Firestore Rules.');
    }
  };

  const handleRestrictMedia = async (mediaItem: any, action: 'Suspend' | 'Ban') => {
    const col = mediaItem?.sourceCollection || 'videos';
    const docId = mediaItem?.docId || mediaItem?.id;
    const reasonInput = window.prompt(
      `Enter reason to ${action.toLowerCase()} this media (moves to Restricted Accounts):`,
      'Community guidelines violation'
    );
    if (!reasonInput || !reasonInput.trim()) return;
    try {
      const { statusValue } = await restrictMediaInFirestore(db, mediaItem, action, reasonInput.trim());
      showToast(`Media ${statusValue} & moved to Restricted Accounts.`);
      setSelectedMedia(null);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `${col}/${docId}`);
      showToast('Failed to restrict media — check Firestore Rules.');
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userDocId) return;
    setIsSubmitting(true);
    try {
      if (deleteUserMediaAlso) {
        for (const colName of MEDIA_COLLECTIONS) {
          try {
            const snap = await getDocs(collection(db, colName));
            const matching = snap.docs
              .map((d) => normalizeMediaDoc(d, colName))
              .filter((m) => doesMediaBelongToUser(m, currentUserData));
            await Promise.all(
              matching.map((m) => deleteDoc(doc(db, colName, m.docId)).catch(() => {}))
            );
          } catch {
            // ignore inaccessible optional collections
          }
        }
      }

      await deleteDoc(doc(db, 'users', userDocId));
      setShowDeleteUserModal(false);
      showToast(`User "${currentUserData.displayName || currentUserData.email || userDocId}" deleted from Firestore!`);
      onClose();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `users/${userDocId}`);
      showToast('Permission denied — ensure `allow delete: if isAdmin();` is published on /users in Firestore Rules.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRestricted = currentUserData.status === 'Suspended' || currentUserData.status === 'Banned';

  // Derived user statistics using real YouSnap app fields
  const totalVideos = !mediaLoading
    ? userMedia.length
    : Number(currentUserData.postCount ?? currentUserData.photoUploadsCount ?? currentUserData.uploads ?? currentUserData.totalVideos ?? 0);
  const totalEarnings = currentUserData.totalEarnings ?? currentUserData.earnings ?? '₹0';
  const followersCount = Number(currentUserData.followersCount ?? currentUserData.followers ?? 0).toLocaleString();
  const createdDate = currentUserData.joinedDate || (currentUserData.createdAt?.toDate ? currentUserData.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (currentUserData.monetizationStatus ? `Monetization: ${currentUserData.monetizationStatus}` : 'Active Member'));
  
  const totalViewsCount = React.useMemo(() => {
    const sumFromMedia = userMedia.reduce((acc, m) => acc + (parseInt(m.views) || 0), 0);
    const profileViews = Number(currentUserData.videoViewsCount ?? currentUserData.totalViews ?? 0);
    return Math.max(sumFromMedia, profileViews);
  }, [userMedia, currentUserData]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md overflow-y-auto flex flex-col p-0 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Container Box - Fullscreen / Maximized view */}
      <div className="w-full min-h-full sm:min-h-0 sm:max-w-5xl mx-auto bg-white sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
        
        {/* Top Navigation Bar */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between sticky top-0 z-20">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition py-1 px-2.5 rounded-xl hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            <span>Back to Users Table</span>
          </button>

          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs ${
              currentUserData.status === 'Active'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : currentUserData.status === 'Suspended'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                currentUserData.status === 'Active' ? 'bg-emerald-400' : currentUserData.status === 'Suspended' ? 'bg-amber-400' : 'bg-rose-400'
              }`} />
              {currentUserData.status || 'Active'}
            </span>

            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Hero Profile Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white border-b border-slate-800 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative shrink-0">
              <img 
                src={currentUserData.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'} 
                alt={currentUserData.displayName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-slate-700 shadow-2xl ring-4 ring-slate-800/80" 
              />
              <span className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                currentUserData.status === 'Active' ? 'bg-emerald-500' : currentUserData.status === 'Suspended' ? 'bg-amber-500' : 'bg-rose-500'
              }`}>
                {currentUserData.status === 'Active' ? (
                  <CheckCircle2 size={13} className="text-white" />
                ) : (
                  <ShieldAlert size={13} className="text-white" />
                )}
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {currentUserData.displayName || 'Unnamed User'}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                  YouSnap Member
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-400">
                <span className="font-mono text-slate-300">@{currentUserData.username || currentUserData.displayName?.toLowerCase().replace(/\s+/g, '_') || 'user'}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-emerald-400">
                  <Mail size={13} /> {currentUserData.email || 'No email registered'}
                </span>
                <span>•</span>
                <span className="font-mono text-slate-400">UID: {currentUserData.uid || currentUserData.id}</span>
              </div>

              {currentUserData.bio && (
                <p className="text-xs text-slate-300 pt-2 italic max-w-xl">
                  "{currentUserData.bio}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* User Content Body */}
        <div className="p-6 sm:p-8 space-y-6 bg-slate-50 flex-1">
          
          {/* Detail Metrics */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
              Account Performance & Overview
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2">
                  <Video size={18} />
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Videos</p>
                <p className="text-2xl font-black text-slate-900 font-mono">{userMedia.length || totalVideos}</p>
                <p className="text-[10px] text-sky-600 font-semibold">Uploaded to platform</p>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                  <Eye size={18} />
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Views</p>
                <p className="text-2xl font-black text-slate-900 font-mono">{totalViewsCount.toLocaleString()}</p>
                <p className="text-[10px] text-indigo-600 font-semibold">Across all uploads</p>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <DollarSign size={18} />
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Earnings</p>
                <p className="text-2xl font-black text-emerald-600 font-mono">{totalEarnings}</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Monetization pool</p>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                  <Users size={18} />
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Followers</p>
                <p className="text-2xl font-black text-slate-900 font-mono">{followersCount}</p>
                <p className="text-[10px] text-purple-600 font-semibold">App subscriber base</p>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                  <Calendar size={18} />
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Account Created</p>
                <p className="text-base font-black text-slate-900 truncate mt-1">{createdDate}</p>
                <p className="text-[10px] text-amber-600 font-semibold">Registration date</p>
              </div>

            </div>
          </div>

          {/* Account Restriction Notice Banner if Suspended or Banned */}
          {isRestricted ? (
            <div className={`p-5 rounded-2xl border shadow-xs space-y-2.5 ${
              currentUserData.status === 'Banned' 
                ? 'bg-rose-50 border-rose-200 text-rose-900' 
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2.5">
                <ShieldAlert size={20} className={currentUserData.status === 'Banned' ? 'text-rose-600' : 'text-amber-600'} />
                <h4 className="font-extrabold text-sm uppercase tracking-wide">
                  Account Status: {currentUserData.status} (Restriction Active)
                </h4>
              </div>

              <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/60 space-y-1 text-xs">
                <p className="font-bold text-slate-700">Reason:</p>
                <p className="font-medium text-slate-900 italic leading-relaxed">
                  "{currentUserData.suspendReason || currentUserData.banReason || 'Violation of YouSnap safety, copyright, and community standards.'}"
                </p>
              </div>

              <p className="text-[11px] text-slate-500 font-medium">
                • A direct notification with this reason has been pushed to the user's mobile app in the <code className="font-bold">/notifications</code> collection.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Account in Good Standing</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  This user has zero active infractions and is authorized for full YouSnap app features.
                </p>
              </div>
            </div>
          )}

          {/* NEW: Uploaded Photos & Videos Gallery Section */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <ImageIcon size={15} className="text-emerald-600" /> Uploaded Photos & Videos Gallery
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Live media filtered across <code className="text-emerald-600">/posts</code>, <code className="text-emerald-600">/reels</code>, <code className="text-emerald-600">/stories</code> & <code className="text-emerald-600">/videos</code>
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                {userMedia.length} Items
              </span>
            </div>

            {mediaLoading ? (
              <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw className="animate-spin text-emerald-500" size={16} />
                <span>Loading media gallery from Firestore...</span>
              </div>
            ) : userMedia.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <Video className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-xs font-bold text-slate-600">No media uploads found for this user.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Posts ({currentUserData.postCount || 0}), Photos ({currentUserData.photoUploadsCount || 0}), Stories ({currentUserData.storiesUploadedCount || 0}) synced when uploaded to Firestore.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {userMedia.map((media) => (
                  <div 
                    key={media.mediaKey || media.id}
                    onClick={() => setSelectedMedia(media)}
                    className="group relative bg-slate-900 rounded-2xl overflow-hidden shadow-xs cursor-pointer border border-slate-200 hover:border-emerald-500 transition aspect-video flex flex-col justify-end"
                  >
                    {(media.thumbnailURL || media.mediaUrl) && (
                      <img 
                        src={media.thumbnailURL || media.mediaUrl} 
                        alt={media.caption}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                    
                    {/* Type Badge */}
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      {media.mediaKind === 'Photo' ? <ImageIcon size={10} /> : <Play size={10} className="fill-white" />}
                      {media.sourceLabel || media.mediaKind}
                    </span>

                    <div className="relative p-3 z-10 space-y-1 text-white">
                      <p className="text-xs font-bold line-clamp-1 group-hover:text-emerald-300 transition">
                        {media.caption || 'YouSnap Media'}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-300 font-mono">
                        <span className="flex items-center gap-1"><Eye size={11} /> {parseInt(media.views || 0).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><ThumbsUp size={11} /> {parseInt(media.likes || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
              Account Moderation Actions
            </h4>

            <div className="flex flex-wrap items-center gap-3">
              {isRestricted ? (
                <button
                  onClick={handleUnsuspend}
                  disabled={isSubmitting}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs transition shadow-sm active:scale-95 flex items-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  <span>Unsuspend / Unban Account</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleOpenReasonModal('Suspend')}
                    className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl text-xs transition shadow-sm active:scale-95 flex items-center gap-2"
                  >
                    <AlertTriangle size={16} />
                    <span>Suspend Account</span>
                  </button>

                  <button
                    onClick={() => handleOpenReasonModal('Ban')}
                    className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs transition shadow-sm active:scale-95 flex items-center gap-2"
                  >
                    <Ban size={16} />
                    <span>Ban Account</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setShowDeleteUserModal(true)}
                className="px-5 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold rounded-xl text-xs transition active:scale-95 flex items-center gap-2"
              >
                <Trash2 size={16} />
                <span>Delete User</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition ml-auto"
              >
                Close View
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* NEW: Media Player / Preview Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[150] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm truncate max-w-md">{selectedMedia.caption || 'Media Preview'}</h3>
                <p className="text-[10px] text-slate-400 font-mono">ID: {selectedMedia.videoId || selectedMedia.id}</p>
              </div>
              <button onClick={() => setSelectedMedia(null)} className="text-slate-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                {selectedMedia.mediaKind === 'Photo' || (!selectedMedia.videoURL && (selectedMedia.thumbnailURL || selectedMedia.mediaUrl)) ? (
                  <img 
                    src={selectedMedia.thumbnailURL || selectedMedia.mediaUrl} 
                    alt={selectedMedia.caption} 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video 
                    controls 
                    autoPlay 
                    playsInline 
                    poster={selectedMedia.thumbnailURL}
                    className="w-full h-full object-contain"
                    src={selectedMedia.videoURL}
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">
                    {selectedMedia.views || 0} Views • {selectedMedia.likes || 0} Likes
                    {isMediaRestricted(selectedMedia) && (
                      <span className="ml-2 px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px]">
                        {selectedMedia.status}
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400">Uploaded by @{currentUserData.username || currentUserData.displayName} • /{selectedMedia.sourceCollection}</p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => handleRestrictMedia(selectedMedia, 'Suspend')}
                    className="px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl font-bold text-xs transition flex items-center gap-1"
                  >
                    <AlertTriangle size={13} /> Suspend
                  </button>
                  <button
                    onClick={() => handleRestrictMedia(selectedMedia, 'Ban')}
                    className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition flex items-center gap-1"
                  >
                    <Ban size={13} /> Ban
                  </button>
                  <button
                    onClick={() => handleDeleteMedia(selectedMedia)}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Reason Input Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  actionType === 'Ban' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {actionType === 'Ban' ? <Ban size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    {actionType === 'Ban' ? 'Ban User Account' : 'Suspend User Account'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Target: {currentUserData.displayName} (@{currentUserData.username || 'user'})
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowReasonModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmRestriction} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Enter Custom Reason:
                </label>
                <textarea 
                  rows={3}
                  required
                  placeholder={`Enter why this user is being ${actionType.toLowerCase()}ed...`}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400 leading-relaxed"
                />
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Quick Reason Presets:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_REASONS.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setCustomReason(preset)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReasonModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 text-white font-extrabold rounded-xl transition shadow-sm flex items-center gap-1.5 ${
                    actionType === 'Ban' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {isSubmitting ? <RefreshCw className="animate-spin" size={14} /> : <Send size={14} />}
                  <span>Confirm & {actionType} Account</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteUserModal && (
        <div className="fixed inset-0 z-[130] bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
              <Trash2 size={22} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Delete User from Firestore?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This permanently removes <span className="font-bold text-slate-800">{currentUserData.displayName}</span> (<span className="font-mono">{currentUserData.email || userDocId}</span>) from the Admin Panel and Firestore <code className="text-rose-600 font-bold">/users</code>.
              </p>
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={deleteUserMediaAlso}
                onChange={(e) => setDeleteUserMediaAlso(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span>Also delete all posts, reels, stories, and videos uploaded by this user.</span>
            </label>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteUserModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? <RefreshCw className="animate-spin" size={14} /> : <Trash2 size={14} />}
                <span>Delete User</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
