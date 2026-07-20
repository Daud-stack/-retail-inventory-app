import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ScanLine, 
  X, 
  Check, 
  Zap, 
  Camera, 
  Barcode,
  AlertCircle
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function BarcodeScannerModal({ isOpen, onClose, onScanComplete, existingProducts = [] }) {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'simulation'
  const [cameraError, setCameraError] = useState(null);
  const [scannedResult, setScannedResult] = useState('');
  const [detectedItem, setDetectedItem] = useState(null);
  const scannerRef = useRef(null);

  const stopCameraScanner = useCallback(() => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
          scannerRef.current.clear();
        }).catch(err => console.warn(err));
      }
      scannerRef.current = null;
    }
  }, []);

  const handleScanSuccess = useCallback((sku) => {
    setScannedResult(sku);
    
    // Play audio beep indicator
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (_) {}

    // Query local product state
    const found = existingProducts.find(p => p.sku.toLowerCase() === sku.toLowerCase());
    if (found) {
      setDetectedItem(found);
    } else {
      setDetectedItem(null);
    }

    stopCameraScanner();
  }, [existingProducts, stopCameraScanner]);

  const startCameraScanner = useCallback(async () => {
    stopCameraScanner();
    try {
      setTimeout(async () => {
        const readerElement = document.getElementById('qr-reader');
        if (!readerElement) return;

        const html5QrCode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5QrCode;

        const config = { 
          fps: 15, 
          qrbox: { width: 260, height: 160 },
          aspectRatio: 1.0
        };

        try {
          await html5QrCode.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              handleScanSuccess(decodedText);
            },
            () => {}
          );
          setCameraError(null);
        } catch (err) {
          console.warn('Camera access error:', err);
          setCameraError('Camera access unavailable or permission denied. Switch to Camera Simulator below.');
        }
      }, 300);
    } catch (_) {
      setCameraError('Failed to initialize optical camera.');
    }
  }, [handleScanSuccess, stopCameraScanner]);

  useEffect(() => {
    if (isOpen) {
      setScannedResult('');
      setDetectedItem(null);
      setCameraError(null);

      if (activeTab === 'camera') {
        startCameraScanner();
      }
    } else {
      stopCameraScanner();
    }

    return () => {
      stopCameraScanner();
    };
  }, [isOpen, activeTab, startCameraScanner, stopCameraScanner]);

  // Simulate scanning a random SKU or pre-selected preset
  const handleSimulateScan = (providedSku) => {
    let sku = providedSku;
    if (!sku) {
      const prefixes = ['CLN', 'GRO', 'MSC'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const randNum = Math.floor(100000 + Math.random() * 900000);
      sku = `${prefix}-${randNum}`;
    }
    handleScanSuccess(sku);
  };

  const handleConfirmScan = () => {
    if (scannedResult) {
      onScanComplete(scannedResult, detectedItem);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <ScanLine className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Barcode Scanner Engine</h3>
              <p className="text-xs text-slate-400">Html5-QRCode & Optical Camera Integration</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-2 bg-slate-950 border-b border-slate-800 flex items-center justify-center gap-2">
          <button
            onClick={() => setActiveTab('camera')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'camera'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Optical Web Camera</span>
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'simulation'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Fast SKU Simulator</span>
          </button>
        </div>

        {/* Viewfinder Video Area */}
        <div className="p-6 space-y-4">
          {activeTab === 'camera' ? (
            <div>
              <div 
                id="qr-reader" 
                className="w-full h-64 bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden relative shadow-inner"
              />

              {cameraError && (
                <div className="mt-3 p-3 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="relative h-56 bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden flex flex-col items-center justify-center space-y-3 p-4">
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
              
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

              <Barcode className="w-28 h-12 text-slate-300 z-10" />
              <p className="text-xs text-slate-400 z-10 text-center font-mono">
                Click any existing item SKU or generate a new barcode below
              </p>
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Existing Product Barcodes (Query Local State):
            </span>
            <div className="grid grid-cols-3 gap-2">
              {existingProducts.slice(0, 3).map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => handleSimulateScan(prod.sku)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors"
                >
                  <span className="font-mono text-[11px] font-bold text-cyan-400 block">{prod.sku}</span>
                  <span className="text-[10px] text-slate-300 truncate block">{prod.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleSimulateScan(null)}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Generate Brand New SKU Barcode</span>
          </button>

          {/* Scanned Result Banner */}
          {scannedResult && (
            <div className="p-4 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Barcode Captured!</span>
                <span className="font-mono text-sm font-extrabold text-white bg-indigo-600 px-3 py-0.5 rounded-md">
                  {scannedResult}
                </span>
              </div>
              {detectedItem ? (
                <div className="text-xs text-emerald-400 font-semibold flex items-center justify-between pt-1 border-t border-indigo-500/30">
                  <span>Match: <strong>{detectedItem.name}</strong></span>
                  <span className="text-white font-extrabold">${detectedItem.price.toFixed(2)}</span>
                </div>
              ) : (
                <p className="text-xs text-amber-300 font-medium">
                  New Unregistered Barcode. Will auto-fill into <strong>Add Product Form</strong>!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmScan}
            disabled={!scannedResult}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Check className="w-4 h-4" />
            <span>
              {detectedItem ? 'Select Product' : 'Apply Barcode to Form'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
