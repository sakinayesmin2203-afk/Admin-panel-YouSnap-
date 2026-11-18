import { useState } from 'react';
import { Check, AlertTriangle, X, Play, ShieldAlert, Eye, Film, Send, Trash2, CheckCircle2 } from 'lucide-react';
import { UploadItem } from './LiveUploadFeed';

export interface ModerationItem extends UploadItem {
  status: 'Pending' | 'Approved' | 'Warning' | 'Flagged' | 'Deleted';
  uploadDate: string;
}

interface ModerationQueueProps {
  items: ModerationItem[];
  onStatusChange: (id: string, status: ModerationItem['status']) => void;
  onDeleteItem: (id: string) => void;
  externalPreviewVideo?: ModerationItem | null;
  onCloseExternalPreview?: () => void;
}

export default function ModerationQueue({ 
  items, 
  onStatusChange, 
  onDeleteItem, 
  externalPreviewVideo, 
  onCloseExternalPreview 
}: ModerationQueueProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [internalPreviewVideo, setInternalPreviewVideo] = useState<ModerationItem | null>(null);
  const [isWarningBoxOpen, setIsWarningBoxOpen] = useState(false);
  const [warningReason, setWarningReason] = useState('');
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle?: string } | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<ModerationItem | null>(null);

  const activePreview = externalPreviewVideo !== undefined ? externalPreviewVideo : internalPreviewVideo;

  const handleClosePreview = () => {
    if (onCloseExternalPreview) onCloseExternalPreview();
    setInternalPreviewVideo(null);
    setIsWarningBoxOpen(false);
    setWarningReason('');
  };

  const triggerToast = (title: string, subtitle?: string) => {
    setToastMessage({ title, subtitle });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleSendWarning = () => {
    if (!activePreview) return;
    if (!warningReason.trim()) {
      alert('Please enter a warning reason for the uploader.');
      return;
    }

    onStatusChange(activePreview.id, 'Warning');
    triggerToast(
      'Warning notification sent to uploader!', 
      `In-App alert sent to @${activePreview.username}: "Your video '${activePreview.title}' received a warning: ${warningReason.trim()}"`
    );
    handleClosePreview();
  };

  const handleConfirmPermanentDelete = () => {
    if (!videoToDelete) return;
    
    const targetVideo = videoToDelete;
    onDeleteItem(targetVideo.id);

    triggerToast(
      'Video deleted successfully!', 
      `Removed from storage & database • Notification sent to @${targetVideo.username}: "Your video '${targetVideo.title}' has been removed by Admin for violating community guidelines."`
    );

    setVideoToDelete(null);
    handleClosePreview();
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(items.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[480px] relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start gap-3.5 animate-in slide-in-from-top-4 duration-300 max-w-md">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">System Action Completed</p>
            <p className="text-sm font-bold text-slate-100">{toastMessage.title}</p>
            {toastMessage.subtitle && (
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{toastMessage.subtitle}</p>
            )}
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white shrink-0 ml-1">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-lg">Video Content Moderation Queue</h2>
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
            {items.filter(i => i.status === 'Pending' || i.status === 'Warning' || i.status === 'Flagged').length} Pending
          </span>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <button 
              onClick={() => { selectedIds.forEach(id => onStatusChange(id, 'Approved')); setSelectedIds([]); }}
              className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-xs font-medium hover:bg-green-100 transition"
            >
              Approve Selected ({selectedIds.length})
            </button>
            <button 
              onClick={() => { selectedIds.forEach(id => onDeleteItem(id)); setSelectedIds([]); }}
              className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-100 transition"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      <div className="overflow-y-auto flex-1 scrollbar-thin border rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b text-slate-500">
            <tr className="text-left">
              <th className="p-3 w-10"><input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === items.length && items.length > 0} /></th>
              <th className="p-3">Video</th>
              <th className="p-3">Uploader</th>
              <th className="p-3">Category</th>
              <th className="p-3">Upload Date</th>
              <th className="p-3">Flag Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400">No videos in moderation queue</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                  <td className="p-3">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(item.id)} 
                      onChange={() => toggleSelectOne(item.id)} 
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="relative w-14 h-9 rounded bg-slate-800 overflow-hidden shrink-0 cursor-pointer group/vid"
                        onClick={() => setInternalPreviewVideo(item)}
                      >
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/vid:opacity-100 transition">
                          <Play size={14} className="text-white fill-white" />
                        </div>
                        <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-[9px] px-1 rounded text-white">
                          {item.duration}
                        </span>
                      </div>
                      <span className="font-medium text-slate-900 truncate max-w-[180px]">{item.title}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <img src={item.avatar} alt={item.name} className="w-6 h-6 rounded-full object-cover" />
                      <span className="text-xs font-medium text-slate-700">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-slate-500">{item.uploadDate}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      item.status === 'Pending' ? 'bg-blue-100 text-blue-700' :
                      item.status === 'Warning' ? 'bg-yellow-100 text-yellow-700' :
                      item.status === 'Flagged' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.status === 'Approved' && <Check size={12} />}
                      {item.status === 'Pending' && <Film size={12} />}
                      {item.status === 'Warning' && <AlertTriangle size={12} />}
                      {item.status === 'Flagged' && <ShieldAlert size={12} />}
                      {item.status === 'Deleted' && <X size={12} />}
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        title="Review / Preview"
                        onClick={() => setInternalPreviewVideo(item)} 
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        title="Delete Permanently"
                        onClick={() => setVideoToDelete(item)} 
                        className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* HTML5 Video Player Modal */}
      {activePreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Film size={18} className="text-green-400" />
                <h3 className="font-bold text-sm truncate max-w-md">{activePreview.title}</h3>
              </div>
              <button onClick={handleClosePreview} className="text-slate-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* HTML5 Video Player */}
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden mb-5 shadow-lg">
                <video 
                  controls 
                  autoPlay 
                  playsInline 
                  poster={activePreview.thumbnail}
                  className="w-full h-full object-contain"
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Creator & Video Details */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img src={activePreview.avatar} alt={activePreview.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{activePreview.name}</p>
                    <p className="text-xs text-slate-500">@{activePreview.username} • Uploaded {activePreview.uploadDate || activePreview.timestamp}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                  {activePreview.category}
                </span>
              </div>

              {/* Warning Reason Input Box */}
              {isWarningBoxOpen && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 space-y-3 animate-in fade-in duration-150">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Send In-App Warning to @{activePreview.username}
                    </h4>
                    <button onClick={() => setIsWarningBoxOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={16} />
                    </button>
                  </div>
                  <textarea 
                    rows={3}
                    placeholder="Enter violation reason (e.g. Copyright infringement, Nudity policy violation, Hate speech, etc.)..."
                    value={warningReason}
                    onChange={(e) => setWarningReason(e.target.value)}
                    className="w-full p-3 bg-white border border-amber-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setIsWarningBoxOpen(false)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-300 transition"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSendWarning}
                      className="px-4 py-1.5 bg-amber-600 text-white font-bold rounded-xl text-xs hover:bg-amber-700 transition shadow-sm flex items-center gap-1.5"
                    >
                      <Send size={13} /> Send Warning Notification
                    </button>
                  </div>
                </div>
              )}

              {/* Moderation Action Buttons (Clean UI: Flag/Warning & Delete, plus Close) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {!isWarningBoxOpen && (
                    <button 
                      onClick={() => setIsWarningBoxOpen(true)}
                      className="px-4 py-2.5 bg-amber-500 text-white font-bold rounded-xl text-xs hover:bg-amber-600 transition shadow-xs flex items-center gap-1.5"
                    >
                      <AlertTriangle size={15} /> Flag / Add Warning
                    </button>
                  )}

                  <button 
                    onClick={() => setVideoToDelete(activePreview)}
                    className="px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-700 transition shadow-xs flex items-center gap-1.5 active:scale-95"
                  >
                    <Trash2 size={15} /> Delete / Remove
                  </button>
                </div>

                <button 
                  onClick={handleClosePreview}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition"
                >
                  Close Modal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Dialog */}
      {videoToDelete && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <Trash2 size={26} />
            </div>

            <h3 className="text-lg font-bold text-center text-slate-900">Delete Video Permanently?</h3>
            <p className="text-xs text-slate-500 text-center mt-1.5 leading-relaxed">
              Are you sure you want to permanently delete this video from YouSnap?
            </p>

            {/* Video Preview Snapshot in Dialog */}
            <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <img 
                src={videoToDelete.thumbnail} 
                alt={videoToDelete.title} 
                className="w-14 h-10 rounded-lg object-cover bg-slate-800 shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{videoToDelete.title}</p>
                <p className="text-[11px] text-slate-500">by @{videoToDelete.username} • {videoToDelete.category}</p>
              </div>
            </div>

            <div className="mt-3 p-3 bg-rose-50/70 border border-rose-100 rounded-xl text-[11px] text-rose-700">
              <p className="font-semibold flex items-center gap-1">
                <AlertTriangle size={12} className="shrink-0" /> System Action:
              </p>
              <p className="mt-0.5 text-rose-600">
                The video will be purged from Cloud Storage, Live Stream, and database. Uploader will receive a policy violation notification.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button 
                onClick={() => setVideoToDelete(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmPermanentDelete}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} /> Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
