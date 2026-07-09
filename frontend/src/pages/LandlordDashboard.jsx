import React, { useState, useEffect, useRef } from 'react';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { scaleLinear } from 'd3';
import { Sparkles, FileText, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import AuditTrail from '../components/AuditTrail.jsx';

// Mock financial flows data (matches spec exactly)
const FINANCIAL_FLOWS = {
  nodes: [
    { name: 'Ndola Complex' },
    { name: 'Kitwe House' },
    { name: 'Gross Revenue' },
    { name: 'Caretaker Commissions' },
    { name: 'Maintenance Outlay' },
    { name: 'Net Profit' },
  ],
  links: [
    { source: 0, target: 2, value: 15000 },
    { source: 1, target: 2, value: 12000 },
    { source: 2, target: 3, value: 2700 },
    { source: 2, target: 4, value: 1300 },
    { source: 2, target: 5, value: 23000 },
  ],
};

// Mock delinquent payments for AI comms
const DELINQUENT_PAYMENTS = [
  {
    payment_id: 451,
    student_name: 'Chanda Mwamba',
    room: 'Room 4B',
    amount_owed: 2500,
    days_overdue: 18,
  },
  {
    payment_id: 452,
    student_name: 'Mwila Phiri',
    room: 'Room 2A',
    amount_owed: 1800,
    days_overdue: 12,
  },
  {
    payment_id: 453,
    student_name: 'Nkandu Simwaka',
    room: 'Room 5C',
    amount_owed: 3200,
    days_overdue: 25,
  },
];

// Financial Flow Sankey Diagram
function FinancialFlowDiagram({ data }) {
  const svgRef = useRef(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth || 800;
    const height = 300;

    // Create sankey layout
    const sg = sankey()
      .nodeWidth(60)
      .nodePadding(80)
      .extent([
        [0, 0],
        [width, height],
      ]);

    const graph = sg({ nodes: data.nodes.map(d => ({ ...d })), links: data.links.map(d => ({ ...d })) });

    // Clear SVG
    const svg = svgRef.current;
    svg.innerHTML = '';

    // Create defs for gradients
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    data.links.forEach((link, idx) => {
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradient.id = `link-gradient-${idx}`;
      gradient.setAttribute('x1', '0%');
      gradient.setAttribute('y1', '0%');
      gradient.setAttribute('x2', '100%');
      gradient.setAttribute('y2', '0%');

      const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-color', '#00f0ff');
      stop1.setAttribute('stop-opacity', '0.6');

      const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('stop-color', '#00f0ff');
      stop2.setAttribute('stop-opacity', '0.1');

      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
      defs.appendChild(gradient);
    });

    svg.appendChild(defs);

    // Draw links
    const linkSelection = graph.links.map((link, idx) => {
      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElement.setAttribute('d', sankeyLinkHorizontal()(link));
      pathElement.setAttribute('fill', 'none');
      pathElement.setAttribute('stroke', `url(#link-gradient-${idx})`);
      pathElement.setAttribute('stroke-width', Math.max(1, link.width || 1));
      pathElement.setAttribute('opacity', hoveredLink === idx ? '1' : '0.6');
      pathElement.setAttribute('class', 'transition-opacity');
      pathElement.style.cursor = 'pointer';

      pathElement.addEventListener('mouseenter', () => {
        setHoveredLink(idx);
        setTooltip({
          x: (link.source.x1 + link.target.x0) / 2,
          y: link.y0 + (link.y1 - link.y0) / 2,
          value: link.value,
        });
      });

      pathElement.addEventListener('mouseleave', () => {
        setHoveredLink(null);
        setTooltip(null);
      });

      svg.appendChild(pathElement);
      return pathElement;
    });

    // Draw nodes
    graph.nodes.forEach((node) => {
      const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      // Node rect
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', node.x0);
      rect.setAttribute('y', node.y0);
      rect.setAttribute('width', node.x1 - node.x0);
      rect.setAttribute('height', node.y1 - node.y0);
      rect.setAttribute('fill', '#00f0ff');
      rect.setAttribute('fill-opacity', '0.15');
      rect.setAttribute('stroke', '#00f0ff');
      rect.setAttribute('stroke-width', '1.5');
      rect.setAttribute('rx', '6');
      rect.setAttribute('filter', 'drop-shadow(0 0 12px rgba(0, 240, 255, 0.4))');

      // Node label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x0 + (node.x1 - node.x0) / 2);
      text.setAttribute('y', node.y0 + (node.y1 - node.y0) / 2);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dy', '0.35em');
      text.setAttribute('fill', '#ffffff');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', '600');
      text.textContent = node.name;

      nodeGroup.appendChild(rect);
      nodeGroup.appendChild(text);
      svg.appendChild(nodeGroup);
    });
  }, [data, hoveredLink]);

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        width="100%"
        height="300"
        style={{ background: 'transparent', overflow: 'visible' }}
      />
      {tooltip && (
        <div
          className="fixed bg-gray-900 border border-cyan-500/40 rounded px-3 py-2 text-xs text-cyan-200 font-mono pointer-events-none z-50"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 40}px`,
            transform: 'translate(-50%, 0)',
          }}
        >
          ZMW {tooltip.value.toLocaleString()}
        </div>
      )}
    </div>
  );
}

// AI Comms Copilot
function AICommsCopilot() {
  const [expandedId, setExpandedId] = useState(null);
  const [draftText, setDraftText] = useState('');
  const [loadingId, setLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const handleDraftNotice = async (payment) => {
    setLoadingId(payment.payment_id);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockDraft = `Dear ${payment.student_name},\n\nThis is a friendly reminder that your rent for ${payment.room} is currently outstanding. As of today, your payment is ${payment.days_overdue} days overdue.\n\nAmount owed: ZMW ${payment.amount_owed.toLocaleString()}\n\nPlease arrange payment at your earliest convenience to avoid further action.\n\nBest regards,\nBoardPay Management`;

    setDraftText(mockDraft);
    setExpandedId(payment.payment_id);
    setLoadingId(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftText);
    setToast('Copied to clipboard!');
    setTimeout(() => setToast(null), 2000);
  };

  const handleSendNotice = () => {
    setToast('Notice sent to tenant!');
    setExpandedId(null);
    setDraftText('');
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="space-y-4">
      {DELINQUENT_PAYMENTS.map((payment) => (
        <div
          key={payment.payment_id}
          className={`transition-all ${
            expandedId === payment.payment_id
              ? 'bg-white/5 border border-white/10 rounded-2xl p-6'
              : 'bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10'
          }`}
        >
          {expandedId === payment.payment_id ? (
            // Expanded state: code editor
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white">{payment.student_name} — {payment.room}</h4>
                <button
                  onClick={() => {
                    setExpandedId(null);
                    setDraftText('');
                  }}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  ✕ Close
                </button>
              </div>

              <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden font-mono text-xs leading-relaxed">
                <textarea
                  className="w-full h-48 bg-gray-950 text-gray-100 p-4 focus:outline-none resize-none"
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder="Draft notice will appear here…"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 px-4 py-2 text-xs rounded-lg border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 transition-colors font-medium"
                >
                  Copy
                </button>
                <button
                  onClick={handleSendNotice}
                  className="flex-1 px-4 py-2 text-xs rounded-lg bg-cyan-500 text-black hover:bg-cyan-600 transition-colors font-medium"
                >
                  Send Notice
                </button>
              </div>
            </div>
          ) : (
            // Collapsed state: row
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{payment.student_name}</p>
                <p className="text-xs text-gray-400">{payment.room} · ZMW {payment.amount_owed.toLocaleString()} · {payment.days_overdue}d overdue</p>
              </div>
              <button
                onClick={() => handleDraftNotice(payment)}
                disabled={loadingId === payment.payment_id}
                className="px-3 py-2 text-xs rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors font-medium flex items-center gap-1.5 disabled:opacity-50"
              >
                {loadingId === payment.payment_id ? (
                  <>
                    <div className="w-3 h-3 border border-cyan-300 border-t-transparent rounded-full animate-spin" />
                    Drafting…
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Draft Notice
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Lease Generator and Print
function LeaseGenerator() {
  const [showLease, setShowLease] = useState(false);
  const leaseRef = useRef(null);

  const mockLeaseData = {
    tenant_name: 'Chanda Mwamba',
    room: 'Room 4B',
    rent_amount: 2500,
    lease_start: '2024-01-15',
    lease_end: '2024-12-31',
  };

  const handlePrint = () => {
    window.print();
  };

  if (!showLease) {
    return (
      <button
        onClick={() => setShowLease(true)}
        className="w-full px-4 py-3 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
      >
        <FileText size={16} />
        Generate Print Lease
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Lease Document</h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs rounded-lg bg-cyan-500 text-black hover:bg-cyan-600 transition-colors font-medium"
          >
            Print / Save as PDF
          </button>
          <button
            onClick={() => setShowLease(false)}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-700 text-gray-400 hover:text-white transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>

      {/* Print-isolated lease document */}
      <div
        ref={leaseRef}
        id="lease-print-frame"
        className="bg-white text-black p-12 rounded-lg shadow-lg border border-gray-200"
        style={{ pageBreakAfter: 'avoid' }}
      >
        {/* BoardPay Letterhead */}
        <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
          <h1 className="text-3xl font-bold text-cyan-600">BoardPay</h1>
          <p className="text-xs text-gray-600 mt-1">Student Housing Management System</p>
          <p className="text-xs text-gray-600">Lusaka, Zambia</p>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold">RESIDENTIAL LEASE AGREEMENT</h2>
        </div>

        {/* Lease Details */}
        <div className="space-y-4 text-sm mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-bold text-xs">TENANT NAME:</p>
              <p>{mockLeaseData.tenant_name}</p>
            </div>
            <div>
              <p className="font-bold text-xs">ROOM NUMBER:</p>
              <p>{mockLeaseData.room}</p>
            </div>
            <div>
              <p className="font-bold text-xs">MONTHLY RENT:</p>
              <p>ZMW {mockLeaseData.rent_amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="font-bold text-xs">LEASE PERIOD:</p>
              <p>
                {new Date(mockLeaseData.lease_start).toLocaleDateString()} to{' '}
                {new Date(mockLeaseData.lease_end).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Terms Section */}
        <div className="text-sm space-y-3 mb-8">
          <p className="font-bold">TERMS AND CONDITIONS:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed">
            <li>Tenant agrees to pay rent on or before the due date each month.</li>
            <li>Failure to pay rent may result in eviction proceedings.</li>
            <li>Tenant is responsible for maintaining the room in good condition.</li>
            <li>Any damages beyond normal wear and tear will be charged to the tenant.</li>
            <li>Tenant must adhere to house rules and community standards.</li>
            <li>This lease is valid for the period specified above.</li>
          </ol>
        </div>

        {/* Signature Lines */}
        <div className="border-t border-gray-300 pt-8 mt-12">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold mb-12">TENANT SIGNATURE</p>
              <p className="text-xs">__________________________</p>
              <p className="text-xs text-gray-600">Date: ____________</p>
            </div>
            <div>
              <p className="text-xs font-bold mb-12">LANDLORD SIGNATURE</p>
              <p className="text-xs">__________________________</p>
              <p className="text-xs text-gray-600">Date: ____________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function LandlordDashboard() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Board<span className="text-cyan-500">Pay</span></h1>
            <p className="text-xs text-gray-500 mt-0.5">Landlord Management Dashboard</p>
          </div>
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
      </header>

      {/* Analytics Metrics Bar */}
      <section className="px-6 py-8 border-b border-white/5 bg-gradient-to-b from-white/2 to-transparent">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-semibold mb-6 text-white">Revenue & Collections</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:border-cyan-500/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-2xl font-bold text-white mt-1">ZMW 27,000</p>
                </div>
                <DollarSign className="w-8 h-8 text-cyan-400/30" />
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-green-400">+12.5% vs last month</span>
              </div>
            </div>

            {/* Collections Today */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:border-green-500/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Collected Today</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">ZMW 4,500</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-green-400">✓</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">24 payments verified</p>
            </div>

            {/* Outstanding */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:border-orange-500/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding</p>
                  <p className="text-2xl font-bold text-orange-400 mt-1">ZMW 7,500</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-400/30" />
              </div>
              <p className="text-xs text-slate-400">3 delinquent accounts</p>
            </div>

            {/* Collection Rate */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:border-cyan-500/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Collection Rate</p>
                  <p className="text-2xl font-bold text-cyan-400 mt-1">78.2%</p>
                </div>
                <div className="relative w-8 h-8">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(0,240,255,0.1)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#00f0ff" strokeWidth="3" 
                            strokeDasharray={`${78.2 / 100 * 100}`} strokeDashoffset="0" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-slate-400">Month-to-date</p>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Revenue Chart */}
      <section className="px-6 py-8 border-b border-white/5 bg-gradient-to-b from-white/1 to-transparent">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-semibold mb-6 text-white">Revenue Trends (7-Day Timeline)</h2>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            {/* Mini line chart using SVG */}
            <svg width="100%" height="200" viewBox="0 0 700 200" className="w-full" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1="40" y1={40 + i * 40} x2="680" y2={40 + i * 40} stroke="rgba(0,240,255,0.1)" strokeWidth="1" />
              ))}

              {/* Area fill */}
              <path d="M 80 100 L 180 70 L 280 90 L 380 50 L 480 75 L 580 45 L 680 65 L 680 180 L 80 180 Z" fill="url(#revenueGradient)" />

              {/* Line */}
              <polyline points="80,100 180,70 280,90 380,50 480,75 580,45 680,65" fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              {/* Data points */}
              {[{x: 80, val: 3200}, {x: 180, val: 4100}, {x: 280, val: 3800}, {x: 380, val: 5200}, {x: 480, val: 4500}, {x: 580, val: 5800}, {x: 680, val: 4500}].map((point, i) => (
                <g key={i}>
                  <circle cx={point.x} cy={point.y === 100 ? 100 : point.y} r="5" fill="rgba(0,240,255,0.8)" stroke="#00f0ff" strokeWidth="2" />
                  <text x={point.x} y={point.y === 100 ? 70 : point.y - 15} textAnchor="middle" fontSize="11" fill="#00f0ff" fontWeight="600">
                    {point.val / 1000}k
                  </text>
                </g>
              ))}

              {/* X-axis labels */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <text key={day} x={80 + i * 100} y="195" textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.6)">
                  {day}
                </text>
              ))}
            </svg>

            {/* Legend */}
            <div className="flex gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{background: 'linear-gradient(90deg, #00f0ff, #0ea5e9)'}} />
                <span className="text-slate-300">Revenue (ZMW)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-slate-300">On-time payments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="px-6 py-8 max-w-7xl mx-auto">
        {/* Toast */}
        {/* (Toast handled within components) */}

        <div className="space-y-6">
          {/* 0. Immutable Audit Trail */}
          <AuditTrail />

          {/* 1. Financial Flow Map */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Financial Flow — This Month</h2>
            <div className="overflow-x-auto">
              <FinancialFlowDiagram data={FINANCIAL_FLOWS} />
            </div>
          </div>

          {/* 2. AI Comms Copilot */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">AI Comms Copilot — Delinquent Notices</h2>
            <AICommsCopilot />
          </div>

          {/* 3. Contract Engine */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Contract Engine</h2>
            <LeaseGenerator />
          </div>
        </div>
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          body, html {
            background: white;
            margin: 0;
            padding: 0;
          }

          main, header, button:not(#lease-print-frame button) {
            display: none !important;
          }

          #lease-print-frame {
            display: block !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            background: white !important;
            margin: 0 !important;
            page-break-after: avoid !important;
          }

          #lease-print-frame * {
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
