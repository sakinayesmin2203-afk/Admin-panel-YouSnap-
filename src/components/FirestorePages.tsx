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
  Image as ImageIcon,
  Copy,
  Wallet,
  CreditCard,
  TrendingUp,
  Landmark
} from 'lucide-react';
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
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 group-hover:text-emerald-700 py-1 px-2.5 rounded-lg bg-emerald-50/70 group-hover:bg-emerald-100/70 border border-emerald-200/50 transition">
                        <span>View Details</span>
                        <ArrowUpRight size={13} />
                      </span>
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
          const data = snapshot.docs
            .map((docSnap) => normalizeMediaDoc(docSnap, colName))
            .filter((item) => !item.isDeleted && !isMediaRestricted(item));
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
      await deleteMediaFromFirestore(db, item);
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
const formatUsdAmount = (val: number) => {
  const num = Number(val) || 0;
  if (num > 0 && num < 0.01) return `$${num.toFixed(4)}`;
  return `$${num.toFixed(2)}`;
};

const formatInrAmount = (usdVal: number, rate: number) => {
  const inr = (Number(usdVal) || 0) * (Number(rate) || 85);
  if (inr > 0 && inr < 0.01) return `₹${inr.toFixed(4)}`;
  return `₹${inr.toFixed(2)}`;
};

const extractCreatorPayoutDetails = (u: any) => {
  const payout = u?.payoutDetails || u?.bankDetails || u?.paymentDetails || {};
  const upiId = String(
    u?.upiId || u?.upi || payout?.upiId || payout?.upi || ''
  ).trim();
  const accountHolderName = String(
    u?.accountHolderName || u?.bankAccountHolder || payout?.accountHolderName || payout?.holderName || ''
  ).trim();
  const bankAccount = String(
    u?.bankAccount || u?.accountNumber || u?.bankAccountNumber || payout?.bankAccount || payout?.accountNumber || ''
  ).trim();
  const ifscCode = String(
    u?.ifscCode || u?.ifsc || payout?.ifscCode || payout?.ifsc || ''
  ).trim();
  const bankName = String(
    u?.bankName || payout?.bankName || ''
  ).trim();
  const hasDetails = Boolean(upiId || bankAccount || ifscCode || accountHolderName);
  return { upiId, accountHolderName, bankAccount, ifscCode, bankName, hasDetails };
};

