import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

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
    status: data.status || 'Active',
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
    suspendReason: data.suspendReason || data.suspensionReason || data.banReason || '',
  };
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
    status: data.status || (data.isBlocked ? 'Blocked' : 'Active'),
    isBlocked: Boolean(data.isBlocked || data.status === 'Blocked'),
    isViralBoosted: Boolean(data.isViralBoosted),
    createdAtMs,
    timeLabel: formatTimeLabel(data.createdAt || data.timestamp || data.uploadedAt || data.created_at),
  };
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
