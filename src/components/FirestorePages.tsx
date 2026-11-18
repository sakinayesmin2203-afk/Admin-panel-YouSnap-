import React, { useState, useEffect } from 'react';
import UserDetailsModal from './UserDetailsModal';
import VideoPreviewModal from './VideoPreviewModal';
import { db, auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  doc, 
  deleteDoc, 
  updateDoc, 
  setDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  Users, 
  Video, 
  DollarSign, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Plus, 
  Play, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  ThumbsUp, 
  ExternalLink,
  ArrowUpRight,
  LogIn,
  LogOut,
  Database,
  Check,
  X,
  Image as ImageIcon
} from 'lucide-react';
import {
  MEDIA_COLLECTIONS,
  MediaSourceCollection,
  buildUsersLookupMap,
  normalizeMediaDoc,
  normalizeUserDoc,
} from '../lib/firestoreAdapters';

// ==========================================
// AUTH & FIREBASE STATUS BANNER COMPONENT
// ==========================================
export const FirebaseStatusBar = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSignIn = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setAuthError(err.message || 'Failed to sign in with Google');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  return (
    <div className="mb-6 p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <Database size={16} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">Cloud Firestore Live</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              yousnap-app
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Real-time listener <code className="text-emerald-400 font-mono">onSnapshot</code> connected with multi-collection structure.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {authLoading ? (
          <span className="text-slate-400">Checking auth...</span>
        ) : currentUser ? (
          <div className="flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="Admin" className="w-6 h-6 rounded-full border border-emerald-400" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-900 font-bold flex items-center justify-center text-[10px]">
                {currentUser.displayName?.[0] || 'A'}
              </div>
            )}
            <div className="text-left">
              <p className="font-bold text-white text-[11px] leading-tight">{currentUser.displayName || 'Admin'}</p>
              <p className="text-[9px] text-emerald-400 font-mono">{currentUser.email}</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="ml-2 p-1 text-slate-400 hover:text-rose-400 transition"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition shadow-xs active:scale-95"
          >
            <LogIn size={14} />
            <span>Sign in as Admin</span>
          </button>
        )}
      </div>

      {authError && (
        <div className="w-full text-rose-400 text-[11px] bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
          Auth Notice: {authError}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 1. USERS PAGE COMPONENT (/admin/users)
// ==========================================
export const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteUser = async (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    const docId = user.docId || user.id;
    const label = user.displayName || user.email || docId;
    if (!window.confirm(`Delete "${label}" from Firestore /users and remove from Admin Panel?`)) return;
    try {
      await deleteDoc(doc(db, 'users', docId));
      if (selectedUser && (selectedUser.docId || selectedUser.id) === docId) {
        setSelectedUser(null);
      }
      showToast(`User "${label}" removed from Admin Panel & Firestore.`);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `users/${docId}`);
      showToast('Permission denied — ensure `allow delete: if isAdmin();` is published in Firestore Rules.');
    }
  };

  useEffect(() => {
    setLoading(true);
    const path = 'users';
    const q = query(collection(db, path));
    
    // Attach onSnapshot with proper error handler as required by SKILL.md
    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const data = snapshot.docs.map(docSnap => normalizeUserDoc(docSnap));
        setUsers(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        const errorInfo = handleFirestoreError(err, OperationType.GET, path);
        setError(errorInfo.error || 'Failed to fetch users from Firestore');
        setLoading(false);
      }
    );

    // Critical: Clean up listener to prevent memory leak
    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (u.displayName || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.uid || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header - Black status banner and Add User button removed per request */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-emerald-600" /> Users Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time live synchronization with Cloud Firestore <code className="text-emerald-600 font-bold">/users</code> collection
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Firestore Users</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{users.length}</p>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Active Accounts</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {users.filter(u => u.status === 'Active').length}
          </p>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Suspended</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {users.filter(u => u.status === 'Suspended').length}
          </p>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Banned</p>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {users.filter(u => u.status === 'Banned').length}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
          <input 
            type="text" 
            placeholder="Search by Name or Email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Active', 'Suspended', 'Banned'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
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

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700">
          <AlertTriangle size={18} className="shrink-0 text-rose-600" />
          <div>
            <p className="font-bold">Firestore Error Notice</p>
            <p className="text-[11px] text-rose-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Users Table - USER ID column and Change Status button column removed per request */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="animate-spin mx-auto text-emerald-500 mb-2" size={24} />
            <p className="text-xs font-bold text-slate-600">Connecting to Firestore & loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="mx-auto text-slate-300 mb-3" size={40} />
            <h3 className="text-sm font-bold text-slate-700">No users found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are currently no documents matching your query in the Firestore <code className="text-emerald-600">users</code> collection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6 font-black">Profile / Name</th>
                  <th className="py-3.5 px-6 font-black">Email</th>
                  <th className="py-3.5 px-6 font-black">Account Status</th>
                  <th className="py-3.5 px-6 font-black text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => (
                  <tr 
                    key={user.id} 
                    onClick={() => setSelectedUser(user)}
                    className="hover:bg-slate-50/80 cursor-pointer transition group"
                    title="Click to view full user profile & moderation details"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        {user.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt={user.displayName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition shadow-2xs" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center border border-emerald-200 shrink-0 text-xs">
                            {(user.displayName || 'U').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-emerald-600 transition flex items-center gap-1.5 text-xs">
                            {user.displayName || 'Unnamed User'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            @{user.username || 'user'} • {Number(user.followersCount || 0).toLocaleString()} followers • {Number(user.postCount || 0)} posts
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium font-mono text-[11px]">
                      {user.email || 'No email provided'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] ${
                        user.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : user.status === 'Suspended'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'Active' ? 'bg-emerald-500' : user.status === 'Suspended' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 group-hover:text-emerald-700 py-1 px-2.5 rounded-lg bg-emerald-50/70 group-hover:bg-emerald-100/70 border border-emerald-200/50 transition">
                          <span>View Details</span>
                          <ArrowUpRight size={13} />
                        </span>
                        <button
                          onClick={(e) => handleDeleteUser(e, user)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 transition"
                          title="Delete User from Firestore"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Full-Screen Modal View */}
      {selectedUser && (
        <UserDetailsModal 
          user={selectedUser}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          showToast={showToast}
        />
      )}

      {/* Floating Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

// 2. VIDEOS PAGE COMPONENT (/admin/videos)
// ==========================================
export const VideosPage = () => {
  const [mediaByCollection, setMediaByCollection] = useState<Record<string, any[]>>({
    posts: [],
    reels: [],
    stories: [],
    videos: [],
    live_uploads: [],
  });
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'All' | 'reels' | 'posts' | 'stories'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New video form state
  const [newVideoId, setNewVideoId] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newThumb, setNewThumb] = useState('');
  const [newViews, setNewViews] = useState('0');
  const [newLikes, setNewLikes] = useState('0');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    setLoading(true);

    const unsubUsers = onSnapshot(
      query(collection(db, 'users')),
      (snapshot) => {
        const normalizedUsers = snapshot.docs.map((d) => normalizeUserDoc(d));
        setUsersMap(buildUsersLookupMap(normalizedUsers));
      },
      () => {}
    );

    const unsubs = MEDIA_COLLECTIONS.map((colName: MediaSourceCollection) =>
      onSnapshot(
        query(collection(db, colName)),
        (snapshot) => {
          const data = snapshot.docs.map((docSnap) => normalizeMediaDoc(docSnap, colName));
          setMediaByCollection((prev) => ({ ...prev, [colName]: data }));
          setLoading(false);
          setError(null);
        },
        () => {
          setLoading(false);
        }
      )
    );

    return () => {
      unsubUsers();
      unsubs.forEach((u) => u());
    };
  }, []);

  const videos = React.useMemo(() => {
    const merged: any[] = [];
    MEDIA_COLLECTIONS.forEach((colName) => {
      (mediaByCollection[colName] || []).forEach((item) => {
        const owner = usersMap[item.userId] || usersMap[item.username];
        merged.push({
          ...item,
          uploader: item.uploader || owner?.displayName || 'Creator',
          username: item.username || owner?.username || item.userId || 'creator',
          avatar: item.avatar || owner?.photoURL || '',
        });
      });
    });
    return merged.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
  }, [mediaByCollection, usersMap]);

  // Delete Media in Firestore
  const handleDeleteVideo = async (item: any) => {
    const col = item.sourceCollection || 'videos';
    const docId = item.docId || item.id;
    const caption = item.caption || docId;
    if (!window.confirm(`Are you sure you want to delete "${caption}" from /${col}?`)) return;
    try {
      await deleteDoc(doc(db, col, docId));
      showToast(`Deleted from /${col} successfully`);
      if (previewVideo?.mediaKey === item.mediaKey) setPreviewVideo(null);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `${col}/${docId}`);
      showToast('Failed to delete — check Firestore Rules permissions for Admin.');
    }
  };

  // Add new Video to Firestore
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoId.trim() || !newUserId.trim()) return;

    try {
      const customId = newVideoId.trim();
      await setDoc(doc(db, 'videos', customId), {
        videoId: customId,
        userId: newUserId.trim(),
        caption: newCaption.trim() || 'YouSnap Short Video',
        thumbnailURL: newThumb.trim() || '',
        videoURL: '',
        views: parseInt(newViews) || 0,
        likes: parseInt(newLikes) || 0,
        createdAt: serverTimestamp()
      });
      setShowAddModal(false);
      setNewVideoId('');
      setNewUserId('');
      setNewCaption('');
      setNewThumb('');
      showToast('Video published to Firestore!');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'videos');
      showToast('Failed to save video to Firestore');
    }
  };

  const filteredVideos = videos.filter(v => {
    const matchesSource =
      sourceFilter === 'All' ||
      (sourceFilter === 'reels' && (v.sourceCollection === 'reels' || v.sourceCollection === 'videos' || v.sourceCollection === 'live_uploads')) ||
      (sourceFilter === 'posts' && v.sourceCollection === 'posts') ||
      (sourceFilter === 'stories' && v.sourceCollection === 'stories');
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      (v.caption || '').toLowerCase().includes(q) ||
      (v.videoId || '').toLowerCase().includes(q) ||
      (v.userId || '').toLowerCase().includes(q) ||
      (v.uploader || '').toLowerCase().includes(q) ||
      (v.username || '').toLowerCase().includes(q);
    return matchesSource && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Video className="text-emerald-600" /> Posts, Reels & Stories Moderation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time media sync across <code className="text-emerald-600 font-bold">/posts</code>, <code className="text-emerald-600 font-bold">/reels</code>, <code className="text-emerald-600 font-bold">/stories</code> & <code className="text-emerald-600 font-bold">/videos</code>
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Total App Uploads</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{videos.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-emerald-500 uppercase">Cumulative Views</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {videos.reduce((acc, v) => acc + (parseInt(v.views) || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-sky-500 uppercase">Total Likes</p>
          <p className="text-2xl font-black text-sky-600 mt-1">
            {videos.reduce((acc, v) => acc + (parseInt(v.likes) || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search Input & Collection Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
          <input 
            type="text" 
            placeholder="Search by Creator, @username, User ID, or Caption..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'All', label: 'All Media' },
            { id: 'posts', label: 'Posts / Photos' },
            { id: 'reels', label: 'Reels / Videos' },
            { id: 'stories', label: 'Stories' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSourceFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                sourceFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700">
          <AlertTriangle size={18} className="shrink-0 text-rose-600" />
          <div>
            <p className="font-bold">Firestore Error Notice</p>
            <p className="text-[11px] text-rose-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Media Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="animate-spin mx-auto text-emerald-500 mb-2" size={24} />
            <p className="text-xs font-bold text-slate-600">Connecting to Firestore & loading media...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="p-16 text-center">
            <Video className="mx-auto text-slate-300 mb-3" size={40} />
            <h3 className="text-sm font-bold text-slate-700">No uploads found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Posts, Reels, and Stories uploaded from your YouSnap app will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-black">Type</th>
                  <th className="py-3 px-4 font-black">Creator</th>
                  <th className="py-3 px-4 font-black">Preview & Caption</th>
                  <th className="py-3 px-4 font-black">Views</th>
                  <th className="py-3 px-4 font-black">Likes</th>
                  <th className="py-3 px-4 font-black text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVideos.map(video => (
                  <tr key={video.mediaKey || video.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                        video.sourceCollection === 'reels' || video.sourceCollection === 'videos'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : video.sourceCollection === 'stories'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {video.sourceLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{video.uploader}</p>
                        <p className="text-[10px] text-slate-400 font-mono">@{video.username}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div 
                          onClick={() => setPreviewVideo(video)}
                          className="relative w-14 h-10 rounded-lg overflow-hidden bg-slate-900 shrink-0 cursor-pointer group flex items-center justify-center"
                        >
                          {video.thumbnailURL || video.mediaUrl ? (
                            <img 
                              src={video.thumbnailURL || video.mediaUrl} 
                              alt={video.caption} 
                              className="w-full h-full object-cover group-hover:scale-105 transition" 
                            />
                          ) : (
                            <Video size={14} className="text-slate-400" />
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                            {video.mediaKind === 'Photo' ? <ImageIcon size={12} /> : <Play size={12} className="fill-white" />}
                          </div>
                        </div>
                        <p className="font-semibold text-slate-800 line-clamp-1 max-w-xs">
                          {video.caption || 'No caption'}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      <div className="flex items-center gap-1">
                        <Eye size={12} className="text-slate-400" />
                        <span>{parseInt(video.views || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      <div className="flex items-center gap-1">
                        <ThumbsUp size={12} className="text-slate-400" />
                        <span>{parseInt(video.likes || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewVideo(video)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition flex items-center gap-1"
                        >
                          <Play size={10} /> Preview
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(video)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                          title="Delete / Block objectionable content"
                        >
                          <Trash2 size={12} /> Delete / Block
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Video / Photo Preview Modal */}
      <VideoPreviewModal 
        video={previewVideo}
        isOpen={Boolean(previewVideo)}
        onClose={() => setPreviewVideo(null)}
        showToast={showToast}
        onVideoDeleted={(id) => {
          setMediaByCollection((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((k) => {
              next[k] = next[k].filter((i) => i.docId !== id && i.id !== id);
            });
            return next;
          });
          setPreviewVideo(null);
        }}
      />

      {/* Add Video Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900">Add New Video Document</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddVideo} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Video ID</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. VID-101"
                  value={newVideoId}
                  onChange={(e) => setNewVideoId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Uploader User ID</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. USR-9021"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Video Caption</label>
                <input 
                  type="text" 
                  placeholder="e.g. Guwahati Sunset Reel #assam"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Initial Views</label>
                  <input 
                    type="number" 
                    value={newViews}
                    onChange={(e) => setNewViews(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Initial Likes</label>
                  <input 
                    type="number" 
                    value={newLikes}
                    onChange={(e) => setNewLikes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Thumbnail URL</label>
                <input 
                  type="url" 
                  placeholder="https://..."
                  value={newThumb}
                  onChange={(e) => setNewThumb(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-xs"
                >
                  Save Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. MONETIZATION PAGE COMPONENT (/admin/monetization)
// ==========================================
export const MonetizationPage = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUserForModal, setSelectedUserForModal] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    setLoading(true);
    // 1. Listen to monetization_requests (if present in Firestore)
    const unsubReqs = onSnapshot(
      query(collection(db, 'monetization_requests')),
      (snapshot) => {
        const data = snapshot.docs.map(docSnap => ({ 
          ...docSnap.data(),
          id: docSnap.id,
          fromUserDoc: false
        }));
        setRequests(data);
        setLoading(false);
        setError(null);
      },
      () => {
        setLoading(false);
      }
    );

    // 2. Listen to users for profile mapping and user-level monetizationStatus
    const unsubUsers = onSnapshot(
      query(collection(db, 'users')),
      (snapshot) => {
        const normalizedUsers = snapshot.docs.map((d) => normalizeUserDoc(d));
        setUsersMap(buildUsersLookupMap(normalizedUsers));
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'users');
        setLoading(false);
      }
    );

    return () => {
      unsubReqs();
      unsubUsers();
    };
  }, []);

  // Combine explicit monetization_requests with any users who have an active/pending/rejected monetizationStatus
  const combinedRequests = React.useMemo(() => {
    if (requests.length > 0) return requests;
    const seen = new Set<string>();
    const derived: any[] = [];
    Object.values(usersMap).forEach((u: any) => {
      if (!u?.docId || seen.has(u.docId)) return;
      seen.add(u.docId);
      const rawStatus = String(u.monetizationStatus || '').trim();
      if (!rawStatus || rawStatus.toLowerCase() === 'not applied' || rawStatus.toLowerCase() === 'none') {
        return;
      }
      const normalizedStatus =
        rawStatus.toLowerCase() === 'approved' || rawStatus.toLowerCase() === 'active'
          ? 'Approved'
          : rawStatus.toLowerCase() === 'rejected'
          ? 'Rejected'
          : 'Pending';
      derived.push({
        id: u.docId,
        userId: u.docId,
        followersCount: u.followersCount || 0,
        totalViews: u.videoViewsCount || 0,
        earnings: parseFloat(String(u.totalEarnings || '0').replace(/[^0-9.]/g, '')) || 0,
        status: normalizedStatus,
        fromUserDoc: true,
      });
    });
    return derived;
  }, [requests, usersMap]);

  // Update Status in Firestore (Approve / Reject) & update user isMonetized
  const handleUpdateStatus = async (reqId: string, reqData: any, targetStatus: 'Approved' | 'Rejected') => {
    try {
      // 1. Update monetization request doc if it came from monetization_requests
      if (!reqData.fromUserDoc) {
        await updateDoc(doc(db, 'monetization_requests', reqId), {
          status: targetStatus,
          reviewedAt: serverTimestamp()
        });
      }

      // 2. Update user monetization status in users collection
      const targetUserId = reqData.userId;
      if (targetUserId && usersMap[targetUserId]) {
        try {
          await updateDoc(doc(db, 'users', usersMap[targetUserId].docId || usersMap[targetUserId].id), {
            monetizationStatus: targetStatus,
            monetization: targetStatus === 'Approved' ? 'Active' : 'Rejected',
            isMonetized: targetStatus === 'Approved',
            updatedAt: serverTimestamp()
          });
        } catch (e) {
          // ignore if doc id differs
        }
      }

      // 3. Send app notification (if collection is allowed in Rules)
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: targetUserId,
          title: targetStatus === 'Approved' ? 'Monetization Approved! 🎉' : 'Monetization Request Update',
          message: targetStatus === 'Approved' 
            ? 'Congratulations! Your creator payout monetization application has been approved.'
            : 'Your monetization request was reviewed. Please review guidelines and re-apply.',
          createdAt: serverTimestamp(),
          read: false,
          type: 'monetization_update'
        });
      } catch {
        // ignore if notifications rules are not added yet
      }

      // Local Simulator notification sync
      const notifsKey = 'yousnap_user_app_notifications';
      const existing = JSON.parse(localStorage.getItem(notifsKey) || '[]');
      const newNotif = {
        id: `NTF-MON-${Date.now()}`,
        userId: targetUserId,
        title: targetStatus === 'Approved' ? 'Monetization Approved! 🎉' : 'Monetization Request Update',
        message: targetStatus === 'Approved' ? 'Your creator payout monetization is now Active.' : 'Monetization application was rejected.',
        createdAt: new Date().toISOString(),
        timestamp: 'Just now',
        category: 'Monetization'
      };
      localStorage.setItem(notifsKey, JSON.stringify([newNotif, ...existing]));
      window.dispatchEvent(new Event('yousnap_user_notification_sent'));

      showToast(`Request ${targetStatus === 'Approved' ? 'approved' : 'rejected'} successfully!`);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `monetization_requests/${reqId}`);
      showToast('Error updating status — check Firestore Rules.');
    }
  };

  const filteredRequests = combinedRequests.filter(r => {
    if (statusFilter === 'All') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="text-emerald-600" /> Monetization Applications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time creator payout requests from Cloud Firestore <code className="text-emerald-600 font-bold">/monetization_requests</code> collection
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Applications</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{requests.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-amber-500 uppercase">Pending Review</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {requests.filter(r => r.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-emerald-500 uppercase">Approved Creators</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {requests.filter(r => r.status === 'Approved').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-rose-500 uppercase">Rejected</p>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {requests.filter(r => r.status === 'Rejected').length}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500">Filter By Status:</p>
        <div className="flex items-center gap-2">
          {['All', 'Pending', 'Approved', 'Rejected'].map(st => (
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

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700">
          <AlertTriangle size={18} className="shrink-0 text-rose-600" />
          <div>
            <p className="font-bold">Firestore Error Notice</p>
            <p className="text-[11px] text-rose-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="animate-spin mx-auto text-emerald-500 mb-2" size={24} />
            <p className="text-xs font-bold text-slate-600">Connecting to Firestore & loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-16 text-center">
            <DollarSign className="mx-auto text-slate-300 mb-3" size={40} />
            <h3 className="text-sm font-bold text-slate-700">No requests found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are currently no documents matching your query in the Firestore <code className="text-emerald-600">monetization_requests</code> collection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-black">Creator Profile</th>
                  <th className="py-3 px-4 font-black">Followers Count</th>
                  <th className="py-3 px-4 font-black">Total Views</th>
                  <th className="py-3 px-4 font-black">Calculated Earnings</th>
                  <th className="py-3 px-4 font-black">Request Status</th>
                  <th className="py-3 px-4 font-black text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map(req => {
                  const u = usersMap[req.userId] || {
                    id: req.userId,
                    displayName: 'Creator User',
                    username: 'creator_user',
                    avatar: ''
                  };

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div 
                          onClick={() => setSelectedUserForModal(u)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <img 
                            src={u.avatar || u.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                            alt={u.displayName || u.name} 
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 group-hover:border-emerald-500 transition shadow-2xs" 
                          />
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-emerald-600 transition text-xs">
                              {u.displayName || u.name || 'Creator'}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              @{u.username || 'user'} • <span className="font-mono text-emerald-600">{req.userId}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {(parseInt(req.followersCount) || 0).toLocaleString()} followers
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {(parseInt(req.totalViews) || 0).toLocaleString()} views
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-emerald-600 text-[13px]">
                        ${parseFloat(req.earnings || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          req.status === 'Approved' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : req.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            req.status === 'Approved' ? 'bg-emerald-500' : req.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          {req.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(req.id, req, 'Approved')}
                            disabled={req.status === 'Approved'}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-2xs"
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, req, 'Rejected')}
                            disabled={req.status === 'Rejected'}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-2xs"
                          >
                            <X size={12} /> Reject
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

      {/* User Details Modal when Creator Profile is clicked */}
      <UserDetailsModal 
        user={selectedUserForModal}
        isOpen={Boolean(selectedUserForModal)}
        onClose={() => setSelectedUserForModal(null)}
        showToast={showToast}
      />

      {/* Floating Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
