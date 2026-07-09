import React, { useState, useRef } from 'react';
import { Upload, Mic, Loader, CheckCircle, AlertCircle, Edit2 } from 'lucide-react';
import api from '../api/axios';

export default function UploadPanel({ onDataUpdate }) {
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, success, error
  const [previewData, setPreviewData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isEditing, setIsEditing] = useState({});
  const [editValues, setEditValues] = useState({});
  const fileInputRef = useRef(null);
  const dragZoneRef = useRef(null);

  // Upload file to backend via Axios with FormData
  const uploadFileToBackend = async (file) => {
    setUploadState('uploading');
    setErrorMessage('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/payments/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        const extractedData = response.data.extracted_data;
        setPreviewData({
          payment_id: null,
          status: "PENDING",
          extracted_data: extractedData,
          ocr_match_flag: true
        });
        setEditValues({
          amount: extractedData.amount || '',
          reference: extractedData.transaction_reference || '',
          date: extractedData.date || ''
        });
        setUploadState('success');
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('[UploadPanel] Upload error:', error);
      setErrorMessage(
        error?.response?.data?.error ||
        error?.message ||
        'Failed to upload file. Please try again.'
      );
      setUploadState('error');
      setTimeout(() => setUploadState('idle'), 4000);
    }
  };

  // Simulate voice transcription (placeholder for actual speech-to-text)
  const startVoiceTranscription = async () => {
    setIsListening(true);
    setTranscription('');
    setErrorMessage('');
    
    // Simulate listening for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In production, integrate with Web Speech API or a speech service
    setTranscription('Voice transcription feature requires Speech API setup');
    setIsListening(false);
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
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      uploadFileToBackend(files[0]);
    } else {
      setErrorMessage('Please drop an image file');
      setUploadState('error');
      setTimeout(() => setUploadState('idle'), 3000);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      uploadFileToBackend(files[0]);
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

  // Submit the payment with edited values
  const handleSubmitPayment = async () => {
    try {
      setUploadState('uploading');
      
      // Call API to submit payment with extracted/edited data
      const response = await api.post('/payments/', {
        amount: editValues.amount,
        transaction_ref: editValues.reference,
        // receipt_image would need to be uploaded separately with FormData if needed
      });
      
      setPreviewData(null);
      setUploadState('idle');
      setTranscription('');
      setEditValues({});
      
      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error) {
      console.error('[UploadPanel] Submit error:', error);
      setErrorMessage(
        error?.response?.data?.detail ||
        error?.message ||
        'Failed to submit payment. Please try again.'
      );
      setUploadState('error');
    }
  };

  if (previewData && uploadState === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
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
            <p className="text-green-200/60 text-xs">OCR data extracted - review and confirm details below</p>
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
                <span className="font-mono text-slate-300">{editValues.reference || 'N/A'}</span>
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
                <span className="text-slate-300">{editValues.date || 'N/A'}</span>
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
              onClick={handleSubmitPayment}
              disabled={uploadState === 'uploading'}
              className="flex-1 px-4 py-3 rounded-lg bg-cyan-500 text-black font-semibold
                         hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
            >
              {uploadState === 'uploading' ? 'Submitting...' : 'Confirm & Submit'}
            </button>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md 
                    shadow-2xl hover:shadow-cyan-500/5 transition-all duration-300 p-8">
      
      <h2 className="text-2xl font-bold text-white mb-2">Submit Payment Receipt</h2>
      <p className="text-slate-400 text-sm mb-6">
        Upload proof or use voice to log your payment instantly
      </p>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-300 font-medium text-sm">Error</p>
            <p className="text-red-200/60 text-xs">{errorMessage}</p>
          </div>
        </div>
      )}

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
    </div>
  );
}
