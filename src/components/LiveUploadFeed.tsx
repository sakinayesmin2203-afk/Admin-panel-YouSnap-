import { Play, Sparkles, Film, Eye, Video, Radio } from 'lucide-react';

export interface UploadItem {
  id: string;
  name: string;
  username: string;
  avatar: string;
  title: string;
  category: 'Vlogs' | 'Music' | 'Comedy' | 'Tutorials' | 'Gaming';
  thumbnail: string;
  duration: string;
  timestamp: string;
}

interface LiveUploadFeedProps {
  items: UploadItem[];
  onPreviewVideo: (item: UploadItem) => void;
}

export default function LiveUploadFeed({ items, onPreviewVideo }: LiveUploadFeedProps) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col space-y-4">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-lg text-slate-900">Live New Uploads Stream</h2>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Real-time incoming video uploads from YouSnap creators worldwide</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-2xl font-extrabold border border-emerald-200 flex items-center gap-1.5">
            <Sparkles size={13} className="text-emerald-600" /> {items.length} Active Feeds
          </span>
        </div>
      </div>

      {/* Expanded & Scrollable Live Feed List */}
      <div className="overflow-y-auto max-h-[500px] space-y-3.5 pr-1 scrollbar-thin">
        {items.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Film size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">No incoming live uploads right now</p>
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onPreviewVideo(item)}
              className="p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-100 hover:border-emerald-200 transition-all duration-200 group cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Creator Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img 
                  src={item.avatar} 
                  alt={item.name} 
                  className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0 group-hover:scale-105 transition" 
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-slate-900 text-sm truncate">{item.name}</p>
                    <span className="text-xs text-slate-500 truncate">@{item.username}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>Uploaded a new video</span>
                    <span className="text-[10px] bg-slate-200/60 text-slate-600 font-mono px-2 py-0.5 rounded-md">{item.timestamp}</span>
                  </p>
                </div>
              </div>

              {/* Video Thumbnail Box */}
              <div className="flex items-center gap-3 bg-slate-900 text-white rounded-2xl p-2.5 w-full sm:w-auto sm:min-w-[320px] relative overflow-hidden group/thumb shadow-sm">
                <div className="relative w-24 h-14 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover/thumb:scale-105 transition duration-300" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/thumb:bg-black/60 transition">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover/thumb:scale-110 transition">
                      <Play size={12} className="fill-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-mono px-1.5 py-0.5 rounded text-white backdrop-blur-xs">
                    {item.duration}
                  </span>
                </div>

                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs font-bold truncate text-slate-100">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      <Eye size={11} /> Click to play
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
