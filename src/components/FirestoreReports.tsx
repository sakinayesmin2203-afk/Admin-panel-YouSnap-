import React, { useState, useEffect, useMemo } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  collection,
  onSnapshot,
  query,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Flag,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Ban,
  Trash2,
  Check,
  Play,
  Image as ImageIcon,
  MessageSquareWarning,
  X,
  Send,
} from 'lucide-react';
import UserDetailsModal from './UserDetailsModal';
import VideoPreviewModal from './VideoPreviewModal';
import {
  MEDIA_COLLECTIONS,
  MediaSourceCollection,
  buildUsersLookupMap,
  deleteMediaFromFirestore,
  isAppReportDoc,
  isRecordDeleted,
  normalizeAppReport,
  normalizeMediaDoc,
  normalizeUserDoc,
  restrictMediaInFirestore,
} from '../lib/firestoreAdapters';

export default function FirestoreReports() {
  const [reportsColDocs, setReportsColDocs] = useState<any[]>([]);
  const [supportReportDocs, setSupportReportDocs] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const [mediaMap, setMediaMap] = useState<Record<string, any>>({});
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Resolved'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedUserForModal, setSelectedUserForModal] = useState<any | null>(null);
  const [previewMedia, setPreviewMedia] = useState<any | null>(null);
  const [processingKey, setProcessingKey] = useState<string | null>(null);

  // Restrict Media Modal state (Ban / Suspend reported media directly from Reports -> Restricted Accounts)
  const [restrictTarget, setRestrictTarget] = useState<{
    report: any;
    media: any;
    action: 'Suspend' | 'Ban';
  } | null>(null);
  const [restrictReason, setRestrictReason] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    setLoading(true);

    // 1. Live users lookup
    const unsubUsers = onSnapshot(
      query(collection(db, 'users')),
      (snapshot) => {
        const normalized = snapshot.docs
          .map((d) => normalizeUserDoc(d))
          .filter((u) => !u.isDeleted);
        setUsersMap(buildUsersLookupMap(normalized));
      },
      () => {}
    );

    // 2. Live media lookup across all collections to resolve reported photo/video previews
    const mediaByCollection: Record<string, any[]> = {};
    const unsubMediaList = MEDIA_COLLECTIONS.map((colName: MediaSourceCollection) =>
      onSnapshot(
        query(collection(db, colName)),
        (snapshot) => {
          mediaByCollection[colName] = snapshot.docs.map((d) => normalizeMediaDoc(d, colName));
          const mergedMap: Record<string, any> = {};
          MEDIA_COLLECTIONS.forEach((c) => {
            (mediaByCollection[c] || []).forEach((m) => {
              if (m.docId) mergedMap[m.docId] = m;
              if (m.videoId) mergedMap[m.videoId] = m;
              if (m.mediaKey) mergedMap[m.mediaKey] = m;
            });
          });
          setMediaMap(mergedMap);
          setMediaLoaded(true);
        },
        () => {}
      )
    );

    // 3. Dedicated /reports collection (if enabled in Firestore Rules)
    const unsubReports = onSnapshot(
      query(collection(db, 'reports')),
      (snapshot) => {
        const docs = snapshot.docs
          .filter((d) => !isRecordDeleted(d.data()) && isAppReportDoc(d.data(), 'reports'))
          .map((d) => normalizeAppReport(d, 'reports'));
        setReportsColDocs(docs);
        setLoading(false);
      },
      () => {
        // Gracefully fall back to /support_tickets if /reports rule is not yet added
        setLoading(false);
      }
    );

    // 4. App reports stored in /support_tickets (strictly filtered to user reports only; zero admin actions)
    const unsubSupportReports = onSnapshot(
      query(collection(db, 'support_tickets')),
      (snapshot) => {
        const docs = snapshot.docs
          .filter((d) => !isRecordDeleted(d.data()) && isAppReportDoc(d.data(), 'support_tickets'))
          .map((d) => normalizeAppReport(d, 'support_tickets'));
        setSupportReportDocs(docs);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => {
      unsubUsers();
      unsubMediaList.forEach((u) => u());
      unsubReports();
      unsubSupportReports();
    };
  }, []);

  const allReports = useMemo(() => {
    return [...reportsColDocs, ...supportReportDocs].sort(
      (a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0)
    );
  }, [reportsColDocs, supportReportDocs]);

  // Auto-close media preview in Reports if the photo/video/story is deleted from the App
  useEffect(() => {
    if (!mediaLoaded || !previewMedia) return;
    const key = previewMedia.docId || previewMedia.id || previewMedia.videoId;
    const liveItem = key ? mediaMap[key] : undefined;
    if (!liveItem || liveItem.isDeleted) {
      setPreviewMedia(null);
    }
  }, [mediaMap, previewMedia, mediaLoaded]);

  const filteredReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allReports.filter((rep) => {
      const matchesStatus = statusFilter === 'All' || rep.status === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;

      const reporter = rep.reporterId ? usersMap[rep.reporterId] : undefined;
      const reportedUser = rep.reportedUserId ? usersMap[rep.reportedUserId] : undefined;
      const targetMedia = rep.reportedMediaId ? mediaMap[rep.reportedMediaId] : undefined;

      return (
        rep.reportReason.toLowerCase().includes(q) ||
        rep.reportCategory.toLowerCase().includes(q) ||
        (rep.reporterName || reporter?.displayName || '').toLowerCase().includes(q) ||
        (rep.reportedName || reportedUser?.displayName || '').toLowerCase().includes(q) ||
        (targetMedia?.caption || rep.reportedCaption || '').toLowerCase().includes(q) ||
        (rep.docId || '').toLowerCase().includes(q)
      );
    });
  }, [allReports, statusFilter, searchQuery, usersMap, mediaMap]);

  const pendingCount = allReports.filter((r) => r.status === 'Pending').length;
  const resolvedCount = allReports.filter((r) => r.status === 'Resolved').length;

  const markReportResolved = async (report: any, resolutionNote: string) => {
    const col = report.sourceCollection === 'support_tickets' ? 'support_tickets' : 'reports';
    await updateDoc(doc(db, col, report.docId), {
      status: 'Resolved',
      adminReply: resolutionNote,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const handleResolveOnly = async (report: any) => {
    setProcessingKey(report.reportKey);
    try {
      await markReportResolved(report, 'Report reviewed by Admin.');
      showToast('Report marked as Resolved');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `${report.sourceCollection}/${report.docId}`);
      showToast('Failed to update report status');
    } finally {
      setProcessingKey(null);
    }
  };

  const handleDeleteReportDoc = async (report: any) => {
    if (!window.confirm('Delete this report record permanently from Firestore?')) return;
    setProcessingKey(report.reportKey);
    try {
      const col = report.sourceCollection === 'support_tickets' ? 'support_tickets' : 'reports';
      await deleteDoc(doc(db, col, report.docId));
      showToast('Report record deleted');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `${report.sourceCollection}/${report.docId}`);
      showToast('Failed to delete report');
    } finally {
      setProcessingKey(null);
    }
  };

  const handleConfirmRestrictMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restrictTarget) return;
    const reasonText =
      restrictReason.trim() ||
      restrictTarget.report.reportReason ||
      'Community guidelines violation';

    setProcessingKey(restrictTarget.report.reportKey);
    try {
      const { statusValue } = await restrictMediaInFirestore(
        db,
        restrictTarget.media,
        restrictTarget.action,
        reasonText
      );
      await markReportResolved(
        restrictTarget.report,
        `Media ${statusValue.toLowerCase()} and moved to Restricted Accounts. Reason: ${reasonText}`
      ).catch(() => {});

      showToast(
        `Media ${statusValue} & moved to Restricted Accounts (will not appear in Reports).`
      );
      setRestrictTarget(null);
      setRestrictReason('');
    } catch (err: any) {
      handleFirestoreError(
        err,
        OperationType.UPDATE,
        `${restrictTarget.media.sourceCollection || 'videos'}/${restrictTarget.media.docId}`
      );
      showToast('Failed to restrict media — check Firestore Rules.');
    } finally {
      setProcessingKey(null);
    }
  };

  const handleDeleteReportedMedia = async (report: any, media: any) => {
    if (!window.confirm(`Permanently delete reported media "${media.caption || media.docId}" from Firestore and Supabase Storage?`)) return;
    setProcessingKey(report.reportKey);
    try {
      const result = await deleteMediaFromFirestore(db, media);
      await markReportResolved(report, 'Reported media permanently deleted by Admin.').catch(() => {});
      const storageNote =
        result.deletedStorageKeys.length > 0
          ? ` & ${result.deletedStorageKeys.length} YouSnap Storage file(s)`
          : '';
      showToast(`Reported media deleted from /${result.deletedDocs.map((d) => d.col).join(', /')}${storageNote} & report resolved`);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `${media.sourceCollection}/${media.docId}`);
      showToast(err?.message || 'Failed to delete reported media — check Firestore Rules & Storage settings.');
    } finally {
      setProcessingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Flag className="text-rose-600" /> App User Reports & Violations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            All user-submitted reports from the mobile app with reporter reasons. Admin bans & suspensions go directly to{' '}
            <span className="font-bold text-rose-600">Restricted Accounts</span>.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Total App Reports</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{allReports.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-rose-500 uppercase">Pending Review</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-emerald-500 uppercase">Reviewed / Resolved</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{resolvedCount}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search by reporter, reported user, or written reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-rose-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['All', 'Pending', 'Resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="animate-spin mx-auto text-rose-500 mb-2" size={24} />
            <p className="text-xs font-bold text-slate-600">Loading app reports from Firestore...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-16 text-center">
            <Flag className="mx-auto text-slate-300 mb-3" size={40} />
            <h3 className="text-sm font-bold text-slate-700">No User Reports Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              When mobile app users report a photo, video, reel, story, or account with their reason, it will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReports.map((rep) => {
              const reporterUser = rep.reporterId ? usersMap[rep.reporterId] : undefined;
              const reporterObj = reporterUser || {
                id: rep.reporterId || 'unknown',
                docId: rep.reporterId || 'unknown',
                displayName: rep.reporterName || rep.userName || 'YouSnap User',
                username: rep.reporterUsername || rep.username || 'user',
                photoURL: rep.reporterAvatar || '',
                status: 'Active',
              };

              const targetMedia = rep.reportedMediaId
                ? mediaMap[rep.reportedMediaId]
                : undefined;

              const inferredReportedUserId =
                rep.reportedUserId || targetMedia?.userId || '';
              const reportedUser = inferredReportedUserId
                ? usersMap[inferredReportedUserId]
                : undefined;

              const reportedUserObj = reportedUser || {
                id: inferredReportedUserId || 'unknown',
                docId: inferredReportedUserId || 'unknown',
                displayName:
                  rep.reportedName ||
                  targetMedia?.uploader ||
                  rep.reportedUsername ||
                  'Reported Creator',
                username:
                  rep.reportedUsername ||
                  targetMedia?.username ||
                  'creator',
                photoURL: rep.reportedAvatar || targetMedia?.avatar || '',
                status: 'Active',
              };

              const isBusy = processingKey === rep.reportKey;

              return (
                <div key={rep.reportKey} className="p-5 hover:bg-slate-50/60 transition space-y-3.5">
                  {/* Top Row: Reporter -> Target + Status & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Reporter */}
                      <div
                        onClick={() => reporterUser && setSelectedUserForModal(reporterObj)}
                        className="flex items-center gap-2.5 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-emerald-500 transition"
                      >
                        {reporterObj.photoURL || reporterObj.avatar ? (
                          <img
                            src={reporterObj.photoURL || reporterObj.avatar}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                            {(reporterObj.displayName || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Reported By</p>
                          <p className="font-bold text-slate-900 text-xs">
                            {reporterObj.displayName}{' '}
                            <span className="font-mono text-[10px] text-slate-400">
                              @{reporterObj.username}
                            </span>
                          </p>
                        </div>
                      </div>

                      <ArrowRight size={14} className="text-slate-400 shrink-0" />

                      {/* Reported Media OR Reported User */}
                      {targetMedia || rep.reportedMediaId ? (
                        <div
                          onClick={() => {
                            if (targetMedia) {
                              setPreviewMedia({
                                ...targetMedia,
                                uploader: targetMedia.uploader || reportedUserObj.displayName,
                                username: targetMedia.username || reportedUserObj.username,
                                avatar: targetMedia.avatar || reportedUserObj.photoURL,
                              });
                            } else if (reportedUser) {
                              setSelectedUserForModal(reportedUserObj);
                            }
                          }}
                          className="flex items-center gap-2.5 cursor-pointer bg-rose-50/70 px-3 py-2 rounded-xl border border-rose-200 hover:border-rose-500 transition"
                        >
                          {targetMedia?.thumbnailURL ||
                          targetMedia?.mediaUrl ||
                          rep.reportedThumbnail ? (
                            <img
                              src={
                                targetMedia?.thumbnailURL ||
                                targetMedia?.mediaUrl ||
                                rep.reportedThumbnail
                              }
                              alt=""
                              className="w-10 h-8 rounded-lg object-cover bg-slate-900"
                            />
                          ) : (
                            <div className="w-10 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                              {targetMedia?.mediaKind === 'Photo' ? (
                                <ImageIcon size={14} />
                              ) : (
                                <Play size={14} />
                              )}
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] font-bold text-rose-600 uppercase flex items-center gap-1.5">
                              <span>
                                Reported {targetMedia?.sourceLabel || 'Media'}
                              </span>
                              {(targetMedia?.isDeleted || (mediaLoaded && rep.reportedMediaId && !targetMedia)) && (
                                <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[9px]">
                                  Deleted
                                </span>
                              )}
                              {targetMedia && (targetMedia.isBanned || targetMedia.isSuspended || targetMedia.isBlocked) && (
                                <span className="px-1.5 py-0.2 bg-rose-200 text-rose-800 rounded text-[9px]">
                                  {targetMedia.status}
                                </span>
                              )}
                            </p>
                            <p className="font-bold text-slate-900 text-xs line-clamp-1 max-w-[220px]">
                              {targetMedia?.caption ||
                                rep.reportedCaption ||
                                rep.reportedMediaId}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => reportedUser && setSelectedUserForModal(reportedUserObj)}
                          className="flex items-center gap-2.5 cursor-pointer bg-rose-50/70 px-3 py-2 rounded-xl border border-rose-200 hover:border-rose-500 transition"
                        >
                          {reportedUserObj.photoURL || reportedUserObj.avatar ? (
                            <img
                              src={reportedUserObj.photoURL || reportedUserObj.avatar}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center">
                              {(reportedUserObj.displayName || 'R').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] font-bold text-rose-600 uppercase">Reported User</p>
                            <p className="font-bold text-slate-900 text-xs">
                              {reportedUserObj.displayName}{' '}
                              <span className="font-mono text-[10px] text-rose-600">
                                @{reportedUserObj.username}
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Badges + Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          rep.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {rep.status}
                      </span>

                      {targetMedia && !targetMedia.isDeleted && (
                        <>
                          <button
                            onClick={() => {
                              setRestrictTarget({
                                report: rep,
                                media: targetMedia,
                                action: 'Suspend',
                              });
                              setRestrictReason(rep.reportReason || '');
                            }}
                            disabled={isBusy}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                            title="Suspend media & move to Restricted Accounts"
                          >
                            <AlertTriangle size={12} /> Suspend Media
                          </button>

                          <button
                            onClick={() => {
                              setRestrictTarget({
                                report: rep,
                                media: targetMedia,
                                action: 'Ban',
                              });
                              setRestrictReason(rep.reportReason || '');
                            }}
                            disabled={isBusy}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                            title="Ban media & move to Restricted Accounts"
                          >
                            <Ban size={12} /> Ban Media
                          </button>

                          <button
                            onClick={() => handleDeleteReportedMedia(rep, targetMedia)}
                            disabled={isBusy}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                            title="Delete reported photo/video"
                          >
                            <Trash2 size={12} /> Delete Media
                          </button>
                        </>
                      )}

                      {reportedUser && (
                        <button
                          onClick={() => setSelectedUserForModal(reportedUserObj)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
                        >
                          Inspect Creator
                        </button>
                      )}

                      {rep.status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolveOnly(rep)}
                          disabled={isBusy}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <Check size={12} /> Resolve
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteReportDoc(rep)}
                        disabled={isBusy}
                        className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition"
                        title="Delete Report"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Reporter's Written Reason Box */}
                  <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-200/70 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-rose-700 uppercase tracking-wider">
                        <MessageSquareWarning size={13} />
                        User Report Reason • {rep.reportCategory}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {rep.timeLabel} • /{rep.sourceCollection}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                      {rep.reportReason || 'No written reason provided by user.'}
                    </p>
                  </div>

                  {rep.adminReply && (
                    <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/60 flex items-start gap-2 text-xs">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-slate-700 font-semibold">{rep.adminReply}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Suspend / Ban Media Confirmation Modal */}
      {restrictTarget && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    restrictTarget.action === 'Ban'
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {restrictTarget.action === 'Ban' ? (
                    <Ban size={20} />
                  ) : (
                    <AlertTriangle size={20} />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {restrictTarget.action === 'Ban' ? 'Ban Reported Media' : 'Suspend Reported Media'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Will be moved directly to Restricted Accounts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRestrictTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmRestrictMedia} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Restriction Reason:
                </label>
                <textarea
                  rows={3}
                  required
                  value={restrictReason}
                  onChange={(e) => setRestrictReason(e.target.value)}
                  placeholder="Enter reason for banning or suspending this photo/video..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestrictTarget(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white font-bold rounded-xl flex items-center gap-1.5 ${
                    restrictTarget.action === 'Ban'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  <Send size={13} /> Confirm {restrictTarget.action}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUserForModal}
        isOpen={Boolean(selectedUserForModal)}
        onClose={() => setSelectedUserForModal(null)}
        showToast={showToast}
      />

      {/* Video / Photo Preview Modal */}
      <VideoPreviewModal
        video={previewMedia}
        isOpen={Boolean(previewMedia)}
        onClose={() => setPreviewMedia(null)}
        showToast={showToast}
        onVideoDeleted={() => setPreviewMedia(null)}
      />

      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs border border-emerald-500/30">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
