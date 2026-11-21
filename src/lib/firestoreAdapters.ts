import {
  QueryDocumentSnapshot,
  DocumentData,
  Firestore,
  doc,
  deleteDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

export type MediaSourceCollection = 'posts' | 'reels' | 'stories' | 'videos' | 'live_uploads';

export const MEDIA_COLLECTIONS: MediaSourceCollection[] = [
  'posts',
  'reels',
  'stories',
  'videos',
  'live_uploads',
];

export function toMillis(val: any): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = Date.parse(val);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (typeof val?.toMillis === 'function') return val.toMillis();
  if (typeof val?.toDate === 'function') return val.toDate().getTime();
  if (typeof val?.seconds === 'number') return val.seconds * 1000;
  return 0;
}

export function formatTimeLabel(val: any): string {
  const ms = toMillis(val);
  if (!ms) return 'Recently';
  return new Date(ms).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.split('?')[0].toLowerCase();
  return /\.(mp4|mov|webm|mkv|avi|m4v|3gp)$/.test(clean);
}

export function normalizeUserDoc(docSnap: QueryDocumentSnapshot<DocumentData> | { id: string; data: () => DocumentData }) {
  const data = typeof docSnap.data === 'function' ? docSnap.data() : {};
  const docId = docSnap.id;
  const displayName = data.name || data.displayName || data.fullName || 'Unnamed User';
  const username = data.username || displayName.toLowerCase().replace(/\s+/g, '_');
  const photoURL = data.profilePic || data.photoURL || data.avatar || data.avatarUrl || '';
  const followers = Number(data.followersCount ?? data.followers ?? 0);
  const following = Number(data.followingCount ?? data.following ?? 0);
  const postCount = Number(data.postCount ?? data.uploads ?? data.totalVideos ?? 0);
  const photoUploadsCount = Number(data.photoUploadsCount ?? 0);
  const storiesUploadedCount = Number(data.storiesUploadedCount ?? 0);
  const videoViewsCount = Number(data.videoViewsCount ?? 0);
  const monetizationStatus = data.monetizationStatus || data.monetization || (data.isMonetized ? 'Approved' : 'Not Applied');

  const rawStatusLower = String(data.status || data.accountStatus || '').trim().toLowerCase();
  const normalizedUserStatus =
    data.isBanned === true || rawStatusLower === 'banned'
      ? 'Banned'
      : data.isSuspended === true || rawStatusLower === 'suspended' || data.isRestricted === true
      ? 'Suspended'
      : data.status || data.accountStatus || 'Active';

  return {
    ...data,
    // Always preserve the Firestore document ID (avoid being overwritten by numeric `data.id`)
    id: docId,
    docId,
    uid: data.uid || docId,
    appNumericId: data.id !== undefined && data.id !== docId ? String(data.id) : undefined,
    displayName,
    name: displayName,
    username,
    email: data.email || '',
    photoURL,
    avatar: photoURL,
    status: normalizedUserStatus,
    followers,
    followersCount: followers,
    followingCount: following,
    postCount,
    photoUploadsCount,
    storiesUploadedCount,
    videoViewsCount,
    uploads: postCount,
    monetizationStatus,
    monetization: monetizationStatus,
    totalEarnings: data.totalEarnings || data.earnings || '₹0',
    suspendReason: data.suspendReason || data.suspensionReason || data.banReason || data.restrictionReason || '',
  };
}

export function isUserRestricted(user: any): boolean {
  if (!user) return false;
  const st = String(user.status || user.accountStatus || '').trim().toLowerCase();
  return Boolean(
    user.isBanned === true ||
    user.isSuspended === true ||
    user.isRestricted === true ||
    st === 'banned' ||
    st === 'suspended'
  );
}

export function getUserMonetizationApplicationStatus(
  user: any
): 'Pending' | 'Approved' | 'Rejected' | null {
  if (!user) return null;
  if (user.isMonetized === true) return 'Approved';

  const raw = String(user.monetizationStatus || user.monetization || '')
    .trim()
    .toLowerCase();

  if (
    raw === 'pending' ||
    raw === 'applied' ||
    raw === 'requested' ||
    raw === 'submitted' ||
    raw === 'in_review' ||
    raw === 'in review' ||
    raw === 'under_review' ||
    raw === 'under review' ||
    raw === 'waiting' ||
    user.monetizationApplied === true ||
    user.monetizationRequested === true
  ) {
    return 'Pending';
  }

  if (raw === 'approved' || raw === 'active' || raw === 'monetized' || raw === 'enabled') {
    return 'Approved';
  }

  if (raw === 'rejected' || raw === 'revoked' || raw === 'declined' || raw === 'denied') {
    return 'Rejected';
  }

  return null;
}

