import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

// Mock data: exactly as specified for later API swap
const MOCK_VERIFICATIONS = [
  {
    payment_id: 451,
    student_name: 'Chanda Mwamba',
    room: 'Room 4B',
    typed_amount: 2500.00,
    typed_reference: 'TXN987654321',
    receipt_image_url: '/placeholder.svg?height=600&width=400',
    ocr_data: {
      extracted_amount: 2500.00,
      extracted_reference: 'TXN987654321',
      match: true,
      bounding_boxes: {
        amount: [710, 450, 750, 600],
        reference: [220, 150, 260, 400],
      },
    },
  },
];

// Canvas helper to draw OCR bounding box highlights
function ReceiptViewer({ data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!data?.ocr_data?.bounding_boxes) return;

    // IMAGE DIMENSIONS: 400x600 (width x height)
    // Backend sends pixel coords relative to ORIGINAL image (e.g., 600w x 600h)
    // We scale them to fit our 400x600 canvas
    const IMAGE_WIDTH = 400;
    const IMAGE_HEIGHT = 600;
    const ORIGINAL_WIDTH = 600; // Assumed original image width (adjust per backend)
    const ORIGINAL_HEIGHT = 600; // Assumed original image height (adjust per backend)

    const bboxes = data.ocr_data.bounding_boxes;

    // Helper to scale bounding box from original to canvas coords
    const scaleBox = ([x1, y1, x2, y2]) => [
      (x1 / ORIGINAL_WIDTH) * IMAGE_WIDTH,
      (y1 / ORIGINAL_HEIGHT) * IMAGE_HEIGHT,
      (x2 / ORIGINAL_WIDTH) * IMAGE_WIDTH,
      (y2 / ORIGINAL_HEIGHT) * IMAGE_HEIGHT,
    ];

    // Draw highlights for amount and reference
    const boxesToDraw = [
      { box: bboxes.amount, label: 'AMOUNT' },
      { box: bboxes.reference, label: 'REF' },
    ];

    boxesToDraw.forEach(({ box, label }) => {
      const [x1, y1, x2, y2] = scaleBox(box);
      const w = x2 - x1;
      const h = y2 - y1;

      // Semi-transparent cyan fill
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.fillRect(x1, y1, w, h);

      // Glowing cyan border with shadow
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.roundRect(x1, y1, w, h, 4);
      ctx.stroke();

      // Label above box
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 10px system-ui';
      ctx.fillText(label, x1 + 4, Math.max(y1 - 4, 12));
    });

    ctx.shadowBlur = 0;
  }, [data]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-900 rounded-2xl border border-white/10">
      <img
        src={data?.receipt_image_url}
        alt="Receipt"
        className="w-96 h-96 object-contain"
        crossOrigin="anonymous"
        onLoad={() => {
          // Trigger canvas redraw after image loads
        }}
      />
      <canvas
        ref={canvasRef}
        width={400}
        height={600}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '300px',
          height: '450px',
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
}

