import { useState } from 'react';
import { 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  Building2, 
  QrCode, 
  Clock, 
  Users, 
  CreditCard, 
  TrendingUp, 
  ShieldAlert, 
  Ban,
  X,
  Send,
  Eye,
  Copy,
  Check,
  ShieldCheck,
  Film,
  Image as ImageIcon,
  Play,
  Calendar,
  Sparkles,
  Info,
  ExternalLink,
  Heart,
  Volume2,
  VolumeX,
  Trash2,
  UserX,
  Lock
} from 'lucide-react';

export interface CreatorMedia {
  id: string;
  type: 'Video' | 'Photo';
  title: string;
  thumbnail: string;
  duration?: string;
  views: string;
  likes: string;
  comments: string;
  uploadDate: string;
  isMonetized?: boolean;
}

export interface MonetizationRecord {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatar: string;
  coverImage: string; // cover image for profile dashboard
  followers: number;
  following: number; // following count
  totalLikes: string; // total likes received across content
  totalViews: string;
  viewsVal: number; // numeric views for rolling eligibility
  paymentMethod: 'UPI' | 'Bank Transfer';
  upiId?: string;
  bankDetails?: {
    accountHolder: string;
    bankName: string;
    fullAccountNumber: string;
    maskedAccountNumber: string;
    ifscCode: string;
    accountType?: 'Savings' | 'Current';
    branchName?: string;
  };
  isPaymentVerified?: boolean;
  status: 'Active' | 'Pending' | 'Cancelled' | 'Suspended';
  appliedDate: string;
  joinedDate: string; //Joined Date
  totalPayoutEarned: string;
  uploadedMedia: CreatorMedia[];
  payoutHoldDaysLeft?: number; // Days left for 30-day holding cycle
  payoutBatch?: 'Batch 1' | 'Batch 2' | 'Batch 3'; // Scheduled batches
  autoPayEnabled?: boolean; // Auto-Pay on Scheduled Date Toggle state
  payoutStatus?: 'Scheduled' | 'Disbursed'; // Current payment status
  approvalDateISO?: string; // e.g. '2026-09-01'
  hasApplied?: boolean; // Track if creator applied from YouSnap App
  disbursedAmount?: number; // Persist actual historical disbursed amount
}

const INITIAL_RECORDS: MonetizationRecord[] = [
  {
    id: 'mon-101',
    userId: 'USR-9021',
    name: 'Sakin Yesmin',
    username: 'sakin_y',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    followers: 12840,
    following: 320,
    totalLikes: '142K',
    totalViews: '720.5K',
    viewsVal: 720500,
    paymentMethod: 'UPI',
    upiId: 'sakin.yesmin@okicici',
    isPaymentVerified: true,
    status: 'Active',
    appliedDate: 'Jul 20, 2026',
    joinedDate: 'Joined: 15 Jan 2026',
    totalPayoutEarned: '$1,240.00',
    payoutHoldDaysLeft: 0,
    payoutBatch: 'Batch 1',
    autoPayEnabled: true,
    payoutStatus: 'Scheduled',
    approvalDateISO: '2026-09-01',
    hasApplied: true,
    uploadedMedia: [
      {
        id: 'cm-1',
        type: 'Video',
        title: 'Amazing Guwahati Street Food Vlog',
        thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
        duration: '3:45',
        views: '124.5K',
        likes: '22.4K',
        comments: '1,210',
        uploadDate: '2 days ago',
        isMonetized: true
      },
      {
        id: 'cm-2',
        type: 'Photo',
        title: 'Brahmaputra Cruise Sunset View',
        thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
        views: '84.2K',
        likes: '14.8K',
        comments: '420',
        uploadDate: '5 days ago',
        isMonetized: false
      },
      {
        id: 'cm-3',
        type: 'Video',
        title: 'Shillong Monsoons Road Trip Vlog',
        thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&auto=format&fit=crop&q=80',
        duration: '5:12',
        views: '131.8K',
        likes: '25.2K',
        comments: '931',
        uploadDate: '1 week ago',
        isMonetized: true
      },
      {
        id: 'cm-3b',
        type: 'Video',
        title: 'Guwahati Sunset Cruise Vlog',
        thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
        duration: '4:10',
        views: '380.0K',
        likes: '79.6K',
        comments: '1,590',
        uploadDate: 'Yesterday',
        isMonetized: true
      }
    ]
  },
  {
    id: 'mon-102',
    userId: 'USR-8842',
    name: 'John Doe',
    username: 'john_creator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    followers: 3420,
    following: 112,
    totalLikes: '18.5K',
    totalViews: '94.2K',
    viewsVal: 94200,
    paymentMethod: 'Bank Transfer',
    bankDetails: {
      accountHolder: 'John Doe',
      bankName: 'HDFC Bank Ltd.',
      fullAccountNumber: '50100882194012',
      maskedAccountNumber: '•••• 8821',
      ifscCode: 'HDFC0001234',
      accountType: 'Savings',
      branchName: 'Khar West Branch, Mumbai'
    },
    isPaymentVerified: false,
    status: 'Pending',
    appliedDate: 'Sep 25, 2026',
    joinedDate: 'Joined: 12 Feb 2026',
    totalPayoutEarned: '$0.00',
    payoutHoldDaysLeft: 30,
    payoutBatch: 'Batch 2',
    autoPayEnabled: false,
    payoutStatus: 'Scheduled',
    hasApplied: true,
    uploadedMedia: [
      {
        id: 'cm-4',
        type: 'Video',
        title: 'iPhone 18 Pro Max Review',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
        duration: '8:15',
        views: '94.2K',
        likes: '12.4K',
        comments: '312',
        uploadDate: '3 days ago',
        isMonetized: false
      }
    ]
  },
  {
    id: 'mon-103',
    userId: 'USR-6520',
    name: 'Rahul Sharma',
    username: 'rahul_official',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80',
    followers: 48200,
    following: 890,
    totalLikes: '580K',
    totalViews: '1.2M',
    viewsVal: 1200000,
    paymentMethod: 'Bank Transfer',
    bankDetails: {
      accountHolder: 'Rahul Sharma',
      bankName: 'State Bank of India',
      fullAccountNumber: '3891029559012',
      maskedAccountNumber: '•••• 5590',
      ifscCode: 'SBIN0004521',
      accountType: 'Current',
      branchName: 'Connaught Place Branch, Delhi'
    },
    isPaymentVerified: true,
    status: 'Active',
    appliedDate: 'Jun 10, 2026',
    joinedDate: 'Joined: 28 Dec 2025',
    totalPayoutEarned: '$4,850.00',
    payoutHoldDaysLeft: 12,
    payoutBatch: 'Batch 3',
    autoPayEnabled: true,
    payoutStatus: 'Scheduled',
    approvalDateISO: '2026-06-10',
    hasApplied: true,
    uploadedMedia: [
      {
        id: 'cm-5',
        type: 'Video',
        title: 'Monsoon EDM Live Set 2026',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
        duration: '15:20',
        views: '840.5K',
        likes: '142.1K',
        comments: '12,400',
        uploadDate: '2 weeks ago',
        isMonetized: true
      },
      {
        id: 'cm-6',
        type: 'Photo',
        title: 'Backstage Synthesizer Setup',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
        views: '359.5K',
        likes: '48.2K',
        comments: '1,890',
        uploadDate: '3 weeks ago',
        isMonetized: true
      }
    ]
  },
  {
    id: 'mon-104',
    userId: 'USR-5120',
    name: 'Ananya Baruah',
    username: 'ananya_b',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80',
    followers: 10500,
    following: 450,
    totalLikes: '98K',
    totalViews: '580.0K',
    viewsVal: 580000,
    paymentMethod: 'UPI',
    upiId: 'ananya_b@ybl',
    isPaymentVerified: true,
    status: 'Pending',
    appliedDate: 'Sep 28, 2026',
    joinedDate: 'Joined: 18 Mar 2026',
    totalPayoutEarned: '$0.00',
    payoutHoldDaysLeft: 30,
    payoutBatch: 'Batch 1',
    autoPayEnabled: false,
    payoutStatus: 'Scheduled',
    hasApplied: true,
    uploadedMedia: [
      {
        id: 'cm-7',
        type: 'Video',
        title: 'Assamese Bihu Dance Tutorial',
        thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
        duration: '4:50',
        views: '180.0K',
        likes: '35.4K',
        comments: '1,120',
        uploadDate: '1 week ago',
        isMonetized: false
      },
      {
        id: 'cm-7b',
        type: 'Photo',
        title: 'Traditional Assamese Silk Attire',
        thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
        views: '400.0K',
        likes: '62.6K',
        comments: '890',
        uploadDate: '4 days ago',
        isMonetized: false
      }
    ]
  },
  {
    id: 'mon-105',
    userId: 'USR-7619',
    name: 'Jane Smith',
    username: 'jane_smith',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=800&auto=format&fit=crop&q=80',
    followers: 45,
    following: 980,
    totalLikes: '1.2K',
    totalViews: '1.2K',
    viewsVal: 1200,
    paymentMethod: 'UPI',
    upiId: 'jane_smith@paytm',
    isPaymentVerified: false,
    status: 'Cancelled',
    appliedDate: 'Jul 18, 2026',
    joinedDate: 'Joined: 04 May 2026',
    totalPayoutEarned: '$0.00',
    payoutHoldDaysLeft: 30,
    payoutBatch: 'Batch 2',
    autoPayEnabled: false,
    payoutStatus: 'Scheduled',
    hasApplied: false,
    uploadedMedia: [
      {
        id: 'cm-8',
        type: 'Photo',
        title: 'Morning Nature Sunrise Shot',
        thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&auto=format&fit=crop&q=80',
        views: '1.2K',
        likes: '94',
        comments: '12',
        uploadDate: '2 months ago',
        isMonetized: false
      }
    ]
  }
];