export function normalizeMediaDoc(
  docSnap: QueryDocumentSnapshot<DocumentData> | { id: string; data: () => DocumentData },
  sourceCollection: MediaSourceCollection
) {
  const data = typeof docSnap.data === 'function' ? docSnap.data() : {};
  const docId = docSnap.id;

  const rawVideoUrl =
    data.videoURL ||
    data.videoUrl ||
    data.reelUrl ||
    data.reelURL ||
    data.storyVideoUrl ||
    '';

  const rawImageUrl =
    data.imageUrl ||
    data.imageURL ||
    data.photoUrl ||
    data.photoURL ||
    data.postUrl ||
    data.postURL ||
    data.thumbnailURL ||
    data.thumbnailUrl ||
    data.thumbnail ||
    data.thumbUrl ||
    data.coverUrl ||
    '';

  const rawGenericMedia =
    data.mediaUrl ||
    data.mediaURL ||
    data.fileUrl ||
    data.fileURL ||
    data.url ||
    data.contentUrl ||
    data.storageUrl ||
    '';

  const primaryMediaUrl = rawVideoUrl || rawGenericMedia || rawImageUrl || '';
  const explicitType = String(data.type || data.mediaType || data.contentType || '').toLowerCase();

  let mediaKind: 'Video' | 'Photo' = 'Photo';
  if (
    explicitType.includes('video') ||
    explicitType.includes('reel') ||
    sourceCollection === 'reels' ||
    sourceCollection === 'videos' ||
    Boolean(rawVideoUrl) ||
    isVideoUrl(primaryMediaUrl)
  ) {
    mediaKind = 'Video';
  }
  if (explicitType === 'photo' || explicitType === 'image') {
    mediaKind = 'Photo';
  }

  const videoURL = mediaKind === 'Video' ? (rawVideoUrl || rawGenericMedia || primaryMediaUrl) : '';
  const thumbnailURL =
    data.thumbnailURL ||
    data.thumbnailUrl ||
    data.thumbnail ||
    data.thumbUrl ||
    data.coverUrl ||
    rawImageUrl ||
    (mediaKind === 'Photo' ? primaryMediaUrl : '');

  const caption =
    data.caption ||
    data.title ||
    data.description ||
    data.text ||
    (sourceCollection === 'stories' ? 'YouSnap Story' : sourceCollection === 'reels' ? 'YouSnap Reel' : 'YouSnap Post');

  const userId = String(
    data.userId ??
    data.uid ??
    data.uploaderId ??
    data.authorId ??
    data.creatorId ??
    ''
  );

  const views = Number(data.views ?? data.viewsCount ?? data.viewCount ?? 0);
  const likes = Number(
    data.likesCount ??
    data.likeCount ??
    (Array.isArray(data.likes) ? data.likes.length : data.likes) ??
    (Array.isArray(data.likedBy) ? data.likedBy.length : 0) ??
    0
  );
  const comments = Number(
    data.commentsCount ??
    data.commentCount ??
    (Array.isArray(data.comments) ? data.comments.length : data.comments) ??
    0
  );
  const shares = Number(data.sharesCount ?? data.shares ?? 0);

  const createdAtMs =
    toMillis(data.createdAt) ||
    toMillis(data.timestamp) ||
    toMillis(data.uploadedAt) ||
    toMillis(data.created_at) ||
    0;

  const sourceLabel =
    sourceCollection === 'posts'
      ? 'Post'
      : sourceCollection === 'reels'
      ? 'Reel'
      : sourceCollection === 'stories'
      ? 'Story'
      : sourceCollection === 'live_uploads'
      ? 'Live Upload'
      : 'Video';

  const isDeleted = Boolean(
    data.isDeleted === true ||
    data.deleted === true ||
    data.deletedAt ||
    String(data.status || '').toLowerCase() === 'deleted'
  );

  const rawMediaStatus = String(data.status || '').trim().toLowerCase();
  const isMediaBanned = Boolean(data.isBanned === true || rawMediaStatus === 'banned');
  const isMediaSuspended = Boolean(data.isSuspended === true || rawMediaStatus === 'suspended');
  const isMediaBlockedFlag = Boolean(
    data.isBlocked === true ||
    data.isRestricted === true ||
    rawMediaStatus === 'blocked' ||
    isMediaBanned ||
    isMediaSuspended
  );
  const normalizedMediaStatus = isMediaBanned
    ? 'Banned'
    : isMediaSuspended
    ? 'Suspended'
    : isMediaBlockedFlag
    ? 'Blocked'
    : data.status || 'Active';

  return {
    ...data,
    id: docId,
    docId,
    mediaKey: `${sourceCollection}:${docId}`,
    sourceCollection,
    sourceLabel,
    videoId: data.videoId || data.postId || data.reelId || data.storyId || data.uploadId || docId,
    userId,
    caption,
    title: caption,
    mediaKind,
    type: mediaKind,
    videoURL,
    thumbnailURL,
    thumbnail: thumbnailURL,
    mediaUrl: primaryMediaUrl,
    uploader: data.uploader || data.userName || data.authorName || data.name || '',
    username: data.username || data.userHandle || data.authorUsername || '',
    avatar: data.avatar || data.userAvatar || data.authorAvatar || data.profilePic || '',
    category: data.category || sourceLabel,
    duration: data.duration || (mediaKind === 'Video' ? 'Video' : 'Photo'),
    views,
    likes,
    comments,
    shares,
    status: normalizedMediaStatus,
    isBlocked: isMediaBlockedFlag,
    isBanned: isMediaBanned,
    isSuspended: isMediaSuspended,
    isRestricted: isMediaBlockedFlag,
    blockReason:
      data.banReason ||
      data.suspensionReason ||
      data.suspendReason ||
      data.blockReason ||
      data.restrictionReason ||
      data.reason ||
      '',
    isDeleted,
    isViralBoosted: Boolean(data.isViralBoosted),
    createdAtMs,
    timeLabel: formatTimeLabel(data.createdAt || data.timestamp || data.uploadedAt || data.created_at),
  };
}

