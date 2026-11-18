const activities = [
  { user: 'Sakin', action: 'uploaded a video', time: '2 mins ago' },
  { user: 'John', action: 'followed you', time: '5 mins ago' },
  { user: 'Jane', action: 'commented on a video', time: '10 mins ago' },
];

export default function RecentActivity() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="font-bold text-lg mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((act, i) => (
          <div key={i} className="flex gap-3 items-center">
            <div className="w-10 h-10 bg-slate-200 rounded-full" />
            <div>
              <p className="font-medium text-sm">{act.user} <span className="text-slate-500">{act.action}</span></p>
              <p className="text-xs text-slate-400">{act.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
