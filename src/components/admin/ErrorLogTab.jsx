import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, AlertTriangle, Bug, CreditCard, CheckCircle, Clock, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const TYPE_CONFIG = {
  error: { icon: AlertCircle, color: 'text-red-600 bg-red-50', label: 'Error' },
  payment_issue: { icon: CreditCard, color: 'text-amber-600 bg-amber-50', label: 'Payment Issue' },
  security: { icon: AlertTriangle, color: 'text-purple-600 bg-purple-50', label: 'Security' },
  bug: { icon: Bug, color: 'text-blue-600 bg-blue-50', label: 'Bug' },
};

const SEVERITY_CONFIG = {
  low: { color: 'bg-green-100 text-green-700', label: 'Low' },
  medium: { color: 'bg-yellow-100 text-yellow-700', label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-700', label: 'High' },
  critical: { color: 'bg-red-100 text-red-700', label: 'CRITICAL' },
};

function ErrorDetail({ error, onClose, onUpdate }) {
  const [notes, setNotes] = useState(error.notes || '');
  const [status, setStatus] = useState(error.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(error.id, { notes, status });
    setSaving(false);
  };

  const TypeIcon = TYPE_CONFIG[error.type]?.icon || AlertCircle;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TypeIcon className={`w-5 h-5 ${TYPE_CONFIG[error.type]?.color.split(' ')[0]}`} />
            {error.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
            <div>
              <p className="text-gray-500">Type</p>
              <p className="font-medium">{TYPE_CONFIG[error.type]?.label}</p>
            </div>
            <div>
              <p className="text-gray-500">Severity</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${SEVERITY_CONFIG[error.severity]?.color}`}>
                {SEVERITY_CONFIG[error.severity]?.label}
              </span>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium capitalize">{status}</p>
            </div>
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium">{format(new Date(error.created_date), 'd MMM HH:mm')}</p>
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Message</p>
            <p className="bg-gray-50 p-3 rounded text-sm font-mono text-gray-700">{error.message}</p>
          </div>

          {/* Stack trace */}
          {error.stack_trace && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Stack Trace</p>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-40">
                {error.stack_trace}
              </pre>
            </div>
          )}

          {/* Related info */}
          {(error.order_id || error.user_email) && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded">
              {error.order_id && <p className="text-sm"><span className="text-gray-600">Order ID:</span> <code className="font-mono text-blue-700">{error.order_id}</code></p>}
              {error.user_email && <p className="text-sm"><span className="text-gray-600">User:</span> {error.user_email}</p>}
            </div>
          )}

          {/* Status update */}
          <div>
            <label className="text-sm text-gray-500">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full mt-1 h-9 rounded border border-gray-200 px-2 text-sm"
            >
              <option value="new">New</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Admin notes */}
          <div>
            <label className="text-sm text-gray-500">Admin Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this error..."
              className="mt-1 text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ErrorLogTab() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedError, setSelectedError] = useState(null);

  const { data: errors = [] } = useQuery({
    queryKey: ['admin-error-logs'],
    queryFn: () => base44.entities.ErrorLog.list('-created_date', 500),
    refetchInterval: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: (params) => base44.entities.ErrorLog.update(params.id, { notes: params.notes, status: params.status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-error-logs'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ErrorLog.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-error-logs'] }),
  });

  const filtered = useMemo(() => {
    return errors
      .filter(e => filter === 'all' || e.type === filter || e.severity === filter || e.status === filter)
      .filter(e => search === '' || e.title.toLowerCase().includes(search.toLowerCase()) || e.message.toLowerCase().includes(search.toLowerCase()));
  }, [errors, filter, search]);

  const stats = {
    total: errors.length,
    critical: errors.filter(e => e.severity === 'critical').length,
    unresolved: errors.filter(e => ['new', 'acknowledged', 'investigating'].includes(e.status)).length,
    byType: {
      error: errors.filter(e => e.type === 'error').length,
      payment_issue: errors.filter(e => e.type === 'payment_issue').length,
      security: errors.filter(e => e.type === 'security').length,
      bug: errors.filter(e => e.type === 'bug').length,
    },
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Errors', value: stats.total, color: 'bg-red-100 text-red-700' },
          { label: 'Critical', value: stats.critical, color: 'bg-orange-100 text-orange-700' },
          { label: 'Unresolved', value: stats.unresolved, color: 'bg-yellow-100 text-yellow-700' },
          { label: 'Payment Issues', value: stats.byType.payment_issue, color: 'bg-amber-100 text-amber-700' },
        ].map(stat => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${stat.color} rounded-xl p-4`}
          >
            <p className="text-xs font-medium opacity-80">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'error', 'payment_issue', 'security', 'bug', 'critical', 'new'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f.replace(/_/g, ' ').charAt(0).toUpperCase() + f.replace(/_/g, ' ').slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <Input
        placeholder="Search errors..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded-xl"
      />

      {/* Error list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No errors matching filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((error, i) => {
            const TypeIcon = TYPE_CONFIG[error.type]?.icon || AlertCircle;
            return (
              <motion.div
                key={error.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedError(error)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${TYPE_CONFIG[error.type]?.color}`}>
                    <TypeIcon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900 truncate">{error.title}</h4>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${SEVERITY_CONFIG[error.severity]?.color}`}>
                        {SEVERITY_CONFIG[error.severity]?.label}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        error.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        error.status === 'investigating' ? 'bg-blue-100 text-blue-700' :
                        error.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {error.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{error.message}</p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>{format(new Date(error.created_date), 'd MMM, HH:mm')}</span>
                      {error.order_id && <span>Order: {error.order_id.slice(0, 8)}…</span>}
                      {error.user_email && <span>{error.user_email}</span>}
                    </div>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(error.id);
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {selectedError && (
        <ErrorDetail
          error={selectedError}
          onClose={() => setSelectedError(null)}
          onUpdate={(id, data) => updateMutation.mutate({ id, ...data })}
        />
      )}
    </div>
  );
}