export function isMediaDeleted(data: any): boolean {
  if (!data) return false;
  return Boolean(
    data.isDeleted === true ||
    data.deleted === true ||
    data.deletedAt ||
    String(data.status || '').toLowerCase() === 'deleted'
  );
}

export function isMediaRestricted(item: any): boolean {
  if (!item) return false;
  const st = String(item.status || '').trim().toLowerCase();
  return Boolean(
    item.isBlocked === true ||
    item.isBanned === true ||
    item.isSuspended === true ||
    item.isRestricted === true ||
    st === 'blocked' ||
    st === 'banned' ||
    st === 'suspended'
  );
}

export function buildUsersLookupMap(users: any[]): Record<string, any> {
  const map: Record<string, any> = {};
  users.forEach((u) => {
    if (u.id) map[u.id] = u;
    if (u.docId) map[u.docId] = u;
    if (u.uid) map[u.uid] = u;
    if (u.appNumericId) map[u.appNumericId] = u;
    if (u.username) map[u.username] = u;
    if (u.email) map[u.email] = u;
  });
  return map;
}

export function doesMediaBelongToUser(media: any, user: any): boolean {
  if (!media || !user) return false;
  const userIds = new Set(
    [user.id, user.docId, user.uid, user.appNumericId]
      .filter(Boolean)
      .map((v) => String(v))
  );
  const mediaOwnerIds = [media.userId, media.uid, media.uploaderId, media.authorId, media.creatorId]
    .filter(Boolean)
    .map((v) => String(v));

  if (mediaOwnerIds.some((id) => userIds.has(id))) {
    return true;
  }
  if (user.username && media.username && String(user.username).toLowerCase() === String(media.username).toLowerCase()) {
    return true;
  }
  return false;
}

