import { useState } from 'react';
import { 
  Headphones, 
  Flag, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Search, 
  Filter, 
  X, 
  Send, 
  AlertTriangle,
  Play,
  Image as ImageIcon,
  Check,
  ShieldAlert,
  UserCheck,
  Ban,
  Film,
  Users,
  Grid,
  Calendar,
  ExternalLink
} from 'lucide-react';

export interface UserProfileData {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: 'Active' | 'Suspended' | 'Banned';
  followers: number;
  following: number;
  totalVideos: number;
  totalPhotos: number;
  bio?: string;
  joinedDate: string;
  uploadedMedia: Array<{
    id: string;
    type: 'Video' | 'Photo';
    title: string;
    thumbnail: string;
    views: string;
  }>;
}

export interface SupportTicket {
  id: string;
  category: 'Reports';
  reporterId: string;
  reporterName: string;
  reporterUsername: string;
  reporterAvatar: string;
  targetUserId: string;
  targetUserName: string;
  targetUsername: string;
  targetUserAvatar: string;
  reportType: 'Video' | 'Photo' | 'Profile';
  subject: string;
  message: string;
  status: 'Pending' | 'Resolved' | 'Dismissed';
  submittedDate: string;
  mediaPreview?: {
    title: string;
    thumbnailUrl: string;
  };
}

// User Database Lookup for Inspection Modal
const USER_DIRECTORY: Record<string, UserProfileData> = {
  'USR-1088': {
    id: 'USR-1088',
    name: 'Vikram Singh',
    username: 'vikram_tech',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    followers: 14200,
    following: 180,
    totalVideos: 12,
    totalPhotos: 8,
    bio: 'Tech reviews, coding tutorials & gadget news in Assam.',
    joinedDate: 'Jun 12, 2026',
    uploadedMedia: [
      {
        id: 'med-v1',
        type: 'Video',
        title: 'Building Fullstack Apps with Gemini AI',
        thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=300&auto=format&fit=crop&q=80',
        views: '18.4K'
      },
      {
        id: 'med-v2',
        type: 'Photo',
        title: 'New Coding Workspace Setup 2026',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&auto=format&fit=crop&q=80',
        views: '5.2K'
      }
    ]
  },
  'USR-5120': {
    id: 'USR-5120',
    name: 'Ananya Das',
    username: 'ananya_comedy',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    followers: 8900,
    following: 210,
    totalVideos: 18,
    totalPhotos: 5,
    bio: 'Standup comedian & funny shorts creator.',
    joinedDate: 'Jul 10, 2026',
    uploadedMedia: [
      {
        id: 'med-a1',
        type: 'Video',
        title: 'Coding vs Real Life Expectations',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&auto=format&fit=crop&q=80',
        views: '42.1K'
      }
    ]
  },
  'USR-8842': {
    id: 'USR-8842',
    name: 'John Doe',
    username: 'john_creator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'Suspended',
    followers: 3420,
    following: 89,
    totalVideos: 12,
    totalPhotos: 2,
    bio: 'Mobile unboxing & review channel.',
    joinedDate: 'Jul 16, 2026',
    uploadedMedia: [
      {
        id: 'med-j1',
        type: 'Video',
        title: 'iPhone 18 Pro Max Honest Review',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
        views: '9.4K'
      }
    ]
  },
  'USR-7619': {
    id: 'USR-7619',
    name: 'Jane Smith',
    username: 'jane_smith',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    followers: 45,
    following: 610,
    totalVideos: 0,
    totalPhotos: 1,
    bio: 'Music lover & video viewer.',
    joinedDate: 'Jul 17, 2026',
    uploadedMedia: []
  },
  'USR-6520': {
    id: 'USR-6520',
    name: 'Rahul Sharma',
    username: 'rahul_official',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    followers: 48200,
    following: 210,
    totalVideos: 64,
    totalPhotos: 28,
    bio: 'Electronic Music Producer & DJ.',
    joinedDate: 'Jul 18, 2026',
    uploadedMedia: [
      {
        id: 'med-r1',
        type: 'Video',
        title: 'Monsoon EDM Live Set 2026',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
        views: '52.1K'
      },
      {
        id: 'med-r2',
        type: 'Photo',
        title: 'Backstage Studio Setup & Synthesizers',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
        views: '19.8K'
      }
    ]
  },
  'USR-4310': {
    id: 'USR-4310',
    name: 'Priya Roy',
    username: 'priya_vlogs',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    followers: 12500,
    following: 140,
    totalVideos: 24,
    totalPhotos: 15,
    bio: 'Exploring Shillong & Northeast nature.',
    joinedDate: 'Aug 01, 2026',
    uploadedMedia: [
      {
        id: 'med-p1',
        type: 'Video',
        title: 'Exploring Shillong Waterfalls in Monsoon',
        thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&auto=format&fit=crop&q=80',
        views: '28.9K'
      }
    ]
  }
};

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-101',
    category: 'Reports',
    reporterId: 'USR-1088',
    reporterName: 'Vikram Singh',
    reporterUsername: 'vikram_tech',
    reporterAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    targetUserId: 'USR-5120',
    targetUserName: 'Ananya Das',
    targetUsername: 'ananya_comedy',
    targetUserAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    reportType: 'Video',
    subject: 'Reported Video: "Coding vs Real Life Expectations"',
    message: 'This video contains uncredited audio tracks and misleading copyright tags.',
    status: 'Pending',
    submittedDate: 'Oct 01, 2026',
    mediaPreview: {
      title: 'Coding vs Real Life Expectations',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'TKT-102',
    category: 'Reports',
    reporterId: 'USR-4310',
    reporterName: 'Priya Roy',
    reporterUsername: 'priya_vlogs',
    reporterAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    targetUserId: 'USR-8842',
    targetUserName: 'John Doe',
    targetUsername: 'john_creator',
    targetUserAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    reportType: 'Profile',
    subject: 'Reported Profile: Spam comments & deceptive bio link',
    message: 'This user is leaving automated spam comments and external phishing links under my videos.',
    status: 'Pending',
    submittedDate: 'Sep 30, 2026'
  },
  {
    id: 'TKT-104',
    category: 'Reports',
    reporterId: 'USR-4310',
    reporterName: 'Priya Roy',
    reporterUsername: 'priya_vlogs',
    reporterAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    targetUserId: 'USR-6520',
    targetUserName: 'Rahul Sharma',
    targetUsername: 'rahul_official',
    targetUserAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    reportType: 'Photo',
    subject: 'Reported Photo: "Backstage Studio Setup"',
    message: 'Copyright complaint regarding studio setup background artwork.',
    status: 'Resolved',
    submittedDate: 'Sep 25, 2026',
    mediaPreview: {
      title: 'Backstage Studio Setup & Synthesizers',
      thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80'
    }
  }
];

