import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function InsightsTab() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['analytics-events'],
    queryFn: () => base44.entities.AnalyticsEvent.list('-created_date', 500),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  // Aggregate by event type
  const byType = events.reduce((acc, e) => {
    acc[e.event_type] = (acc[e.event_type] || 0) + 1;
    return acc;
  }, {});

  // Aggregate by page
  const byPage = events.reduce((acc, e) => {
    if (e.page) acc[e.page] = (acc[e.page] || 0) + 1;
    return acc;
  }, {});

  // Aggregate by device
  const byDevice = events.reduce((acc, e) => {
    if (e.device_type) acc[e.device_type] = (acc[e.device_type] || 0) + 1;
    return acc;
  }, {});

  // Top occasions
  const byOccasion = events.reduce((acc, e) => {
    if (e.occasion) acc[e.occasion] = (acc[e.occasion] || 0) + 1;
    return acc;
  }, {});

  const topOccasions = Object.entries(byOccasion)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topPages = Object.entries(byPage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: events.length },
          { label: 'Page Views', value: byType['page_view'] || 0 },
          { label: 'Books Started', value: byType['book_created'] || 0 },
          { label: 'Unique Sessions', value: new Set(events.map(e => e.session_id).filter(Boolean)).size },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
          >
            <p className="text-xs text-gray-500 font-medium mb-1">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top pages */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">Top Pages</h3>
          <div className="space-y-3">
            {topPages.map(([page, count], i) => {
              const max = topPages[0]?.[1] || 1;
              return (
                <div key={page}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{page}</span>
                    <span className="text-gray-400">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / max) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="h-full bg-purple-400 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
            {topPages.length === 0 && <p className="text-gray-400 text-sm">No data yet</p>}
          </div>
        </div>

        {/* Device & event breakdown */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Device Types</h3>
            <div className="flex gap-4 flex-wrap">
              {Object.entries(byDevice).map(([device, count]) => (
                <div key={device} className="text-center bg-purple-50 rounded-xl px-5 py-3">
                  <p className="text-2xl font-bold text-purple-700">{count}</p>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">{device}</p>
                </div>
              ))}
              {Object.keys(byDevice).length === 0 && <p className="text-gray-400 text-sm">No data yet</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Top Occasions Searched</h3>
            <div className="space-y-2">
              {topOccasions.map(([occ, count]) => (
                <div key={occ} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 capitalize">{occ.replace(/_/g, ' ')}</span>
                  <span className="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded-lg">{count}</span>
                </div>
              ))}
              {topOccasions.length === 0 && <p className="text-gray-400 text-sm">No data yet</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Recent events */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">Recent Events</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wide border-b border-gray-50">
                <th className="pb-3 text-left font-medium">Type</th>
                <th className="pb-3 text-left font-medium">Page</th>
                <th className="pb-3 text-left font-medium">Device</th>
                <th className="pb-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {events.slice(0, 20).map((ev) => (
                <tr key={ev.id} className="hover:bg-gray-50/50">
                  <td className="py-2.5">
                    <span className="bg-purple-50 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      {ev.event_type}
                    </span>
                  </td>
                  <td className="py-2.5 text-gray-600">{ev.page || '—'}</td>
                  <td className="py-2.5 text-gray-500 capitalize">{ev.device_type || '—'}</td>
                  <td className="py-2.5 text-gray-400 text-xs">
                    {ev.created_date ? format(new Date(ev.created_date), 'd MMM, HH:mm') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}