export async function deleteMediaFromFirestore(db: Firestore, item: any): Promise<{ col: string; docId: string }> {
  const col = item?.sourceCollection || 'videos';
  const docId = item?.docId || item?.id || item?.videoId || item?.uploadId;
  if (!docId) {
    throw new Error('Missing document ID for media deletion');
  }

  // 1. Delete the actual document from its exact Firestore collection
  await deleteDoc(doc(db, col, docId));

  // 2. Safely decrement uploader counters on /users/{uid} if present
  const ownerId = item?.userId || item?.uid || item?.uploaderId || item?.authorId;
  if (ownerId) {
    try {
      const userRef = doc(db, 'users', String(ownerId));
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const uData = userSnap.data() || {};
        const updates: Record<string, any> = {};
        if (col === 'stories' && typeof uData.storiesUploadedCount === 'number' && uData.storiesUploadedCount > 0) {
          updates.storiesUploadedCount = uData.storiesUploadedCount - 1;
        }
        if (col === 'posts' || col === 'reels' || col === 'videos') {
          if (typeof uData.postCount === 'number' && uData.postCount > 0) {
            updates.postCount = uData.postCount - 1;
          }
          if (item?.mediaKind === 'Photo' && typeof uData.photoUploadsCount === 'number' && uData.photoUploadsCount > 0) {
            updates.photoUploadsCount = uData.photoUploadsCount - 1;
          }
        }
        if (Object.keys(updates).length > 0) {
          await updateDoc(userRef, updates).catch(() => {});
        }
      }
    } catch {
      // ignore optional counter sync errors
    }

    // 3. Optional notification to uploader (only if /notifications rule allows admin write)
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: String(ownerId),
        title: 'Content Removed by Admin',
        message: `Your ${item?.sourceLabel || 'media'} "${item?.caption || item?.title || docId}" was removed by Admin.`,
        createdAt: serverTimestamp(),
        read: false,
        type: 'content_removed',
      });
    } catch {
      // ignore if notifications rules are not enabled
    }
  }

  return { col, docId };
}

// Restrict (Suspend / Ban) a specific Photo or Video in Firestore.
// IMPORTANT: Updates ONLY the media document & optional uploader notification; NEVER creates a Report entry.
export async function restrictMediaInFirestore(
  db: Firestore,
  item: any,
  action: 'Suspend' | 'Ban',
  reason: string
): Promise<{ col: string; docId: string; statusValue: 'Suspended' | 'Banned' }> {
  const col = item?.sourceCollection || 'videos';
  const docId = item?.docId || item?.id || item?.videoId || item?.uploadId;
  if (!docId) {
    throw new Error('Missing document ID for media restriction');
  }

  const isBan = action === 'Ban';
  const statusValue: 'Suspended' | 'Banned' = isBan ? 'Banned' : 'Suspended';
  const cleanReason = reason.trim() || 'Community guidelines violation';

  await updateDoc(doc(db, col, docId), {
    status: statusValue,
    isBlocked: true,
    isRestricted: true,
    isBanned: isBan,
    isSuspended: !isBan,
    blockReason: cleanReason,
    restrictionReason: cleanReason,
    banReason: isBan ? cleanReason : null,
    suspensionReason: !isBan ? cleanReason : null,
    suspendReason: !isBan ? cleanReason : null,
    restrictedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const ownerId = item?.userId || item?.uid || item?.uploaderId || item?.authorId;
  if (ownerId) {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: String(ownerId),
        title: isBan ? 'Media Banned by Admin' : 'Media Suspended by Admin',
        message: `Your ${item?.sourceLabel || 'media'} "${item?.caption || item?.title || docId}" has been ${statusValue.toLowerCase()}. Reason: ${cleanReason}`,
        reason: cleanReason,
        createdAt: serverTimestamp(),
        read: false,
        type: isBan ? 'media_banned' : 'media_suspended',
      });
    } catch {
      // ignore if notifications rules are not enabled
    }
  }

  return { col, docId, statusValue };
}

