import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import {
  MEDIA_COLLECTIONS,
  MediaSourceCollection,
  deduplicateMediaItems,
  isMediaRestricted,
  normalizeMediaDoc,
} from '../lib/firestoreAdapters';

export default function AnalyticsChart() {
  const [mediaByCol, setMediaByCol] = useState<Record<string, any[]>>({
    posts: [],
    reels: [],
    stories: [],
    videos: [],
    live_uploads: [],
  });

  useEffect(() => {
    const unsubs = MEDIA_COLLECTIONS.map((col: MediaSourceCollection) =>
      onSnapshot(
        query(collection(db, col)),
        (snapshot) => {
          const activeItems = snapshot.docs
            .map((d) => normalizeMediaDoc(d, col))
            .filter((item) => !item.isDeleted && !isMediaRestricted(item));
          setMediaByCol((prev) => ({ ...prev, [col]: activeItems }));
        },
        () => {}
      )
    );

    return () => unsubs.forEach((u) => u());
  }, []);

  const dedupedMedia = deduplicateMediaItems([
    ...(mediaByCol.posts || []),
    ...(mediaByCol.reels || []),
    ...(mediaByCol.stories || []),
    ...(mediaByCol.videos || []),
    ...(mediaByCol.live_uploads || []),
  ]);

  const chartData = [
    { name: 'Posts', uploads: dedupedMedia.filter((m) => m.sourceCollection === 'posts').length },
    { name: 'Reels', uploads: dedupedMedia.filter((m) => m.sourceCollection === 'reels').length },
    { name: 'Stories', uploads: dedupedMedia.filter((m) => m.sourceCollection === 'stories').length },
    { name: 'Videos', uploads: dedupedMedia.filter((m) => m.sourceCollection === 'videos').length },
    { name: 'Live', uploads: dedupedMedia.filter((m) => m.sourceCollection === 'live_uploads').length },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Global Media Upload Breakdown</h2>
        <select className="p-2 border rounded-lg text-sm text-slate-500">
          <option>Live Firestore Collections</option>
        </select>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="uploads" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

