import { useState, useEffect } from 'react';
import { 
  Search, 
  User, 
  Eye, 
  Pencil, 
  Trash2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Smartphone, 
  Laptop, 
  Globe, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  Filter, 
  Calendar, 
  Video, 
  Users as UsersIcon, 
  Heart, 
  Clock, 
  Shield, 
  ShieldAlert,
  Activity, 
  Mail, 
  Phone, 
  AlertCircle,
  Play,
  ArrowLeft,
  UserPlus,
  AlertTriangle,
  Lock,
  Unlock,
  Ban,
  Send,
  Info
} from 'lucide-react';

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role: 'Admin' | 'Creator' | 'Viewer';
  status: 'Active' | 'Suspended' | 'Banned';
  joinedDate: string;
  joinedTime: string;
  device: 'Android' | 'iOS' | 'Web' | 'Desktop';
  location: string;
  ipAddress: string;
  uploads: number;
  followers: number;
  following: number;
  totalLikes: string;
  verified: boolean;
  bio: string;
  phone: string;
  monetization: 'Active' | 'Pending' | 'Disabled';
  banReason?: string;
  bannedAt?: string;
  suspensionReason?: string;
  suspensionDurationDays?: number;
  suspensionUntil?: string;
  suspendedAt?: string;
  recentVideos?: {
    title: string;
    views: string;
    date: string;
    thumbnail: string;
  }[];
  activityLogs?: {
    action: string;
    time: string;
    ip: string;
    device: string;
  }[];
}