// Comparison row: typed vs extracted
function ComparisonRow({ label, typed, extracted, match }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400 font-medium">{label}</span>
        {match ? (
          <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
            <CheckCircle size={14} />
            Match
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-orange-400 font-medium">
            <AlertCircle size={14} />
            Mismatch
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 border border-white/10 rounded-lg p-2">
          <p className="text-xs text-gray-500 mb-0.5">Typed</p>
          <p className="text-sm text-white font-mono">{typed}</p>
        </div>
        <div
          className={`border rounded-lg p-2 ${
            match
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-orange-500/10 border-orange-500/30'
          }`}
        >
          <p className="text-xs text-gray-500 mb-0.5">Extracted (OCR)</p>
          <p className="text-sm font-mono font-medium" style={{color: match ? '#22c55e' : '#f97316'}}>{extracted}</p>
        </div>
      </div>
    </div>
  );
}

// Modal for rejection reason
function RejectionModal({ open, onClose, onConfirm, reason, setReason, isLoading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Reject Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Please provide a reason for rejection:
        </p>

        <textarea
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none mb-4"
          rows={4}
          placeholder="Enter rejection reason…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isLoading}
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-700 text-white hover:bg-white/5 transition-colors font-medium disabled:opacity-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!reason.trim() || isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '…' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hotkey cheat sheet overlay
function HotkeySheet({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          {[
            { key: 'A', desc: 'Approve current payment' },
            { key: 'R', desc: 'Reject current payment (opens reason modal)' },
            { key: '?', desc: 'Show this cheat sheet' },
            { key: 'Esc', desc: 'Close any open modal' },
          ].map(({ key, desc }) => (
            <div key={key} className="flex items-center gap-3">
              <kbd className="bg-gray-700 text-white px-2.5 py-1 rounded text-xs font-semibold min-w-10 text-center">
                {key}
              </kbd>
              <span className="text-gray-300">{desc}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-4 border-t border-gray-700 pt-4">
          Hotkeys are disabled when a modal textarea is focused to prevent accidental triggers.
        </p>
      </div>
    </div>
  );
}

export default function CaretakerDashboard() {
  const [verifications, setVerifications] = useState(MOCK_VERIFICATIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showHotkeySheet, setShowHotkeySheet] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const textareaRef = useRef(null);

  const current = verifications[currentIndex];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger hotkeys if textarea is focused
      if (textareaRef.current === document.activeElement) {
        if (e.key === 'Escape') {
          setShowRejectModal(false);
          setShowHotkeySheet(false);
        }
        return;
      }

      const key = e.key.toLowerCase();

      if (key === 'a') {
        e.preventDefault();
        handleApprove();
      } else if (key === 'r') {
        e.preventDefault();
        setShowRejectModal(true);
      } else if (key === '?') {
        e.preventDefault();
        setShowHotkeySheet(true);
      } else if (key === 'escape') {
        setShowRejectModal(false);
        setShowHotkeySheet(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleApprove = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      showToast('✓ Payment approved via hotkey');
      setIsLoading(false);
      // Move to next if available
      if (currentIndex < verifications.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 500);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      showToast('✗ Payment rejected');
      setShowRejectModal(false);
      setRejectReason('');
      setIsLoading(false);
      // Move to next if available
      if (currentIndex < verifications.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Board<span className="text-cyan-500">Pay</span></h1>
            <p className="text-xs text-gray-500 mt-0.5">Caretaker Verification Portal</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHotkeySheet(true)}
              className="text-xs text-gray-400 hover:text-cyan-400 transition-colors px-3 py-1.5 rounded border border-gray-700 hover:border-cyan-500/30"
            >
              ? Shortcuts
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-green-500/20 border border-green-500/40 text-green-200 px-4 py-3 rounded-lg text-sm font-medium animate-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}

      {/* Main content */}
      <main className="px-6 py-8">
        {verifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-gray-400">No pending verifications</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Verification counter */}
            <div className="mb-4 text-xs text-gray-500">
              Payment {currentIndex + 1} of {verifications.length}
            </div>

            {/* Split layout: responsive (row on desktop, column on mobile) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT: Receipt viewer */}
              <div className="flex flex-col gap-3">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Receipt Image (OCR Highlights)
                </div>
                <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 bg-gray-900/50">
                  <ReceiptViewer data={current} />
                </div>
              </div>

              {/* RIGHT: Verification controls */}
              <div className="flex flex-col gap-4">
                {/* Student info card */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Student</p>
                    <p className="text-lg font-semibold">{current.student_name}</p>
                    <p className="text-sm text-gray-400">{current.room}</p>
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-3">
                    {/* Amount comparison */}
                    <ComparisonRow
                      label="Amount (ZMW)"
                      typed={current.typed_amount.toLocaleString()}
                      extracted={current.ocr_data.extracted_amount.toLocaleString()}
                      match={current.ocr_data.match && current.typed_amount === current.ocr_data.extracted_amount}
                    />

                    {/* Reference comparison */}
                    <ComparisonRow
                      label="Transaction Reference"
                      typed={current.typed_reference}
                      extracted={current.ocr_data.extracted_reference}
                      match={current.ocr_data.match && current.typed_reference === current.ocr_data.extracted_reference}
                    />

                    {/* Overall match badge */}
                    <div className="pt-3 border-t border-white/10">
                      {current.ocr_data.match ? (
                        <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                          <CheckCircle size={18} />
                          All fields verified
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-orange-400 text-sm font-medium">
                          <AlertCircle size={18} />
                          Review discrepancies
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleApprove}
                    disabled={isLoading}
                    className="flex-1 bg-cyan-500 text-black font-semibold py-3 rounded-lg hover:bg-cyan-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isLoading ? '…' : 'Approve (A)'}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={isLoading}
                    className="flex-1 border border-orange-500 text-orange-400 font-semibold py-3 rounded-lg hover:bg-orange-500/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isLoading ? '…' : 'Reject (R)'}
                  </button>
                </div>

                {/* Help text */}
                <p className="text-xs text-gray-500 text-center pt-2">
                  Press <kbd className="bg-gray-800 px-1.5 rounded">?</kbd> for all keyboard shortcuts
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Rejection modal */}
      <RejectionModal
        open={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
        }}
        onConfirm={handleReject}
        reason={rejectReason}
        setReason={setRejectReason}
        isLoading={isLoading}
      />

      {/* Hotkey sheet */}
      <HotkeySheet open={showHotkeySheet} onClose={() => setShowHotkeySheet(false)} />
    </div>
  );
}