export const MonetizationPage = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const [adEvents, setAdEvents] = useState<any[]>([]);
  const [adEventsError, setAdEventsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUserForModal, setSelectedUserForModal] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [usdToInrRate, setUsdToInrRate] = useState<number>(() => {
    const saved = parseFloat(localStorage.getItem('yousnap_usd_to_inr_rate') || '85');
    return Number.isFinite(saved) && saved > 0 ? saved : 85;
  });

  // Mark as Paid Modal State
  const [payoutTarget, setPayoutTarget] = useState<any | null>(null);
  const [payoutAmountUsdInput, setPayoutAmountUsdInput] = useState<string>('0');
  const [payoutRefInput, setPayoutRefInput] = useState<string>('');
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRateChange = (raw: string) => {
    const parsed = parseFloat(raw);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setUsdToInrRate(parsed);
      localStorage.setItem('yousnap_usd_to_inr_rate', String(parsed));
    }
  };

  useEffect(() => {
    setLoading(true);
    // 1. Listen to monetization_requests (if present in Firestore)
    const unsubReqs = onSnapshot(
      query(collection(db, 'monetization_requests')),
      (snapshot) => {
        const data = snapshot.docs.map(docSnap => {
          const rawData = docSnap.data();
          const rawStatus = String(rawData.status || 'Pending').trim().toLowerCase();
          const normalizedStatus =
            rawStatus === 'approved' || rawStatus === 'active' || rawStatus === 'monetized'
              ? 'Approved'
              : rawStatus === 'rejected' || rawStatus === 'revoked' || rawStatus === 'declined'
              ? 'Rejected'
              : 'Pending';
          return {
            ...rawData,
            id: docSnap.id,
            userId: rawData.userId || rawData.uid || rawData.creatorId || rawData.applicantId || '',
            status: normalizedStatus,
            fromUserDoc: false
          };
        });
        setRequests(data);
        setLoading(false);
        setError(null);
      },
      () => {
        setLoading(false);
      }
    );

    // 2. Listen to users for profile mapping, isMonetized, UPI/Bank details, and paidAmount
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

    // 3. Listen to live /ad_events (AdMob ad_revenue + monetized views)
    const unsubAdEvents = onSnapshot(
      query(collection(db, 'ad_events')),
      (snapshot) => {
        const events = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setAdEvents(events);
        setAdEventsError(null);
      },
      (err: any) => {
        const msg = String(err?.message || 'Permission error reading /ad_events');
        setAdEventsError(msg);
      }
    );

    return () => {
      unsubReqs();
      unsubUsers();
      unsubAdEvents();
    };
  }, []);

  // Merge explicit monetization_requests with any users who explicitly applied / are approved / rejected
  const combinedRequests = React.useMemo(() => {
    const merged: any[] = [...requests];
    const existingUserIds = new Set<string>(
      requests.map((r: any) => String(r.userId || r.uid || '')).filter(Boolean)
    );

    const seenUsers = new Set<string>();
    Object.values(usersMap).forEach((u: any) => {
      if (!u?.docId || seenUsers.has(u.docId)) return;
      seenUsers.add(u.docId);

      // Skip if this user already has a document in monetization_requests
      if (existingUserIds.has(u.docId) || (u.uid && existingUserIds.has(String(u.uid)))) {
        return;
      }

      const appStatus = getUserMonetizationApplicationStatus(u);
      if (!appStatus) return;

      merged.push({
        id: u.docId,
        userId: u.docId,
        followersCount: u.followersCount || 0,
        totalViews: u.videoViewsCount || 0,
        earnings: parseFloat(String(u.totalEarnings || '0').replace(/[^0-9.]/g, '')) || 0,
        status: appStatus,
        fromUserDoc: true,
      });
    });

    return merged;
  }, [requests, usersMap]);

  // Live 60% / 40% AdMob + Monetized View Revenue Calculation (ONLY for isMonetized == true / Approved users)
  const revenueSummary = React.useMemo(() => {
    // Build canonical creator ID mapping for Approved (isMonetized == true) creators
    const approvedCanonicalIds = new Set<string>();
    const aliasToCanonical: Record<string, string> = {};

    Object.values(usersMap).forEach((u: any) => {
      if (!u?.docId) return;
      const isApprovedUser =
        u.isMonetized === true ||
        u.monetizationApproved === true ||
        getUserMonetizationApplicationStatus(u) === 'Approved';

      if (isApprovedUser) {
        approvedCanonicalIds.add(u.docId);
        aliasToCanonical[u.docId] = u.docId;
        if (u.uid) aliasToCanonical[String(u.uid)] = u.docId;
        if (u.id) aliasToCanonical[String(u.id)] = u.docId;
      }
    });

    combinedRequests.forEach((req: any) => {
      if (req.status === 'Approved' && req.userId) {
        const matchedUser = usersMap[req.userId];
        const canonicalId = matchedUser?.docId || String(req.userId);
        approvedCanonicalIds.add(canonicalId);
        aliasToCanonical[String(req.userId)] = canonicalId;
        if (matchedUser?.uid) aliasToCanonical[String(matchedUser.uid)] = canonicalId;
        if (matchedUser?.docId) aliasToCanonical[matchedUser.docId] = canonicalId;
      }
    });

    const viewsByCreator: Record<string, number> = {};
    const directUsdByCreator: Record<string, number> = {};
    let platformFeedPoolUsd = 0;
    let totalApprovedMonetizedViews = 0;
    let totalDirectApprovedUsd = 0;
    let totalAdRevenueEvents = 0;

    adEvents.forEach((ev: any) => {
      const eventType = String(ev.eventType || ev.type || '').trim().toLowerCase();
      const rawCreatorId = String(ev.creatorId || ev.userId || ev.uid || '').trim();
      const canonicalCreatorId = rawCreatorId ? aliasToCanonical[rawCreatorId] : undefined;

      if (eventType === 'view' || eventType === 'monetized_view' || eventType === 'video_view') {
        // Count live monetized views ONLY for Approved (isMonetized == true) creators
        if (canonicalCreatorId && approvedCanonicalIds.has(canonicalCreatorId)) {
          const count = Number(ev.viewsCount ?? ev.count ?? 1) || 1;
          viewsByCreator[canonicalCreatorId] = (viewsByCreator[canonicalCreatorId] || 0) + count;
          totalApprovedMonetizedViews += count;
        }
        return;
      }

      if (eventType === 'ad_revenue' || eventType === 'ad_impression' || eventType === 'revenue') {
        totalAdRevenueEvents += 1;
        const currencyCode = String(ev.currencyCode || ev.currency || 'USD').trim().toUpperCase();
        let amountUsd = 0;

        if (ev.amountUsd !== undefined && ev.amountUsd !== null && !Number.isNaN(Number(ev.amountUsd))) {
          amountUsd = Number(ev.amountUsd) || 0;
        } else if (ev.valueMicros !== undefined && ev.valueMicros !== null) {
          const rawVal = (Number(ev.valueMicros) || 0) / 1_000_000;
          amountUsd = currencyCode === 'INR' ? rawVal / usdToInrRate : rawVal;
        } else if (ev.amount !== undefined && ev.amount !== null) {
          const rawVal = Number(ev.amount) || 0;
          amountUsd = currencyCode === 'INR' ? rawVal / usdToInrRate : rawVal;
        }

        if (amountUsd <= 0) return;

        if (canonicalCreatorId && approvedCanonicalIds.has(canonicalCreatorId)) {
          directUsdByCreator[canonicalCreatorId] = (directUsdByCreator[canonicalCreatorId] || 0) + amountUsd;
          totalDirectApprovedUsd += amountUsd;
        } else {
          // Feed / platform-level / unmatched ad revenue goes to the proportional feed pool
          platformFeedPoolUsd += amountUsd;
        }
      }
    });

    const totalLiveAdMobGrossUsd = totalDirectApprovedUsd + platformFeedPoolUsd;
    const adminPlatform60Usd = totalLiveAdMobGrossUsd * 0.6;

    const perCreator: Record<
      string,
      {
        isApproved: boolean;
        monetizedViews: number;
        viewShareRatio: number;
        directUsd: number;
        feedShareUsd: number;
        gross100Usd: number;
        creatorShare40Usd: number;
        paidAmountUsd: number;
        payableBalanceUsd: number;
      }
    > = {};

    let totalCreators40Usd = 0;
    let totalPaidOutUsd = 0;
    let totalPayableBalanceUsd = 0;

    approvedCanonicalIds.forEach((canonicalId) => {
      const u = usersMap[canonicalId] || {};
      const monetizedViews = viewsByCreator[canonicalId] || 0;
      const viewShareRatio =
        totalApprovedMonetizedViews > 0 ? monetizedViews / totalApprovedMonetizedViews : 0;
      const directUsd = directUsdByCreator[canonicalId] || 0;
      const feedShareUsd = platformFeedPoolUsd * viewShareRatio;
      const gross100Usd = directUsd + feedShareUsd;
      const creatorShare40Usd = gross100Usd * 0.4;
      const paidAmountUsd = Math.max(0, Number(u.paidAmountUsd ?? u.paidAmount ?? 0) || 0);
      const payableBalanceUsd = Math.max(0, creatorShare40Usd - paidAmountUsd);

      perCreator[canonicalId] = {
        isApproved: true,
        monetizedViews,
        viewShareRatio,
        directUsd,
        feedShareUsd,
        gross100Usd,
        creatorShare40Usd,
        paidAmountUsd,
        payableBalanceUsd,
      };

      totalCreators40Usd += creatorShare40Usd;
      totalPaidOutUsd += paidAmountUsd;
      totalPayableBalanceUsd += payableBalanceUsd;
    });

    const unallocatedFeedPoolUsd =
      totalApprovedMonetizedViews === 0 && platformFeedPoolUsd > 0 ? platformFeedPoolUsd : 0;

    return {
      approvedCanonicalIds,
      aliasToCanonical,
      totalLiveAdMobGrossUsd,
      totalDirectApprovedUsd,
      platformFeedPoolUsd,
      unallocatedFeedPoolUsd,
      adminPlatform60Usd,
      totalCreators40Usd,
      totalPaidOutUsd,
      totalPayableBalanceUsd,
      totalApprovedMonetizedViews,
      totalAdRevenueEvents,
      perCreator,
    };
  }, [adEvents, usersMap, combinedRequests, usdToInrRate]);

  // Update Status in Firestore (Approve / Reject) & update user isMonetized
  const handleUpdateStatus = async (reqId: string, reqData: any, targetStatus: 'Approved' | 'Rejected') => {
    try {
      const targetUserId = reqData.userId || reqData.uid || (reqData.fromUserDoc ? reqId : '');
      const resolvedUserDocId = (targetUserId && usersMap[targetUserId]?.docId) || targetUserId;
      const isApproved = targetStatus === 'Approved';

      // 1. Update monetization_requests doc (or create/merge for user-doc-only applications so both collections stay synced)
      if (!reqData.fromUserDoc) {
        await updateDoc(doc(db, 'monetization_requests', reqId), {
          status: targetStatus,
          reviewedAt: serverTimestamp()
        });
      } else if (resolvedUserDocId) {
        await setDoc(doc(db, 'monetization_requests', resolvedUserDocId), {
          userId: resolvedUserDocId,
          followersCount: reqData.followersCount || 0,
          totalViews: reqData.totalViews || 0,
          earnings: reqData.earnings || 0,
          status: targetStatus,
          reviewedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        }, { merge: true });
      }

      // Also sync any duplicate pending docs in monetization_requests for this user
      if (targetUserId) {
        const otherMatchingReqs = requests.filter(
          (r) => r.id !== reqId && (r.userId === targetUserId || r.uid === targetUserId) && r.status !== targetStatus
        );
        await Promise.all(
          otherMatchingReqs.map((r) =>
            updateDoc(doc(db, 'monetization_requests', r.id), {
              status: targetStatus,
              reviewedAt: serverTimestamp(),
            }).catch(() => {})
          )
        );
      }

      // 2. Update user monetization status in users collection
      const userPayload = {
        monetizationStatus: targetStatus,
        monetization: isApproved ? 'Active' : 'Rejected',
        isMonetized: isApproved,
        monetizationApproved: isApproved,
        monetizationRejected: !isApproved,
        monetizationApplied: false,
        monetizationRequested: false,
        monetizationReviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const matchedUserDocId = targetUserId ? usersMap[targetUserId]?.docId : '';
      if (matchedUserDocId) {
        await updateDoc(doc(db, 'users', matchedUserDocId), userPayload);
      } else if (resolvedUserDocId) {
        await updateDoc(doc(db, 'users', resolvedUserDocId), userPayload).catch(() => {});
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

  // Open Payout Modal
  const openPayoutModal = (req: any, userObj: any, metrics: any) => {
    const balanceUsd = metrics?.payableBalanceUsd || 0;
    setPayoutTarget({ req, user: userObj, metrics });
    setPayoutAmountUsdInput(balanceUsd > 0 ? (balanceUsd < 0.01 ? balanceUsd.toFixed(4) : balanceUsd.toFixed(2)) : '0');
    setPayoutRefInput('');
  };

  // Submit Payout ("Mark as Paid") -> updates paidAmount on users/{uid} + sends app notification
  const handleConfirmPayout = async () => {
    if (!payoutTarget) return;
    const payoutUsd = parseFloat(payoutAmountUsdInput);
    if (!Number.isFinite(payoutUsd) || payoutUsd <= 0) {
      showToast('Please enter a valid payout amount greater than $0.');
      return;
    }

    setPayoutSubmitting(true);
    try {
      const { req, user: u, metrics } = payoutTarget;
      const targetUserId = u?.docId || req?.userId || u?.uid;
      const previousPaidUsd = metrics?.paidAmountUsd || 0;
      const newTotalPaidUsd = Number((previousPaidUsd + payoutUsd).toFixed(6));
      const newTotalPaidInr = Number((newTotalPaidUsd * usdToInrRate).toFixed(2));
      const payoutInr = Number((payoutUsd * usdToInrRate).toFixed(2));
      const refText = payoutRefInput.trim();

      if (targetUserId) {
        await updateDoc(doc(db, 'users', targetUserId), {
          paidAmount: newTotalPaidUsd,
          paidAmountUsd: newTotalPaidUsd,
          paidAmountInr: newTotalPaidInr,
          lastPaidAt: serverTimestamp(),
          lastPayoutAmountUsd: payoutUsd,
          lastPayoutAmountInr: payoutInr,
          lastPayoutRef: refText || null,
          updatedAt: serverTimestamp(),
        });
      }

      const recipientUid = u?.uid || u?.docId || req?.userId || targetUserId;
      const payoutMessage = `Your creator payout of ${formatUsdAmount(payoutUsd)} (₹${payoutInr.toFixed(2)}) has been sent to your saved UPI / Bank account.${refText ? ` Ref: ${refText}` : ''}`;

      try {
        await addDoc(collection(db, 'notifications'), {
          userId: recipientUid,
          title: 'Payout Sent! 💸',
          message: payoutMessage,
          amountUsd: payoutUsd,
          amountInr: payoutInr,
          referenceId: refText || null,
          createdAt: serverTimestamp(),
          read: false,
          type: 'payout_sent',
        });
      } catch {
        // ignore if notifications rules reject write
      }

      // Local Simulator notification sync
      const notifsKey = 'yousnap_user_app_notifications';
      const existing = JSON.parse(localStorage.getItem(notifsKey) || '[]');
      const newNotif = {
        id: `NTF-PAY-${Date.now()}`,
        userId: recipientUid,
        title: 'Payout Sent! 💸',
        message: payoutMessage,
        createdAt: new Date().toISOString(),
        timestamp: 'Just now',
        category: 'Payout',
      };
      localStorage.setItem(notifsKey, JSON.stringify([newNotif, ...existing]));
      window.dispatchEvent(new Event('yousnap_user_notification_sent'));

      showToast(`Marked ${formatUsdAmount(payoutUsd)} (₹${payoutInr.toFixed(2)}) as Paid & notified creator!`);
      setPayoutTarget(null);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${payoutTarget?.user?.docId || 'payout'}`);
      showToast('Failed to record payout — check Firestore Rules.');
    } finally {
      setPayoutSubmitting(false);
    }
  };

  const handleCopyText = (label: string, value: string) => {
    if (!value) return;
    navigator.clipboard?.writeText(value);
    showToast(`${label} copied: ${value}`);
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
            <DollarSign className="text-emerald-600" /> Monetization & Live AdMob Revenue Share (60% / 40%)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Live <code className="text-emerald-600 font-bold">/ad_events</code> AdMob income & monetized views — 60% Platform share & 40% Creator share (Approved users only)
          </p>
        </div>

        {/* USD to INR Exchange Rate Control */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">1 USD =</span>
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
            <span className="text-xs font-black text-emerald-600">₹</span>
            <input
              type="number"
              min="1"
              step="0.5"
              value={usdToInrRate}
              onChange={(e) => handleRateChange(e.target.value)}
              aria-label="USD to INR Rate"
              className="w-14 bg-transparent text-xs font-black text-slate-900 focus:outline-none text-right"
            />
          </div>
        </div>
      </div>

      {/* Live 60% / 40% Revenue Sharing Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Platform Revenue (My 60%)</p>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black mt-1.5 font-mono">
            {formatUsdAmount(revenueSummary.adminPlatform60Usd)}
          </p>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-300">
            <span className="font-bold text-emerald-300">
              {formatInrAmount(revenueSummary.adminPlatform60Usd, usdToInrRate)}
            </span>
            <span className="text-slate-400">
              100% Gross: {formatUsdAmount(revenueSummary.totalLiveAdMobGrossUsd)}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Creators Share (40% Pool)</p>
            <Wallet size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1.5 font-mono">
            {formatUsdAmount(revenueSummary.totalCreators40Usd)}
          </p>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="font-bold text-emerald-700">
              {formatInrAmount(revenueSummary.totalCreators40Usd, usdToInrRate)}
            </span>
            <span className="font-bold text-amber-600">
              Due: {formatUsdAmount(revenueSummary.totalPayableBalanceUsd)}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Live Monetized Views</p>
            <Eye size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1.5">
            {revenueSummary.totalApprovedMonetizedViews.toLocaleString()}
          </p>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
            <span>Approved creators only</span>
            <span className="font-semibold text-slate-600">{revenueSummary.totalAdRevenueEvents} Ad Events</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Creator Applications</p>
          <div className="flex items-baseline gap-3 mt-1.5">
            <p className="text-2xl font-black text-emerald-600">
              {combinedRequests.filter(r => r.status === 'Approved').length}
            </p>
            <span className="text-xs font-bold text-slate-500">Approved</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-[11px] font-bold">
            <span className="text-amber-600">
              {combinedRequests.filter(r => r.status === 'Pending').length} Pending
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-rose-600">
              {combinedRequests.filter(r => r.status === 'Rejected').length} Rejected
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">
              Paid: {formatUsdAmount(revenueSummary.totalPaidOutUsd)}
            </span>
          </div>
        </div>
      </div>

      {/* Warning if /ad_events Firestore rules are not yet added or unallocated feed pool exists */}
      {adEventsError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-800">
          <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-bold">Live /ad_events Listener Notice</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Could not read <code className="font-mono font-bold">/ad_events</code> ({adEventsError}). Make sure the <code className="font-mono font-bold">/ad_events</code> Firestore Rule is published in Firebase Console so live AdMob income &amp; monetized views load here.
            </p>
          </div>
        </div>
      )}

      {revenueSummary.unallocatedFeedPoolUsd > 0 && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-xs text-blue-800">
          <Sparkles size={16} className="shrink-0 text-blue-600" />
          <p className="text-[11px]">
            <span className="font-bold">{formatUsdAmount(revenueSummary.unallocatedFeedPoolUsd)}</span> ({formatInrAmount(revenueSummary.unallocatedFeedPoolUsd, usdToInrRate)}) in feed AdMob revenue is waiting in the pool and will automatically split 40% across Approved creators as soon as live monetized views arrive.
          </p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
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
            <p className="text-xs font-bold text-slate-600">Connecting to Firestore & loading live AdMob data...</p>
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
                  <th className="py-3 px-4 font-black">Live Monetized Views</th>
                  <th className="py-3 px-4 font-black">Calculated Earnings (40%)</th>
                  <th className="py-3 px-4 font-black">UPI / Bank &amp; Balance</th>
                  <th className="py-3 px-4 font-black">Status</th>
                  <th className="py-3 px-4 font-black text-right">Actions &amp; Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map(req => {
                  const u = usersMap[req.userId] || {
                    docId: req.userId,
                    id: req.userId,
                    displayName: 'Creator User',
                    username: 'creator_user',
                    avatar: ''
                  };
                  const canonicalId = u.docId || revenueSummary.aliasToCanonical[req.userId] || req.userId;
                  const metrics = revenueSummary.perCreator[canonicalId];
                  const isApprovedCreator = req.status === 'Approved' || Boolean(metrics?.isApproved);
                  const payoutInfo = extractCreatorPayoutDetails(u);

                  const liveMonetizedViews = isApprovedCreator ? (metrics?.monetizedViews || 0) : 0;
                  const profileTotalViews = parseInt(req.totalViews ?? u.videoViewsCount ?? 0) || 0;
                  const share40Usd = isApprovedCreator ? (metrics?.creatorShare40Usd || 0) : 0;
                  const gross100Usd = isApprovedCreator ? (metrics?.gross100Usd || 0) : 0;
                  const paidUsd = isApprovedCreator ? (metrics?.paidAmountUsd || 0) : 0;
                  const balanceDueUsd = isApprovedCreator ? (metrics?.payableBalanceUsd || 0) : 0;

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition align-top">
                      <td className="py-3.5 px-4">
                        <div 
                          onClick={() => setSelectedUserForModal(u)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          {u.avatar || u.photoURL ? (
                            <img 
                              src={u.avatar || u.photoURL} 
                              alt={u.displayName || u.name} 
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 group-hover:border-emerald-500 transition shadow-2xs shrink-0" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center border border-emerald-200 shrink-0">
                              {(u.displayName || u.name || 'C').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-emerald-600 transition text-xs">
                              {u.displayName || u.name || 'Creator'}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              @{u.username || 'user'} • {(parseInt(req.followersCount ?? u.followersCount ?? 0) || 0).toLocaleString()} followers
                            </p>
                            <p className="text-[10px] font-mono text-slate-400">{req.userId}</p>
                          </div>
                        </div>
                      </td>

                      {/* Live Monetized Views */}
                      <td className="py-3.5 px-4">
                        {isApprovedCreator ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-slate-900 text-xs">
                                {liveMonetizedViews.toLocaleString()}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase">
                                Live
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Profile views: {profileTotalViews.toLocaleString()}
                            </p>
                            {revenueSummary.totalApprovedMonetizedViews > 0 && (
                              <p className="text-[10px] font-semibold text-indigo-600 mt-0.5">
                                {((metrics?.viewShareRatio || 0) * 100).toFixed(1)}% feed share
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="font-bold text-slate-400">0 live views</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Profile views: {profileTotalViews.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Calculated Earnings (Direct 40% Creator Share in USD + INR) */}
                      <td className="py-3.5 px-4">
                        {isApprovedCreator ? (
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-mono font-black text-emerald-600 text-sm">
                                {formatUsdAmount(share40Usd)}
                              </span>
                              <span className="font-mono font-bold text-slate-700 text-xs">
                                ({formatInrAmount(share40Usd, usdToInrRate)})
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              100% Gross: <span className="font-mono font-semibold">{formatUsdAmount(gross100Usd)}</span>
                            </p>
                            {gross100Usd > 0 && (
                              <p className="text-[9px] text-slate-400">
                                Direct {formatUsdAmount(metrics?.directUsd || 0)} + Feed {formatUsdAmount(metrics?.feedShareUsd || 0)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="font-mono font-bold text-slate-400 text-xs">$0.00 (₹0.00)</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Approved only</p>
                          </div>
                        )}
                      </td>

                      {/* UPI / Bank Details & Remaining Balance */}
                      <td className="py-3.5 px-4 max-w-[230px]">
                        <div className="space-y-1">
                          {payoutInfo.hasDetails ? (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 space-y-0.5">
                              {payoutInfo.upiId && (
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-bold text-slate-700 truncate flex items-center gap-1">
                                    <CreditCard size={10} className="text-emerald-600 shrink-0" />
                                    {payoutInfo.upiId}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyText('UPI ID', payoutInfo.upiId)}
                                    className="text-slate-400 hover:text-emerald-600 p-0.5 shrink-0"
                                    title="Copy UPI ID"
                                  >
                                    <Copy size={11} />
                                  </button>
                                </div>
                              )}
                              {payoutInfo.bankAccount && (
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] text-slate-600 font-mono truncate flex items-center gap-1">
                                    <Landmark size={10} className="text-slate-500 shrink-0" />
                                    {payoutInfo.bankAccount}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyText('Account No', payoutInfo.bankAccount)}
                                    className="text-slate-400 hover:text-emerald-600 p-0.5 shrink-0"
                                    title="Copy Account Number"
                                  >
                                    <Copy size={11} />
                                  </button>
                                </div>
                              )}
                              {(payoutInfo.ifscCode || payoutInfo.accountHolderName) && (
                                <p className="text-[9px] text-slate-500 truncate">
                                  {[payoutInfo.accountHolderName, payoutInfo.ifscCode].filter(Boolean).join(' • ')}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-400 italic">No UPI / Bank saved yet</p>
                          )}

                          {isApprovedCreator && (
                            <div className="flex items-center justify-between text-[10px] pt-0.5">
                              <span className="text-slate-500">
                                Paid: <span className="font-mono font-semibold text-slate-700">{formatUsdAmount(paidUsd)}</span>
                              </span>
                              <span className={`font-mono font-black ${balanceDueUsd > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                Due: {formatUsdAmount(balanceDueUsd)} ({formatInrAmount(balanceDueUsd, usdToInrRate)})
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Request Status */}
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

                      {/* Approval & Mark as Paid Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          {isApprovedCreator && (
                            <button
                              onClick={() => openPayoutModal(req, u, metrics)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-2xs ${
                                balanceDueUsd > 0
                                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              <Wallet size={12} /> Mark as Paid
                            </button>
                          )}
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

      {/* Mark as Paid Confirmation Modal */}
      {payoutTarget && (() => {
        const { user: u, metrics } = payoutTarget;
        const payoutInfo = extractCreatorPayoutDetails(u);
        const parsedUsd = parseFloat(payoutAmountUsdInput) || 0;
        const parsedInr = parsedUsd * usdToInrRate;
        return (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Record Creator Payout</h3>
                    <p className="text-[11px] text-slate-500">
                      {u.displayName || u.name || 'Creator'} (@{u.username || 'user'})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPayoutTarget(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Saved UPI / Bank Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5 text-xs">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Saved UPI / Bank Details</p>
                {payoutInfo.hasDetails ? (
                  <>
                    {payoutInfo.upiId && (
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">UPI: {payoutInfo.upiId}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText('UPI ID', payoutInfo.upiId)}
                          className="text-emerald-600 hover:underline text-[11px] font-bold flex items-center gap-1"
                        >
                          <Copy size={11} /> Copy
                        </button>
                      </div>
                    )}
                    {payoutInfo.bankAccount && (
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-slate-700">A/C: {payoutInfo.bankAccount}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText('Account No', payoutInfo.bankAccount)}
                          className="text-emerald-600 hover:underline text-[11px] font-bold flex items-center gap-1"
                        >
                          <Copy size={11} /> Copy
                        </button>
                      </div>
                    )}
                    {(payoutInfo.accountHolderName || payoutInfo.ifscCode || payoutInfo.bankName) && (
                      <p className="text-[11px] text-slate-500">
                        {[payoutInfo.accountHolderName, payoutInfo.bankName, payoutInfo.ifscCode].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-[11px] text-amber-600 font-semibold">
                    Creator has not saved UPI / Bank details yet.
                  </p>
                )}
              </div>

              {/* Earnings Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">40% Earned</p>
                  <p className="text-xs font-black font-mono text-slate-900 mt-0.5">
                    {formatUsdAmount(metrics?.creatorShare40Usd || 0)}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {formatInrAmount(metrics?.creatorShare40Usd || 0, usdToInrRate)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Already Paid</p>
                  <p className="text-xs font-black font-mono text-slate-700 mt-0.5">
                    {formatUsdAmount(metrics?.paidAmountUsd || 0)}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {formatInrAmount(metrics?.paidAmountUsd || 0, usdToInrRate)}
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-200">
                  <p className="text-[10px] text-emerald-700 font-bold uppercase">Balance Due</p>
                  <p className="text-xs font-black font-mono text-emerald-700 mt-0.5">
                    {formatUsdAmount(metrics?.payableBalanceUsd || 0)}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-bold">
                    {formatInrAmount(metrics?.payableBalanceUsd || 0, usdToInrRate)}
                  </p>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Payout Amount (USD)</label>
                    <span className="text-xs font-black text-emerald-600">
                      ≈ ₹{parsedInr.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={payoutAmountUsdInput}
                    onChange={(e) => setPayoutAmountUsdInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Transaction / UTR Reference (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UPI Ref 4321987654"
                    value={payoutRefInput}
                    onChange={(e) => setPayoutRefInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayoutTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={payoutSubmitting || parsedUsd <= 0}
                  onClick={handleConfirmPayout}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-sm flex items-center gap-1.5"
                >
                  {payoutSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Confirm &amp; Mark as Paid
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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

