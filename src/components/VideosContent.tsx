import { useState } from 'react';
import { 
  Video, 
  Image as ImageIcon, 
  Play, 
  Eye, 
  Heart, 
  MessageSquare, 
  AlertTriangle, 
  Trash2, 
  X, 
  Search, 
  CheckCircle2, 
  ShieldAlert, 
  Send,
  Film,
  ArrowLeft,
  Users as UsersIcon,
  ChevronRight,
  Sparkles,
  Check
} from 'lucide-react';

export interface MediaItem {
  id: string;
  userId: string;
  userName: string;
  username: string;
  userAvatar: string;
  title: string;
  type: 'Video' | 'Photo';
  thumbnail: string;
  duration?: string;
  views: string;
  likes: string;
  comments: string;
  uploadDate: string;
  category: string;
  status: 'Active' | 'Flagged' | 'Warning';
}

const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'media-1',
    userId: 'USR-9021',
    userName: 'Sakin Yesmin',
    username: 'sakin_y',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    title: 'Guwahati Sunset Cruise Vlog',
    type: 'Video',
    thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80',
    duration: '3:45',
    views: '24.5K',
    likes: '4.2K',
    comments: '312',
    uploadDate: 'Yesterday',
    category: 'Vlogs',
    status: 'Active'
  },
  {
    id: 'media-2',
    userId: 'USR-9021',
    userName: 'Sakin Yesmin',
    username: 'sakin_y',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    title: 'Brahmaputra River Bank Morning Photography',
    type: 'Photo',
    thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&auto=format&fit=crop&q=80',
    views: '12.1K',
    likes: '2.8K',
    comments: '145',
    uploadDate: '2 days ago',
    category: 'Photography',
    status: 'Active'
  },
  {
    id: 'media-3',
    userId: 'USR-8842',
    userName: 'John Doe',
    username: 'john_creator',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    title: 'iPhone 18 Pro Max Honest Review',
    type: 'Video',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    duration: '8:10',
    views: '9.4K',
    likes: '1.5K',
    comments: '89',
    uploadDate: '4 days ago',
    category: 'Tutorials',
    status: 'Warning'
  },
  {
    id: 'media-4',
    userId: 'USR-6520',
    userName: 'Rahul Sharma',
    username: 'rahul_official',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    title: 'Monsoon EDM Live Set 2026',
    type: 'Video',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    duration: '5:30',
    views: '52.1K',
    likes: '8.9K',
    comments: '620',
    uploadDate: '5 days ago',
    category: 'Music',
    status: 'Active'
  },
  {
    id: 'media-5',
    userId: 'USR-6520',
    userName: 'Rahul Sharma',
    username: 'rahul_official',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    title: 'Backstage Studio Setup & Synthesizers',
    type: 'Photo',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
    views: '19.8K',
    likes: '3.4K',
    comments: '210',
    uploadDate: '1 week ago',
    category: 'Music',
    status: 'Active'
  }
];

