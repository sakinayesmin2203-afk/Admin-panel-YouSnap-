import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  collection,
  onSnapshot,
  query,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Headphones,
  CheckCircle2,
  AlertTriangle,
  Search,
  RefreshCw,
  Check,
  Trash2,
  Filter,
  ArrowRight,
  UserCheck,
  XCircle,
} from 'lucide-react';
import UserDetailsModal from './UserDetailsModal';
import { buildUsersLookupMap, isAppReportDoc, normalizeUserDoc, toMillis } from '../lib/firestoreAdapters';

function isAppealCategory(cat: string): boolean {
  const c = (cat || '').toLowerCase();
  return (
    c.includes('appeal') ||
    c.includes('suspension') ||
    c.includes('ban') ||
    c.includes('recovery') ||
    c.includes('restore')
  );
}

export default function FirestoreSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedUserForModal, setSelectedUserForModal] = useState<any | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    setLoading(true);

    const unsubUsers = onSnapshot(
      query(collection(db, 'users')),
      (snapshot) => {
        const normalized = snapshot.docs.map((d) => normalizeUserDoc(d));
        setUsersMap(buildUsersLookupMap(normalized));
      },
      () => {}
    );

    const path = 'support_tickets';
    const q = query(collection(db, path));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .filter((docSnap) => !isAppReportDoc(docSnap.data(), 'support_tickets'))
          .map((docSnap) => {
            const raw = docSnap.data();
            return {
              ...raw,
              id: docSnap.id,
              docId: docSnap.id,
              createdAtMs: toMillis(raw.createdAt) || toMillis(raw.timestamp) || 0,
            };
          })
          .sort((a: any, b: any) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
        setTickets(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('insufficient')) {
          setTickets([]);
          setError(
            'Collection "/support_tickets" is not yet enabled in your YouSnap Firestore Rules. Add admin read/write rule for support_tickets to view tickets here.'
          );
        } else {
          const errInfo = handleFirestoreError(err, OperationType.GET, path);
          setError(errInfo.error || 'Failed to load support tickets from Firestore');
        }
        setLoading(false);
      }
    );

    return () => {
      unsubUsers();
      unsubscribe();
    };
  }, []);

  // Resolve Ticket Only (without changing account status)
  const handleResolveTicket = async (ticket: any, adminReplyText?: string) => {
    const ticketDocId = ticket.docId || ticket.id;
    setProcessingId(ticketDocId);
    try {
      await updateDoc(doc(db, 'support_tickets', ticketDocId), {
        status: 'Resolved',
        ...(adminReplyText ? { adminReply: adminReplyText } : {}),
        updatedAt: serverTimestamp(),
      });

      const targetUserId = ticket.userId || ticket.uid || ticket.reporterUserId || ticket.creatorUsername || 'user_general';
      try {
        await setDoc(doc(db, 'notifications', `notif_${Date.now()}`), {
          userId: targetUserId,
          title: 'Support Ticket Reviewed',
          message: adminReplyText || 'Your support ticket has been reviewed and resolved by admin.',
          createdAt: serverTimestamp(),
          read: false,
        });
      } catch {
        // ignore if notifications rules are not added yet
      }

      showToast(`Ticket ${ticket.ticketId || ticketDocId} marked as Resolved!`);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `support_tickets/${ticketDocId}`);
      showToast('Error updating ticket status');
    } finally {
      setProcessingId(null);
    }
  };

  // Approve Appeal & Restore Suspended/Banned User Account to Active
  const handleApproveAndRestoreAccount = async (ticket: any, matchedUser: any) => {
    const ticketDocId = ticket.docId || ticket.id;
    const targetUid = matchedUser?.docId || matchedUser?.id || ticket.userId || ticket.uid;
    if (!targetUid) {
      showToast('Could not find target user ID for this appeal.');
      return;
    }

    if (
      !window.confirm(
        `Approve appeal and restore "${matchedUser?.displayName || ticket.creatorName || targetUid}" back to Active?`
      )
    ) {
      return;
    }

    setProcessingId(ticketDocId);
    try {
      await updateDoc(doc(db, 'users', targetUid), {
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
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'support_tickets', ticketDocId), {
        status: 'Resolved',
        resolution: 'Approved',
        adminReply: 'Appeal approved. Your account has been restored to Active.',
        updatedAt: serverTimestamp(),
      });

      try {
        await setDoc(doc(db, 'notifications', `notif_${Date.now()}`), {
          userId: targetUid,
          userDocId: targetUid,
          recipientId: targetUid,
          title: 'Account Restored to Active 🎉',
          message: 'Your appeal was approved by YouSnap Admin. Your account is now active again.',
          createdAt: serverTimestamp(),
          read: false,
          type: 'account_restored',
        });
      } catch {
        // ignore if notifications rules are not added yet
      }

      showToast('Appeal approved & user account restored to Active!');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
      showToast('Failed to restore account — check Firestore Rules permissions.');
    } finally {
      setProcessingId(null);
    }
  };

  // Delete Ticket
  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm('Delete this support ticket from Firestore?')) return;
    try {
      await deleteDoc(doc(db, 'support_tickets', ticketId));
      showToast('Ticket deleted successfully');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `support_tickets/${ticketId}`);
      showToast('Failed to delete ticket');
    }
  };

  const categoryTabs = [
    { label: 'All', value: 'All' },
    { label: 'Suspension Appeals', value: 'Suspension Appeal' },
    { label: 'Monetization Issues', value: 'Monetization Issues' },
    { label: 'General', value: 'General & App Bugs' },
  ];

  const filtered = tickets.filter((t) => {
    const uid = t.userId || t.uid || t.reporterUserId;
    const owner = uid ? usersMap[uid] : undefined;
    const name = t.creatorName || t.userName || t.displayName || t.name || owner?.displayName || '';
    const msg = t.message || t.appealMessage || t.reason || t.description || '';
    const subj = t.subject || '';
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      name.toLowerCase().includes(q) ||
      subj.toLowerCase().includes(q) ||
      (t.ticketId || t.id || '').toLowerCase().includes(q) ||
      msg.toLowerCase().includes(q) ||
      (t.reportedName || '').toLowerCase().includes(q);

    const st = t.status || 'Open';
    const matchesStatus =
      statusFilter === 'All' ||
      st === statusFilter ||
      (statusFilter === 'Open' && (st === 'Open' || st === 'Pending'));

    const matchesCategory =
      categoryFilter === 'All' ||
      (t.category || '').toLowerCase() === categoryFilter.toLowerCase() ||
      (categoryFilter === 'Suspension Appeal' && isAppealCategory(t.category || subj)) ||
      (categoryFilter === 'Monetization Issues' &&
        (t.category === 'Payout Inquiry' || t.category === 'Monetization Issues')) ||
      (categoryFilter === 'General & App Bugs' &&
        (t.category === 'General' || t.category === 'App Bug' || t.category === 'General & App Bugs'));

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Headphones className="text-emerald-600" /> Support, Appeals & Grievance Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time account restore requests & creator tickets listening on Cloud Firestore{' '}
            <code className="text-emerald-600 font-bold">/support_tickets</code>
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Tickets</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{tickets.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-amber-500 uppercase">Open / Appeals</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {tickets.filter((t) => !t.status || t.status === 'Open' || t.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-sky-500 uppercase">In Progress</p>
          <p className="text-2xl font-black text-sky-600 mt-1">
            {tickets.filter((t) => t.status === 'In Progress').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-emerald-500 uppercase">Resolved</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {tickets.filter((t) => t.status === 'Resolved').length}
          </p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <Filter size={13} className="text-emerald-600" /> Filter by Status & Category:
          </p>
          <div className="flex items-center gap-2">
            {['All', 'Open', 'In Progress', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition ${
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

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {categoryTabs.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                categoryFilter === cat.value
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search appeals or tickets by creator, subject, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Tickets List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="animate-spin mx-auto text-emerald-500 mb-2" size={24} />
            <p className="text-xs font-bold text-slate-600">Connecting to Firestore support tickets...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Headphones className="mx-auto text-slate-300 mb-3" size={40} />
            <h3 className="text-sm font-bold text-slate-700">No Support Tickets Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are currently no appeals or tickets matching your filter in Firestore{' '}
              <code className="text-emerald-600">/support_tickets</code>.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((ticket) => {
              const isReport = ticket.category === 'Reports & Violations';
              const uid = ticket.reporterUserId || ticket.userId || ticket.uid || '';
              const matchedUser = uid ? usersMap[uid] : undefined;

              const reporterObj = matchedUser
                ? {
                    ...matchedUser,
                    displayName:
                      ticket.reporterName ||
                      ticket.creatorName ||
                      ticket.userName ||
                      ticket.name ||
                      matchedUser.displayName,
                    username:
                      ticket.reporterUsername ||
                      ticket.creatorUsername ||
                      ticket.username ||
                      matchedUser.username,
                    avatar:
                      ticket.reporterAvatar ||
                      ticket.creatorAvatar ||
                      ticket.userAvatar ||
                      ticket.profilePic ||
                      matchedUser.photoURL ||
                      '',
                  }
                : {
                    id: uid || 'unknown',
                    docId: uid || 'unknown',
                    displayName:
                      ticket.reporterName ||
                      ticket.creatorName ||
                      ticket.userName ||
                      ticket.displayName ||
                      ticket.name ||
                      'YouSnap User',
                    username: ticket.reporterUsername || ticket.creatorUsername || ticket.username || 'user',
                    email: ticket.email || ticket.userEmail || '',
                    avatar:
                      ticket.reporterAvatar ||
                      ticket.creatorAvatar ||
                      ticket.userAvatar ||
                      ticket.profilePic ||
                      ticket.photoURL ||
                      '',
                    status: ticket.accountStatus || 'Active',
                    totalVideos: 0,
                    totalEarnings: '₹0',
                    followers: 0,
                    createdAt: 'N/A',
                  };

              const reportedOwner = ticket.reportedUserId ? usersMap[ticket.reportedUserId] : undefined;
              const reportedObj = reportedOwner || {
                id: ticket.reportedUserId || 'unknown',
                docId: ticket.reportedUserId || 'unknown',
                displayName: ticket.reportedName || 'Reported Entity',
                username: ticket.reportedUsername || 'reported_user',
                avatar: ticket.reportedAvatar || '',
                status: 'Suspended',
                totalVideos: 0,
                totalEarnings: '₹0',
                followers: 0,
                createdAt: 'N/A',
              };

              const ticketMessage =
                ticket.message || ticket.appealMessage || ticket.reason || ticket.description || 'No message provided.';
              const ticketSubject =
                ticket.subject ||
                (isAppealCategory(ticket.category || '')
                  ? 'Account Restore Request (Appeal)'
                  : 'User Support Request');
              const ticketStatus = ticket.status || 'Open';
              const isAppeal = isAppealCategory(ticket.category || ticketSubject);
              const isUserCurrentlyRestricted =
                matchedUser?.status === 'Suspended' ||
                matchedUser?.status === 'Banned' ||
                matchedUser?.isRestricted === true;

              return (
                <div key={ticket.docId || ticket.id} className="p-5 hover:bg-slate-50/60 transition space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {isReport ? (
                      <div className="flex flex-wrap items-center gap-4">
                        <div
                          onClick={() => setSelectedUserForModal(reporterObj)}
                          className="flex items-center gap-2.5 cursor-pointer group bg-slate-50 p-2 rounded-xl border border-slate-200 hover:border-emerald-500 transition"
                        >
                          {reporterObj.avatar ? (
                            <img
                              src={reporterObj.avatar}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover shadow-2xs"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                              {(reporterObj.displayName || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Reporter</p>
                            <p className="font-bold text-slate-900 group-hover:text-emerald-600 transition text-xs">
                              {reporterObj.displayName}{' '}
                              <span className="font-mono text-[10px] text-slate-400">@{reporterObj.username}</span>
                            </p>
                          </div>
                        </div>

                        <ArrowRight size={14} className="text-slate-400 shrink-0" />

                        <div
                          onClick={() => setSelectedUserForModal(reportedObj)}
                          className="flex items-center gap-2.5 cursor-pointer group bg-rose-50/60 p-2 rounded-xl border border-rose-200 hover:border-rose-500 transition"
                        >
                          {reportedObj.avatar ? (
                            <img
                              src={reportedObj.avatar}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover shadow-2xs"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center">
                              {(reportedObj.displayName || 'R').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] font-bold text-rose-500 uppercase">Reported ID / Content</p>
                            <p className="font-bold text-slate-900 group-hover:text-rose-600 transition text-xs">
                              {reportedObj.displayName}{' '}
                              <span className="font-mono text-[10px] text-rose-600">@{reportedObj.username}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => setSelectedUserForModal(reporterObj)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          {reporterObj.avatar ? (
                            <img
                              src={reporterObj.avatar}
                              alt={reporterObj.displayName}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 group-hover:border-emerald-500 transition shadow-2xs shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center border border-emerald-200 shrink-0">
                              {(reporterObj.displayName || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 group-hover:text-emerald-600 transition text-sm">
                                {reporterObj.displayName}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">@{reporterObj.username}</span>
                              {matchedUser && (
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isUserCurrentlyRestricted
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {matchedUser.status || 'Active'}
                                </span>
                              )}
                            </div>
                            <span
                              className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded border ${
                                isAppeal
                                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                                  : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              }`}
                            >
                              {ticket.category || 'General Support'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          ticketStatus === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ticketStatus === 'In Progress'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {ticketStatus}
                      </span>

                      {(isAppeal || isUserCurrentlyRestricted) && ticketStatus !== 'Resolved' && (
                        <button
                          onClick={() => handleApproveAndRestoreAccount(ticket, matchedUser)}
                          disabled={processingId === (ticket.docId || ticket.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-2xs flex items-center gap-1"
                          title="Approve appeal & unsuspend user account"
                        >
                          <UserCheck size={13} /> Approve & Restore Account
                        </button>
                      )}

                      {isAppeal && ticketStatus !== 'Resolved' && (
                        <button
                          onClick={() =>
                            handleResolveTicket(
                              ticket,
                              'Appeal reviewed. Account restriction remains active due to policy violation.'
                            )
                          }
                          disabled={processingId === (ticket.docId || ticket.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                          title="Reject appeal without restoring account"
                        >
                          <XCircle size={13} /> Reject Appeal
                        </button>
                      )}

                      {!isAppeal && (
                        <button
                          onClick={() => handleResolveTicket(ticket)}
                          disabled={ticketStatus === 'Resolved' || processingId === (ticket.docId || ticket.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-2xs flex items-center gap-1"
                          title="Mark as Resolved"
                        >
                          <Check size={13} /> Resolve
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteTicket(ticket.docId || ticket.id)}
                        className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition"
                        title="Delete Ticket"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{ticketSubject}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {ticket.ticketId || ticket.docId || ticket.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{ticketMessage}</p>
                  </div>

                  {ticket.adminReply && (
                    <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/60 flex items-start gap-2.5 text-xs">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                          Admin Resolution Response:
                        </p>
                        <p className="text-slate-800 font-semibold mt-0.5">{ticket.adminReply}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
