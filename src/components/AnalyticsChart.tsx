import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { isMediaDeleted } from '../lib/firestoreAdapters';

export default function AnalyticsChart() {
  const [counts, setCounts] = useState<Record<string, number>>({
    Posts: 0,
    Reels: 0,
    Stories: 0,
    Videos: 0,
    Live: 0,
  });

  useEffect(() => {
    const sources: Array<{ col: string; label: string }> = [
      { col: 'posts', label: 'Posts' },
      { col: 'reels', label: 'Reels' },
      { col: 'stories', label: 'Stories' },
      { col: 'videos', label: 'Videos' },
      { col: 'live_uploads', label: 'Live' },
    ];

    const unsubs = sources.map(({ col, label }) =>
      onSnapshot(
        query(collection(db, col)),
        (snapshot) => {
          const activeCount = snapshot.docs.filter((d) => !isMediaDeleted(d.data())).length;
          setCounts((prev) => ({ ...prev, [label]: activeCount }));
        },
        () => {}
      )
    );

    return () => unsubs.forEach((u) => u());
  }, []);

  const chartData = [
    { name: 'Posts', uploads: counts.Posts },
    { name: 'Reels', uploads: counts.Reels },
    { name: 'Stories', uploads: counts.Stories },
    { name: 'Videos', uploads: counts.Videos },
    { name: 'Live', uploads: counts.Live },
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