const DIRECTORY_USERS = [
  { id: 'USR-9021', name: 'Sakin Yesmin', username: 'sakin_y', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: 'Active' as const, role: 'Creator' },
  { id: 'USR-8842', name: 'John Doe', username: 'john_creator', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', status: 'Suspended' as const, role: 'Creator' },
  { id: 'USR-7619', name: 'Jane Smith', username: 'jane_smith', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', status: 'Banned' as const, role: 'Viewer' },
  { id: 'USR-6520', name: 'Rahul Sharma', username: 'rahul_official', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', status: 'Active' as const, role: 'Creator' }
];

export default function VideosContent() {
  const [mediaList, setMediaList] = useState<MediaItem[]>(INITIAL_MEDIA_ITEMS);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [warningModalMedia, setWarningModalMedia] = useState<MediaItem | null>(null);
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
  const [warningReason, setWarningReason] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Algorithmic Viral Boost configurations per media ID
  const [videoBoosts, setVideoBoosts] = useState<Record<string, { isViralBoosted: boolean, boostTarget: string, boostDuration: string }>>({});

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4500);
  };

  const handleFlagWarning = () => {
    if (!warningModalMedia) return;
    if (!warningReason.trim()) {
      alert('Please enter a warning reason.');
      return;
    }

    setMediaList(prev => prev.map(m => m.id === warningModalMedia.id ? { ...m, status: 'Warning' } : m));
    showToast(`Warning notice sent to @${warningModalMedia.username} regarding "${warningModalMedia.title}"`);
    setWarningModalMedia(null);
    setWarningReason('');
  };

  const handleConfirmPermanentDelete = () => {
    if (!mediaToDelete) return;
    
    const target = mediaToDelete;
    setMediaList(prev => prev.filter(m => m.id !== target.id));
    
    if (previewMedia?.id === target.id) {
      setPreviewMedia(null);
    }
    
    showToast("Video deleted successfully!");
    setMediaToDelete(null);
  };

  // Filter users for directory grid
  const filteredDirectoryUsers = DIRECTORY_USERS.filter(u => 
    u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.id.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const activeSelectedUser = DIRECTORY_USERS.find(u => u.id === selectedUserId);
  const userSpecificMedia = mediaList.filter(m => m.userId === selectedUserId);

  return (
    <div className="p-6 relative space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-bounce">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">System Action Completed</p>
            <p className="text-sm font-bold text-slate-100">{toastMsg}</p>
          </div>
        </div>
      )}

      {/* CONDITIONAL SCREEN 1: ALL USERS DIRECTORY GRID */}
      {selectedUserId === null ? (
        <>
          {/* Header */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <Video className="text-emerald-600" size={26} /> Videos & Media Management
              </h1>
              <p className="text-xs text-slate-500 mt-1">Select a user profile below to view and moderate their uploaded photos and videos</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600">
              <UsersIcon size={16} className="text-emerald-600" />
              <span>{DIRECTORY_USERS.length} Directory Creators</span>
            </div>
          </div>

          {/* User Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search creator by Name, @username, or User ID (e.g. USR-9021)..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>

          {/* All Users Directory Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDirectoryUsers.length === 0 ? (
              <div className="col-span-full py-16 bg-white rounded-3xl border border-slate-100 text-center text-slate-400">
                <UsersIcon size={36} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No users found matching your search</p>
              </div>
            ) : (
              filteredDirectoryUsers.map((user) => {
                const uploadCount = mediaList.filter(m => m.userId === user.id).length;
                const videoCount = mediaList.filter(m => m.userId === user.id && m.type === 'Video').length;
                const photoCount = mediaList.filter(m => m.userId === user.id && m.type === 'Photo').length;

                return (
                  <div 
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition"></div>

                    <div>
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-md group-hover:scale-105 transition" 
                        />
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          user.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                          user.status === 'Suspended' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {user.status}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-600 transition truncate">{user.name}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">@{user.username}</p>
                      <p className="text-[11px] text-emerald-600 font-bold mt-1">ID: {user.id}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-slate-400 font-semibold uppercase">Uploaded Media</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">
                          {videoCount} Videos, {photoCount} Photos
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 flex items-center justify-center transition shadow-xs">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* CONDITIONAL SCREEN 2: DEDICATED USER MEDIA GALLERY */
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top Back & Profile Summary Bar */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <button 
              onClick={() => setSelectedUserId(null)}
              className="flex items-center gap-2 text-slate-700 hover:text-emerald-600 font-bold text-sm transition"
            >
              <ArrowLeft size={18} />
              <span>← Back to All Users Directory</span>
            </button>

            {activeSelectedUser && (
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 w-full sm:w-auto">
                <img src={activeSelectedUser.avatar} alt={activeSelectedUser.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs text-slate-900">{activeSelectedUser.name}</p>
                    <span className="text-[10px] text-slate-500 font-mono">({activeSelectedUser.id})</span>
                  </div>
                  <p className="text-[11px] text-slate-500">@{activeSelectedUser.username} • {userSpecificMedia.length} Uploads</p>
                </div>
              </div>
            )}
          </div>

          {/* User Media Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userSpecificMedia.length === 0 ? (
              <div className="col-span-full py-20 bg-white rounded-3xl border border-slate-100 text-center text-slate-400">
                <Film size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No media uploaded by this user yet.</p>
              </div>
            ) : (
              userSpecificMedia.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col group">
                  
                  {/* Thumbnail / Preview */}
                  <div 
                    className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer"
                    onClick={() => setPreviewMedia(item)}
                  >
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    
                    {item.type === 'Video' ? (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition">
                        <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                          <Play size={20} className="fill-white ml-0.5" />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <span className="px-3 py-1 bg-black/70 text-white rounded-xl text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5">
                          <ImageIcon size={14} /> View Photo
                        </span>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase shadow-sm ${
                        item.type === 'Video' ? 'bg-indigo-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {item.type}
                      </span>
                      {item.duration && (
                        <span className="bg-black/80 text-white text-[10px] font-mono px-2 py-1 rounded-xl backdrop-blur-xs">
                          {item.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Uploaded {item.uploadDate} • <span className="text-emerald-600 font-semibold">{item.category}</span></p>
                    </div>

                    {/* Engagement Stats */}
                    <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="flex items-center gap-1 font-medium"><Eye size={13} className="text-slate-400" /> {item.views}</span>
                      <span className="flex items-center gap-1 font-medium"><Heart size={13} className="text-rose-500 fill-rose-500/20" /> {item.likes}</span>
                      <span className="flex items-center gap-1 font-medium"><MessageSquare size={13} className="text-blue-500" /> {item.comments}</span>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                      <button 
                        onClick={() => setPreviewMedia(item)}
                        className="flex-1 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Eye size={14} /> Preview
                      </button>
                      <button 
                        onClick={() => setWarningModalMedia(item)}
                        title="Flag / Add Warning"
                        className="p-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl transition"
                      >
                        <AlertTriangle size={15} />
                      </button>
                      <button 
                        onClick={() => setMediaToDelete(item)}
                        title="Delete Media"
                        className="p-2 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Interactive Video / Photo Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${previewMedia.type === 'Video' ? 'bg-indigo-600' : 'bg-amber-600'}`}>
                  {previewMedia.type}
                </span>
                <h3 className="font-bold text-sm truncate max-w-md">{previewMedia.title}</h3>
              </div>
              <button onClick={() => setPreviewMedia(null)} className="text-slate-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden mb-5 shadow-lg flex items-center justify-center">
                {previewMedia.type === 'Video' ? (
                  <video 
                    controls 
                    autoPlay 
                    playsInline 
                    poster={previewMedia.thumbnail}
                    className="w-full h-full object-contain"
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img src={previewMedia.thumbnail} alt={previewMedia.title} className="w-full h-full object-contain" />
                )}
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-3">
                  <img src={previewMedia.userAvatar} alt={previewMedia.userName} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{previewMedia.userName}</p>
                    <p className="text-xs text-slate-500">@{previewMedia.username} • Uploaded {previewMedia.uploadDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                  <span>👁️ {previewMedia.views}</span>
                  <span>❤️ {previewMedia.likes}</span>
                  <span>💬 {previewMedia.comments}</span>
                </div>
              </div>

              {/* Algorithmic Viral Boost Engine Controls */}
              {previewMedia.type === 'Video' && (
                <div className="mb-5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-amber-500 fill-amber-500 animate-pulse" size={18} />
                      <div>
                        <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Algorithmic Viral Boost Engine</p>
                        <p className="text-[10px] text-slate-500">Inject priority boosting, reels recommendation, and trending section visibility</p>
                      </div>
                    </div>

                    {/* Live Status Badge */}
                    {videoBoosts[previewMedia.id]?.isViralBoosted && (
                      <span className="bg-amber-500 text-white font-extrabold px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-wider animate-bounce flex items-center gap-1">
                        🔥 VIRAL BOOST ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Toggle Control Switch */}
                    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                      <span className="text-xs font-bold text-slate-700">Activate Viral Feed Booster</span>
                      <button 
                        type="button"
                        onClick={() => {
                          const current = videoBoosts[previewMedia.id] || { isViralBoosted: false, boostTarget: 'Top 1 Feed Priority', boostDuration: '24 Hours' };
                          setVideoBoosts(prev => ({
                            ...prev,
                            [previewMedia.id]: {
                              ...current,
                              isViralBoosted: !current.isViralBoosted
                            }
                          }));
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          videoBoosts[previewMedia.id]?.isViralBoosted ? 'bg-amber-500' : 'bg-slate-200'
                        }`}
                      >
                        <span 
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            videoBoosts[previewMedia.id]?.isViralBoosted ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Save Boost Button */}
                    <button 
                      onClick={() => {
                        const config = videoBoosts[previewMedia.id] || { isViralBoosted: false, boostTarget: 'Top 1 Feed Priority', boostDuration: '24 Hours' };
                        if (config.isViralBoosted) {
                          showToast(`🚀 Algorithm Boost successfully saved for "${previewMedia.title}"! Multiplier set to 10.0x.`);
                        } else {
                          showToast(`Boost turned OFF for "${previewMedia.title}". Normal reach applied.`);
                        }
                      }}
                      className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <Check size={14} /> Save Boost Configuration
                    </button>
                  </div>

                  {/* Dropdown Options shown when Enabled */}
                  {videoBoosts[previewMedia.id]?.isViralBoosted && (
                    <div className="grid grid-cols-2 gap-3 mt-3 animate-in fade-in duration-150">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Boost Target</label>
                        <select 
                          value={videoBoosts[previewMedia.id]?.boostTarget || 'Top 1 Feed Priority'}
                          onChange={(e) => {
                            const current = videoBoosts[previewMedia.id] || { isViralBoosted: true, boostTarget: 'Top 1 Feed Priority', boostDuration: '24 Hours' };
                            setVideoBoosts(prev => ({
                              ...prev,
                              [previewMedia.id]: { ...current, boostTarget: e.target.value }
                            }));
                          }}
                          className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-800 outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                        >
                          <option value="Guaranteed 100K+ Views">Guaranteed 100K+ Views</option>
                          <option value="Top 1 Feed Priority">Top 1 Feed Priority</option>
                          <option value="For You Page Placement">For You Page Placement</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Expiration Limit</label>
                        <select 
                          value={videoBoosts[previewMedia.id]?.boostDuration || '24 Hours'}
                          onChange={(e) => {
                            const current = videoBoosts[previewMedia.id] || { isViralBoosted: true, boostTarget: 'Top 1 Feed Priority', boostDuration: '24 Hours' };
                            setVideoBoosts(prev => ({
                              ...prev,
                              [previewMedia.id]: { ...current, boostDuration: e.target.value }
                            }));
                          }}
                          className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-800 outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                        >
                          <option value="24 Hours">24 Hours</option>
                          <option value="48 Hours">48 Hours</option>
                          <option value="Unlimited / Permanent">Unlimited / Permanent</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setWarningModalMedia(previewMedia); setPreviewMedia(null); }}
                    className="px-4 py-2.5 bg-amber-500 text-white font-bold rounded-xl text-xs hover:bg-amber-600 transition flex items-center gap-1.5"
                  >
                    <AlertTriangle size={15} /> Flag / Add Warning
                  </button>
                  <button 
                    onClick={() => setMediaToDelete(previewMedia)}
                    className="px-4 py-2.5 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition flex items-center gap-1.5"
                  >
                    <Trash2 size={15} /> Delete Media
                  </button>
                </div>
                <button 
                  onClick={() => setPreviewMedia(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Reason Modal */}
      {warningModalMedia && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-100">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-base font-bold text-center text-slate-900">Send Warning to @{warningModalMedia.username}</h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Provide violation reason for "{warningModalMedia.title}":
            </p>

            <textarea 
              rows={3}
              placeholder="Enter violation reason (e.g., Copyright, Community guidelines, Spam)..."
              value={warningReason}
              onChange={(e) => setWarningReason(e.target.value)}
              className="w-full mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
            />

            <div className="flex items-center justify-end gap-2 mt-5">
              <button 
                onClick={() => { setWarningModalMedia(null); setWarningReason(''); }}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleFlagWarning}
                className="px-4 py-2 bg-amber-600 text-white font-bold rounded-xl text-xs hover:bg-amber-700 transition flex items-center gap-1.5 shadow-sm"
              >
                <Send size={13} /> Send Warning Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup Modal */}
      {mediaToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <Trash2 size={26} />
            </div>

            <h3 className="text-lg font-extrabold text-center text-slate-900">Confirm Media Deletion</h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed px-2 font-medium">
              Are you sure you want to permanently delete this video from YouSnap for violating platform rules?
            </p>

            {/* Media Item Snapshot */}
            <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
              <img 
                src={mediaToDelete.thumbnail} 
                alt={mediaToDelete.title} 
                className="w-16 h-11 rounded-xl object-cover bg-slate-900 shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{mediaToDelete.title}</p>
                <p className="text-[11px] text-slate-500">by @{mediaToDelete.username} • {mediaToDelete.type}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button 
                onClick={() => setMediaToDelete(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmPermanentDelete}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
