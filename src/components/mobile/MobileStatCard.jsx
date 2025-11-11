'use client';
import React from 'react';

const colorMap = {
  red: 'bg-red-50 text-red-600 border-red-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  pink: 'bg-pink-50 text-pink-600 border-pink-200',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
};

export default function MobileStatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-2 rounded-lg border ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  );
}
