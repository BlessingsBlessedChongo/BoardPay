import React, { useState, useRef } from 'react';
import { Upload, Mic, Loader, CheckCircle, AlertCircle, Edit2 } from 'lucide-react';

export default function UploadPanel() {
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, success, error
  const [previewData, setPreviewData] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isEditing, setIsEditing] = useState({});
  const [editValues, setEditValues] = useState({});
  const fileInputRef = useRef(null);
  const dragZoneRef = useRef(null);

  // Simulate voice transcription
  const startVoiceTranscription = async () => {
    setIsListening(true);
    setTranscription('');
    
    // Pulse animation for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Auto-populate transcription
    setTranscription('Uploading 2,500 Kwacha for July rent');
    setIsListening(false);

    // Immediately trigger file upload simulation
    simulateFileUpload();
  };

  // Simulate file upload
  const simulateFileUpload = async () => {
    setUploadState('uploading');
    
    try {
      // Simulate POST to /api/payments/upload/
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful OCR response
      const mockResponse = {
        payment_id: 451,
        status: "PENDING",
        extracted_data: {
          amount: 2500.00,
          transaction_reference: "TXN987654321",
          date: "2026-07-09"
        },
        ocr_match_flag: true
      };
      
      setPreviewData(mockResponse);
      setEditValues({
        amount: mockResponse.extracted_data.amount,
        reference: mockResponse.extracted_data.transaction_reference,
        date: mockResponse.extracted_data.date
      });
      setUploadState('success');
    } catch (error) {
      console.error('[v0] Upload error:', error);
      setUploadState('error');
      setTimeout(() => setUploadState('idle'), 3000);
    }
  };

  // Handle file drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragZoneRef.current?.classList.add('border-cyan-500', 'bg-cyan-500/5');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragZoneRef.current?.classList.remove('border-cyan-500', 'bg-cyan-500/5');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragZoneRef.current?.classList.remove('border-cyan-500', 'bg-cyan-500/5');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      simulateFileUpload();
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      simulateFileUpload();
    }
  };

  // Toggle edit mode for a field
  const toggleEdit = (field) => {
    setIsEditing(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Update editable field
  const handleEditChange = (field, value) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  if (previewData && uploadState === 'success') {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md 
                      shadow-2xl hover:shadow-cyan-500/5 transition-all duration-300 p-8">
        
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Payment Proof Analyzed</h2>
        </div>

        {/* OCR Match Status Badge */}
        <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-transparent 
                        border border-green-500/30 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-green-300 font-medium text-sm">Receipt Verified</p>
            <p className="text-green-200/60 text-xs">OCR match confirmed - details ready for review</p>
          </div>
        </div>

        {/* Editable Preview Card */}
        <div className="space-y-4">
          
          {/* Amount */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Amount (ZMW)
            </label>
            {isEditing.amount ? (
              <input
                type="number"
                value={editValues.amount}
                onChange={(e) => handleEditChange('amount', e.target.value)}
                className="w-full bg-[#0a0a0f] border border-cyan-500 rounded-lg px-3 py-2 
                           text-white font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                onBlur={() => toggleEdit('amount')}
                autoFocus
              />
            ) : (
              <div className="flex items-center justify-between group">
                <span className="text-3xl font-bold text-cyan-400">
                  {editValues.amount?.toLocaleString()}
                </span>
                <button
                  onClick={() => toggleEdit('amount')}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-cyan-500/20 rounded-lg"
                >
                  <Edit2 className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            )}
          </div>

          {/* Transaction Reference */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Transaction Reference
            </label>
            {isEditing.reference ? (
              <input
                type="text"
                value={editValues.reference}
                onChange={(e) => handleEditChange('reference', e.target.value)}
                className="w-full bg-[#0a0a0f] border border-cyan-500 rounded-lg px-3 py-2 
                           text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                onBlur={() => toggleEdit('reference')}
                autoFocus
              />
            ) : (
              <div className="flex items-center justify-between group">
                <span className="font-mono text-slate-300">{editValues.reference}</span>
                <button
                  onClick={() => toggleEdit('reference')}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-cyan-500/20 rounded-lg"
                >
                  <Edit2 className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            )}
          </div>

          {/* Date */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Payment Date
            </label>
            {isEditing.date ? (
              <input
                type="date"
                value={editValues.date}
                onChange={(e) => handleEditChange('date', e.target.value)}
                className="w-full bg-[#0a0a0f] border border-cyan-500 rounded-lg px-3 py-2 
                           text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                onBlur={() => toggleEdit('date')}
                autoFocus
              />
            ) : (
              <div className="flex items-center justify-between group">
                <span className="text-slate-300">{editValues.date}</span>
                <button
                  onClick={() => toggleEdit('date')}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-cyan-500/20 rounded-lg"
                >
                  <Edit2 className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setPreviewData(null);
                setUploadState('idle');
                setTranscription('');
              }}
              className="flex-1 px-4 py-3 rounded-lg border border-slate-600 text-slate-300 font-medium
                         hover:bg-slate-600/10 transition-all"
            >
              Cancel
            </button>
            <button
              className="flex-1 px-4 py-3 rounded-lg bg-cyan-500 text-black font-semibold
                         hover:brightness-110 transition-all active:scale-95"
            >
              Confirm & Submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md 
                    shadow-2xl hover:shadow-cyan-500/5 transition-all duration-300 p-8">
      
      <h2 className="text-2xl font-bold text-white mb-2">Submit Payment Receipt</h2>
      <p className="text-slate-400 text-sm mb-6">
        Upload proof or use voice to log your payment instantly
      </p>

      {/* Drag & Drop Zone */}
      <div
        ref={dragZoneRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="mb-6 relative rounded-xl border-2 border-dashed border-white/20 
                   bg-white/5 p-8 text-center transition-all duration-200 cursor-pointer
                   hover:border-cyan-500/50 hover:bg-cyan-500/5 group"
      >
        <Upload className="w-12 h-12 mx-auto mb-3 text-slate-400 group-hover:text-cyan-400 transition-colors" />
        <p className="text-slate-300 font-medium mb-1">Drag and drop your receipt here</p>
        <p className="text-slate-500 text-sm">or click below to browse</p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 sm:flex-row flex-col">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadState === 'uploading'}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg 
                     bg-cyan-500 text-black font-semibold hover:brightness-110 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {uploadState === 'uploading' ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Browse Files</span>
            </>
          )}
        </button>

        {/* Voice Transcription Button */}
        <button
          onClick={startVoiceTranscription}
          disabled={uploadState === 'uploading' || isListening}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold 
                      transition-all active:scale-95 ${
            isListening
              ? 'bg-orange-500/20 border border-orange-500/50 text-orange-300 animate-pulse'
              : 'bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>{isListening ? 'Listening...' : 'Voice Log'}</span>
        </button>
      </div>

      {/* Transcription Display */}
      {transcription && (
        <div className="mt-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
          <p className="text-xs font-medium text-orange-400 uppercase tracking-wider mb-2">Transcription</p>
          <p className="text-slate-200">{transcription}</p>
        </div>
      )}

      {/* Loading State */}
      {uploadState === 'uploading' && (
        <div className="mt-6 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-3">
          <Loader className="w-5 h-5 text-cyan-400 animate-spin" />
          <div>
            <p className="text-cyan-300 font-medium text-sm">AI Analyzing Receipt...</p>
            <p className="text-cyan-200/60 text-xs">Please wait while we extract payment details</p>
          </div>
        </div>
      )}
    </div>
  );
}
