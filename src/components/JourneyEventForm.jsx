import { useState } from 'react';
import { X, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STAGES = [
  { value: 'farm_collection', label: 'Farm Collection' },
  { value: 'chilling_center', label: 'Chilling Center' },
  { value: 'transport', label: 'Transport' },
  { value: 'processing_plant', label: 'Processing Plant' },
  { value: 'cold_storage', label: 'Cold Storage' },
  { value: 'retail_delivery', label: 'Retail Delivery' },
  { value: 'consumer', label: 'Consumer' },
];

export default function JourneyEventForm({ batchId, onClose, onSuccess }) {
  const { user, token } = useAuth();
  const [stage, setStage] = useState('farm_collection');
  const [location, setLocation] = useState('');
  const [handler, setHandler] = useState(user?.name || '');
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!stage) {
      setError('Please select a stage.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/journey/${encodeURIComponent(batchId)}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stage,
          location: location.trim(),
          handler: handler.trim(),
          handlerRole: user?.role || 'operator',
          temperature: temperature !== '' ? parseFloat(temperature) : undefined,
          humidity: humidity !== '' ? parseFloat(humidity) : undefined,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to add journey event.');
      } else {
        if (onSuccess) onSuccess(data.event);
        if (onClose) onClose();
      }
    } catch (err) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 rounded-lg border border-border bg-white text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-navy transition-default';
  const labelCls =
    'block text-[11px] font-semibold uppercase tracking-wide text-ink-muted mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xl w-full max-w-lg space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-navy" />
            <h3 className="font-serif text-lg font-bold text-ink-primary">
              Add Journey Checkpoint
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-ink-muted hover:text-navy hover:bg-neutral-100 transition-default"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Batch ID</label>
              <input
                type="text"
                value={batchId}
                disabled
                className={`${inputCls} bg-neutral-100 font-mono font-semibold text-navy cursor-not-allowed`}
              />
            </div>

            <div>
              <label className={labelCls}>Journey Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className={inputCls}
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Checkpoint Location</label>
            <input
              type="text"
              placeholder="e.g. Salem Central Dairy, Bay 4"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Handler Name</label>
              <input
                type="text"
                placeholder="Full Name"
                value={handler}
                onChange={(e) => setHandler(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Handler Role</label>
              <input
                type="text"
                value={user?.role || 'operator'}
                disabled
                className={`${inputCls} bg-neutral-100 capitalize cursor-not-allowed`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Temperature (°C)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 3.8"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Humidity (%)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 65"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Observation Notes</label>
            <textarea
              rows={2}
              placeholder="Operational notes, custody signoff, sealed status..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-border text-sm text-ink-secondary hover:bg-neutral-50 transition-default"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy/90 transition-default disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add to Journey
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