export default function SupportHub() {
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [userDirectory, setUserDirectory] = useState<Record<string, UserProfileData>>(USER_DIRECTORY);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Inspection & Detail Modals
  const [inspectedUserId, setInspectedUserId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToastMsg({ title, desc, type });
    setTimeout(() => setToastMsg(null), 4500);
  };

  const handleResolveTicket = (ticket: SupportTicket) => {
    setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'Resolved' } : t));
    showToast('Ticket Resolved', `Support ticket ${ticket.id} has been marked as Resolved.`, 'success');
    if (selectedTicket?.id === ticket.id) setSelectedTicket(null);
  };

  const handleDismissTicket = (ticket: SupportTicket) => {
    setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'Dismissed' } : t));
    showToast('Ticket Dismissed', `Ticket ${ticket.id} has been dismissed.`, 'error');
    if (selectedTicket?.id === ticket.id) setSelectedTicket(null);
  };

  const handleToggleUserSuspension = (userId: string) => {
    setUserDirectory(prev => {
      const current = prev[userId];
      if (!current) return prev;
      const nextStatus = current.status === 'Active' ? 'Suspended' : 'Active';
      showToast(
        nextStatus === 'Suspended' ? 'Account Suspended' : 'Account Reactivated',
        `User @${current.username} status set to ${nextStatus}.`,
        nextStatus === 'Suspended' ? 'warning' : 'success'
      );
      return {
        ...prev,
        [userId]: { ...current, status: nextStatus }
      };
    });
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesCategory = 
      activeCategoryTab === 'All' ||
      (activeCategoryTab === 'Reports' && ticket.category === 'Reports');

    const matchesSearch = 
      ticket.targetUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.targetUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;

    return matchesCategory && matchesSearch && matchesStatus;
  });

  const inspectedUser = inspectedUserId ? userDirectory[inspectedUserId] : null;
  const reportsCount = tickets.filter(t => t.category === 'Reports' && t.status === 'Pending').length;

  return (
    <div className="p-6 relative space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className={`fixed top-6 right-6 z-[90] text-white px-5 py-4 rounded-2xl shadow-2xl border flex items-start gap-3.5 max-w-md animate-in slide-in-from-top-4 duration-300 ${
          toastMsg.type === 'error' ? 'bg-slate-900 border-rose-500/50' :
          toastMsg.type === 'warning' ? 'bg-slate-900 border-amber-500/50' :
          'bg-slate-900 border-emerald-500/50'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
            toastMsg.type === 'error' ? 'bg-rose-500/20 text-rose-400' :
            toastMsg.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
            'bg-emerald-500/20 text-emerald-400'
          }`}>
            {toastMsg.type === 'error' ? <XCircle size={20} /> :
             toastMsg.type === 'warning' ? <AlertTriangle size={20} /> :
             <CheckCircle2 size={20} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-100">{toastMsg.title}</p>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toastMsg.desc}</p>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Page Header Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Headphones className="text-emerald-600" size={26} /> Support & Help Desk Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage content violation reports (photos, videos, profiles) and guidelines enforcement</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-rose-50 text-rose-800 border border-rose-200 px-3.5 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5">
            <Flag size={14} className="text-rose-600" /> {reportsCount} Pending Reports
          </span>
        </div>
      </div>

      {/* TWO MAIN CATEGORIES / TABS */}
      <div className="flex flex-wrap gap-2.5 border-b border-slate-200 pb-3">
        <button 
          onClick={() => setActiveCategoryTab('All')}
          className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 ${
            activeCategoryTab === 'All' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Grid size={15} /> All Support Tickets
        </button>
        <button 
          onClick={() => setActiveCategoryTab('Reports')}
          className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 ${
            activeCategoryTab === 'Reports' ? 'bg-rose-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Flag size={15} /> Reports (Photos, Videos & Profiles)
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
        
        {/* Search & Status Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by reporter name, reported user, ticket ID, or issue..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition" 
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
            <Filter size={15} className="text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 font-semibold">Status:</span>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Resolved">Resolved / Approved</option>
              <option value="Dismissed">Dismissed / Rejected</option>
            </select>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs">
              <tr>
                <th className="p-4">Ticket ID & Category</th>
                <th className="p-4">Reported By (Reporter)</th>
                <th className="p-4">Reported Entity / Target</th>
                <th className="p-4">Issue Message</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Headphones size={32} className="mx-auto mb-2 text-slate-300" />
                    No tickets found matching your selection.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/70 transition">
                    
                    {/* Ticket ID & Category */}
                    <td className="p-4">
                      <p className="font-mono text-xs font-bold text-emerald-600">{ticket.id}</p>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold mt-1 bg-rose-100 text-rose-800 border border-rose-200">
                        <Flag size={10} /> Reports
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">{ticket.submittedDate}</p>
                    </td>

                    {/* CLICKABLE 1: Reported By (Reporter) */}
                    <td className="p-4">
                      <div 
                        onClick={() => setInspectedUserId(ticket.reporterId)}
                        className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 hover:border-emerald-300 transition cursor-pointer group"
                        title="Click to inspect Reporter Profile"
                      >
                        <img 
                          src={ticket.reporterAvatar} 
                          alt={ticket.reporterName} 
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition" 
                        />
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900 text-xs truncate group-hover:text-emerald-600 transition">{ticket.reporterName}</p>
                          <p className="text-[11px] text-slate-500 truncate">@{ticket.reporterUsername}</p>
                          <span className="text-[9px] text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
                            Inspect <ExternalLink size={9} />
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* CLICKABLE 2: Reported Entity / Target (Media or User) */}
                    <td className="p-4">
                      <div 
                        onClick={() => setInspectedUserId(ticket.targetUserId)}
                        className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 hover:border-emerald-300 transition cursor-pointer group"
                        title="Click to inspect Target Profile & Uploads"
                      >
                        {ticket.mediaPreview ? (
                          <div className="relative w-12 h-10 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200">
                            <img src={ticket.mediaPreview.thumbnailUrl} alt={ticket.mediaPreview.title} className="w-full h-full object-cover" />
                            {ticket.reportType === 'Video' && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Play size={10} className="fill-white text-white" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <img src={ticket.targetUserAvatar} alt={ticket.targetUserName} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" />
                        )}

                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900 text-xs truncate group-hover:text-emerald-600 transition">{ticket.targetUserName}</p>
                          <p className="text-[11px] text-slate-500 truncate">@{ticket.targetUsername}</p>
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase mt-0.5 ${
                            ticket.reportType === 'Video' ? 'bg-indigo-100 text-indigo-700' :
                            ticket.reportType === 'Photo' ? 'bg-amber-100 text-amber-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {ticket.reportType} Report
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Issue Subject & Message */}
                    <td className="p-4 max-w-xs">
                      <p className="font-bold text-slate-900 text-xs truncate">{ticket.subject}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">"{ticket.message}"</p>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                        ticket.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {ticket.status === 'Pending' ? '⚠️ Pending' :
                         ticket.status === 'Resolved' ? '✓ Resolved' : '🚫 Dismissed'}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedTicket(ticket)}
                          title="View Details"
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                        >
                          <Eye size={15} />
                        </button>

                        {ticket.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => handleResolveTicket(ticket)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1"
                            >
                              <CheckCircle2 size={13} /> Resolve
                            </button>
                            <button 
                              onClick={() => handleDismissTicket(ticket)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1"
                            >
                              <XCircle size={13} /> Dismiss
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER PROFILE INSPECTION DRAWER / MODAL */}
      {inspectedUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[85] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            
            {/* Inspection Top Bar */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600">
                  User Inspection
                </span>
                <p className="font-mono text-xs text-slate-300">{inspectedUser.id}</p>
              </div>
              <button onClick={() => setInspectedUserId(null)} className="text-slate-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            {/* Inspection Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <img src={inspectedUser.avatar} alt={inspectedUser.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base truncate">{inspectedUser.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      inspectedUser.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                      inspectedUser.status === 'Suspended' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {inspectedUser.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">@{inspectedUser.username}</p>
                  {inspectedUser.bio && <p className="text-xs text-slate-600 mt-1 italic">"{inspectedUser.bio}"</p>}
                </div>
              </div>

              {/* User Stats Grid */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Followers</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">{inspectedUser.followers.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Following</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">{inspectedUser.following}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Videos</p>
                  <p className="text-sm font-extrabold text-indigo-600 mt-0.5">{inspectedUser.totalVideos}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Photos</p>
                  <p className="text-sm font-extrabold text-amber-600 mt-0.5">{inspectedUser.totalPhotos}</p>
                </div>
              </div>

              {/* Uploaded Media Gallery Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Film size={14} className="text-emerald-600" /> Uploaded Media & Content Grid
                </h4>

                {inspectedUser.uploadedMedia.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">No uploaded media items found.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {inspectedUser.uploadedMedia.map((media) => (
                      <div key={media.id} className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 group relative">
                        <div className="relative aspect-video">
                          <img src={media.thumbnail} alt={media.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-black/70 text-white backdrop-blur-xs">
                            {media.type}
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-900 text-white">
                          <p className="text-xs font-bold truncate text-slate-100">{media.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">👁️ {media.views} views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Admin Actions */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-500">Quick Admin Actions:</p>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleToggleUserSuspension(inspectedUser.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                      inspectedUser.status === 'Suspended' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-rose-600 text-white hover:bg-rose-700'
                    }`}
                  >
                    <Ban size={13} /> {inspectedUser.status === 'Suspended' ? 'Reactivate Account' : 'Suspend Account'}
                  </button>
                  <button 
                    onClick={() => {
                      showToast('Warning Sent', `Warning notification sent to @${inspectedUser.username}`, 'warning');
                    }}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
                  >
                    <AlertTriangle size={13} /> Send Warning
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Bottom Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setInspectedUserId(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition"
              >
                Close Inspection
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SUPPORT TICKET DETAILS MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-600">
                  {selectedTicket.category}
                </span>
                <h3 className="font-extrabold text-sm">{selectedTicket.id}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <p className="font-bold text-slate-900 text-sm">{selectedTicket.subject}</p>
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  "{selectedTicket.message}"
                </p>
                {selectedTicket.reporterName && (
                  <p className="text-xs font-semibold text-rose-700 pt-1">
                    Reported by: <span className="font-bold">{selectedTicket.reporterName}</span> (@{selectedTicket.reporterUsername})
                  </p>
                )}
              </div>

              {selectedTicket.mediaPreview && (
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                  <p className="text-xs font-bold text-slate-300 uppercase">Attached Media</p>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                    <img src={selectedTicket.mediaPreview.thumbnailUrl} alt={selectedTicket.mediaPreview.title} className="w-full h-full object-contain" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              {selectedTicket.status === 'Pending' && (
                <>
                  <button onClick={() => handleResolveTicket(selectedTicket)} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700">
                    Resolve
                  </button>
                  <button onClick={() => handleDismissTicket(selectedTicket)} className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700">
                    Dismiss
                  </button>
                </>
              )}
              <button onClick={() => setSelectedTicket(null)} className="px-4 py-2 bg-slate-200 text-slate-800 font-bold rounded-xl text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