// Identify genuine user-submitted reports coming from the App (and strictly exclude any Admin ban/suspend entries)
export function isAppReportDoc(raw: any, collectionName: 'reports' | 'support_tickets' = 'reports'): boolean {
  if (!raw) return false;

  // Strictly exclude anything triggered by Admin moderation actions
  if (
    raw.source === 'admin' ||
    raw.createdBy === 'admin' ||
    raw.isAdminAction === true ||
    raw.adminRestriction === true
  ) {
    return false;
  }

  const cat = String(raw.category || raw.type || '').trim().toLowerCase();
  const subj = String(raw.subject || raw.title || '').trim().toLowerCase();

  // Exclude admin account restriction or suspension appeals
  if (
    cat.includes('appeal') ||
    cat.includes('recovery') ||
    cat.includes('restore') ||
    cat.includes('admin moderation') ||
    cat.includes('account restriction') ||
    subj.includes('appeal')
  ) {
    return false;
  }

  if (collectionName === 'reports') {
    return true;
  }

  // Inside /support_tickets, match only user-submitted reports
  const hasReportCategory =
    cat.includes('report') ||
    cat.includes('violation') ||
    cat.includes('abuse') ||
    cat.includes('flag');

  const hasReportedTarget = Boolean(
    raw.reportedMediaId ||
    raw.reportedPostId ||
    raw.reportedVideoId ||
    raw.reportedReelId ||
    raw.reportedStoryId ||
    raw.reportedContentId ||
    raw.targetMediaId ||
    raw.postId ||
    raw.reelId ||
    raw.videoId ||
    raw.reportedUserId
  );

  return hasReportCategory || hasReportedTarget;
}

export function normalizeAppReport(
  docSnap: QueryDocumentSnapshot<DocumentData> | { id: string; data: () => DocumentData },
  sourceCollection: 'reports' | 'support_tickets'
) {
  const data = typeof docSnap.data === 'function' ? docSnap.data() : {};
  const docId = docSnap.id;

  const reporterId = String(
    data.reporterUserId ||
    data.reporterId ||
    data.reportedBy ||
    data.userId ||
    data.uid ||
    data.senderId ||
    ''
  );

  const reportedUserId = String(
    data.reportedUserId ||
    data.targetUserId ||
    data.creatorId ||
    data.ownerId ||
    data.uploaderId ||
    data.accusedUserId ||
    ''
  );

  const reportedMediaId = String(
    data.reportedMediaId ||
    data.reportedPostId ||
    data.reportedVideoId ||
    data.reportedReelId ||
    data.reportedStoryId ||
    data.reportedContentId ||
    data.targetMediaId ||
    data.contentId ||
    data.mediaId ||
    data.postId ||
    data.reelId ||
    data.videoId ||
    data.storyId ||
    ''
  );

  const reportedCollectionRaw = String(
    data.reportedCollection ||
    data.targetCollection ||
    data.mediaCollection ||
    data.contentType ||
    data.mediaType ||
    (data.reportedReelId || data.reelId
      ? 'reels'
      : data.reportedStoryId || data.storyId
      ? 'stories'
      : data.reportedPostId || data.postId
      ? 'posts'
      : data.reportedVideoId || data.videoId
      ? 'videos'
      : '')
  ).toLowerCase();

  const reportReason = String(
    data.reason ||
    data.reportReason ||
    data.customReason ||
    data.message ||
    data.description ||
    data.details ||
    data.comment ||
    data.violationReason ||
    ''
  ).trim();

  const reportCategory = String(
    data.reportCategory ||
    data.violationType ||
    data.issueType ||
    data.subject ||
    (data.category && data.category !== 'Reports & Violations' ? data.category : '') ||
    'User Report'
  );

  const rawStatus = String(data.status || 'Pending').trim().toLowerCase();
  const status: 'Pending' | 'Resolved' =
    rawStatus === 'resolved' ||
    rawStatus === 'reviewed' ||
    rawStatus === 'closed' ||
    rawStatus === 'dismissed' ||
    rawStatus === 'action_taken'
      ? 'Resolved'
      : 'Pending';

  const createdAtMs =
    toMillis(data.createdAt) ||
    toMillis(data.timestamp) ||
    toMillis(data.reportedAt) ||
    toMillis(data.created_at) ||
    0;

  return {
    ...data,
    id: docId,
    docId,
    reportKey: `${sourceCollection}:${docId}`,
    sourceCollection,
    reporterId,
    reportedUserId,
    reportedMediaId,
    reportedCollectionRaw,
    reportReason,
    reportCategory,
    status,
    createdAtMs,
    timeLabel: formatTimeLabel(data.createdAt || data.timestamp || data.reportedAt || data.created_at),
  };
}
