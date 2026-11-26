import { useState, useEffect, useMemo, useCallback } from 'react';
import { db, auth } from '../../lib/firebase';
import {
  collection,
  onSnapshot,
  query,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  MEDIA_COLLECTIONS,
  MediaSourceCollection,
  buildUsersLookupMap,
  collectDeletedUserKeys,
  formatTimeLabel,
  getUserMonetizationApplicationStatus,
  isAppReportDoc,
  isMediaOwnedByDeletedUser,
  isMediaRestricted,
  isRecordDeleted,
  normalizeAppReport,
  normalizeMediaDoc,
  normalizeUserDoc,
  toMillis,
} from './firestoreAdapters';
import { secureStorage } from './security';

const READ_STORAGE_KEY = 'yousnap_admin_read_notif_ids_v1';
const DISMISSED_STORAGE_KEY = 'yousnap_admin_dismissed_notif_ids_v1';

async function loadStringSetEncrypted(key: string): Promise<Set<string>> {
  try {
    const parsed = await secureStorage.getEncryptedItem<string[]>(key);
    return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

function saveStringSetEncrypted(key: string, set: Set<string>) {
  secureStorage.setEncryptedItem(key, Array.from(set)).catch(() => {
    // ignore storage quota errors
  });
}

export interface AdminNotificationItem {
  id: string;
  source: 'firestore_admin_notifications' | 'live_activity';
  type: 'Uploads' | 'Reports' | 'Monetization' | 'Security';
  targetUser: string;
  targetAvatar: string;
  message: string;
  unread: boolean;
  timeStr: string;
  createdAtMs: number;
  linkTo: 'Videos' | 'Reports' | 'Monetization' | 'Support' | 'Dashboard';
}

export function useAdminActivityNotifications(enabled: boolean) {
  const [adminDocs, setAdminDocs] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [deletedUserKeys, setDeletedUserKeys] = useState<Set<string>>(() => new Set());
  const [mediaByCol, setMediaByCol] = useState<Record<string, any[]>>({});
  const [monetizationReqs, setMonetizationReqs] = useState<any[]>([]);
  const [reportsColDocs, setReportsColDocs] = useState<any[]>([]);
  const [supportDocs, setSupportDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let active = true;
    Promise.all([
      loadStringSetEncrypted(READ_STORAGE_KEY),
      loadStringSetEncrypted(DISMISSED_STORAGE_KEY),
    ]).then(([loadedRead, loadedDismissed]) => {
      if (!active) return;
      setReadIds(loadedRead);
      setDismissedIds(loadedDismissed);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !auth.currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Direct /admin_notifications docs (if any)
    const unsubAdmin = onSnapshot(
      query(collection(db, 'admin_notifications')),
      (snapshot) => {
        const docs = snapshot.docs
          .filter((d) => !isRecordDeleted(d.data()))
          .map((d) => ({
            id: d.id,
            ...d.data(),
          }));
        setAdminDocs(docs);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    // 2. Users collection
    const unsubUsers = onSnapshot(
      query(collection(db, 'users')),
      (snapshot) => {
        setDeletedUserKeys(collectDeletedUserKeys(snapshot.docs));
        setUsersList(
          snapshot.docs
            .map((d) => normalizeUserDoc(d))
            .filter((u) => !u.isDeleted)
        );
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    // 3. Media collections (posts, reels, stories, videos, live_uploads)
    const unsubMedia = MEDIA_COLLECTIONS.map((colName: MediaSourceCollection) =>
      onSnapshot(
        query(collection(db, colName)),
        (snapshot) => {
          const items = snapshot.docs
            .map((d) => normalizeMediaDoc(d, colName))
            .filter((item) => !item.isDeleted && !isMediaRestricted(item));
          setMediaByCol((prev) => ({ ...prev, [colName]: items }));
        },
        () => {}
      )
    );

    // 4. Monetization requests
    const unsubMonetization = onSnapshot(
      query(collection(db, 'monetization_requests')),
      (snapshot) => {
        setMonetizationReqs(
          snapshot.docs
            .filter((d) => !isRecordDeleted(d.data()))
            .map((d) => ({ id: d.id, ...d.data() }))
        );
      },
      () => {}
    );

    // 5. Optional dedicated /reports collection
    const unsubReports = onSnapshot(
      query(collection(db, 'reports')),
      (snapshot) => {
        const docs = snapshot.docs
          .filter((d) => !isRecordDeleted(d.data()) && isAppReportDoc(d.data(), 'reports'))
          .map((d) => normalizeAppReport(d, 'reports'));
        setReportsColDocs(docs);
      },
      () => {}
    );

    // 6. /support_tickets (for user reports & suspension appeals)
    const unsubSupport = onSnapshot(
      query(collection(db, 'support_tickets')),
      (snapshot) => {
        const docs = snapshot.docs
          .filter((d) => !isRecordDeleted(d.data()))
          .map((d) => ({
            id: d.id,
            docId: d.id,
            raw: d.data(),
            isReport: isAppReportDoc(d.data(), 'support_tickets'),
            normalizedReport: isAppReportDoc(d.data(), 'support_tickets')
              ? normalizeAppReport(d, 'support_tickets')
              : null,
          }));
        setSupportDocs(docs);
      },
      () => {}
    );

    return () => {
      unsubAdmin();
      unsubUsers();
      unsubMedia.forEach((u) => u());
      unsubMonetization();
      unsubReports();
      unsubSupport();
    };
  }, [enabled]);

  const usersMap = useMemo(() => buildUsersLookupMap(usersList), [usersList]);

  const notifications = useMemo<AdminNotificationItem[]>(() => {
    const list: AdminNotificationItem[] = [];

    // A. Direct /admin_notifications items
    adminDocs.forEach((d) => {
      const createdAtMs = toMillis(d.createdAt) || toMillis(d.timestamp) || 0;
      list.push({
        id: d.id,
        source: 'firestore_admin_notifications',
        type: d.type || 'Security',
        targetUser: d.targetUser || 'System Alert',
        targetAvatar: d.targetAvatar || '',
        message: d.message || '',
        unread: Boolean(d.unread),
        timeStr: d.timeStr || formatTimeLabel(d.createdAt || d.timestamp),
        createdAtMs,
        linkTo: d.linkTo || 'Dashboard',
      });
    });

    // B. Photo / Video / Reel / Story Uploads from App
    MEDIA_COLLECTIONS.forEach((colName) => {
      (mediaByCol[colName] || []).forEach((item) => {
        if (isMediaOwnedByDeletedUser(item, deletedUserKeys)) return;
        const id = `live_upload:${colName}:${item.docId}`;
        if (dismissedIds.has(id)) return;
        const owner = item.userId ? usersMap[item.userId] : undefined;
        const creatorName =
          item.uploader || owner?.displayName || item.username || owner?.username || 'YouSnap Creator';
        const captionPreview = item.caption ? `: "${item.caption}"` : '';
        list.push({
          id,
          source: 'live_activity',
          type: 'Uploads',
          targetUser: creatorName,
          targetAvatar: owner?.photoURL || item.avatar || item.thumbnailURL || '',
          message: `New ${item.sourceLabel} (${item.mediaKind}) uploaded${captionPreview}`,
          unread: !readIds.has(id),
          timeStr: item.timeLabel || 'Recently',
          createdAtMs: item.createdAtMs || 0,
          linkTo: 'Videos',
        });
      });
    });

    // C. Monetization Applications (from /monetization_requests + /users pending apps)
    const seenMonetizationUsers = new Set<string>();
    monetizationReqs.forEach((req) => {
      const uid = String(req.userId || req.uid || req.creatorId || req.applicantId || '');
      if (uid) seenMonetizationUsers.add(uid);
      const rawStatus = String(req.status || 'Pending').trim().toLowerCase();
      if (rawStatus === 'approved' || rawStatus === 'active' || rawStatus === 'rejected' || rawStatus === 'revoked') {
        return;
      }

      const id = `live_monetization:req:${req.id}`;
      if (dismissedIds.has(id)) return;
      const owner = uid ? usersMap[uid] : undefined;
      if (usersList.length > 0 && uid && !owner) return;
      const creatorName = owner?.displayName || owner?.username || uid || 'Creator';
      const followers = Number(req.followersCount ?? owner?.followersCount ?? 0).toLocaleString();
      const views = Number(req.totalViews ?? owner?.videoViewsCount ?? 0).toLocaleString();
      const createdAtMs = toMillis(req.createdAt) || toMillis(req.timestamp) || 0;

      list.push({
        id,
        source: 'live_activity',
        type: 'Monetization',
        targetUser: creatorName,
        targetAvatar: owner?.photoURL || '',
        message: `Applied for Monetization (${followers} followers • ${views} views)`,
        unread: !readIds.has(id),
        timeStr: formatTimeLabel(req.createdAt || req.timestamp),
        createdAtMs,
        linkTo: 'Monetization',
      });
    });

    usersList.forEach((u) => {
      if (seenMonetizationUsers.has(u.docId) || (u.uid && seenMonetizationUsers.has(String(u.uid)))) {
        return;
      }
      if (getUserMonetizationApplicationStatus(u) !== 'Pending') return;
      const id = `live_monetization:user:${u.docId}`;
      if (dismissedIds.has(id)) return;

      const createdAtMs = toMillis(u.updatedAt) || toMillis(u.createdAt) || 0;
      list.push({
        id,
        source: 'live_activity',
        type: 'Monetization',
        targetUser: u.displayName || u.username || 'Creator',
        targetAvatar: u.photoURL || '',
        message: `Applied for Monetization (${Number(u.followersCount || 0).toLocaleString()} followers • ${Number(u.videoViewsCount || 0).toLocaleString()} views)`,
        unread: !readIds.has(id),
        timeStr: formatTimeLabel(u.updatedAt || u.createdAt),
        createdAtMs,
        linkTo: 'Monetization',
      });
    });

    // D. App User Reports (from /reports and /support_tickets)
    const combinedReports = [
      ...reportsColDocs,
      ...supportDocs.filter((d) => d.isReport && d.normalizedReport).map((d) => d.normalizedReport),
    ];

    combinedReports.forEach((rep) => {
      const id = `live_report:${rep.reportKey}`;
      if (dismissedIds.has(id)) return;
      const reporter = rep.reporterId ? usersMap[rep.reporterId] : undefined;
      const reportedUser = rep.reportedUserId ? usersMap[rep.reportedUserId] : undefined;
      const reporterName =
        rep.reporterName || reporter?.displayName || reporter?.username || 'YouSnap User';
      const targetLabel = rep.reportedMediaId
        ? 'a photo/video'
        : reportedUser?.displayName || rep.reportedName || 'an account';
      const reasonSnippet = rep.reportReason ? ` — Reason: "${rep.reportReason}"` : '';

      list.push({
        id,
        source: 'live_activity',
        type: 'Reports',
        targetUser: reporterName,
        targetAvatar: reporter?.photoURL || rep.reporterAvatar || '',
        message: `Reported ${targetLabel} (${rep.reportCategory})${reasonSnippet}`,
        unread: !readIds.has(id),
        timeStr: rep.timeLabel || 'Recently',
        createdAtMs: rep.createdAtMs || 0,
        linkTo: 'Reports',
      });
    });

    // E. Account Suspension / Ban Appeals from /support_tickets
    supportDocs
      .filter((d) => !d.isReport)
      .forEach((d) => {
        const raw = d.raw || {};
        const cat = String(raw.category || raw.subject || '').toLowerCase();
        const isAppeal =
          cat.includes('appeal') ||
          cat.includes('suspension') ||
          cat.includes('ban') ||
          cat.includes('recovery') ||
          cat.includes('restore');
        if (!isAppeal) return;
        const st = String(raw.status || 'Open').toLowerCase();
        if (st === 'resolved') return;

        const id = `live_appeal:${d.id}`;
        if (dismissedIds.has(id)) return;
        const uid = raw.userId || raw.uid || '';
        const owner = uid ? usersMap[uid] : undefined;
        const senderName = raw.creatorName || raw.userName || owner?.displayName || 'YouSnap User';
        const appealMsg = raw.message || raw.appealMessage || raw.reason || '';

        list.push({
          id,
          source: 'live_activity',
          type: 'Security',
          targetUser: senderName,
          targetAvatar: owner?.photoURL || '',
          message: `Account Restore Appeal${appealMsg ? `: "${appealMsg}"` : ''}`,
          unread: !readIds.has(id),
          timeStr: formatTimeLabel(raw.createdAt || raw.timestamp),
          createdAtMs: toMillis(raw.createdAt) || toMillis(raw.timestamp) || 0,
          linkTo: 'Support',
        });
      });

    return list.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
  }, [
    adminDocs,
    mediaByCol,
    monetizationReqs,
    usersList,
    deletedUserKeys,
    reportsColDocs,
    supportDocs,
    usersMap,
    readIds,
    dismissedIds,
  ]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  const toggleRead = useCallback(async (notif: AdminNotificationItem) => {
    if (notif.source === 'firestore_admin_notifications') {
      await updateDoc(doc(db, 'admin_notifications', notif.id), {
        unread: !notif.unread,
      });
      return;
    }

    setReadIds((prev) => {
      const next = new Set(prev);
      if (notif.unread) {
        next.add(notif.id);
      } else {
        next.delete(notif.id);
      }
      saveStringSetEncrypted(READ_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const markAsReadById = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveStringSetEncrypted(READ_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadAdminDocs = notifications.filter(
      (n) => n.source === 'firestore_admin_notifications' && n.unread
    );
    if (unreadAdminDocs.length > 0) {
      const batch = writeBatch(db);
      unreadAdminDocs.forEach((n) => {
        batch.update(doc(db, 'admin_notifications', n.id), { unread: false });
      });
      await batch.commit().catch(() => {});
    }

    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => {
        if (n.source === 'live_activity') next.add(n.id);
      });
      saveStringSetEncrypted(READ_STORAGE_KEY, next);
      return next;
    });
  }, [notifications]);

  const deleteNotification = useCallback(async (notif: AdminNotificationItem) => {
    if (notif.source === 'firestore_admin_notifications') {
      await deleteDoc(doc(db, 'admin_notifications', notif.id));
      return;
    }

    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(notif.id);
      saveStringSetEncrypted(DISMISSED_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const clearReadNotifications = useCallback(async () => {
    const readAdminDocs = notifications.filter(
      (n) => n.source === 'firestore_admin_notifications' && !n.unread
    );
    if (readAdminDocs.length > 0) {
      const batch = writeBatch(db);
      readAdminDocs.forEach((n) => {
        batch.delete(doc(db, 'admin_notifications', n.id));
      });
      await batch.commit().catch(() => {});
    }

    const readLiveIds = notifications
      .filter((n) => n.source === 'live_activity' && !n.unread)
      .map((n) => n.id);

    if (readLiveIds.length > 0) {
      setDismissedIds((prev) => {
        const next = new Set(prev);
        readLiveIds.forEach((id) => next.add(id));
        saveStringSetEncrypted(DISMISSED_STORAGE_KEY, next);
        return next;
      });
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    toggleRead,
    markAsReadById,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
  };
}