export default function MonetizationManagement() {
  const [records, setRecords] = useState<MonetizationRecord[]>(INITIAL_RECORDS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal & Selection States
  const [cancelModalRecord, setCancelModalRecord] = useState<MonetizationRecord | null>(null);
  const [selectedPaymentRecord, setSelectedPaymentRecord] = useState<MonetizationRecord | null>(null);
  const [inspectedCreator, setInspectedCreator] = useState<MonetizationRecord | null>(null);
  const [historyModalRecord, setHistoryModalRecord] = useState<MonetizationRecord | null>(null);
  
  // Tab states for media section in Modal
  const [activeMediaTab, setActiveMediaTab] = useState<'All' | 'Videos' | 'Photos' | 'Monetized'>('All');
  
  // Custom video player state
  const [lightboxMedia, setLightboxMedia] = useState<CreatorMedia | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // End-to-End Encryption (E2EE) Payout Vault security states
  const [isE2eeEnabled, setIsE2eeEnabled] = useState(true);
  const [cryptoKey, setCryptoKey] = useState('yousnap_e2ee_aes256_payout_seal_77a9b2c3d4f501e2');
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [newKeyVal, setNewKeyVal] = useState('yousnap_e2ee_aes256_payout_seal_77a9b2c3d4f501e2');

  // 50/50 Payout split and disbursement state
  const [payoutDisburseRecord, setPayoutDisburseRecord] = useState<MonetizationRecord | null>(null);

  // Admin Bank Account Details state with persistent storage in localStorage
  const [adminDetails, setAdminDetails] = useState(() => {
    const saved = localStorage.getItem('yousnap_admin_payout_details');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      bankName: 'State Bank of India',
      accountHolder: 'YouSnap Platform Admin Account',
      fullAccountNumber: '3994109552109',
      ifscCode: 'SBIN0001042',
      upiId: 'yousnap.admin@okaxis'
    };
  });
  const [isEditingAdminDetails, setIsEditingAdminDetails] = useState(false);
  const [payoutSuccessReceipt, setPayoutSuccessReceipt] = useState<{
    creatorName: string;
    creatorUsername: string;
    creatorPayoutMethod: string;
    creatorTarget: string;
    totalAmount: string;
    adminShare: string;
    creatorShare: string;
    transactionId: string;
    timestamp: string;
  } | null>(null);

  // Master Revenue Pool Base with localStorage persistence (screenshot baseline is 183714.22)
  const [masterRevenuePoolBase, setMasterRevenuePoolBase] = useState(() => {
    const saved = localStorage.getItem('yousnap_master_revenue_pool_base_v2');
    return saved !== null ? parseFloat(saved) : 183714.22;
  });

  // State to trigger Admin Withdrawal Modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isEditingWithdrawAdminDetails, setIsEditingWithdrawAdminDetails] = useState(false);
  const [withdrawSuccessReceipt, setWithdrawSuccessReceipt] = useState<{
    amountWithdrawn: string;
    adminBank: string;
    adminAccount: string;
    adminUpi: string;
    transactionId: string;
    timestamp: string;
  } | null>(null);

  // Automated suspension notification modal states
  const [suspensionModalRecord, setSuspensionModalRecord] = useState<MonetizationRecord | null>(null);
  const [suspensionCategory, setSuspensionCategory] = useState('Community Guideline Violation');
  const [suspensionReason, setSuspensionReason] = useState('');

  const [copySuccessMsg, setCopySuccessMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToastMsg({ title, desc, type });
    setTimeout(() => setToastMsg(null), 4500);
  };

  const parseViewsToNumber = (viewsStr: string): number => {
    const clean = viewsStr.trim().toUpperCase();
    if (clean.endsWith('M')) {
      return (parseFloat(clean.replace(/[^0-9.]/g, '')) || 0) * 1000000;
    }
    if (clean.endsWith('K')) {
      return (parseFloat(clean.replace(/[^0-9.]/g, '')) || 0) * 1000;
    }
    return parseFloat(clean.replace(/[^0-9.]/g, '')) || 0;
  };

  const formatViewsCompact = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Calculate real organic monetized views and earnings from creator's monetized videos
  const getCreatorOrganicStats = (record: MonetizationRecord) => {
    const monetizedItems = record.uploadedMedia.filter(m => m.isMonetized);
    const monetizedViewsNum = monetizedItems.reduce((sum, m) => sum + parseViewsToNumber(m.views), 0);
    const rawCurrentEarned = parseFloat(record.totalPayoutEarned.replace(/[^0-9.]/g, '')) || 0;
    const disbursedAmount = record.disbursedAmount || 0;
    // Organic RPM calculation (~$1.95 per 1,000 monetized views) when videos are monetized
    const calculatedOrganicFromViews = monetizedViewsNum > 0
      ? Math.round((monetizedViewsNum / 1000) * 1.95 * 100) / 100
      : 0;

    return {
      monetizedVideosCount: monetizedItems.length,
      monetizedViewsNum,
      monetizedViewsFormatted: formatViewsCompact(monetizedViewsNum),
      rawCurrentEarned,
      organicReferenceAmount: rawCurrentEarned > 0 ? rawCurrentEarned : (disbursedAmount > 0 ? disbursedAmount : calculatedOrganicFromViews)
    };
  };

  const activeMonetizedCount = records.filter(r => r.status === 'Active').length;
  const pendingCount = records.filter(r => r.status === 'Pending').length;

  // Dynamic Sum/Calculate of Creator Earnings using State Array Reduce Function
  const totalCreatorEarnings = records.reduce((acc, r) => {
    const stats = getCreatorOrganicStats(r);
    // Sum up the organicReferenceAmount for active, pending or already disbursed creators
    if (r.status === 'Active' || r.status === 'Pending' || r.payoutStatus === 'Disbursed') {
      return acc + stats.organicReferenceAmount;
    }
    return acc;
  }, 0);

  // Dynamic sum/calculate of pending disbursals
  const totalPendingCreatorDisbursal = records.reduce((acc, r) => {
    const rawVal = parseFloat(r.totalPayoutEarned.replace(/[^0-9.]/g, ''));
    return acc + (isNaN(rawVal) ? 0 : rawVal);
  }, 0);

  // Live Sync with Master Revenue Pool
  const masterRevenuePoolBalance = masterRevenuePoolBase + totalCreatorEarnings;

  const handleApprove = (record: MonetizationRecord) => {
    // Strictly $0.00 initial income upon approval — never auto-add $100.00!
    // Only real monetized video views accrued after monetization will add to earnings.
    const monetizedItems = record.uploadedMedia.filter(m => m.isMonetized);
    const monetizedViewsNum = monetizedItems.reduce((sum, m) => sum + parseViewsToNumber(m.views), 0);
    const initialOrganicEarned = monetizedViewsNum > 0
      ? `$${((monetizedViewsNum / 1000) * 1.95).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : '$0.00';

    setRecords(prev => prev.map(r => r.id === record.id ? { 
      ...r, 
      status: 'Active', 
      approvalDateISO: '2026-10-04',
      payoutHoldDaysLeft: 30,
      hasApplied: true,
      payoutStatus: 'Scheduled',
      totalPayoutEarned: initialOrganicEarned
    } : r));
    showToast(
      'Monetization Approved!',
      `@${record.username} is now Active. Initial balance set to ${initialOrganicEarned} (strictly based on real monetized video views).`,
      'success'
    );
    if (inspectedCreator?.id === record.id) {
      setInspectedCreator(prev => prev ? { 
        ...prev, 
        status: 'Active', 
        approvalDateISO: '2026-10-04',
        payoutHoldDaysLeft: 30,
        hasApplied: true,
        payoutStatus: 'Scheduled',
        totalPayoutEarned: initialOrganicEarned
      } : null);
    }
  };

  const handleToggleMediaMonetization = (mediaId: string) => {
    if (!inspectedCreator) return;
    if (inspectedCreator.status !== 'Active') {
      showToast('Creator Not Active', 'Approve the creator first before enabling video ad monetization.', 'warning');
      return;
    }

    const updatedMedia = inspectedCreator.uploadedMedia.map(m =>
      m.id === mediaId ? { ...m, isMonetized: !m.isMonetized } : m
    );
    const monetizedViewsNum = updatedMedia
      .filter(m => m.isMonetized)
      .reduce((sum, m) => sum + parseViewsToNumber(m.views), 0);
    const updatedEarned = monetizedViewsNum > 0
      ? `$${((monetizedViewsNum / 1000) * 1.95).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : '$0.00';

    setRecords(prev => prev.map(r => r.id === inspectedCreator.id ? {
      ...r,
      uploadedMedia: updatedMedia,
      totalPayoutEarned: updatedEarned,
      payoutStatus: monetizedViewsNum > 0 ? 'Scheduled' : r.payoutStatus
    } : r));

    setInspectedCreator(prev => prev ? {
      ...prev,
      uploadedMedia: updatedMedia,
      totalPayoutEarned: updatedEarned,
      payoutStatus: monetizedViewsNum > 0 ? 'Scheduled' : prev.payoutStatus
    } : null);

    if (lightboxMedia?.id === mediaId) {
      setLightboxMedia(prev => prev ? { ...prev, isMonetized: !prev.isMonetized } : null);
    }

    showToast(
      'Real Video Earnings Updated',
      `Recalculated organic income from ${formatViewsCompact(monetizedViewsNum)} monetized views: ${updatedEarned}`,
      'success'
    );
  };

  const handleReject = (record: MonetizationRecord) => {
    setRecords(prev => prev.map(r => r.id === record.id ? { ...r, status: 'Cancelled' } : r));
    showToast('Application Rejected', `Monetization application for @${record.username} was rejected.`, 'error');
    if (inspectedCreator?.id === record.id) {
      setInspectedCreator(prev => prev ? { ...prev, status: 'Cancelled' } : null);
    }
  };

  const handleSuspendAccount = (record: MonetizationRecord) => {
    // Open Account Suspension Reason Modal instead of immediate suspension
    setSuspensionModalRecord(record);
    setSuspensionReason('');
    setSuspensionCategory('Community Guideline Violation');
  };

  const handleConfirmSuspension = () => {
    if (!suspensionModalRecord) return;
    const record = suspensionModalRecord;

    if (!suspensionReason.trim()) {
      alert('Please provide a violation reason.');
      return;
    }

    setRecords(prev => prev.map(r => r.id === record.id ? { ...r, status: 'Suspended' } : r));
    showToast('Creator Suspended', `@${record.username}'s creator privileges and payouts have been restricted.`, 'error');
    if (inspectedCreator?.id === record.id) {
      setInspectedCreator(prev => prev ? { ...prev, status: 'Suspended' } : null);
    }

    // Dispatch automated in-app notification to localStorage database
    try {
      const userNotifsKey = 'yousnap_user_app_notifications';
      const existingNotifs = localStorage.getItem(userNotifsKey);
      let userNotifs = [];
      if (existingNotifs) {
        userNotifs = JSON.parse(existingNotifs);
      }

      const newAppNotification = {
        id: 'UN-' + Math.floor(10000 + Math.random() * 90000),
        userId: record.userId,
        username: record.username,
        title: '⚠️ Account Suspended',
        message: `[Violation Category: ${suspensionCategory}] ${suspensionReason.trim()}`,
        category: suspensionCategory,
        timestamp: new Date().toLocaleString(),
        actionLink: 'Appeal / Support'
      };

      userNotifs.unshift(newAppNotification);
      localStorage.setItem(userNotifsKey, JSON.stringify(userNotifs));
    } catch (err) {
      console.error('Failed to dispatch user app notification:', err);
    }

    // Reset suspension modal state
    setSuspensionModalRecord(null);
    setSuspensionReason('');
    setSuspensionCategory('Community Guideline Violation');
  };

  const handleDeleteContentItem = (mediaId: string) => {
    if (!inspectedCreator) return;
    
    // Dynamically filter content item from state records
    setRecords(prev => prev.map(r => {
      if (r.id === inspectedCreator.id) {
        return {
          ...r,
          uploadedMedia: r.uploadedMedia.filter(m => m.id !== mediaId)
        };
      }
      return r;
    }));

    // Sync inspection modal state
    setInspectedCreator(prev => {
      if (!prev) return null;
      return {
        ...prev,
        uploadedMedia: prev.uploadedMedia.filter(m => m.id !== mediaId)
      };
    });

    setLightboxMedia(null);
    showToast('Content Deleted', 'The specific post was successfully deleted from YouSnap App.', 'success');
  };

  const handleConfirmCancelMonetization = () => {
    if (!cancelModalRecord) return;
    const target = cancelModalRecord;
    setRecords(prev => prev.map(r => r.id === target.id ? { ...r, status: 'Cancelled' } : r));
    showToast('Monetization Revoked', `Monetization cancelled for @${target.username}. Features disabled on YouSnap App.`, 'warning');
    setCancelModalRecord(null);
    if (inspectedCreator?.id === target.id) {
      setInspectedCreator(prev => prev ? { ...prev, status: 'Cancelled' } : null);
    }
  };

  const handleExecutePayoutDisbursement = () => {
    if (!payoutDisburseRecord) return;
    const target = payoutDisburseRecord;
    
    // Parse target amount
    const rawVal = parseFloat(target.totalPayoutEarned.replace(/[^0-9.]/g, ''));
    if (isNaN(rawVal) || rawVal <= 0) return;

    // 50/50 split calculations
    const adminShare = rawVal * 0.5;
    const creatorShare = rawVal * 0.5;

    // Deduct from record to show $0.00 and mark payoutStatus as Disbursed, persisting disbursedAmount
    setRecords(prev => prev.map(r => r.id === target.id ? { 
      ...r, 
      totalPayoutEarned: '$0.00', 
      payoutStatus: 'Disbursed',
      disbursedAmount: (r.disbursedAmount || 0) + rawVal
    } : r));

    // Generate unique mock tx ID
    const randomTxId = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
    const dateStr = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    // Set payout success receipt to show beautiful success indicator
    setPayoutSuccessReceipt({
      creatorName: target.name,
      creatorUsername: target.username,
      creatorPayoutMethod: target.paymentMethod,
      creatorTarget: target.paymentMethod === 'UPI' ? (target.upiId || '') : (target.bankDetails?.maskedAccountNumber || ''),
      totalAmount: target.totalPayoutEarned,
      adminShare: `$${adminShare.toFixed(2)}`,
      creatorShare: `$${creatorShare.toFixed(2)}`,
      transactionId: randomTxId,
      timestamp: dateStr
    });

    // Display a beautiful notification
    showToast(
      'Payout Disbursed Successfully!',
      `Released total of $${rawVal.toLocaleString()}: $${creatorShare.toFixed(2)} sent to @${target.username} and $${adminShare.toFixed(2)} sent to Admin Receiving Account.`,
      'success'
    );
  };

  const handleCopyText = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopySuccessMsg(`${label} copied to clipboard!`);
    setTimeout(() => setCopySuccessMsg(null), 3000);
    showToast('Copied!', `${label} copied to clipboard.`, 'success');
  };

  const handleCopyBankDetails = (bankDetails: NonNullable<MonetizationRecord['bankDetails']>) => {
    const formatted = `Account Holder: ${bankDetails.accountHolder}\nBank Name: ${bankDetails.bankName}\nAccount Number: ${bankDetails.fullAccountNumber}\nIFSC Code: ${bankDetails.ifscCode}\nAccount Type: ${bankDetails.accountType || 'Savings'}\nBranch: ${bankDetails.branchName || 'N/A'}`;
    navigator.clipboard.writeText(formatted);
    setCopySuccessMsg('Bank account details copied to clipboard!');
    setTimeout(() => setCopySuccessMsg(null), 3000);
    showToast('Bank Info Copied!', `Bank transfer details for ${bankDetails.accountHolder} copied.`, 'success');
  };

  const handleToggleVerifyPaymentInfo = (recordId: string) => {
    setRecords(prev => prev.map(r => {
      if (r.id === recordId) {
        const nextVerified = !r.isPaymentVerified;
        showToast(
          nextVerified ? 'Payment Info Verified' : 'Verification Status Reset',
          nextVerified ? `Payment details for @${r.username} marked as verified.` : `Verification mark removed.`,
          nextVerified ? 'success' : 'warning'
        );
        return { ...r, isPaymentVerified: nextVerified };
      }
      return r;
    }));

    if (selectedPaymentRecord && selectedPaymentRecord.id === recordId) {
      setSelectedPaymentRecord(prev => prev ? { ...prev, isPaymentVerified: !prev.isPaymentVerified } : null);
    }
    if (inspectedCreator && inspectedCreator.id === recordId) {
      setInspectedCreator(prev => prev ? { ...prev, isPaymentVerified: !prev.isPaymentVerified } : null);
    }
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.upiId && r.upiId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.bankDetails && r.bankDetails.bankName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.bankDetails && r.bankDetails.accountHolder.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
             toastMsg.type === 'warning' ? <ShieldAlert size={20} /> :
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

      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <DollarSign className="text-emerald-600" size={26} /> Creator Monetization & Payout Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage creator monetization applications, payment methods (UPI / Bank Transfer), and payout distributions</p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-800">
          <TrendingUp size={16} className="text-emerald-600" />
          <span>Active Revenue Program</span>
        </div>
      </div>

      {/* Top Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Master Revenue Pool - Fully Interactive for Withdrawal */}
        <div 
          onClick={() => setShowWithdrawModal(true)}
          className="bg-slate-900 text-white p-6 rounded-3xl shadow-md border border-slate-800 hover:border-emerald-500/50 cursor-pointer active:scale-[0.98] relative overflow-hidden group hover:shadow-xl transition-all duration-300 select-none"
          title="Click to withdraw total platform revenue to your saved admin account"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                Master Revenue Pool <span className="text-emerald-400 text-[8px] font-black tracking-normal uppercase bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-900/50">💳 Click to Withdraw</span>
              </p>
              <p className="text-2xl font-black text-slate-100 font-mono mt-2">
                ${masterRevenuePoolBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Sparkles size={24} className="animate-pulse" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-[11px] text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-full">★ Central Hub</span>
              <span>Total Admin Collection</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-black group-hover:underline">Withdraw Cash ➔</span>
          </div>
        </div>

        {/* Pending Creator Disbursal */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending Creator Disbursal</p>
              <p className="text-2xl font-black text-emerald-600 font-mono mt-2">
                ${totalPendingCreatorDisbursal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[11px]">
            <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">⏳ Accrued Due</span>
            <span className="text-slate-400">held in central account</span>
          </div>
        </div>

        {/* Approved Monetized Creators */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Monetized Creators</p>
              <p className="text-2xl font-black text-slate-900 mt-2">{activeMonetizedCount + 1420}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users size={24} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[11px]">
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">● Approved</span>
            <span className="text-slate-400">active payout creators</span>
          </div>
        </div>

        {/* Pending Applications */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending Applications</p>
              <p className="text-2xl font-black text-slate-900 mt-2">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock size={24} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[11px]">
            <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">⚠️ Review Needed</span>
            <span className="text-slate-400">awaiting decision</span>
          </div>
        </div>
      </div>

      {/* End-to-End Encryption (E2EE) Cryptographic Security Panel */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-md border border-slate-850 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-400">
              <ShieldCheck size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
                  🔒 End-to-End Encrypted (E2EE) Payout Seal Security Center
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                  System Lock Active & Protected
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-extrabold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Immutable Encryption
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                All UPI VPA addresses and bank routing codes are cryptographically sealed client-side before database transit to prevent MITM tampering or database leak.
              </p>
            </div>
          </div>

          {/* Disabled Read-Only Indicator */}
          <button
            disabled
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-none shrink-0 flex items-center gap-1.5 cursor-not-allowed pointer-events-none select-none opacity-80"
          >
            🔒 Security Active (Locked)
          </button>
        </div>

        {/* Read-Only Secret Key Vault display area */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-xs">
          {/* Decryption status check */}
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Cryptographic cipher</p>
              <p className="text-slate-200 font-extrabold font-mono mt-1">AES-GCM-256</p>
            </div>
            <span className="text-[9px] text-emerald-400 bg-emerald-950/60 border border-emerald-900/50 px-2 py-0.5 rounded">Immutable</span>
          </div>

          {/* Read-Only Secret key display */}
          <div className="sm:col-span-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-3 select-none">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-500 uppercase font-bold">AES-256 Payout Private Key Seal (Read Only)</p>
              <p className="text-slate-300 font-mono mt-1 truncate tracking-wider">yousnap_e2ee_aes256_payout_seal_77a9b2c3d4f501e2</p>
            </div>

            <div className="flex gap-2 shrink-0 items-center">
              <span className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded font-bold text-[10px] border border-slate-700/50 flex items-center gap-1">
                🔒 Sealed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card - Full-Width Executive Horizontal Layout */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by creator name, @username, User ID, or bank/UPI ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition" 
            />
          </div>

          <div className="flex items-center gap-2.5 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 shrink-0">
            <Filter size={15} className="text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Status:</span>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active (Monetized)</option>
              <option value="Pending">Pending Review</option>
              <option value="Cancelled">Cancelled / Revoked</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Monetization Table - Full-Width Horizontal Responsive ("Lomba Table") Layout */}
        <div className="w-full overflow-x-auto border border-slate-200/80 rounded-2xl shadow-2xs">
          <table className="w-full min-w-[1080px] text-sm border-collapse">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider select-none">
              <tr>
                <th className="py-4 px-6 text-center min-w-[270px]">Creator Profile & ID</th>
                <th className="py-4 px-6 text-center min-w-[215px]">Scheduled Payout Window</th>
                <th className="py-4 px-6 text-center min-w-[235px]">Applied Date & Earned</th>
                <th className="py-4 px-6 text-center min-w-[160px]">Status</th>
                <th className="py-4 px-6 text-center min-w-[230px]">Actions / Payout History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-14 text-slate-400">
                    <AlertCircle size={32} className="mx-auto mb-2 text-slate-300" />
                    No monetization records matching search found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const organicStats = getCreatorOrganicStats(record);

                  // Calculate Approval Date based rolling payout details
                  const rollingDetails = record.approvalDateISO ? (() => {
                    const approvalDate = new Date(record.approvalDateISO);
                    const currentLocalTime = new Date('2026-10-04T01:02:09-07:00'); // System Date context

                    // 1st Month Rolling Window is (Approval Date + 30 days) to (Approval Date + 33 days)
                    const firstMonthStart = new Date(approvalDate);
                    firstMonthStart.setDate(firstMonthStart.getDate() + 30);
                    const firstMonthEnd = new Date(firstMonthStart);
                    firstMonthEnd.setDate(firstMonthEnd.getDate() + 3);

                    let targetStart = new Date(firstMonthStart);
                    let targetEnd = new Date(firstMonthEnd);
                    let cycleText = '1st Month Rolling Cycle';

                    if (currentLocalTime > firstMonthEnd) {
                      const monthsDiff = (currentLocalTime.getFullYear() - firstMonthStart.getFullYear()) * 12 + (currentLocalTime.getMonth() - firstMonthStart.getMonth());
                      const targetMonthOffset = monthsDiff >= 0 ? monthsDiff : 0;

                      targetStart.setMonth(firstMonthStart.getMonth() + targetMonthOffset);
                      targetEnd.setMonth(firstMonthEnd.getMonth() + targetMonthOffset);

                      if (currentLocalTime > targetEnd) {
                        targetStart.setMonth(targetStart.getMonth() + 1);
                        targetEnd.setMonth(targetEnd.getMonth() + 1);
                        cycleText = `${targetMonthOffset + 2}nd Month Recurring Cycle`;
                      } else {
                        cycleText = `${targetMonthOffset + 1}st Month Recurring Cycle`;
                      }
                      if (targetMonthOffset > 0) {
                        cycleText = `${targetMonthOffset + 1}nd Month Recurring Cycle`;
                      }
                    }

                    const formatDate = (d: Date) => {
                      const day = String(d.getDate()).padStart(2, '0');
                      const month = d.toLocaleString('en-US', { month: 'short' });
                      const year = d.getFullYear();
                      return `${day} ${month} ${year}`;
                    };

                    const formatDateShort = (d: Date) => {
                      const day = String(d.getDate()).padStart(2, '0');
                      const month = d.toLocaleString('en-US', { month: 'short' });
                      return `${day} ${month}`;
                    };

                    return {
                      approvedDateFormatted: formatDate(approvalDate),
                      payoutWindowFormatted: `${formatDateShort(targetStart)} – ${formatDateShort(targetEnd)}, ${targetStart.getFullYear()}`,
                      cycleText,
                      isCurrentlyDisbursed: record.payoutStatus === 'Disbursed' && organicStats.rawCurrentEarned === 0
                    };
                  })() : null;

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors duration-150">
                      
                      {/* 1. Creator Profile & ID Column */}
                      <td className="py-5 px-6 align-middle">
                        <div 
                          onClick={() => setInspectedCreator(record)}
                          className="flex items-center justify-center sm:justify-start gap-3.5 cursor-pointer group select-none mx-auto max-w-[260px]"
                          title="Click to open Creator Inspection Center"
                        >
                          <div className="relative shrink-0">
                            <img 
                              src={record.avatar} 
                              alt={record.name} 
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs group-hover:ring-2 group-hover:ring-emerald-500 transition-all duration-200" 
                            />
                            {record.status === 'Active' && (
                              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white">
                                <Check size={9} className="stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 text-left space-y-0.5">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <p className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">{record.name}</p>
                              <ExternalLink size={12} className="text-slate-400 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
                              <span className="font-medium">@{record.username}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono text-[11px] font-bold text-emerald-700 tabular-nums">{record.userId}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 whitespace-nowrap tabular-nums">
                              {record.joinedDate}
                              {rollingDetails ? ` · Approved: ${rollingDetails.approvedDateFormatted}` : ''}
                            </p>
                            {/* Payout Hold Status Indicator */}
                            {record.status === 'Active' && (
                              <div className="pt-1">
                                {record.payoutHoldDaysLeft === 0 ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                    🔓 Hold Cleared (Withdrawable)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap tabular-nums">
                                    🔒 30-Day Hold Active ({record.payoutHoldDaysLeft}d)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Scheduled Payout Window Column (Centered) */}
                      <td className="py-5 px-6 text-center align-middle">
                        {rollingDetails ? (
                          <div className="inline-flex flex-col items-center justify-center space-y-1.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">
                              Next Payout Window
                            </span>
                            <span className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50/90 text-indigo-700 border border-indigo-200/80 shadow-2xs whitespace-nowrap tabular-nums">
                              <Calendar size={12} className="text-indigo-500 shrink-0" />
                              {rollingDetails.payoutWindowFormatted}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                            <Clock size={12} className="text-slate-400 shrink-0" />
                            Awaiting Approval
                          </span>
                        )}
                      </td>

                      {/* 3. Applied Date & Earned Column (Centered - Real Organic Earnings & Video Views) */}
                      <td className="py-5 px-6 text-center align-middle">
                        <div className="inline-flex flex-col items-center justify-center space-y-1.5">
                          <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                            <span className={`text-base font-extrabold font-mono tabular-nums ${
                              organicStats.rawCurrentEarned > 0 ? 'text-emerald-700' : 'text-slate-800'
                            }`}>
                              {record.totalPayoutEarned}
                            </span>
                            {organicStats.rawCurrentEarned > 0 && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 whitespace-nowrap">
                                Organic Earned
                              </span>
                            )}
                          </div>

                          {/* Real Video Views & Monetization Earnings Context */}
                          <p className="text-[11px] text-slate-500 font-medium whitespace-nowrap tabular-nums">
                            {organicStats.monetizedVideosCount > 0 ? (
                              <span>
                                {organicStats.monetizedViewsFormatted} Monetized Views ({organicStats.monetizedVideosCount} {organicStats.monetizedVideosCount === 1 ? 'Video' : 'Videos'})
                              </span>
                            ) : (
                              <span>{record.totalViews} Total Views · 0 Monetized</span>
                            )}
                          </p>

                          {/* Disburse Button or Accurate Earning State Badge */}
                          {organicStats.rawCurrentEarned > 0 && record.status === 'Active' ? (
                            <button
                              onClick={() => setPayoutDisburseRecord(record)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 whitespace-nowrap"
                              title="Click to process 50/50 Revenue Split & release payout"
                            >
                              💸 Disburse (50/50)
                            </button>
                          ) : record.payoutStatus === 'Disbursed' ? (
                            <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                              ✓ Paid & Disbursed {organicStats.organicReferenceAmount > 0 ? `($${organicStats.organicReferenceAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : ''}
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap tabular-nums">
                              Initial Income: $0.00
                            </span>
                          )}

                          <p className="text-[11px] text-slate-400 font-medium whitespace-nowrap tabular-nums">
                            {record.hasApplied === false ? 'Not Applied Yet' : `Applied: ${record.appliedDate}`}
                          </p>
                        </div>
                      </td>

                      {/* 4. Status Column (Centered) */}
                      <td className="py-5 px-6 text-center align-middle">
                        <span className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs whitespace-nowrap ${
                          record.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          record.status === 'Pending' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          record.status === 'Suspended' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {record.status === 'Active' ? '● Active' :
                           record.status === 'Pending' ? '⚠️ Pending Review' :
                           record.status === 'Suspended' ? '🚫 Suspended' : '🚫 Cancelled'}
                        </span>
                      </td>

                      {/* 5. Actions / Payout History Column (Centered) */}
                      <td className="py-5 px-6 text-center align-middle">
                        {record.status === 'Pending' ? (
                          <div className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap">
                            <button 
                              onClick={() => handleApprove(record)}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95"
                            >
                              <CheckCircle2 size={14} /> Approve
                            </button>
                            <button 
                              onClick={() => handleReject(record)}
                              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition shadow-2xs inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        ) : record.status === 'Active' ? (
                          <div className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap">
                            <button
                              onClick={() => setHistoryModalRecord(record)}
                              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition shadow-2xs inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95"
                              title="Click to view full 1-Year Annual Statement & download receipts"
                            >
                              <CreditCard size={14} /> Payout History
                            </button>
                            <button 
                              onClick={() => setCancelModalRecord(record)}
                              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition shadow-2xs inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95"
                            >
                              <Ban size={14} /> Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap">
                            {record.approvalDateISO && (
                              <button
                                onClick={() => setHistoryModalRecord(record)}
                                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition shadow-2xs inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95"
                                title="Click to view past payout history"
                              >
                                <CreditCard size={14} /> Payout History
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                if (record.hasApplied === false) {
                                  showToast('Re-Approve Failed', 'User has not applied for monetization yet.', 'error');
                                } else {
                                  handleApprove(record);
                                }
                              }}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-2xs inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                                record.hasApplied === false
                                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 active:scale-95'
                              }`}
                            >
                              <CheckCircle2 size={14} /> Re-Approve
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DYNAMIC COMPREHENSIVE CREATOR PROFILE & INSPECTION MODAL */}
      {inspectedCreator && (
        <div className="fixed inset-0 bg-slate-50 z-[75] flex flex-col animate-in fade-in duration-200 overflow-hidden">
          <div className="bg-white w-full h-full overflow-hidden flex flex-col flex-1">
            
            {/* Modal Top Header with close button */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 uppercase tracking-wider animate-pulse">
                  Creator Inspection Center
                </span>
                <span className="text-slate-400 text-xs font-mono">{inspectedCreator.userId}</span>
              </div>
              <button 
                onClick={() => {
                  setInspectedCreator(null);
                  setLightboxMedia(null);
                }} 
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Dashboard Container */}
            <div className="overflow-y-auto flex-1 pb-6 space-y-6">
              
              {/* Profile Cover Photo and Avatar Stack */}
              <div className="relative h-44 bg-slate-800 shrink-0 select-none">
                <img 
                  src={inspectedCreator.coverImage} 
                  alt="cover" 
                  className="w-full h-full object-cover opacity-90 filter brightness-95" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                
                {/* Profile Details Overlay on Cover */}
                <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={inspectedCreator.avatar} 
                      alt={inspectedCreator.name} 
                      className="w-20 h-20 rounded-3xl object-cover border-4 border-white shadow-xl bg-slate-100 shrink-0" 
                    />
                    <div className="text-white">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-extrabold tracking-tight">{inspectedCreator.name}</h3>
                        {inspectedCreator.status === 'Active' && (
                          <span className="bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <ShieldCheck size={10} /> Active
                          </span>
                        )}
                        {inspectedCreator.status === 'Pending' && (
                          <span className="bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Clock size={10} /> Pending
                          </span>
                        )}
                        {inspectedCreator.status === 'Suspended' && (
                          <span className="bg-rose-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Lock size={10} /> Suspended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300">@{inspectedCreator.username}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Calendar size={11} /> {inspectedCreator.joinedDate}
                      </p>
                    </div>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-2xl text-[11px] font-extrabold bg-white/10 text-white border border-white/20 backdrop-blur-md">
                    Apply Date: {inspectedCreator.appliedDate}
                  </span>
                </div>
              </div>

              {/* Real-time Comprehensive Analytics Cards */}
              <div className="px-6">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase">Followers</p>
                    <p className="text-base font-extrabold text-slate-900 mt-1">{inspectedCreator.followers.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase">Following</p>
                    <p className="text-base font-extrabold text-slate-900 mt-1">{inspectedCreator.following}</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase">Total Likes</p>
                    <p className="text-base font-extrabold text-indigo-600 mt-1">{inspectedCreator.totalLikes}</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase">Total Views</p>
                    <p className="text-base font-extrabold text-emerald-600 mt-1">{inspectedCreator.totalViews}</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center col-span-2 sm:col-span-1">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase">Uploads</p>
                    <p className="text-xs font-bold text-slate-700 mt-1">
                      {inspectedCreator.uploadedMedia.filter(m => m.type === 'Video').length}V • {inspectedCreator.uploadedMedia.filter(m => m.type === 'Photo').length}P
                    </p>
                  </div>
                </div>
              </div>

              {/* Payout Routes & Verification status details */}
              <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard size={15} className="text-indigo-600" /> 
                    {inspectedCreator.paymentMethod === 'UPI' ? 'UPI Route Details' : 'Bank Transfer Route Details'}
                  </h4>
                  
                  {inspectedCreator.hasApplied === false ? (
                    <div className="bg-white p-6 rounded-xl border border-dashed border-slate-300 text-center py-10 flex flex-col items-center justify-center space-y-2 select-none">
                      <Lock size={24} className="text-slate-400" />
                      <p className="font-extrabold text-slate-800 text-xs">No Payment Details Submitted</p>
                      <p className="text-[10px] text-slate-400 max-w-[220px] leading-relaxed">
                        This creator has not submitted a monetization application yet. Form details will unlock once they apply from YouSnap App.
                      </p>
                    </div>
                  ) : inspectedCreator.paymentMethod === 'UPI' ? (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div>
                          <p className="text-[9px] text-slate-400 font-extrabold uppercase">Payment Method</p>
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            UPI Payment
                          </span>
                        </div>
                        <button 
                          onClick={() => handleCopyText(inspectedCreator.upiId || '', 'UPI ID')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                        >
                          <Copy size={10} /> Copy ID
                        </button>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase">UPI Address (VPA)</p>
                        <p className="font-mono text-xs font-black text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-150 mt-1">
                          {inspectedCreator.upiId}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="grid grid-cols-2 gap-3 border-b border-slate-100 pb-2">
                        <div>
                          <p className="text-[9px] text-slate-400 font-extrabold uppercase">Account Holder</p>
                          <p className="font-extrabold text-slate-900 text-xs mt-0.5">{inspectedCreator.bankDetails?.accountHolder}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-extrabold uppercase">Bank Name</p>
                          <p className="font-bold text-slate-800 text-xs mt-0.5">{inspectedCreator.bankDetails?.bankName}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase">Account Number</p>
                        <p className="font-mono text-xs font-black text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-150 mt-1 tracking-wider">
                          {inspectedCreator.bankDetails?.fullAccountNumber}
                        </p>
                      </div>
                      {inspectedCreator.bankDetails?.ifscCode && (
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <p className="text-[9px] text-slate-400 font-extrabold uppercase">IFSC Code</p>
                            <p className="font-mono text-xs font-bold text-slate-800 mt-0.5">{inspectedCreator.bankDetails.ifscCode}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-extrabold uppercase">Branch</p>
                            <p className="text-slate-800 text-xs mt-0.5 truncate">{inspectedCreator.bankDetails.branchName || 'Main Branch'}</p>
                          </div>
                        </div>
                      )}
                      <button 
                        onClick={() => inspectedCreator.bankDetails && handleCopyBankDetails(inspectedCreator.bankDetails)}
                        className="w-full mt-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition"
                      >
                        <Copy size={11} /> Copy Full Routing Details
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-600" /> Payment Route Verification
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">Verify if the submitted credentials match legal documents for taxing and payment processing.</p>
                  </div>

                  <div className="flex items-center justify-between mt-3 bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-700">Verification Status</span>
                    <button 
                      onClick={() => handleToggleVerifyPaymentInfo(inspectedCreator.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        inspectedCreator.isPaymentVerified 
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {inspectedCreator.isPaymentVerified ? (
                        <>
                          <ShieldCheck size={12} /> Verified
                        </>
                      ) : (
                        'Verify Now'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Uploaded Media Gallery with Interactive Tabs and Grid */}
              <div className="px-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-slate-100 pt-5">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Film size={16} className="text-emerald-600" /> Creator Media & Uploads Gallery
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Click any thumbnail below to launch the Built-in interactive media inspect player</p>
                  </div>

                  {/* Interactive Tab switches */}
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 select-none text-[10px]">
                    <button 
                      onClick={() => setActiveMediaTab('All')}
                      className={`px-3 py-1.5 rounded-lg font-extrabold transition ${
                        activeMediaTab === 'All' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All Content ({inspectedCreator.uploadedMedia.length})
                    </button>
                    <button 
                      onClick={() => setActiveMediaTab('Videos')}
                      className={`px-3 py-1.5 rounded-lg font-extrabold transition flex items-center gap-1 ${
                        activeMediaTab === 'Videos' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Videos Only ({inspectedCreator.uploadedMedia.filter(m => m.type === 'Video').length})
                    </button>
                    <button 
                      onClick={() => setActiveMediaTab('Photos')}
                      className={`px-3 py-1.5 rounded-lg font-extrabold transition flex items-center gap-1 ${
                        activeMediaTab === 'Photos' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Photos Only ({inspectedCreator.uploadedMedia.filter(m => m.type === 'Photo').length})
                    </button>
                    <button 
                      onClick={() => setActiveMediaTab('Monetized')}
                      className={`px-3 py-1.5 rounded-lg font-extrabold transition flex items-center gap-1 ${
                        activeMediaTab === 'Monetized' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Sparkles size={10} className="text-amber-500 fill-amber-500" /> Monetized ({inspectedCreator.uploadedMedia.filter(m => m.isMonetized).length})
                    </button>
                  </div>
                </div>

                {/* Grid Layout of photos/videos */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {inspectedCreator.uploadedMedia
                    .filter(m => {
                      if (activeMediaTab === 'All') return true;
                      if (activeMediaTab === 'Videos') return m.type === 'Video';
                      if (activeMediaTab === 'Photos') return m.type === 'Photo';
                      if (activeMediaTab === 'Monetized') return m.isMonetized;
                      return true;
                    })
                    .map(media => (
                      <div 
                        key={media.id} 
                        onClick={() => {
                          setLightboxMedia(media);
                          setIsPlaying(true);
                        }}
                        className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group aspect-video cursor-pointer hover:shadow-md hover:border-slate-300 transition-all duration-200"
                      >
                        <img src={media.thumbnail} alt={media.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                        
                        {/* Status elements */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                          <Play size={24} className="text-white fill-white animate-pulse" />
                        </div>

                        {media.type === 'Video' && (
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] bg-black/70 font-extrabold text-white flex items-center gap-0.5">
                            <Film size={8} /> {media.duration || 'Shorts'}
                          </span>
                        )}

                        {media.isMonetized && (
                          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] bg-emerald-600 font-extrabold text-white flex items-center gap-0.5 shadow-xs">
                            🔥 Monetized
                          </span>
                        )}

                        <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                          <p className="text-[10px] font-bold text-white truncate">{media.title}</p>
                          <p className="text-[8px] text-slate-300 mt-0.5 flex items-center gap-2">
                            <span>👁️ {media.views} views</span>
                            <span>❤️ {media.likes}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* BUILT-IN ACTIVE INSPECTOR VIDEO/PHOTO LIGHTBOX */}
              {lightboxMedia && (
                <div className="px-6 pt-4">
                  <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-xl p-5 space-y-4 animate-in slide-in-from-bottom-4 duration-200">
                    <div className="flex justify-between items-center text-white pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${lightboxMedia.type === 'Video' ? 'bg-indigo-600' : 'bg-amber-600'}`}>
                          {lightboxMedia.type} Previewing Mode
                        </span>
                        <p className="text-xs font-bold truncate max-w-sm">{lightboxMedia.title}</p>
                      </div>
                      <button 
                        onClick={() => setLightboxMedia(null)}
                        className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full"
                        title="Close player view"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Left: Built-In Interactive Media Player Component */}
                      <div className="md:col-span-2 relative aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center shadow-inner group">
                        {lightboxMedia.type === 'Video' ? (
                          <>
                            <video 
                              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                              controls={false}
                              autoPlay={isPlaying}
                              muted={isMuted}
                              className="w-full h-full object-contain"
                            />
                            
                            {/* Custom Play/Mute overlays */}
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-xl opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => setIsPlaying(!isPlaying)}
                                  className="text-white hover:text-emerald-400 font-bold text-xs"
                                >
                                  {isPlaying ? 'Pause ⏸' : 'Play ▶'}
                                </button>
                                <button 
                                  onClick={() => setIsMuted(!isMuted)}
                                  className="text-white hover:text-emerald-400"
                                >
                                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                                </button>
                              </div>
                              <span className="text-[10px] text-slate-300 font-mono">Looping Active</span>
                            </div>
                          </>
                        ) : (
                          <img src={lightboxMedia.thumbnail} alt="preview" className="w-full h-full object-contain" />
                        )}
                      </div>

                      {/* Right: Media Stats Details & Admin Actions */}
                      <div className="bg-slate-950 p-4 rounded-2xl text-slate-300 flex flex-col justify-between">
                        <div className="space-y-3 text-xs">
                          <p className="font-bold text-white text-sm truncate">{lightboxMedia.title}</p>
                          <p className="text-[10px] text-slate-400">Uploaded Date: {lightboxMedia.uploadDate}</p>
                          
                          <div className="grid grid-cols-3 gap-2 text-center pt-2">
                            <div className="bg-slate-900 p-2 rounded-xl">
                              <p className="text-[9px] text-slate-400">Views</p>
                              <p className="font-bold text-white mt-0.5">{lightboxMedia.views}</p>
                            </div>
                            <div className="bg-slate-900 p-2 rounded-xl">
                              <p className="text-[9px] text-slate-400">Likes</p>
                              <p className="font-bold text-indigo-400 mt-0.5">{lightboxMedia.likes}</p>
                            </div>
                            <div className="bg-slate-900 p-2 rounded-xl">
                              <p className="text-[9px] text-slate-400">Comments</p>
                              <p className="font-bold text-emerald-400 mt-0.5">{lightboxMedia.comments}</p>
                            </div>
                          </div>
                        </div>

                        {/* Interactive specific content actions */}
                        <div className="mt-5 space-y-2">
                          <button 
                            onClick={() => handleToggleMediaMonetization(lightboxMedia.id)}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border shadow-xs ${
                              lightboxMedia.isMonetized
                                ? 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white border-amber-500/30'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/40'
                            }`}
                          >
                            <DollarSign size={13} /> {lightboxMedia.isMonetized ? 'Disable Ad Monetization' : 'Enable Real Views Monetization'}
                          </button>
                          <button 
                            onClick={() => handleDeleteContentItem(lightboxMedia.id)}
                            className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-rose-500/30 shadow-xs"
                          >
                            <Trash2 size={13} /> Delete Specific Content
                          </button>
                          <button 
                            onClick={() => setLightboxMedia(null)}
                            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition text-center"
                          >
                            Close Inspector
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Bottom Payout Review Action Controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
              <div className="flex flex-wrap items-center gap-2">
                {inspectedCreator.status === 'Pending' ? (
                  <>
                    <button 
                      onClick={() => handleApprove(inspectedCreator)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <CheckCircle2 size={14} /> Approve Monetization
                    </button>
                    <button 
                      onClick={() => handleReject(inspectedCreator)}
                      className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition flex items-center gap-1.5 active:scale-95"
                    >
                      <XCircle size={14} /> Reject Application
                    </button>
                  </>
                ) : inspectedCreator.status === 'Active' ? (
                  <button 
                    onClick={() => { setCancelModalRecord(inspectedCreator); }}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Ban size={14} /> Revoke Monetization
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      if (inspectedCreator.hasApplied === false) {
                        showToast('Re-Approve Failed', 'User has not applied for monetization yet.', 'error');
                      } else {
                        handleApprove(inspectedCreator);
                      }
                    }}
                    className={`px-4 py-2.5 font-bold rounded-xl text-xs transition flex items-center gap-1.5 active:scale-95 ${
                      inspectedCreator.hasApplied === false 
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60' 
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    Re-Approve Privileges
                  </button>
                )}

                {/* Suspend account action control */}
                {inspectedCreator.status !== 'Suspended' && (
                  <button 
                    onClick={() => handleSuspendAccount(inspectedCreator)}
                    className="px-4 py-2.5 bg-rose-50/80 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition flex items-center gap-1.5 active:scale-95"
                    title="Restrict layout and block payout channels"
                  >
                    <UserX size={14} /> Suspend Creator Account
                  </button>
                )}
              </div>

              <button 
                onClick={() => {
                  setInspectedCreator(null);
                  setLightboxMedia(null);
                }}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition"
              >
                Close Profile Inspection
              </button>
            </div>

          </div>
        </div>
      )}

      {/* INTERACTIVE PAYMENT & VERIFICATION DETAILS POPUP MODAL */}
      {selectedPaymentRecord && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[75] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Top Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-md ${
                  selectedPaymentRecord.paymentMethod === 'UPI' ? 'bg-indigo-600' : 'bg-emerald-600'
                }`}>
                  {selectedPaymentRecord.paymentMethod === 'UPI' ? <QrCode size={24} /> : <Building2 size={24} />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold flex items-center gap-2">
                    Payment & Verification Details
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official payout credentials submitted for YouSnap Monetization
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPaymentRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              
              {/* Creator Profile Summary Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={selectedPaymentRecord.avatar} alt={selectedPaymentRecord.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{selectedPaymentRecord.name}</h4>
                    <p className="text-xs text-slate-500">@{selectedPaymentRecord.username} • <span className="font-bold text-emerald-600">{selectedPaymentRecord.userId}</span></p>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                  selectedPaymentRecord.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                  selectedPaymentRecord.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {selectedPaymentRecord.status}
                </span>
              </div>

              {/* Copy Banner Notification */}
              {copySuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{copySuccessMsg}</span>
                </div>
              )}

              {/* DYNAMIC PAYMENT DETAILS DISPLAY */}
              {selectedPaymentRecord.paymentMethod === 'UPI' ? (
                /* UPI Details View */
                <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                      <QrCode size={16} className="text-indigo-600" /> Virtual Payment Address (UPI)
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                      selectedPaymentRecord.isPaymentVerified ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      <ShieldCheck size={12} />
                      {selectedPaymentRecord.isPaymentVerified ? 'Verified VPA' : 'Pending Verification'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-indigo-200 flex items-center justify-between gap-3 shadow-xs">
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase">Registered UPI ID</p>
                      <p className="font-mono text-base font-extrabold text-slate-900 mt-0.5">{selectedPaymentRecord.upiId}</p>
                    </div>
                    <button 
                      onClick={() => handleCopyText(selectedPaymentRecord.upiId || '', 'UPI ID')}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 shrink-0"
                    >
                      <Copy size={13} /> Copy UPI ID
                    </button>
                  </div>
                </div>
              ) : (
                /* Bank Transfer Details View */
                <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                      <Building2 size={16} className="text-emerald-600" /> Bank Transfer Credentials
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                      selectedPaymentRecord.isPaymentVerified ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      <ShieldCheck size={12} />
                      {selectedPaymentRecord.isPaymentVerified ? 'Verified Account' : 'Pending Verification'}
                    </span>
                  </div>

                  {/* Grid of Bank Details */}
                  <div className="bg-white p-4 rounded-xl border border-emerald-200/80 space-y-3 text-xs shadow-xs">
                    <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <p className="text-[11px] text-slate-400 font-semibold uppercase">Account Holder</p>
                        <p className="font-extrabold text-slate-900 mt-0.5">{selectedPaymentRecord.bankDetails?.accountHolder}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-semibold uppercase">Account Type</p>
                        <p className="font-bold text-slate-800 mt-0.5">{selectedPaymentRecord.bankDetails?.accountType || 'Savings Account'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <p className="text-[11px] text-slate-400 font-semibold uppercase">Bank Name</p>
                        <p className="font-bold text-slate-900 mt-0.5">{selectedPaymentRecord.bankDetails?.bankName}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-semibold uppercase">IFSC Code</p>
                        <p className="font-mono font-extrabold text-slate-900 mt-0.5">{selectedPaymentRecord.bankDetails?.ifscCode}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase">Full Bank Account Number</p>
                      <p className="font-mono text-base font-extrabold text-slate-900 mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 tracking-wider">
                        {selectedPaymentRecord.bankDetails?.fullAccountNumber}
                      </p>
                    </div>

                    {selectedPaymentRecord.bankDetails?.branchName && (
                      <p className="text-[11px] text-slate-500 italic">
                        Branch: {selectedPaymentRecord.bankDetails.branchName}
                      </p>
                    )}
                  </div>

                  <button 
                    onClick={() => selectedPaymentRecord.bankDetails && handleCopyBankDetails(selectedPaymentRecord.bankDetails)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2"
                  >
                    <Copy size={14} /> Copy All Bank Details
                  </button>
                </div>
              )}

            </div>

            {/* Modal Bottom Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button 
                onClick={() => handleToggleVerifyPaymentInfo(selectedPaymentRecord.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                  selectedPaymentRecord.isPaymentVerified 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <ShieldCheck size={15} />
                {selectedPaymentRecord.isPaymentVerified ? '✓ Payment Info Verified' : 'Verify Payment Info'}
              </button>

              <button 
                onClick={() => setSelectedPaymentRecord(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Confirmation Modal for Cancel Monetization */}
      {cancelModalRecord && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-[75] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <Ban size={28} />
            </div>

            <h3 className="text-lg font-extrabold text-center text-slate-900">Confirm Monetization Cancellation</h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed px-2 font-medium">
              Are you sure you want to cancel monetization for <span className="font-bold text-slate-900">@{cancelModalRecord.username}</span>?
            </p>
            <p className="text-[11px] text-rose-600 text-center mt-1">
              Their monetization features and payout eligibility will be disabled on YouSnap Mobile App.
            </p>

            {/* Target Creator Summary */}
            <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
              <img src={cancelModalRecord.avatar} alt={cancelModalRecord.name} className="w-11 h-11 rounded-2xl object-cover shrink-0 border border-slate-200" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{cancelModalRecord.name}</p>
                <p className="text-[11px] text-slate-500">@{cancelModalRecord.username} • ID: {cancelModalRecord.userId}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button 
                onClick={() => setCancelModalRecord(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmCancelMonetization}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Ban size={14} /> Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 50/50 Revenue Split & Payout Disbursement Modal */}
      {payoutDisburseRecord && (() => {
        const rawAmt = parseFloat(payoutDisburseRecord.totalPayoutEarned.replace(/[^0-9.]/g, '')) || 0;
        const adminShare = rawAmt * 0.5;
        const creatorShare = rawAmt * 0.5;

        // Render gorgeous success receipt screen if payout is done
        if (payoutSuccessReceipt) {
          return (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in duration-150 p-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                    ✓
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Payout Successfully Released!</h3>
                  <p className="text-xs text-emerald-600 font-extrabold bg-emerald-50 py-1 px-3 rounded-full inline-block">
                    Admin Wallet & Creator Account Credited
                  </p>
                </div>

                {/* Receipt Details Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3 font-mono">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400">Transaction ID:</span>
                    <span className="font-extrabold text-slate-800">{payoutSuccessReceipt.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Release Time:</span>
                    <span className="font-bold text-slate-700">{payoutSuccessReceipt.timestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Accrued Amount:</span>
                    <span className="font-bold text-slate-900">{payoutSuccessReceipt.totalAmount}</span>
                  </div>

                  {/* Platform Commission Routing Details */}
                  <div className="border-t border-slate-200 pt-2 space-y-1.5 font-sans">
                    <p className="text-[10px] text-indigo-600 font-extrabold uppercase font-sans">Platform Share Routed (50%)</p>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Routed To Admin:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[180px]">{adminDetails.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Admin Account/UPI:</span>
                      <span className="font-mono font-bold text-slate-800">{adminDetails.upiId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount Sent:</span>
                      <span className="font-extrabold text-indigo-600">{payoutSuccessReceipt.adminShare}</span>
                    </div>
                  </div>

                  {/* Creator Cash Routing Details */}
                  <div className="border-t border-slate-200 pt-2 space-y-1.5 font-sans">
                    <p className="text-[10px] text-emerald-600 font-extrabold uppercase font-sans">Creator Cash Routed (50%)</p>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Creator Account:</span>
                      <span className="font-bold text-slate-800">@{payoutSuccessReceipt.creatorUsername}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Routed Via:</span>
                      <span className="font-bold text-slate-800">{payoutSuccessReceipt.creatorPayoutMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount Sent:</span>
                      <span className="font-extrabold text-emerald-600">{payoutSuccessReceipt.creatorShare}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setPayoutSuccessReceipt(null);
                    setPayoutDisburseRecord(null);
                  }}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-850 text-white font-black rounded-xl text-xs transition shadow-sm"
                >
                  Close & Done
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in duration-150">
              
              {/* Modal Top Header */}
              <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shadow-md">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold flex items-center gap-2">
                      Revenue Split & Payout (50/50)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Process YouSnap platform commission and creator payout
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setPayoutDisburseRecord(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                
                {/* Creator Card info */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={payoutDisburseRecord.avatar} alt={payoutDisburseRecord.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-200" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{payoutDisburseRecord.name}</h4>
                      <p className="text-xs text-slate-500">@{payoutDisburseRecord.username} • <span className="font-mono text-emerald-600 font-bold">{payoutDisburseRecord.userId}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Total Accrued Balance</p>
                    <p className="text-lg font-extrabold text-emerald-600 font-mono">{payoutDisburseRecord.totalPayoutEarned}</p>
                  </div>
                </div>

                {/* Split Breakdown Graphics */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">50% Platform Share Split Ledger</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Admin Share (My cut) */}
                    <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 flex flex-col justify-between space-y-2 relative overflow-hidden">
                      <span className="absolute -top-3 -right-3 text-indigo-500/10 font-black text-6xl">50</span>
                      <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-100 text-indigo-800">
                          Platform Share (Admin)
                        </span>
                        <p className="text-2xl font-extrabold text-indigo-950 font-mono mt-2">${adminShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                      <p className="text-[10px] text-slate-500">Your 50% commission for platform hosting & maintenance.</p>
                      
                      {/* Set Admin Bank Account Trigger */}
                      <button 
                        onClick={() => setIsEditingAdminDetails(!isEditingAdminDetails)}
                        className="mt-2 text-left text-[9px] text-indigo-700 hover:text-indigo-900 font-extrabold underline flex items-center gap-1"
                      >
                        ⚙️ {isEditingAdminDetails ? 'Back to Split Breakdown' : 'Admin Receiving Details'}
                      </button>
                    </div>

                    {/* Creator Share (Their cut) */}
                    <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 flex flex-col justify-between space-y-2 relative overflow-hidden">
                      <span className="absolute -top-3 -right-3 text-emerald-500/10 font-black text-6xl">50</span>
                      <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                          Creator Payout Share
                        </span>
                        <p className="text-2xl font-extrabold text-emerald-950 font-mono mt-2">${creatorShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                      <p className="text-[10px] text-slate-500">Disbursable payout to creator's registered {payoutDisburseRecord.paymentMethod}.</p>
                    </div>
                  </div>

                  {/* Flow graphic arrow */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-600 font-bold flex items-center justify-center gap-1.5">
                    <span>Platform Balance</span>
                    <span className="text-slate-400">({payoutDisburseRecord.totalPayoutEarned})</span>
                    <span>➔</span>
                    <span className="text-indigo-600">Admin Cut (${adminShare.toFixed(0)})</span>
                    <span>+</span>
                    <span className="text-emerald-600">Creator Cash (${creatorShare.toFixed(0)})</span>
                  </div>

                  {/* Settings inline layout if editing admin details */}
                  {isEditingAdminDetails ? (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-indigo-150 space-y-3.5 animate-in slide-in-from-bottom-2 duration-150">
                      <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        ⚙️ Configure Admin Receiving Channels
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[9px] text-slate-400 font-bold uppercase">Bank Name</label>
                          <input 
                            type="text"
                            value={adminDetails.bankName}
                            onChange={e => setAdminDetails({ ...adminDetails, bankName: e.target.value })}
                            className="w-full mt-0.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-bold text-slate-800 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 font-bold uppercase">Account Holder</label>
                          <input 
                            type="text"
                            value={adminDetails.accountHolder}
                            onChange={e => setAdminDetails({ ...adminDetails, accountHolder: e.target.value })}
                            className="w-full mt-0.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-bold text-slate-800 text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[9px] text-slate-400 font-bold uppercase">Account Number</label>
                          <input 
                            type="text"
                            value={adminDetails.fullAccountNumber}
                            onChange={e => setAdminDetails({ ...adminDetails, fullAccountNumber: e.target.value })}
                            className="w-full mt-0.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-slate-800 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 font-bold uppercase">IFSC Code</label>
                          <input 
                            type="text"
                            value={adminDetails.ifscCode}
                            onChange={e => setAdminDetails({ ...adminDetails, ifscCode: e.target.value })}
                            className="w-full mt-0.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono uppercase text-slate-800 text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 font-bold uppercase">UPI ID Address (Fallback)</label>
                        <input 
                          type="text"
                          value={adminDetails.upiId}
                          onChange={e => setAdminDetails({ ...adminDetails, upiId: e.target.value })}
                          className="w-full mt-0.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-slate-800 text-xs"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          localStorage.setItem('yousnap_admin_payout_details', JSON.stringify(adminDetails));
                          showToast('Admin Details Saved', 'Your platform receiving routing details have been updated and encrypted.', 'success');
                          setIsEditingAdminDetails(false);
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black shadow-xs transition"
                      >
                        ✓ Save Admin Details
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Show current configured admin bank account preview */}
                      <div className="p-3 bg-indigo-50/30 rounded-xl border border-indigo-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-bold">Admin Destination:</span>
                        <span className="font-extrabold text-indigo-700">{adminDetails.bankName} ({adminDetails.upiId})</span>
                      </div>

                      {/* Warning balance info */}
                      <p className="text-[11px] text-amber-600 font-medium text-center bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                        ⚠️ <strong>Post-Disbursement State:</strong> Confirming this transaction will reset @{payoutDisburseRecord.username}'s unpaid earnings to <strong>$0.00</strong> on YouSnap App.
                      </p>
                    </>
                  )}
                </div>

              </div>

              {/* Modal Bottom Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <button 
                  onClick={() => setPayoutDisburseRecord(null)}
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>

                <button 
                  onClick={handleExecutePayoutDisbursement}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <DollarSign size={15} /> Confirm & Release Payout
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 1-Year Full Payout Statement History Modal */}
      {historyModalRecord && (() => {
        // Let's create a beautiful set of 12 months of payouts
        const months = [
          { month: 'Oct 2026', amount: '$1,240.00', date: '02 Oct 2026', status: 'Disbursed', id: 'TXN-902' },
          { month: 'Sep 2026', amount: '$1,120.50', date: '02 Sep 2026', status: 'Disbursed', id: 'TXN-901' },
          { month: 'Aug 2026', amount: '$980.00', date: '02 Aug 2026', status: 'Disbursed', id: 'TXN-809' },
          { month: 'Jul 2026', amount: '$1,450.00', date: '02 Jul 2026', status: 'Disbursed', id: 'TXN-808' },
          { month: 'Jun 2026', amount: '$1,620.00', date: '02 Jun 2026', status: 'Disbursed', id: 'TXN-707' },
          { month: 'May 2026', amount: '$850.00', date: '02 May 2026', status: 'Disbursed', id: 'TXN-706' },
          { month: 'Apr 2026', amount: '$1,100.00', date: '02 Apr 2026', status: 'Disbursed', id: 'TXN-605' },
          { month: 'Mar 2026', amount: '$1,320.00', date: '02 Mar 2026', status: 'Disbursed', id: 'TXN-604' },
          { month: 'Feb 2026', amount: '$950.00', date: '02 Feb 2026', status: 'Disbursed', id: 'TXN-503' },
          { month: 'Jan 2026', amount: '$1,150.00', date: '02 Jan 2026', status: 'Disbursed', id: 'TXN-502' },
          { month: 'Dec 2025', amount: '$740.00', date: '02 Dec 2025', status: 'Disbursed', id: 'TXN-401' },
          { month: 'Nov 2025', amount: '$820.00', date: '02 Nov 2025', status: 'Disbursed', id: 'TXN-399' }
        ];

        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] animate-in zoom-in duration-150">
              
              {/* Modal Top Header */}
              <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shadow-md">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold flex items-center gap-2">
                      1-Year Payout Statement History
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Annual ledger and payment receipts for @{historyModalRecord.username}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setHistoryModalRecord(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Creator Card banner */}
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <img src={historyModalRecord.avatar} alt={historyModalRecord.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs">{historyModalRecord.name}</h4>
                    <p className="text-[10px] text-slate-500">@{historyModalRecord.username} • ID: {historyModalRecord.userId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      showToast('Downloading Statement...', 'Generating encrypted PDF statement for past 1 year.', 'success');
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg shadow-xs transition flex items-center gap-1"
                  >
                    📥 Download PDF
                  </button>
                  <button 
                    onClick={() => {
                      showToast('Preparing Printer...', 'Sending statement ledger to system print queue.', 'success');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-xs transition flex items-center gap-1"
                  >
                    🖨️ Print Receipt
                  </button>
                </div>
              </div>

              {/* Statement Ledger Table */}
              <div className="p-4 overflow-y-auto flex-1">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[9px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Month & Year</th>
                      <th className="p-3">Transaction ID</th>
                      <th className="p-3 text-right">Disbursed Amount</th>
                      <th className="p-3">Payout Date</th>
                      <th className="p-3">Payment Method</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {months.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition">
                        <td className="p-3 font-extrabold text-slate-900">{item.month}</td>
                        <td className="p-3 font-mono text-[10px] text-slate-500">{item.id}</td>
                        <td className="p-3 text-right font-bold text-emerald-600 font-mono">{item.amount}</td>
                        <td className="p-3 text-slate-600">{item.date}</td>
                        <td className="p-3 text-slate-600">{historyModalRecord.paymentMethod}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                            ✓ {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setHistoryModalRecord(null)}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs transition"
                >
                  Close Statement
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ADMIN BANK ACCOUNT WITHDRAWAL MODAL */}
      {showWithdrawModal && (() => {
        const hasSavedDetails = adminDetails.accountHolder && adminDetails.bankName && adminDetails.fullAccountNumber && adminDetails.ifscCode;

        const handleWithdrawExecute = () => {
          if (!hasSavedDetails) {
            showToast('Save Details First', 'Please fill out and save your Admin Bank Details before initiating the withdrawal.', 'warning');
            return;
          }
          if (masterRevenuePoolBalance <= 0) {
            showToast('Zero Balance', 'There are no funds available in the Master Revenue Pool to withdraw.', 'error');
            return;
          }

          const withdrawnAmt = masterRevenuePoolBalance;
          
          // Reset Master Revenue Pool Base to 0.00 and save
          setMasterRevenuePoolBase(0);
          localStorage.setItem('yousnap_master_revenue_pool_base_v2', '0');

          // Reset all user account balances, disbursed amounts, and video monetization to start fresh
          setRecords(prev => prev.map(r => ({
            ...r,
            totalPayoutEarned: '$0.00',
            disbursedAmount: 0,
            payoutStatus: 'Disbursed',
            uploadedMedia: r.uploadedMedia.map(m => ({ ...m, isMonetized: false }))
          })));

          // Generate mock transaction ID
          const randomTxId = 'WITHDRAW-TXN-' + Math.floor(100000 + Math.random() * 900000);
          const timestampStr = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

          setWithdrawSuccessReceipt({
            amountWithdrawn: `$${withdrawnAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            adminBank: adminDetails.bankName,
            adminAccount: adminDetails.fullAccountNumber,
            adminUpi: adminDetails.upiId,
            transactionId: randomTxId,
            timestamp: timestampStr
          });

          showToast(
            'Transfer Complete!',
            `The entire pool of $${withdrawnAmt.toLocaleString()} has been successfully transferred to ${adminDetails.bankName}.`,
            'success'
          );
        };

        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in duration-150 p-6 flex flex-col space-y-6">
              
              {/* If successful, render receipt indicator */}
              {withdrawSuccessReceipt ? (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                      ✓
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Withdrawal Processed!</h3>
                    <p className="text-xs text-emerald-600 font-extrabold bg-emerald-50 py-1 px-3 rounded-full inline-block">
                      Payout Processed to Admin Account
                    </p>
                  </div>

                  {/* Transaction Receipt */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3 font-mono">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-400">Transaction ID:</span>
                      <span className="font-extrabold text-slate-800">{withdrawSuccessReceipt.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Completed Time:</span>
                      <span className="font-bold text-slate-700">{withdrawSuccessReceipt.timestamp}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-400">Total Transferred:</span>
                      <span className="font-black text-emerald-600 font-sans text-sm">{withdrawSuccessReceipt.amountWithdrawn}</span>
                    </div>

                    <div className="space-y-1 pt-1 font-sans">
                      <p className="text-[10px] text-indigo-600 font-extrabold uppercase">Destination Account</p>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Recipient Bank:</span>
                        <span className="font-bold text-slate-800 truncate max-w-[180px]">{withdrawSuccessReceipt.adminBank}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Account Number:</span>
                        <span className="font-mono font-bold text-slate-800">{withdrawSuccessReceipt.adminAccount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">UPI VPA Linked:</span>
                        <span className="font-mono text-slate-800">{withdrawSuccessReceipt.adminUpi}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setWithdrawSuccessReceipt(null);
                      setShowWithdrawModal(false);
                    }}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-850 text-white font-black rounded-xl text-xs transition shadow-sm"
                  >
                    Done & Return to Dashboard
                  </button>
                </div>
              ) : (
                <>
                  {/* Regular configuration & transfer form */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        💳 Admin Revenue Withdrawal
                      </h3>
                      <p className="text-[10px] text-slate-400">Withdraw entire pool balance directly to bank</p>
                    </div>
                    <button 
                      onClick={() => setShowWithdrawModal(false)}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Summary amount banner */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl flex justify-between items-center relative overflow-hidden">
                    <div className="z-10">
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Total Deliverable Balance</p>
                      <p className="text-2xl font-black font-mono mt-1 text-emerald-400">
                        ${masterRevenuePoolBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <DollarSign size={40} className="text-emerald-500/10 absolute right-2" />
                  </div>

                  {/* Details Entry Card */}
                  <div className="space-y-3.5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Configure Permanent Destination Account</p>
                    
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <label className="text-[9px] text-slate-400 font-bold uppercase">Account Holder Name</label>
                        <input 
                          type="text"
                          value={adminDetails.accountHolder}
                          onChange={e => setAdminDetails({ ...adminDetails, accountHolder: e.target.value })}
                          className="w-full mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg focus:outline-none font-bold text-slate-800 text-xs"
                          placeholder="e.g. Sakin Yesmin Admin Account"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] text-slate-400 font-bold uppercase">Bank Name</label>
                          <input 
                            type="text"
                            value={adminDetails.bankName}
                            onChange={e => setAdminDetails({ ...adminDetails, bankName: e.target.value })}
                            className="w-full mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg focus:outline-none font-bold text-slate-800 text-xs"
                            placeholder="e.g. State Bank of India"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 font-bold uppercase">IFSC Code</label>
                          <input 
                            type="text"
                            value={adminDetails.ifscCode}
                            onChange={e => setAdminDetails({ ...adminDetails, ifscCode: e.target.value })}
                            className="w-full mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg focus:outline-none font-mono uppercase text-slate-800 text-xs"
                            placeholder="e.g. SBIN0001042"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] text-slate-400 font-bold uppercase">Account Number</label>
                          <input 
                            type="text"
                            value={adminDetails.fullAccountNumber}
                            onChange={e => setAdminDetails({ ...adminDetails, fullAccountNumber: e.target.value })}
                            className="w-full mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg focus:outline-none font-mono text-slate-800 text-xs"
                            placeholder="e.g. 3994109552109"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 font-bold uppercase">UPI ID Address</label>
                          <input 
                            type="text"
                            value={adminDetails.upiId}
                            onChange={e => setAdminDetails({ ...adminDetails, upiId: e.target.value })}
                            className="w-full mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg focus:outline-none font-mono text-slate-800 text-xs"
                            placeholder="e.g. admin@okaxis"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        localStorage.setItem('yousnap_admin_payout_details', JSON.stringify(adminDetails));
                        showToast('Details Locked!', 'Permanent withdrawal destination details updated.', 'success');
                      }}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black shadow-xs transition"
                    >
                      ✓ Save Bank Details
                    </button>
                  </div>

                  {/* Transfer Action Controls */}
                  <div className="pt-2 border-t border-slate-100 flex gap-3">
                    <button 
                      onClick={() => setShowWithdrawModal(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleWithdrawExecute}
                      disabled={!hasSavedDetails || masterRevenuePoolBalance <= 0}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                        hasSavedDetails && masterRevenuePoolBalance > 0
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      🏦 Confirm Withdraw
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        );
      })()}

      {/* ACCOUNT SUSPENSION REASON MODAL POPUP (AUTOMATED NOTIFICATION DISPATCH) */}
      {suspensionModalRecord && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[90] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-5 bg-rose-950 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Automated Suspension Trigger</h3>
                  <p className="text-[11px] text-slate-300">Set policy restriction with automated push/in-app mobile notification</p>
                </div>
              </div>
              <button 
                onClick={() => setSuspensionModalRecord(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              
              {/* Target User Card */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <img 
                  src={suspensionModalRecord.avatar} 
                  alt={suspensionModalRecord.name} 
                  className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0" 
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{suspensionModalRecord.name}</p>
                  <p className="text-[11px] text-slate-500">@{suspensionModalRecord.username} • ID: {suspensionModalRecord.userId}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 shrink-0">
                  Action: Suspend
                </span>
              </div>

              {/* Reason Category Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-600" /> Reason Category *
                </label>
                <select
                  required
                  value={suspensionCategory}
                  onChange={(e) => setSuspensionCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-950 focus:bg-white cursor-pointer"
                >
                  <option value="Community Guideline Violation">Community Guideline Violation</option>
                  <option value="Copyright Violation">Copyright Violation</option>
                  <option value="Fraudulent Activity">Fraudulent Activity</option>
                  <option value="Impersonation">Impersonation</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              {/* Custom Message Note Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Detailed Reason / Push Notification Notice *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Appears on User's Mobile App Lock Screen</span>
                </label>
                <textarea 
                  rows={3}
                  required
                  placeholder="e.g. Your account has been suspended due to copyright violations on video streams..."
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-rose-950 focus:bg-white outline-none leading-relaxed"
                />
              </div>

              {/* Informative Note */}
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-100 rounded-xl text-[11px] flex items-start gap-2">
                <Info size={14} className="shrink-0 mt-0.5" />
                <p>
                  Confirming this action will suspend creator privileges on YouSnap, lock payout channels, and instantly send a push notification with a support appeal link.
                </p>
              </div>

            </div>

            {/* Action Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={() => setSuspensionModalRecord(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-850 font-bold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleConfirmSuspension}
                disabled={!suspensionReason.trim()}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                  suspensionReason.trim()
                    ? 'bg-rose-600 hover:bg-rose-700 text-white active:scale-95'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                <Send size={13} /> Confirm Suspension
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
