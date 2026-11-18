import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  color: string;
  icon: ReactNode;
}

export default function StatsCard({ title, value, change, color, icon }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <h3 className="text-sm text-slate-500">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className={`text-sm font-medium mt-1 ${color === 'red' ? 'text-red-500' : 'text-green-500'}`}>{change}</p>
      </div>
      <div className="text-slate-400">{icon}</div>
    </div>
  );
}
