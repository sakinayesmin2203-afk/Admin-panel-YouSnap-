import React, { useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { deleteMediaFromFirestore, restrictMediaInFirestore } from '../lib/firestoreAdapters';
import { 
  doc, 
  updateDoc, 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  X, 
  Play, 
  Eye, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Trash2, 
  Ban, 
  AlertTriangle, 
  Check, 
  ShieldAlert, 
  Send 
} from 'lucide-react';

interface VideoPreviewModalProps {
  video: any;
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
  onVideoDeleted?: (videoId: string) => void;
}

export default function VideoPreviewModal({ 
  video, 
  isOpen, 
  onClose, 
  showToast,
  onVideoDeleted 
}: VideoPreviewModalProps) {
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [actionScope, setActionScope] = useState<'Account' | 'Media'>('Account');
  const [actionType, setActionType] = useState<'Suspend' | 'Ban'>('Suspend');
  const [customReason, setCustomReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestricting, setIsRestricting] = useState(false);

  if (!isOpen || !video) return null;

  const videoId = video.docId || video.id || video.videoId || video.uploadId;
  const sourceCollection = video.sourceCollection || 'videos';
  const targetUserId = video.userId || video.uploaderId || 'Unknown';
  const uploaderName = video.uploader || video.name || 'Unknown Creator';
  const username = video.username || 'creator';
  const avatar = video.avatar || video.profilePic || video.thumbnailURL || video.thumbnail || '';
  const caption = video.title || video.caption || 'YouSnap Media';
  const videoSrc = video.videoURL || '';
  const posterSrc = video.thumbnailURL || video.thumbnail || video.mediaUrl || '';
  const isPhoto = video.mediaKind === 'Photo' || (!videoSrc && Boolean(posterSrc));

  const viewsCount = parseInt(video.views ?? 0).toLocaleString();
  const likesCount = parseInt(video.likes ?? 0).toLocaleString();
  const commentsCount = parseInt(video.comments ?? 0).toLocaleString();
  const sharesCount = parseInt(video.shares ?? 0).toLocaleString();

  // Handle Delete / Block Media from Firestore + Supabase Storage
  const handleDeleteVideo = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${caption}" from Firestore and Supabase Storage?`)) return;
    setIsDeleting(true);
    try {
      const result = await deleteMediaFromFirestore(db, video);
      const storageNote =
        result.deletedStorageKeys.length > 0
          ? ` & ${result.deletedStorageKeys.length} file(s) from YouSnap Storage`
          : '';
      showToast(`Media deleted from /${result.deletedDocs.map((d) => d.col).join(', /')}${storageNote}`);
      if (onVideoDeleted) onVideoDeleted(result.docId);
      onClose();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `${sourceCollection}/${videoId}`);
      showToast(err?.message || 'Failed to delete media — check Firestore Rules & Storage configuration.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Account OR Media Suspend / Ban action with custom reason
  const handleOpenReason = (type: 'Suspend' | 'Ban', scope: 'Account' | 'Media' = 'Account') => {
    setActionType(type);
    setActionScope(scope);
    setCustomReason('');
    setShowReasonModal(true);
  };

  const handleConfirmRestriction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReason.trim()) {
      alert('Please enter a reason for suspension/ban.');
      return;
    }

    setIsRestricting(true);
    try {
      const reasonText = customReason.trim();

      if (actionScope === 'Media') {
        const { docId, statusValue } = await restrictMediaInFirestore(db, video, actionType, reasonText);
        setShowReasonModal(false);
        setCustomReason('');
        showToast(`${isPhoto ? 'Photo' : 'Video'} ${statusValue} & moved to Restricted Accounts.`);
        if (onVideoDeleted) onVideoDeleted(docId);
        onClose();
        return;
      }

      const statusValue = actionType === 'Ban' ? 'Banned' : 'Suspended';
      const isBan = statusValue === 'Banned';

      // 1. Update user in Firestore users collection
      try {
        await updateDoc(doc(db, 'users', targetUserId), {
          status: statusValue,
          accountStatus: statusValue,
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
      } catch (err) {
        // Fallback: if user doc id differs
      }

      // 2. Push notification to Firestore notifications collection
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: targetUserId,
          title: statusValue === 'Banned' ? 'Account Banned' : 'Account Suspended',
          message: `Reason: ${reasonText}`,
          createdAt: serverTimestamp(),
          read: false,
          type: statusValue === 'Banned' ? 'account_banned' : 'account_suspended'
        });
      } catch {
        // ignore if notifications rules are not added yet
      }

      // 3. Sync local simulator storage
      const notifsKey = 'yousnap_user_app_notifications';
      const existing = JSON.parse(localStorage.getItem(notifsKey) || '[]');
      const newNotif = {
        id: `NTF-USR-${Date.now()}`,
        userId: targetUserId,
        username: username,
        title: statusValue === 'Banned' ? 'Account Banned' : 'Account Suspended',
        message: `Reason: ${reasonText}`,
        createdAt: new Date().toISOString(),
        timestamp: 'Just now',
        category: statusValue
      };
      localStorage.setItem(notifsKey, JSON.stringify([newNotif, ...existing]));
      window.dispatchEvent(new Event('yousnap_user_notification_sent'));

      setShowReasonModal(false);
      setCustomReason('');
      showToast(`User @${username} account is now ${statusValue} (in Restricted Accounts).`);
    } catch (err: any) {
      handleFirestoreError(
        err,
        OperationType.UPDATE,
        actionScope === 'Media' ? `${sourceCollection}/${videoId}` : `users/${targetUserId}`
      );
      showToast('Failed to update restriction — check Firestore Rules.');
      setShowReasonModal(false);
    } finally {
      setIsRestricting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs z-[90] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200 my-auto">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
              {video.sourceLabel || (isPhoto ? 'Photo' : 'Video')} Inspection
            </span>
            <h3 className="font-bold text-sm truncate max-w-md">{caption}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Embedded Media Player / Photo Viewer */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-lg flex items-center justify-center">
            {isPhoto ? (
              posterSrc ? (
                <img
                  src={posterSrc}
                  alt={caption}
                  className="w-full h-full object-contain"
                />
              ) : (
                <p className="text-xs text-slate-400">No media preview URL available</p>
              )
            ) : (
              <video 
                controls 
                autoPlay 
                playsInline 
                poster={posterSrc}
                className="w-full h-full object-contain"
                src={videoSrc}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Uploader Profile & Info */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <img src={avatar} alt={uploaderName} className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-2xs" />
              <div>
                <p className="font-bold text-slate-900 text-sm">{uploaderName}</p>
                <p className="text-xs text-slate-500">@{username} • ID: <code className="font-mono text-emerald-600">{targetUserId}</code></p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold rounded-full">
                Active Creator
              </span>
            </div>
          </div>

          {/* Engagement Metrics: Likes, Views, Comments, Shares */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
                <Eye size={14} className="text-sky-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Views</span>
              </div>
              <p className="text-base font-black text-slate-900 font-mono">{viewsCount}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
                <ThumbsUp size={14} className="text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Likes</span>
              </div>
              <p className="text-base font-black text-slate-900 font-mono">{likesCount}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
                <MessageCircle size={14} className="text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Comments</span>
              </div>
              <p className="text-base font-black text-slate-900 font-mono">{commentsCount}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
                <Share2 size={14} className="text-indigo-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Shares</span>
              </div>
              <p className="text-base font-black text-slate-900 font-mono">{sharesCount}</p>
            </div>
          </div>

          {/* ACTION BUTTONS: Suspend/Ban Media, Delete Media, Suspend/Ban Account */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 w-full">
              {/* Suspend Media Button */}
              <button
                onClick={() => handleOpenReason('Suspend', 'Media')}
                className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <AlertTriangle size={14} /> Suspend {isPhoto ? 'Photo' : 'Video'}
              </button>

              {/* Ban Media Button */}
              <button
                onClick={() => handleOpenReason('Ban', 'Media')}
                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <Ban size={14} /> Ban {isPhoto ? 'Photo' : 'Video'}
              </button>

              {/* Delete Video Button */}
              <button 
                onClick={handleDeleteVideo}
                disabled={isDeleting}
                className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <Trash2 size={14} /> {isDeleting ? 'Deleting...' : `Delete ${isPhoto ? 'Photo' : 'Video'}`}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Suspend Account Button */}
                <button 
                  onClick={() => handleOpenReason('Suspend', 'Account')}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <AlertTriangle size={14} /> Suspend Account
                </button>

                {/* Ban Account Button */}
                <button 
                  onClick={() => handleOpenReason('Ban', 'Account')}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Ban size={14} /> Ban Account
                </button>
              </div>

              <button 
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reason Input Sub-Modal for Suspend / Ban */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border ${
              actionType === 'Ban' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
              {actionType === 'Ban' ? <Ban size={24} /> : <AlertTriangle size={24} />}
            </div>

            <h3 className="text-base font-extrabold text-center text-slate-900">
              {actionScope === 'Media'
                ? `${actionType} ${isPhoto ? 'Photo' : 'Video'}`
                : `${actionType} Creator Account (@${username})`}
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              {actionScope === 'Media'
                ? `Enter reason for ${actionType.toLowerCase()}ing this media. It will be moved directly to Restricted Accounts:`
                : `Enter reason for ${actionType.toLowerCase()}ing account. This will be sent as a live notification to the user's app:`}
            </p>

            <form onSubmit={handleConfirmRestriction} className="mt-4 space-y-4">
              <textarea 
                rows={3}
                required
                placeholder={`Enter reason for ${actionType.toLowerCase()}ing this account (e.g., Copyright violation, Spam, Community guidelines)...`}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 outline-none text-slate-800 font-medium"
              />

              <div className="flex items-center justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setShowReasonModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isRestricting}
                  className={`px-5 py-2.5 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm ${
                    actionType === 'Ban' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
                  } disabled:opacity-50`}
                >
                  <Send size={13} /> {isRestricting ? 'Processing...' : `Confirm & Notify User`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