const INITIAL_USERS: UserAccount[] = [
  {
    id: 'USR-9021',
    name: 'Sakin Yesmin',
    username: 'sakin_y',
    email: 'sakin@yousnap.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Creator',
    status: 'Active',
    joinedDate: 'Jul 15, 2026',
    joinedTime: '10:45 AM',
    device: 'Android',
    location: 'Guwahati, India',
    ipAddress: '103.212.140.12',
    uploads: 45,
    followers: 12840,
    following: 142,
    totalLikes: '89.4K',
    verified: true,
    bio: 'Travel enthusiast & lifestyle vlogger capturing beautiful Northeast India.',
    phone: '+91 98640 12345',
    monetization: 'Active',
    recentVideos: [
      { title: 'Guwahati Sunset Cruise Vlog', views: '24.5K', date: 'Yesterday', thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80' },
      { title: 'Top 5 Cafes in Assam', views: '18.2K', date: '3 days ago', thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&auto=format&fit=crop&q=80' }
    ],
    activityLogs: [
      { action: 'Uploaded new video "Guwahati Sunset Cruise"', time: '2 hours ago', ip: '103.212.140.12', device: 'Android App 4.2' },
      { action: 'Logged in via One-Time SMS Code', time: '5 hours ago', ip: '103.212.140.12', device: 'Android App 4.2' },
      { action: 'Updated payout bank details', time: '1 day ago', ip: '103.212.140.12', device: 'Web Dashboard' }
    ]
  },
  {
    id: 'USR-8842',
    name: 'John Doe',
    username: 'john_creator',
    email: 'john@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Creator',
    status: 'Suspended',
    suspensionReason: 'Flagged for uploading copyrighted audio and deceptive metadata tags.',
    suspensionDurationDays: 30,
    suspensionUntil: 'Oct 30, 2026',
    suspendedAt: 'Sep 30, 2026',
    joinedDate: 'Jul 16, 2026',
    joinedTime: '02:15 PM',
    device: 'iOS',
    location: 'Mumbai, India',
    ipAddress: '122.161.80.45',
    uploads: 12,
    followers: 3420,
    following: 89,
    totalLikes: '12.8K',
    verified: false,
    bio: 'Tech reviews, mobile unboxing & coding tutorials in Hindi.',
    phone: '+91 98200 67890',
    monetization: 'Pending',
    recentVideos: [
      { title: 'iPhone 18 Pro Max Honest Review', views: '9.4K', date: '4 days ago', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80' }
    ],
    activityLogs: [
      { action: 'Account suspended by Admin (30 Days) - Copyright flags', time: 'Today', ip: 'Admin Console', device: 'Admin Portal' },
      { action: 'Account flagged for review by Moderator', time: '1 day ago', ip: 'System Bot', device: 'AI Guard' },
      { action: 'Logged in from Mumbai iOS client', time: '2 days ago', ip: '122.161.80.45', device: 'iOS App 5.0' }
    ]
  },
  {
    id: 'USR-7619',
    name: 'Jane Smith',
    username: 'jane_smith',
    email: 'jane@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Viewer',
    status: 'Banned',
    banReason: 'Repeated spam comments, phishing links, and bot automation scripts.',
    bannedAt: 'Jul 20, 2026',
    joinedDate: 'Jul 17, 2026',
    joinedTime: '08:30 AM',
    device: 'Web',
    location: 'London, UK',
    ipAddress: '81.149.20.101',
    uploads: 0,
    followers: 45,
    following: 610,
    totalLikes: '0',
    verified: false,
    bio: 'Music lover and avid video consumer.',
    phone: '+44 7911 123456',
    monetization: 'Disabled',
    activityLogs: [
      { action: 'Permanently banned due to repeated spam comments', time: 'Jul 20, 2026', ip: 'Admin Action', device: 'Admin Console' }
    ]
  },
  {
    id: 'USR-6520',
    name: 'Rahul Sharma',
    username: 'rahul_official',
    email: 'rahul.sharma@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'Creator',
    status: 'Active',
    joinedDate: 'Jul 18, 2026',
    joinedTime: '04:10 PM',
    device: 'Android',
    location: 'Delhi, India',
    ipAddress: '49.36.120.89',
    uploads: 64,
    followers: 48200,
    following: 210,
    totalLikes: '340K',
    verified: true,
    bio: 'Electronic Music Producer & DJ. Official releases on YouSnap.',
    phone: '+91 98110 54321',
    monetization: 'Active',
    recentVideos: [
      { title: 'Monsoon EDM Mix 2026 Live', views: '52.1K', date: '5 days ago', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80' }
    ],
    activityLogs: [
      { action: 'Payout transferred ($1,420.00)', time: 'Yesterday', ip: 'Automated Stripe', device: 'Banking API' }
    ]
  }
];

const NEW_USER_SIMULATION_POOL: Omit<UserAccount, 'id' | 'joinedDate' | 'joinedTime'>[] = [
  {
    name: 'Ananya Baruah',
    username: 'ananya_b',
    email: 'ananya.baruah@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'Creator',
    status: 'Active',
    device: 'Android',
    location: 'Jorhat, India',
    ipAddress: '103.88.22.14',
    uploads: 1,
    followers: 120,
    following: 45,
    totalLikes: '540',
    verified: false,
    bio: 'Bihu dancer & cultural storyteller exploring folk arts.',
    phone: '+91 94350 99887',
    monetization: 'Pending',
    recentVideos: [
      { title: 'Traditional Bihu Dance Routine 2026', views: '540', date: 'Just now', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80' }
    ],
    activityLogs: [
      { action: 'Registered new account via Android App', time: 'Just now', ip: '103.88.22.14', device: 'Android 15 (Samsung S24)' },
      { action: 'Verified Mobile Phone number via OTP', time: 'Just now', ip: '103.88.22.14', device: 'Android 15' }
    ]
  },
  {
    name: 'David Chen',
    username: 'david_chen_vlogs',
    email: 'david.chen@outlook.com',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    role: 'Creator',
    status: 'Active',
    device: 'iOS',
    location: 'Singapore',
    ipAddress: '118.200.12.98',
    uploads: 0,
    followers: 15,
    following: 80,
    totalLikes: '0',
    verified: false,
    bio: 'Foodie traveller exploring Southeast Asian street eats.',
    phone: '+65 8123 4567',
    monetization: 'Pending',
    activityLogs: [
      { action: 'Signed up using Apple ID Single Sign-On', time: 'Just now', ip: '118.200.12.98', device: 'iOS 19 (iPhone 16 Pro)' }
    ]
  },
  {
    name: 'Priyanka Das',
    username: 'priyanka_tech',
    email: 'priyanka.das@techmail.io',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'Admin',
    status: 'Active',
    device: 'Web',
    location: 'Bengaluru, India',
    ipAddress: '182.73.240.11',
    uploads: 8,
    followers: 1420,
    following: 110,
    totalLikes: '18.4K',
    verified: true,
    bio: 'Full-stack AI developer & Cloud architect.',
    phone: '+91 97410 88221',
    monetization: 'Active',
    activityLogs: [
      { action: 'Admin privilege granted by Super Admin', time: 'Just now', ip: '182.73.240.11', device: 'Chrome on MacOS' }
    ]
  },
  {
    name: 'Lucas Rossi',
    username: 'lucas_gaming',
    email: 'lucas.rossi@gamingzone.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    role: 'Creator',
    status: 'Active',
    device: 'Desktop',
    location: 'Rome, Italy',
    ipAddress: '93.45.180.72',
    uploads: 2,
    followers: 650,
    following: 120,
    totalLikes: '3.2K',
    verified: false,
    bio: 'Esports caster, Valorant and GTA VI streamer.',
    phone: '+39 06 698 12345',
    monetization: 'Pending',
    activityLogs: [
      { action: 'Registered via YouSnap Desktop Client', time: 'Just now', ip: '93.45.180.72', device: 'Windows 11 Client' }
    ]
  }
];

const PRESET_VIOLATION_REASONS = [
  'Community Guidelines Violation',
  'Spam, Bot, or Coordinated Inauthentic Behavior',
  'Copyright / Intellectual Property Infringement',
  'Hate Speech, Bullying, or Harassment',
  'Nudity, Explicit, or Age-Inappropriate Content',
  'Scam, Phishing, or Fake / Impersonation Account',
  'Dangerous or Harmful Acts Promotion'
];

interface UsersManagementProps {
  totalUsersCount?: number;
  newRegisteredCount?: number;
  onUserAdded?: () => void;
}

export default function UsersManagement({ 
  totalUsersCount = 124500, 
  newRegisteredCount = 1200, 
  onUserAdded 
}: UsersManagementProps) {
  const [usersList, setUsersList] = useState<UserAccount[]>(INITIAL_USERS);
  const [totalUsers, setTotalUsers] = useState<number>(totalUsersCount);
  const [newRegistered, setNewRegistered] = useState<number>(newRegisteredCount);
  const [activeToday, setActiveToday] = useState<number>(45200);
  const [bannedCount, setBannedCount] = useState<number>(85);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [deviceFilter, setDeviceFilter] = useState('All');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [liveToast, setLiveToast] = useState<UserAccount | null>(null);
  const [actionToast, setActionToast] = useState<{ title: string; desc: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // Modals state
  const [selectedUserForView, setSelectedUserForView] = useState<UserAccount | null>(null);
  const [userToEdit, setUserToEdit] = useState<UserAccount | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  // Action Form Modal (Ban / Suspend)
  const [actionModalState, setActionModalState] = useState<{
    isOpen: boolean;
    user: UserAccount | null;
    actionType: 'Ban' | 'Suspend';
    durationDays: number;
    customDays: string;
    reason: string;
    reasonCategory: string;
  }>({
    isOpen: false,
    user: null,
    actionType: 'Suspend',
    durationDays: 30,
    customDays: '',
    reason: '',
    reasonCategory: 'Community Guideline Violation'
  });

  // Modal tab
  const [modalTab, setModalTab] = useState<'overview' | 'videos' | 'activity' | 'applock'>('overview');

  // Simulated real-time user registrations
  useEffect(() => {
    let poolIdx = 0;
    const interval = setInterval(() => {
      const template = NEW_USER_SIMULATION_POOL[poolIdx % NEW_USER_SIMULATION_POOL.length];
      poolIdx++;

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const newUser: UserAccount = {
        ...template,
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        joinedDate: dateStr,
        joinedTime: timeStr,
      };

      setUsersList(prev => [newUser, ...prev]);
      setTotalUsers(prev => prev + 1);
      setNewRegistered(prev => prev + 1);
      setActiveToday(prev => prev + 1);

      if (onUserAdded) onUserAdded();

      setLiveToast(newUser);
      setTimeout(() => {
        setLiveToast(null);
      }, 4500);
    }, 16000);

    return () => clearInterval(interval);
  }, [onUserAdded]);

  const showToast = (title: string, desc: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setActionToast({ title, desc, type });
    setTimeout(() => {
      setActionToast(null);
    }, 5000);
  };

  // Open Ban/Suspend Action Modal
  const openActionModal = (user: UserAccount, actionType: 'Ban' | 'Suspend') => {
    setActionModalState({
      isOpen: true,
      user,
      actionType,
      durationDays: 30,
      customDays: '',
      reason: actionType === 'Ban' ? (user.banReason || '') : (user.suspensionReason || ''),
      reasonCategory: 'Community Guideline Violation'
    });
  };

  // Quick Unban or Reactivate with immediate live update
  const handleDirectReactivateOrUnban = (user: UserAccount) => {
    const isBanned = user.status === 'Banned';
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const updatedUser: UserAccount = {
      ...user,
      status: 'Active',
      banReason: undefined,
      bannedAt: undefined,
      suspensionReason: undefined,
      suspensionUntil: undefined,
      suspensionDurationDays: undefined,
      suspendedAt: undefined,
      activityLogs: [
        {
          action: `${isBanned ? 'Account unbanned' : 'Account suspension lifted & reactivated'} by Super Admin`,
          time: 'Just now',
          ip: 'Admin Console',
          device: 'Admin Portal'
        },
        ...(user.activityLogs || [])
      ]
    };

    setUsersList(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    if (selectedUserForView && selectedUserForView.id === user.id) {
      setSelectedUserForView(updatedUser);
    }

    showToast(
      isBanned ? `Account unbanned successfully!` : `Account reactivated successfully!`,
      `@${user.username}'s account status is now Active. In-App restrictions removed and YouSnap Mobile App unlocked.`,
      'success'
    );
  };

  // Submit Action Form Modal (Ban / Suspend)
  const handleConfirmActionModal = (e: React.FormEvent) => {
    e.preventDefault();
    const { user, actionType, durationDays, customDays, reason } = actionModalState;
    if (!user) return;

    if (!reason.trim()) {
      alert('Please provide a violation reason for this action.');
      return;
    }

    const now = new Date();
    const nowFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    let effectiveDuration = durationDays;
    if (customDays && parseInt(customDays) > 0) {
      effectiveDuration = parseInt(customDays);
    }

    const expiryDate = new Date();
    expiryDate.setDate(now.getDate() + effectiveDuration);
    const expiryFormatted = expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    let updatedUser: UserAccount;

    if (actionType === 'Ban') {
      updatedUser = {
        ...user,
        status: 'Banned',
        banReason: reason.trim(),
        bannedAt: nowFormatted,
        suspensionReason: undefined,
        suspensionUntil: undefined,
        suspensionDurationDays: undefined,
        suspendedAt: undefined,
        activityLogs: [
          {
            action: `Permanently banned: ${reason.trim()}`,
            time: 'Just now',
            ip: 'Admin Console',
            device: 'Admin Portal'
          },
          ...(user.activityLogs || [])
        ]
      };
      setBannedCount(prev => prev + 1);
      showToast(
        `Account Permanently Banned`,
        `@${user.username} has been permanently banned. In-App lock notice & policy notification dispatched.`,
        'error'
      );
    } else {
      updatedUser = {
        ...user,
        status: 'Suspended',
        suspensionReason: reason.trim(),
        suspensionDurationDays: effectiveDuration,
        suspensionUntil: expiryFormatted,
        suspendedAt: nowFormatted,
        banReason: undefined,
        bannedAt: undefined,
        activityLogs: [
          {
            action: `Suspended for ${effectiveDuration} days (Until ${expiryFormatted}): ${reason.trim()}`,
            time: 'Just now',
            ip: 'Admin Console',
            device: 'Admin Portal'
          },
          ...(user.activityLogs || [])
        ]
      };
      showToast(
        `Account Suspended (${effectiveDuration} Days)`,
        `@${user.username} suspended until ${expiryFormatted}. In-App temporary restriction notice sent.`,
        'warning'
      );
    }

    setUsersList(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    if (selectedUserForView && selectedUserForView.id === user.id) {
      setSelectedUserForView(updatedUser);
    }

    // Automated App Suspension Notification dispatch logic to simulated app database in localStorage
    try {
      const userNotifsKey = 'yousnap_user_app_notifications';
      const existingNotifs = localStorage.getItem(userNotifsKey);
      let userNotifs = [];
      if (existingNotifs) {
        userNotifs = JSON.parse(existingNotifs);
      }
      
      const newAppNotification = {
        id: 'UN-' + Math.floor(10000 + Math.random() * 90000),
        userId: user.id,
        username: user.username,
        title: actionType === 'Ban' ? '⚠️ Account Banned' : '⚠️ Account Suspended',
        message: `[Violation Category: ${actionModalState.reasonCategory}] ${reason.trim()}`,
        category: actionModalState.reasonCategory,
        timestamp: new Date().toLocaleString(),
        actionLink: 'Appeal / Support'
      };
      
      userNotifs.unshift(newAppNotification);
      localStorage.setItem(userNotifsKey, JSON.stringify(userNotifs));
    } catch (err) {
      console.error('Failed to dispatch suspension notification:', err);
    }

    setActionModalState({
      isOpen: false,
      user: null,
      actionType: 'Suspend',
      durationDays: 30,
      customDays: '',
      reason: '',
      reasonCategory: 'Community Guideline Violation'
    });
  };

  // Edit user save
  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    setUsersList(prev => prev.map(u => u.id === userToEdit.id ? userToEdit : u));
    if (selectedUserForView && selectedUserForView.id === userToEdit.id) {
      setSelectedUserForView(userToEdit);
    }
    setUserToEdit(null);
    showToast('Profile Updated', `Changes for ${userToEdit.name} saved successfully.`);
  };

  // Delete User
  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    setUsersList(prev => prev.filter(u => u.id !== userToDelete.id));
    setTotalUsers(prev => Math.max(0, prev - 1));
    showToast('User Deleted', `${userToDelete.name} (@${userToDelete.username}) permanently deleted from database.`, 'error');
    setUserToDelete(null);
    if (selectedUserForView && selectedUserForView.id === userToDelete.id) {
      setSelectedUserForView(null);
    }
  };

  // Toggle selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredUsers.map(u => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filtered users list
  const filteredUsers = usersList.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesDevice = deviceFilter === 'All' || user.device === deviceFilter;

    return matchesSearch && matchesRole && matchesDevice;
  });

  const getDeviceIcon = (device: UserAccount['device']) => {
    switch(device) {
      case 'Android':
      case 'iOS':
        return <Smartphone size={14} className="text-emerald-600" />;
      case 'Desktop':
        return <Laptop size={14} className="text-blue-600" />;
      default:
        return <Globe size={14} className="text-purple-600" />;
    }
  };

  return (
    <div className="p-6 relative">
      {/* Toast Notification for Real-Time User Registration */}
      {liveToast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <UserPlus size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">New User Registered!</p>
            </div>
            <p className="text-sm font-bold text-slate-100">{liveToast.name} <span className="font-normal text-xs text-slate-400">(@{liveToast.username})</span></p>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-emerald-400" /> {liveToast.location} • {liveToast.device}
            </p>
          </div>
          <button onClick={() => setLiveToast(null)} className="text-slate-400 hover:text-white ml-2">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Action Toast (Ban/Suspend/Reactivate feedback) */}
      {actionToast && (
        <div className={`fixed top-6 right-6 z-[80] text-white px-5 py-4 rounded-2xl shadow-2xl border flex items-start gap-3.5 max-w-md animate-in slide-in-from-top-4 duration-300 ${
          actionToast.type === 'error' ? 'bg-slate-900 border-rose-500/50' :
          actionToast.type === 'warning' ? 'bg-slate-900 border-amber-500/50' :
          'bg-slate-900 border-emerald-500/50'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
            actionToast.type === 'error' ? 'bg-rose-500/20 text-rose-400' :
            actionToast.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
            'bg-emerald-500/20 text-emerald-400'
          }`}>
            {actionToast.type === 'error' ? <Ban size={20} /> :
             actionToast.type === 'warning' ? <AlertTriangle size={20} /> :
             <CheckCircle2 size={20} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-100">{actionToast.title}</p>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{actionToast.desc}</p>
          </div>
          <button onClick={() => setActionToast(null)} className="text-slate-400 hover:text-white shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Header - Clean Layout */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-xs text-slate-500 mt-1">Real-Time Registration Monitor & Full Member Control Center</p>
      </div>

      {/* Top User Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Users</h3>
              <p className="text-3xl font-extrabold text-slate-900 mt-1.5">{totalUsers.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <UsersIcon size={20} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+8.4%</span>
            <span className="text-xs text-slate-400">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Today</h3>
              <p className="text-3xl font-extrabold text-slate-900 mt-1.5">{activeToday.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Activity size={20} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">+12%</span>
            <span className="text-xs text-slate-400">currently online</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">New Registered</h3>
              <p className="text-3xl font-extrabold text-slate-900 mt-1.5">{newRegistered.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <UserPlus size={20} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">+5%</span>
            <span className="text-xs text-slate-400">last 24 hours</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Banned/Suspended</h3>
              <p className="text-3xl font-extrabold text-slate-900 mt-1.5">{bannedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ShieldAlert size={20} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">-3%</span>
            <span className="text-xs text-slate-400">moderated accounts</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        {/* Search, Filter & Bulk Actions Bar */}
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, @username, email, city, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition" 
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <Filter size={14} className="text-slate-400" />
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">Role: All</option>
                <option value="Admin">Admin</option>
                <option value="Creator">Creator</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <select 
                value={deviceFilter} 
                onChange={(e) => setDeviceFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">Device: All</option>
                <option value="Android">Android</option>
                <option value="iOS">iOS</option>
                <option value="Web">Web</option>
                <option value="Desktop">Desktop</option>
              </select>
            </div>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const count = selectedIds.length;
                    setUsersList(prev => prev.map(u => selectedIds.includes(u.id) ? { 
                      ...u, 
                      status: 'Suspended',
                      suspensionReason: 'Bulk suspension by Moderator',
                      suspensionDurationDays: 30,
                      suspensionUntil: '30 days'
                    } : u));
                    setSelectedIds([]);
                    showToast('Bulk Action Executed', `Suspended ${count} user accounts.`, 'warning');
                  }}
                  className="px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-semibold hover:bg-amber-100 transition"
                >
                  Suspend ({selectedIds.length})
                </button>
                <button 
                  onClick={() => {
                    const count = selectedIds.length;
                    setUsersList(prev => prev.filter(u => !selectedIds.includes(u.id)));
                    setSelectedIds([]);
                    showToast('Bulk Action Executed', `Permanently deleted ${count} user accounts.`, 'error');
                  }}
                  className="px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold hover:bg-rose-100 transition"
                >
                  Delete ({selectedIds.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Data Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-inner">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-semibold text-xs">
              <tr className="text-left">
                <th className="p-3.5 w-10">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll} 
                    checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0} 
                    className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="p-3.5">User Profile & ID</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Joined Date & Time</th>
                <th className="p-3.5">Device & Location</th>
                <th className="p-3.5">Uploads / Likes</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <AlertCircle size={32} className="mx-auto mb-2 text-slate-300" />
                    No users matching the filters found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="p-3.5">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(user.id)} 
                        onChange={() => handleSelectOne(user.id)} 
                        className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </td>
                    
                    {/* User Profile Info */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs" 
                          />
                          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                            user.status === 'Active' ? 'bg-emerald-500' :
                            user.status === 'Suspended' ? 'bg-amber-500' : 'bg-rose-500'
                          }`} title={`Status: ${user.status}`}></span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-900 text-sm hover:text-emerald-600 cursor-pointer transition truncate" onClick={() => setSelectedUserForView(user)}>
                              {user.name}
                            </p>
                            {user.verified && (
                              <span title="Verified Creator"><CheckCircle2 size={14} className="text-blue-500 fill-blue-500/10 shrink-0" /></span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">@{user.username}</p>
                          <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'Admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        user.role === 'Creator' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {user.role === 'Admin' && <Shield size={11} />}
                        {user.role === 'Creator' && <Sparkles size={11} />}
                        {user.role}
                      </span>
                    </td>

                    {/* Joined Date & Time */}
                    <td className="p-3.5">
                      <div className="text-slate-800 font-medium text-xs">{user.joinedDate}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {user.joinedTime}
                      </div>
                    </td>

                    {/* Device & Location */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        {getDeviceIcon(user.device)}
                        <span>{user.device}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[130px]">{user.location}</span>
                      </div>
                    </td>

                    {/* Uploads / Likes */}
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800 text-xs">{user.uploads} Videos</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Heart size={11} className="text-rose-400 fill-rose-400/20" /> {user.totalLikes} likes
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          title="View Full Profile Details"
                          onClick={() => { setSelectedUserForView(user); setModalTab('overview'); }}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition shadow-xs"
                        >
                          <Eye size={15} />
                        </button>
                        <button 
                          title={user.status === 'Active' ? 'Suspend / Ban Account' : 'Manage Account Status'}
                          onClick={() => {
                            if (user.status === 'Active') {
                              openActionModal(user, 'Suspend');
                            } else {
                              handleDirectReactivateOrUnban(user);
                            }
                          }}
                          className={`p-1.5 rounded-lg transition shadow-xs ${
                            user.status === 'Active' 
                              ? 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600' 
                              : user.status === 'Suspended'
                              ? 'bg-amber-100 text-amber-700 hover:bg-emerald-50 hover:text-emerald-600'
                              : 'bg-rose-100 text-rose-700 hover:bg-emerald-50 hover:text-emerald-600'
                          }`}
                        >
                          {user.status === 'Active' ? <ShieldAlert size={15} /> : <Unlock size={15} />}
                        </button>
                        <button 
                          title="Delete User Permanently"
                          onClick={() => setUserToDelete(user)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition shadow-xs"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer summary */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-5 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">Showing 1-{filteredUsers.length}</span> of {totalUsers.toLocaleString()} users
            {filteredUsers.length !== usersList.length && (
              <span className="text-emerald-600 font-semibold">(Filtered from {usersList.length} active sessions)</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition disabled:opacity-50">
              <ChevronLeft size={15} />
            </button>
            <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold shadow-xs">1</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition">2</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition">3</button>
            <span className="px-1 text-slate-400">...</span>
            <button className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition">12</button>
            <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* FULL SCREEN PAGE MODAL FOR USER DETAILS */}
      {selectedUserForView && (
        <div className="fixed inset-0 z-50 w-full h-full min-h-screen bg-slate-50 flex flex-col overflow-y-auto animate-in fade-in duration-200">
          
          {/* Full Screen Top Navigation Bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
            <button 
              onClick={() => setSelectedUserForView(null)}
              className="flex items-center gap-2 text-slate-700 hover:text-emerald-600 font-semibold text-sm transition"
            >
              <ArrowLeft size={18} />
              <span>← Back to Users List</span>
            </button>

            <div className="flex items-center gap-3">
              {selectedUserForView.status === 'Active' ? (
                <button 
                  onClick={() => openActionModal(selectedUserForView, 'Ban')}
                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <Ban size={14} /> Ban Account
                </button>
              ) : selectedUserForView.status === 'Banned' ? (
                <button 
                  onClick={() => handleDirectReactivateOrUnban(selectedUserForView)}
                  className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <Unlock size={14} /> Unban Account
                </button>
              ) : (
                <button 
                  onClick={() => handleDirectReactivateOrUnban(selectedUserForView)}
                  className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <Unlock size={14} /> Lift Suspension
                </button>
              )}

              <button 
                onClick={() => setSelectedUserForView(null)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                title="Close Full Screen View"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Full Screen Content Wrapper */}
          <div className="max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6 flex-1">
            
            {/* Header Banner */}
            <div className="relative bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="h-44 bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 relative">
                <div className="absolute inset-0 bg-black/10"></div>
              </div>

              <div className="px-8 pb-6 pt-0 relative flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-16">
                <div className="flex items-end gap-5">
                  <div className="relative">
                    <img 
                      src={selectedUserForView.avatar} 
                      alt={selectedUserForView.name} 
                      className="w-28 h-28 rounded-3xl object-cover border-4 border-white shadow-xl bg-white" 
                    />
                    {selectedUserForView.verified && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-full shadow-md">
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                  </div>
                  <div className="mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{selectedUserForView.name}</h1>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {selectedUserForView.role}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        selectedUserForView.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        selectedUserForView.status === 'Suspended' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {selectedUserForView.status === 'Active' ? '● Active' :
                         selectedUserForView.status === 'Suspended' ? '⚠️ Suspended' : '🚫 Banned'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm font-mono mt-1">@{selectedUserForView.username} • ID: {selectedUserForView.id}</p>
                  </div>
                </div>


              </div>

              <div className="px-8 pb-6 border-t border-slate-100 pt-4">
                <p className="text-slate-600 text-sm italic">"{selectedUserForView.bio}"</p>
              </div>

              {/* Status Warning Banner Display (Banned / Suspended Reason Banner) */}
              {selectedUserForView.status === 'Suspended' && (
                <div className="mx-8 mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">
                        This account has been suspended until <span className="underline font-extrabold">{selectedUserForView.suspensionUntil || '30 days'}</span>
                      </h4>
                      <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        <span className="font-semibold">Violation Reason:</span> {selectedUserForView.suspensionReason || 'Account flagged for violating YouSnap community guidelines.'}
                      </p>
                      <p className="text-[11px] text-amber-700 mt-1">
                        Suspension active • Mobile & Web app video creation & interaction features are currently locked.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDirectReactivateOrUnban(selectedUserForView)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-xs shrink-0 flex items-center gap-1.5"
                  >
                    <Unlock size={14} /> Reactivate Now
                  </button>
                </div>
              )}

              {selectedUserForView.status === 'Banned' && (
                <div className="mx-8 mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Ban size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-rose-900">
                        This account has been permanently banned from YouSnap
                      </h4>
                      <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                        <span className="font-semibold">Violation Reason:</span> {selectedUserForView.banReason || 'Severe violation of YouSnap Terms of Service and safety policies.'}
                      </p>
                      <p className="text-[11px] text-rose-700 mt-1">
                        Permanent Ban active since {selectedUserForView.bannedAt || 'earlier'} • All login attempts are blocked with policy notice.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDirectReactivateOrUnban(selectedUserForView)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs shrink-0 flex items-center gap-1.5"
                  >
                    <Unlock size={14} /> Unban Account
                  </button>
                </div>
              )}
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex gap-2 overflow-x-auto">
              <button 
                onClick={() => setModalTab('overview')}
                className={`flex-1 py-3 px-4 font-bold text-xs md:text-sm rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap ${
                  modalTab === 'overview' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User size={16} /> Overview & Contact Info
              </button>
              <button 
                onClick={() => setModalTab('videos')}
                className={`flex-1 py-3 px-4 font-bold text-xs md:text-sm rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap ${
                  modalTab === 'videos' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Video size={16} /> Uploaded Videos ({selectedUserForView.uploads})
              </button>
              <button 
                onClick={() => setModalTab('activity')}
                className={`flex-1 py-3 px-4 font-bold text-xs md:text-sm rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap ${
                  modalTab === 'activity' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Activity size={16} /> Security & Audit Logs
              </button>
              <button 
                onClick={() => setModalTab('applock')}
                className={`flex-1 py-3 px-4 font-bold text-xs md:text-sm rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap ${
                  modalTab === 'applock' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone size={16} /> User App Lock Preview
              </button>
            </div>

            {/* Tab Content Area */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              {modalTab === 'overview' && (
                <div className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-500 font-semibold uppercase">Followers</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{selectedUserForView.followers.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-500 font-semibold uppercase">Following</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{selectedUserForView.following}</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-500 font-semibold uppercase">Total Likes</p>
                      <p className="text-2xl font-bold text-rose-600 mt-1">{selectedUserForView.totalLikes}</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-500 font-semibold uppercase">Monetization</p>
                      <p className="text-lg font-bold text-emerald-600 mt-1">{selectedUserForView.monetization}</p>
                    </div>
                  </div>

                  {/* Detailed Information Grid */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <User size={16} className="text-emerald-600" /> Member Details & Connection Info
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/80 p-6 rounded-2xl border border-slate-100 text-sm">
                      <div className="space-y-4">
                        <div>
                          <span className="text-slate-400 block text-xs">Email Address</span>
                          <span className="font-semibold text-slate-900 flex items-center gap-2 mt-1">
                            <Mail size={15} className="text-slate-400" /> {selectedUserForView.email}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-xs">Phone Number</span>
                          <span className="font-semibold text-slate-900 flex items-center gap-2 mt-1">
                            <Phone size={15} className="text-slate-400" /> {selectedUserForView.phone}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-xs">Registered Location</span>
                          <span className="font-semibold text-slate-900 flex items-center gap-2 mt-1">
                            <MapPin size={15} className="text-emerald-600" /> {selectedUserForView.location}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="text-slate-400 block text-xs">Joined Timestamp</span>
                          <span className="font-semibold text-slate-900 flex items-center gap-2 mt-1">
                            <Calendar size={15} className="text-slate-400" /> {selectedUserForView.joinedDate} at {selectedUserForView.joinedTime}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-xs">Device & Client</span>
                          <span className="font-semibold text-slate-900 flex items-center gap-2 mt-1">
                            {getDeviceIcon(selectedUserForView.device)} {selectedUserForView.device} Client Application
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-xs">IP Address</span>
                          <span className="font-mono text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-200 inline-block mt-1">
                            {selectedUserForView.ipAddress}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'videos' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Uploaded Content Gallery</h3>
                    <span className="text-xs text-slate-500 font-medium">{selectedUserForView.uploads} Total Uploads</span>
                  </div>

                  {selectedUserForView.recentVideos && selectedUserForView.recentVideos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedUserForView.recentVideos.map((vid, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 hover:shadow-md transition">
                          <div className="relative w-28 h-16 rounded-xl bg-slate-900 overflow-hidden shrink-0">
                            <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <Play size={18} className="text-white fill-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-900 truncate">{vid.title}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 font-medium">
                              <span>👁️ {vid.views} views</span>
                              <span>•</span>
                              <span>🕒 {vid.date}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-16 text-center text-slate-400 bg-slate-50 rounded-3xl">
                      <Video size={36} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-sm font-semibold">No video items found for this account.</p>
                    </div>
                  )}
                </div>
              )}

              {modalTab === 'activity' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Security & Login Audit Trail</h3>
                  <div className="space-y-3">
                    {selectedUserForView.activityLogs && selectedUserForView.activityLogs.length > 0 ? (
                      selectedUserForView.activityLogs.map((log, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-sm">
                          <div>
                            <p className="font-bold text-slate-900">{log.action}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Device: {log.device} • IP: <span className="font-mono text-slate-700">{log.ip}</span></p>
                          </div>
                          <span className="text-xs text-slate-400 font-semibold bg-white px-3 py-1 rounded-xl border border-slate-200">
                            {log.time}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 py-8 text-center">No audit logs recorded.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Requirement 3: User App-side Lock & Notification Preview */}
              {modalTab === 'applock' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">YouSnap Mobile App-Side Screen Preview</h3>
                      <p className="text-xs text-slate-500 mt-0.5">This is the restriction notice shown to @{selectedUserForView.username} when logging in or opening YouSnap App.</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedUserForView.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                      selectedUserForView.status === 'Suspended' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      Current State: {selectedUserForView.status}
                    </span>
                  </div>

                  <div className="max-w-sm mx-auto bg-slate-950 text-white rounded-[36px] p-6 border-4 border-slate-800 shadow-2xl relative overflow-hidden">
                    <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-6"></div>

                    {selectedUserForView.status === 'Active' ? (
                      <div className="text-center py-10 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                          <CheckCircle2 size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-white">Account in Good Standing</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          No active policy restrictions on @{selectedUserForView.username}. All features, uploads, live feeds, and payouts are operational.
                        </p>
                      </div>
                    ) : selectedUserForView.status === 'Suspended' ? (
                      <div className="text-center py-6 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                          <Lock size={30} />
                        </div>
                        <h4 className="text-base font-bold text-white">Account Temporarily Suspended</h4>
                        <div className="bg-slate-900 p-3.5 rounded-2xl border border-amber-500/30 text-left space-y-1.5 text-xs">
                          <p className="text-amber-400 font-semibold flex items-center gap-1.5">
                            <Clock size={13} /> Restricted Until: {selectedUserForView.suspensionUntil || '30 days'}
                          </p>
                          <p className="text-slate-300">
                            <span className="text-slate-400 font-medium">Reason:</span> {selectedUserForView.suspensionReason || 'Community guidelines violation'}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          You cannot upload videos, comment, or monetize until the suspension period ends.
                        </p>
                        <button className="w-full py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold">
                          Contact YouSnap Trust & Safety
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-6 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                          <Ban size={30} />
                        </div>
                        <h4 className="text-base font-bold text-white">Account Permanently Banned</h4>
                        <div className="bg-slate-900 p-3.5 rounded-2xl border border-rose-500/30 text-left space-y-1.5 text-xs">
                          <p className="text-rose-400 font-semibold flex items-center gap-1.5">
                            <ShieldAlert size={13} /> Access Revoked Permanently
                          </p>
                          <p className="text-slate-300">
                            <span className="text-slate-400 font-medium">Reason:</span> {selectedUserForView.banReason || 'Severe violation of Terms of Service'}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          This account has been terminated due to severe policy violations.
                        </p>
                        <button className="w-full py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold">
                          Submit Ban Appeal Request
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
                {selectedUserForView.status === 'Active' ? (
                  <>
                    <button 
                      onClick={() => openActionModal(selectedUserForView, 'Ban')}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs md:text-sm font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      <Ban size={15} /> Ban Account
                    </button>
                    <button 
                      onClick={() => openActionModal(selectedUserForView, 'Suspend')}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs md:text-sm font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      <Clock size={15} /> Suspend Account
                    </button>
                  </>
                ) : selectedUserForView.status === 'Suspended' ? (
                  <>
                    <button 
                      onClick={() => handleDirectReactivateOrUnban(selectedUserForView)}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      <Unlock size={15} /> Reactivate Account
                    </button>
                    <button 
                      onClick={() => openActionModal(selectedUserForView, 'Ban')}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs md:text-sm font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      <Ban size={15} /> Escalate to Permanent Ban
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => handleDirectReactivateOrUnban(selectedUserForView)}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    <Unlock size={15} /> Unban Account
                  </button>
                )}
              </div>

              <button 
                onClick={() => setSelectedUserForView(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs md:text-sm hover:bg-slate-800 transition shadow-sm"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ACTION FORM MODAL (BAN / SUSPEND REASON INPUT MODAL) */}
      {actionModalState.isOpen && actionModalState.user && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className={`p-5 text-white flex justify-between items-center ${
              actionModalState.actionType === 'Ban' ? 'bg-rose-950' : 'bg-amber-950'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  actionModalState.actionType === 'Ban' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {actionModalState.actionType === 'Ban' ? <Ban size={18} /> : <AlertTriangle size={18} />}
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {actionModalState.actionType === 'Ban' ? 'Permanent Account Ban' : 'Temporary Account Suspension'}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {actionModalState.actionType === 'Ban' ? 'Irreversible platform access revocation' : 'Temporary access lock with auto-expiry'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActionModalState(prev => ({ ...prev, isOpen: false, user: null }))}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleConfirmActionModal} className="p-6 space-y-4">
              
              {/* Target User Card */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <img 
                  src={actionModalState.user.avatar} 
                  alt={actionModalState.user.name} 
                  className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0" 
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{actionModalState.user.name}</p>
                  <p className="text-[11px] text-slate-500">@{actionModalState.user.username} • Role: {actionModalState.user.role} • ID: {actionModalState.user.id}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  actionModalState.actionType === 'Ban' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  Action: {actionModalState.actionType}
                </span>
              </div>

              {/* Suspension Duration Options (Only for Suspend) */}
              {actionModalState.actionType === 'Suspend' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Clock size={13} className="text-amber-600" /> Suspension Duration
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[7, 14, 30, 90].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setActionModalState(prev => ({ ...prev, durationDays: days, customDays: '' }))}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                          actionModalState.durationDays === days && !actionModalState.customDays
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {days} Days
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">Or Custom:</span>
                    <input 
                      type="number"
                      min="1"
                      max="365"
                      placeholder="e.g. 60 days"
                      value={actionModalState.customDays}
                      onChange={(e) => setActionModalState(prev => ({ ...prev, customDays: e.target.value }))}
                      className="w-28 p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-[11px] text-slate-400">days</span>
                  </div>
                </div>
              )}

              {/* Quick Preset Violation Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Quick Violation Reason Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_VIOLATION_REASONS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActionModalState(prev => ({ ...prev, reason: preset }))}
                      className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason Category Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-amber-600" /> Reason Category *
                </label>
                <select
                  required
                  value={actionModalState.reasonCategory}
                  onChange={(e) => setActionModalState(prev => ({ ...prev, reasonCategory: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white cursor-pointer"
                >
                  <option value="Community Guideline Violation">Community Guideline Violation</option>
                  <option value="Copyright Violation">Copyright Violation</option>
                  <option value="Fraudulent Activity">Fraudulent Activity</option>
                  <option value="Impersonation">Impersonation</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              {/* Reason Textarea Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Detailed Reason / Notice to User *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Appears on User's Mobile App Lock Screen</span>
                </label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Explain why this action is being taken (e.g. Repeated spamming in comment section, copyright violation on video #9021, hateful remarks)..."
                  value={actionModalState.reason}
                  onChange={(e) => setActionModalState(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none leading-relaxed"
                />
              </div>

              {/* Informative Warning Note */}
              <div className={`p-3 rounded-xl text-[11px] flex items-start gap-2 ${
                actionModalState.actionType === 'Ban' 
                  ? 'bg-rose-50 text-rose-800 border border-rose-100' 
                  : 'bg-amber-50 text-amber-800 border border-amber-100'
              }`}>
                <Info size={14} className="shrink-0 mt-0.5" />
                <p>
                  {actionModalState.actionType === 'Ban'
                    ? 'Permanent Ban will terminate all API access tokens, halt active sessions, and restrict profile visibility across YouSnap.'
                    : `Account will be locked for ${actionModalState.customDays || actionModalState.durationDays} days. After expiry, access will automatically be evaluated.`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setActionModalState(prev => ({ ...prev, isOpen: false, user: null }))}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition active:scale-95 flex items-center gap-1.5 ${
                    actionModalState.actionType === 'Ban'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  <Send size={13} />
                  {actionModalState.actionType === 'Ban' ? 'Confirm Permanent Ban' : 'Confirm Suspension'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {userToEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Pencil size={18} className="text-emerald-400" />
                <h3 className="font-bold text-sm">Edit User: {userToEdit.name}</h3>
              </div>
              <button onClick={() => setUserToEdit(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={userToEdit.name}
                    onChange={(e) => setUserToEdit({ ...userToEdit, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                  <input 
                    type="text" 
                    value={userToEdit.username}
                    onChange={(e) => setUserToEdit({ ...userToEdit, username: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                  <select 
                    value={userToEdit.role}
                    onChange={(e) => setUserToEdit({ ...userToEdit, role: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none" 
                  >
                    <option value="Creator">Creator</option>
                    <option value="Viewer">Viewer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Status</label>
                  <select 
                    value={userToEdit.status}
                    onChange={(e) => setUserToEdit({ ...userToEdit, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none" 
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Banned">Banned</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input 
                  type="text" 
                  value={userToEdit.location}
                  onChange={(e) => setUserToEdit({ ...userToEdit, location: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="verifiedCheck"
                  checked={userToEdit.verified}
                  onChange={(e) => setUserToEdit({ ...userToEdit, verified: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="verifiedCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Verified Creator Badge ✓
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setUserToEdit(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>

            <h3 className="text-lg font-bold text-center text-slate-900">Delete User Account?</h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Are you sure you want to permanently delete <span className="font-bold text-slate-800">{userToDelete.name}</span> (@{userToDelete.username})? This will erase all their uploaded videos, followers, and activity logs.
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button 
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteUser}
                className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 shadow-md transition"
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
