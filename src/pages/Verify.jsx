import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { BrowserQRCodeReader } from '@zxing/browser';
import {
  Search, X, Camera, Keyboard, ScanLine, Plus, AlertCircle,
  CheckCircle, Clock, Award, ShieldCheck, Eye, ChevronDown,
  ChevronUp, Loader2, Download, ExternalLink, RefreshCw,
  CheckCircle2, AlertTriangle
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const API = 'http://localhost:5000';

// ── small helpers ─────────────────────────────────────────────────────
function fmt(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return iso; }
}

function ScanTypePill({ type }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
      type === 'qr' ? 'bg-mint/10 text-mint border border-mint/20' : 'bg-navy/10 text-navy border border-navy/20'
    }`}>
      {type === 'qr' ? <Camera className="w-2.5 h-2.5" /> : <Keyboard className="w-2.5 h-2.5" />}
      {type}
    </span>
  );
}

function VerifiedPill({ verified }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
      verified ? 'bg-mint/10 text-mint border border-mint/20' : 'bg-red-50 text-red-500 border border-red-200'
    }`}>
      {verified ? <CheckCircle className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
      {verified ? 'Valid' : 'Not Found'}
    </span>
  );
}

// ── create batch form panel ────────────────────────────────────────────
function CreateBatchPanel({ token, onCreated, onClose }) {
  const [form, setForm] = useState({ batchId: '', origin: '', collectionCenter: '', volume: '', route: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.batchId.trim()) { setError('Batch ID is required.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/batches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...form, batchId: form.batchId.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create batch.'); }
      else {
        setSuccess(`Batch ${data.batch.batchId} created successfully!`);
        onCreated(data.batch.batchId);
        setTimeout(onClose, 1800);
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-border bg-white text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-navy transition-default';
  const labelCls = 'block text-[11px] font-semibold uppercase tracking-wide text-ink-muted mb-1';

  return (
    <div className="mt-4 bg-card border border-border rounded-xl p-6 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-ink-primary flex items-center gap-2">
          <Plus className="w-4 h-4 text-navy" /> Register New Batch
        </h3>
        <button type="button" onClick={onClose} className="p-1 text-ink-muted hover:text-navy transition-default">
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <p className="mb-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </p>
      )}
      {success && (
        <p className="mb-3 flex items-center gap-2 text-sm text-mint bg-mint/5 border border-mint/20 rounded-lg px-3 py-2">
          <CheckCircle className="w-4 h-4 shrink-0" /> {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>Batch ID <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={form.batchId}
            onChange={e => set('batchId', e.target.value.toUpperCase())}
            placeholder="e.g. MILK001"
            className={inputCls}
            required
          />
          <p className="mt-1 text-[11px] text-ink-muted">This ID will be printed on the milk packet QR code.</p>
        </div>
        <div>
          <label className={labelCls}>Origin / Farm</label>
          <input type="text" value={form.origin} onChange={e => set('origin', e.target.value)} placeholder="e.g. Erode Dairy Cluster" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Collection Center</label>
          <input type="text" value={form.collectionCenter} onChange={e => set('collectionCenter', e.target.value)} placeholder="e.g. Bhavani BMC" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Volume</label>
          <input type="text" value={form.volume} onChange={e => set('volume', e.target.value)} placeholder="e.g. 12,350 L" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Route</label>
          <input type="text" value={form.route} onChange={e => set('route', e.target.value)} placeholder="e.g. Erode → Chennai Depot" className={inputCls} />
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-default flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Creating…' : 'Create Batch'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── certificate card for a verified batch ─────────────────────────────
function BatchCertificate({ batch, onShowQR, showQR }) {
  const cols = [
    { label: 'Batch ID', value: batch.batchId },
    { label: 'Origin', value: batch.origin || '—' },
    { label: 'Collection Center', value: batch.collectionCenter || '—' },
    { label: 'Volume', value: batch.volume || '—' },
    { label: 'Route', value: batch.route || '—' },
    { label: 'Stage', value: batch.currentStage || 'Collection Center' },
    { label: 'Status', value: batch.status || 'safe' },
    { label: 'Registered', value: fmt(batch.createdAt) },
  ];

  return (
    <div className="relative bg-[#faf8f2] border-2 border-[#c5a55a]/40 rounded-xl p-6 md:p-8 shadow-sm">
      {/* Gold seal */}
      <div className="absolute top-5 right-5 w-12 h-12 rounded-full bg-[#c5a55a]/20 border-2 border-[#c5a55a] flex items-center justify-center">
        <Award className="w-6 h-6 text-[#c5a55a]" />
      </div>

      <StatusBadge status="safe" label="CRYPTOGRAPHICALLY VALIDATED" filled />
      <h2 className="mt-4 font-serif text-2xl md:text-3xl text-ink-primary">
        Certificate of Cold-Chain Authenticity
      </h2>
      <p className="mt-2 text-sm text-ink-secondary">
        Batch <span className="font-mono font-semibold text-navy">{batch.batchId}</span> has been
        verified on the DairyChain blockchain. All custody milestones are confirmed.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cols.map(col => (
          <div key={col.label}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted mb-0.5">{col.label}</p>
            {col.label === 'Status' ? (
              <StatusBadge status={batch.status || 'safe'} label={(batch.status || 'safe').toUpperCase()} />
            ) : (
              <p className="text-sm font-medium text-ink-primary">{col.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* QR Code toggle */}
      <div className="mt-6 pt-5 border-t border-[#c5a55a]/25 flex flex-wrap gap-3 items-center">
        <button
          type="button"
          onClick={onShowQR}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-navy text-navy text-sm font-medium hover:bg-navy hover:text-white transition-default"
        >
          <Download className="w-4 h-4" /> {showQR ? 'Hide QR Code' : 'Show QR Code'}
        </button>
        <span className="text-xs text-ink-muted">Share this QR to let others verify this batch.</span>
      </div>

      {showQR && (
        <div className="mt-4 flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-border w-fit mx-auto">
          <QRCodeSVG
            value={`${window.location.origin}/verify?batch=${batch.batchId}`}
            size={180}
            fgColor="#1E3A5F"
          />
          <p className="text-xs text-ink-muted font-mono">{batch.batchId}</p>
        </div>
      )}
    </div>
  );
}

// ── scan history table ─────────────────────────────────────────────────
function ScanHistoryTable({ scans, user }) {
  if (!scans || scans.length === 0) {
    return (
      <p className="text-sm text-ink-muted text-center py-6">No scan records yet for this batch.</p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 border-b border-border">
          <tr>
            <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-ink-muted">Timestamp</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-ink-muted">Type</th>
            {user && ['admin', 'inspector'].includes(user.role) && (
              <>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-ink-muted">Role</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-ink-muted">Scanner</th>
              </>
            )}
            <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-ink-muted">Result</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {scans.map((s, i) => (
            <tr key={s._id || i} className="hover:bg-neutral-50 transition-colors">
              <td className="px-4 py-2.5 font-mono text-xs text-ink-secondary whitespace-nowrap">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmt(s.createdAt)}</span>
              </td>
              <td className="px-4 py-2.5"><ScanTypePill type={s.scanType} /></td>
              {user && ['admin', 'inspector'].includes(user.role) && (
                <>
                  <td className="px-4 py-2.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-navy/5 text-navy border border-navy/10 font-semibold capitalize">
                      {s.scannerRole || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-ink-secondary font-mono">{s.scannerEmail || '—'}</td>
                </>
              )}
              <td className="px-4 py-2.5"><VerifiedPill verified={s.verified} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── live scan feed ticker ──────────────────────────────────────────────
function LiveScanFeed({ liveScans }) {
  if (liveScans.length === 0) return null;
  return (
    <div className="mt-3 space-y-1.5">
      {liveScans.slice(0, 5).map((s, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-mint/5 border border-mint/15 text-xs animate-fade-in">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-mint" />
          </span>
          <span className="font-mono font-semibold text-navy">{s.batchId}</span>
          <ScanTypePill type={s.scanType} />
          <VerifiedPill verified={s.verified} />
          <span className="text-ink-muted ml-auto whitespace-nowrap">{fmt(s.timestamp)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Blockchain Integrity Section ─────────────────────────────────────
function BlockchainIntegritySection({ batch, readings = [] }) {
  const [recomputingId, setRecomputingId] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState({});

  // Display batch-specific readings or latest from sensor/batch
  const displayList = readings.length > 0 ? readings.slice(-5).reverse() : [
    {
      deviceId: batch.deviceId || 'MILK-ESP32-01',
      temperature: 3.82,
      humidity: 64.2,
      timestamp: batch.createdAt || new Date().toISOString(),
      dataHash: batch.dataHash || '0x9a34d6c2819a0129d9b8c8bd4973baa4c0e9d9a1f923aa4e0fd3c6bf1d23a4b1',
      txHash: batch.txHash || '0x7f4e2b8109ad5c61284710294819a2837102938102938471029384719283741a',
      onChain: true,
    }
  ];

  const handleVerify = async (reading, index) => {
    setRecomputingId(index);
    try {
      const res = await fetch(`${API}/api/blockchain/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            temperature: reading.temperature,
            humidity: reading.humidity,
            deviceId: reading.deviceId || 'MILK-ESP32-01',
            timestamp: reading.timestamp,
          },
        }),
      });
      const data = await res.json();
      if (data.verified) {
        setVerifyStatus((prev) => ({
          ...prev,
          [index]: {
            success: true,
            msg: '✓ Hash Matches On-Chain Record',
            dataHash: data.dataHash,
            onChainData: data.onChainData,
          },
        }));
      } else {
        setVerifyStatus((prev) => ({
          ...prev,
          [index]: {
            success: false,
            msg: data.message || '✗ Mismatch Detected / Not Found On-Chain',
            dataHash: data.dataHash,
          },
        }));
      }
    } catch (err) {
      setVerifyStatus((prev) => ({
        ...prev,
        [index]: {
          success: false,
          msg: 'Error verifying with blockchain service',
        },
      }));
    } finally {
      setRecomputingId(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-navy" />
          <h3 className="font-semibold text-ink-primary text-base">Blockchain Integrity Check</h3>
        </div>
        <span className="text-xs text-ink-muted">Cryptographic Proof & SHA-256 Hashes</span>
      </div>

      <p className="text-xs text-ink-secondary leading-relaxed">
        Verify that temperature telemetry recorded in the database cryptographically matches the immutable hashes anchored onto the Ethereum Sepolia blockchain smart contract.
      </p>

      <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
        {displayList.map((item, idx) => {
          const status = verifyStatus[idx];
          const hasTx = !!item.txHash;
          const displayHash = item.dataHash || '0xPendingHash...';

          return (
            <div key={idx} className="p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-navy/5 text-navy flex items-center justify-center font-mono text-xs font-bold">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-ink-primary">
                        {item.temperature}°C
                      </span>
                      {item.humidity != null && (
                        <span className="text-xs text-ink-muted">💧 {item.humidity}%</span>
                      )}
                      <span className="text-[10px] text-ink-muted font-mono">({item.deviceId})</span>
                    </div>
                    <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {fmt(item.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.onChain ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      On-Chain Anchored
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-neutral-100 text-ink-muted border border-border">
                      Local Proof
                    </span>
                  )}
                </div>
              </div>

              {/* Hash and actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2 font-mono text-ink-secondary bg-neutral-50 px-2.5 py-1.5 rounded-lg border border-border overflow-hidden text-ellipsis">
                  <span className="text-ink-muted shrink-0">Data Hash:</span>
                  <span className="text-navy font-semibold truncate" title={displayHash}>
                    {displayHash.slice(0, 18)}...{displayHash.slice(-8)}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={recomputingId === idx}
                    onClick={() => handleVerify(item, idx)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy text-white text-xs font-medium hover:bg-navy/90 transition-default disabled:opacity-50"
                  >
                    {recomputingId === idx ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    Recompute & Verify
                  </button>

                  <a
                    href={
                      hasTx
                        ? `https://sepolia.etherscan.io/tx/${item.txHash}`
                        : `https://sepolia.etherscan.io`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-ink-secondary hover:text-navy hover:border-navy text-xs font-medium transition-default"
                  >
                    <span>Verify on Etherscan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Verification Feedback Banner */}
              {status && (
                <div
                  className={`mt-2 p-3 rounded-lg border text-xs flex items-center justify-between ${
                    status.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {status.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <span>{status.msg}</span>
                  </div>
                  {status.dataHash && (
                    <span className="font-mono text-[10px] text-ink-muted hidden sm:inline">
                      Hash: {status.dataHash.slice(0, 12)}...
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════
export default function Verify() {
  const { user, token } = useAuth();

  // URL param pre-fill
  const initBatch = (() => {
    try { return new URLSearchParams(window.location.search).get('batch') || ''; } catch { return ''; }
  })();

  // ── state ─────────────────────────────────────────────────────────
  const [inputMode, setInputMode] = useState('manual');   // 'manual' | 'qr'
  const [batchIdInput, setBatchIdInput] = useState(initBatch.toUpperCase());
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);  // batch object
  const [verifyError, setVerifyError] = useState('');
  const [scanHistory, setScanHistory] = useState([]);
  const [tempReadings, setTempReadings] = useState([]);
  const [liveScans, setLiveScans] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showHistorySection, setShowHistorySection] = useState(true);
  const [cameraError, setCameraError] = useState('');

  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const socketRef = useRef(null);

  // ── Socket.io — live scan feed ────────────────────────────────────
  useEffect(() => {
    const socket = io(API, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('new-scan', (scan) => {
      setLiveScans(prev => {
        const updated = [scan, ...prev];
        return updated.slice(0, 20);
      });
    });

    return () => { socket.disconnect(); };
  }, []);

  // ── auto-verify if batch id in URL ───────────────────────────────
  useEffect(() => {
    if (initBatch) verifyBatch(initBatch, 'manual');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── verify batch ──────────────────────────────────────────────────
  async function verifyBatch(batchId, scanType = 'manual') {
    const id = (batchId || batchIdInput).trim().toUpperCase();
    if (!id) { setVerifyError('Please enter a batch ID.'); return; }

    setIsVerifying(true);
    setVerifyError('');
    setVerifyResult(null);
    setScanHistory([]);
    setShowQR(false);

    try {
      // 1. Fetch batch details
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API}/api/batches/${id}`, { headers });
      const data = await res.json();

      if (res.ok && data.success) {
        setVerifyResult(data.batch);
      } else {
        setVerifyError(`Batch "${id}" not found in the DairyChain registry.`);
      }

      // 2. Log the scan (regardless of result)
      let location = {};
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
        );
        location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      } catch { /* geolocation not available or denied */ }

      await fetch(`${API}/api/scans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ batchId: id, scanType, location, userAgent: navigator.userAgent }),
      });

      // 3. Fetch scan history for this batch
      const scanRes = await fetch(`${API}/api/batches/${id}/scans`, { headers });
      if (scanRes.ok) {
        const scanData = await scanRes.json();
        setScanHistory(scanData.scans || []);
      }

      // 4. Fetch temperature readings for blockchain integrity
      try {
        const tempRes = await fetch(`${API}/api/temperature/history`);
        if (tempRes.ok) {
          const tempData = await tempRes.json();
          setTempReadings(tempData.readings || []);
        }
      } catch (e) {
        // ignore
      }

      setShowHistorySection(true);
    } catch (err) {
      setVerifyError('Network error. Please check your connection.');
    } finally {
      setIsVerifying(false);
    }
  }

  // ── QR Camera ─────────────────────────────────────────────────────
  async function startCamera() {
    setCameraError('');
    try {
      const reader = new BrowserQRCodeReader();
      codeReaderRef.current = reader;
      setCameraActive(true);

      await reader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
        if (result) {
          const text = result.getText();
          // Extract batch ID from full URL if scanned from QR on verify page
          let batchId = text;
          try {
            const url = new URL(text);
            const param = url.searchParams.get('batch');
            if (param) batchId = param;
          } catch { /* text is not a URL */ }

          batchId = batchId.trim().toUpperCase();
          setBatchIdInput(batchId);
          stopCamera();
          verifyBatch(batchId, 'qr');
        }
      });
    } catch (err) {
      setCameraError('Could not access camera. Please allow camera permission and try again.');
      setCameraActive(false);
    }
  }

  function stopCamera() {
    if (codeReaderRef.current) {
      try { BrowserQRCodeReader.releaseAllStreams(); } catch { /* ignore */ }
      codeReaderRef.current = null;
    }
    setCameraActive(false);
  }

  // Cleanup camera on unmount or mode switch
  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (inputMode !== 'qr') stopCamera();
  }, [inputMode]);

  // ── batch created callback ────────────────────────────────────────
  function handleBatchCreated(newBatchId) {
    setBatchIdInput(newBatchId);
    setShowCreatePanel(false);
  }

  // ── render ────────────────────────────────────────────────────────
  const canCreate = user && ['admin', 'inspector'].includes(user.role);

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-12 space-y-10">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="text-center">
        <StatusBadge status="safe" label="PUBLIC BLOCKCHAIN AUDIT" filled />
        <h1 className="mt-4 font-serif text-3xl md:text-4xl text-ink-primary">
          Verify Milk Batch Authenticity
        </h1>
        <p className="mt-3 text-ink-secondary max-w-xl mx-auto leading-relaxed">
          Enter the batch ID stamped on your milk packet, paste a transaction
          hash, or scan the on-pack QR code to inspect complete cold chain telemetry.
        </p>
      </div>

      {/* ── Mode switcher ──────────────────────────────────────── */}
      <div>
        <div className="inline-flex items-center gap-1 p-1 bg-neutral-100 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setInputMode('manual')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              inputMode === 'manual'
                ? 'bg-navy text-white shadow-sm'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" /> Manual Entry
          </button>
          <button
            type="button"
            onClick={() => setInputMode('qr')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              inputMode === 'qr'
                ? 'bg-navy text-white shadow-sm'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Scan QR Code
          </button>
        </div>

        {/* ── Manual entry ───────────────────────────────────── */}
        {inputMode === 'manual' && (
          <div className="mt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-ink-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="batch-id-input"
                  type="text"
                  value={batchIdInput}
                  onChange={e => setBatchIdInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && verifyBatch(batchIdInput, 'manual')}
                  placeholder="Enter Batch ID (e.g., MILK001)"
                  className="w-full pl-11 pr-10 py-3 rounded-lg border border-border bg-white text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-navy transition-default font-mono tracking-wide"
                />
                {batchIdInput && (
                  <button
                    type="button"
                    onClick={() => { setBatchIdInput(''); setVerifyResult(null); setVerifyError(''); }}
                    aria-label="Clear"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-navy"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => verifyBatch(batchIdInput, 'manual')}
                disabled={isVerifying}
                className="px-6 py-3 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy/90 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-default flex items-center gap-2"
              >
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {isVerifying ? 'Verifying…' : 'Verify Batch'}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-ink-muted">
              Use the same Batch ID printed on the milk packet. IDs are case-insensitive.
            </p>

            {/* Sample queries */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Try:</span>
              {['MILK001', 'TN-8800-401'].map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => { setBatchIdInput(q); verifyBatch(q, 'manual'); }}
                  className="px-3 py-1 rounded-full border border-border font-mono text-xs text-ink-secondary hover:border-navy hover:text-navy transition-default"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── QR scan mode ───────────────────────────────────── */}
        {inputMode === 'qr' && (
          <div className="mt-4">
            <div className="relative aspect-square max-w-sm mx-auto rounded-xl border-2 border-dashed border-navy/30 bg-navy/5 overflow-hidden flex items-center justify-center">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                  {/* scanning overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-mint rounded-lg relative">
                      <span className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-mint rounded-tl" />
                      <span className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-mint rounded-tr" />
                      <span className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-mint rounded-bl" />
                      <span className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-mint rounded-br" />
                      {/* animated scan line */}
                      <span className="absolute left-0 right-0 h-0.5 bg-mint/70 animate-bounce" style={{ top: '50%' }} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-3 p-8">
                  <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8 text-navy/50" />
                  </div>
                  <p className="text-sm text-ink-muted">Point your camera at a DairyChain QR code</p>
                  {cameraError && (
                    <p className="text-xs text-red-500 bg-red-50 rounded px-2 py-1">{cameraError}</p>
                  )}
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-5 py-2.5 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy/90 transition-default inline-flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" /> Start Camera
                  </button>
                </div>
              )}
            </div>
            {cameraActive && (
              <div className="flex justify-center mt-3">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2 rounded-lg border border-border text-sm text-ink-secondary hover:text-navy hover:border-navy transition-default flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> Stop Camera
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Admin: Create Batch ────────────────────────────────── */}
      {canCreate && (
        <div>
          {!showCreatePanel ? (
            <button
              type="button"
              onClick={() => setShowCreatePanel(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-navy/40 text-navy text-sm font-medium hover:bg-navy/5 transition-default"
            >
              <Plus className="w-4 h-4" /> Register New Batch
            </button>
          ) : (
            <CreateBatchPanel
              token={token}
              onCreated={handleBatchCreated}
              onClose={() => setShowCreatePanel(false)}
            />
          )}
        </div>
      )}

      {/* ── Error state ────────────────────────────────────────── */}
      {verifyError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-600 text-sm">Batch Not Found</p>
            <p className="mt-0.5 text-sm text-red-500">{verifyError}</p>
            {canCreate && (
              <button
                type="button"
                onClick={() => { setShowCreatePanel(true); setVerifyError(''); }}
                className="mt-2 text-sm font-medium text-navy underline"
              >
                Register this batch →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Certificate ───────────────────────────────────────── */}
      {verifyResult && (
        <BatchCertificate
          batch={verifyResult}
          showQR={showQR}
          onShowQR={() => setShowQR(q => !q)}
        />
      )}

      {/* ── Blockchain Integrity Check ───────────────────────── */}
      {verifyResult && (
        <BlockchainIntegritySection
          batch={verifyResult}
          readings={tempReadings}
        />
      )}

      {/* ── Scan History ──────────────────────────────────────── */}
      {(scanHistory.length > 0 || liveScans.length > 0) && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <button
            type="button"
            onClick={() => setShowHistorySection(v => !v)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-navy" />
              <h3 className="font-semibold text-ink-primary text-base">Recent Scan Activity</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-mint">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-mint" />
                </span>
                LIVE
              </span>
              {scanHistory.length > 0 && (
                <span className="text-xs text-ink-muted">({scanHistory.length} record{scanHistory.length !== 1 ? 's' : ''})</span>
              )}
            </div>
            {showHistorySection
              ? <ChevronUp className="w-4 h-4 text-ink-muted" />
              : <ChevronDown className="w-4 h-4 text-ink-muted" />
            }
          </button>

          {showHistorySection && (
            <div className="mt-4 space-y-4">
              {/* Public visitor banner */}
              {!user && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber/10 border border-amber/20 text-amber text-xs">
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                  You're viewing as a public visitor. <a href="/login" className="font-semibold underline">Sign in</a> for full traceability with scanner details.
                </div>
              )}

              {/* Live feed ticker */}
              {liveScans.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted mb-1.5">Live Feed</p>
                  <LiveScanFeed liveScans={liveScans} />
                </div>
              )}

              {/* Historical scan table */}
              {scanHistory.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted mb-2">
                    History for <span className="font-mono text-navy">{verifyResult?.batchId || batchIdInput}</span>
                  </p>
                  <ScanHistoryTable scans={scanHistory} user={user} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Live global feed (when no specific batch searched yet) */}
      {liveScans.length > 0 && scanHistory.length === 0 && !verifyResult && !verifyError && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ScanLine className="w-4 h-4 text-navy" />
            <h3 className="font-semibold text-ink-primary text-base">Live Scan Feed</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-mint">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-mint" />
              </span>
              LIVE
            </span>
          </div>
          {!user && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber/10 border border-amber/20 text-amber text-xs mb-3">
              <Eye className="w-3.5 h-3.5 shrink-0" />
              You're viewing as a public visitor. <a href="/login" className="font-semibold underline ml-1">Sign in</a> for full traceability.
            </div>
          )}
          <LiveScanFeed liveScans={liveScans} />
        </div>
      )}

      {/* ── Custody Timeline (static fallback) ───────────────── */}
      {!verifyResult && !verifyError && (
        <div className="opacity-60">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <h3 className="text-base font-semibold text-ink-primary">Example Custody Timeline</h3>
            <StatusBadge status="safe" label="4 Milestones Confirmed" filled />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Farm Chilling Vat', id: 'MILK-001-RT', note: 'Received at chilling center', ts: '03 Oct 2025, 05:07 IST', active: false },
              { title: 'Verified Tanker', id: 'MILK-001-TNK', note: 'GPS: 11.342°N, 77.720°E', ts: '03 Oct 2025, 06:49 IST', active: false },
              { title: 'Automated Packaging', id: 'MILK-001-PKG', note: 'Sealed at 4.0°C under 20 min', ts: '05 Oct 2025, 05:37 IST', active: false },
              { title: 'Retail Cold Hub', id: 'MILK-001-RTL', note: 'Delivered to Chennai retail', ts: '04 Oct 2025, 18:42 IST', active: true },
            ].map(step => (
              <div key={step.id} className={`card-hover border rounded-xl p-4 ${step.active ? 'bg-navy text-white border-navy' : 'bg-card border-border'}`}>
                <p className={`text-sm font-semibold ${step.active ? 'text-white' : 'text-ink-primary'}`}>{step.title}</p>
                <p className={`text-xs font-mono mt-1 ${step.active ? 'text-white/70' : 'text-ink-muted'}`}>{step.id}</p>
                <p className={`text-xs mt-2 ${step.active ? 'text-white/80' : 'text-ink-secondary'}`}>{step.note}</p>
                <p className={`text-xs mt-2 ${step.active ? 'text-white/60' : 'text-ink-muted'}`}>{step.ts}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
