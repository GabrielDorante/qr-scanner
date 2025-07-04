import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Square, RotateCcw, Copy, ExternalLink, Share2, Search, X, Download } from 'lucide-react';

// Types
interface QRResult {
  data: string;
  type: 'url' | 'email' | 'phone' | 'wifi' | 'text';
}

interface AnalyticsEvent {
  event: string;
  timestamp: string;
  userAgent: string;
  url: string;
  [key: string]: any;
}

// QR Scanner Hook
const useQRScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [status, setStatus] = useState<{ type: 'info' | 'success' | 'error' | 'warning'; message: string } | null>(null);

  // Get available cameras
  const getCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
      
      // Prefer back camera
      const backCameraIndex = videoDevices.findIndex(camera => 
        camera.label.toLowerCase().includes('back') || 
        camera.label.toLowerCase().includes('rear') ||
        camera.label.toLowerCase().includes('environment')
      );
      
      if (backCameraIndex !== -1) {
        setCurrentCameraIndex(backCameraIndex);
      }
    } catch (error) {
      console.error('Error getting cameras:', error);
    }
  }, []);

  // Enhanced QR detection with multiple methods
  const detectQR = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    // Method 1: Standard detection
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // @ts-ignore - jsQR is loaded via script tag
    let code = window.jsQR?.(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });
    
    if (code) return code.data;

    // Method 2: Enhanced contrast (every 3rd attempt)
    if (scanAttempts % 3 === 0) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d')!;
      
      // Apply contrast enhancement
      tempCtx.filter = 'contrast(150%) brightness(110%) saturate(0%)';
      tempCtx.drawImage(canvas, 0, 0);
      
      const enhancedImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      // @ts-ignore
      code = window.jsQR?.(enhancedImageData.data, enhancedImageData.width, enhancedImageData.height, {
        inversionAttempts: "attemptBoth",
      });
      
      if (code) return code.data;
    }

    // Method 3: Region scanning (every 5th attempt)
    if (scanAttempts % 5 === 0) {
      const centerX = Math.floor(canvas.width * 0.125);
      const centerY = Math.floor(canvas.height * 0.125);
      const centerWidth = Math.floor(canvas.width * 0.75);
      const centerHeight = Math.floor(canvas.height * 0.75);
      
      try {
        const centerImageData = ctx.getImageData(centerX, centerY, centerWidth, centerHeight);
        // @ts-ignore
        code = window.jsQR?.(centerImageData.data, centerWidth, centerHeight, {
          inversionAttempts: "attemptBoth",
        });
        
        if (code) return code.data;
      } catch (error) {
        // Continue
      }
    }

    return null;
  }, [scanAttempts]);

  // Scan loop
  const scanLoop = useCallback(() => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const result = detectQR(canvas, ctx);
      if (result) {
        return result;
      }

      setScanAttempts(prev => prev + 1);
    }

    animationRef.current = requestAnimationFrame(scanLoop);
    return null;
  }, [isScanning, detectQR]);

  // Start scanning
  const startScanning = useCallback(async () => {
    try {
      setStatus({ type: 'info', message: 'Iniciando cámara...' });
      await getCameras();

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 30, min: 15 }
        }
      };

      if (cameras.length > 0) {
        (constraints.video as MediaTrackConstraints).deviceId = { 
          exact: cameras[currentCameraIndex].deviceId 
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => resolve();
          }
        });
      }

      setIsScanning(true);
      setScanAttempts(0);
      setStatus({ type: 'success', message: '¡Cámara activa! Apunta hacia un código QR' });
      
      // Start scan loop
      const result = scanLoop();
      return result;

    } catch (error) {
      console.error('Error accessing camera:', error);
      setStatus({ type: 'error', message: 'No se pudo acceder a la cámara. Verifica los permisos.' });
      throw error;
    }
  }, [cameras, currentCameraIndex, getCameras, scanLoop]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    setIsScanning(false);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setStatus(null);
    setScanAttempts(0);
  }, []);

  // Switch camera
  const switchCamera = useCallback(async () => {
    if (cameras.length <= 1) return;
    
    const newIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(newIndex);
    
    if (isScanning) {
      stopScanning();
      setTimeout(() => startScanning(), 500);
    }
  }, [cameras.length, currentCameraIndex, isScanning, stopScanning, startScanning]);

  // Effect for scan loop
  useEffect(() => {
    if (isScanning) {
      const scan = () => {
        const result = scanLoop();
        if (!result) {
          animationRef.current = requestAnimationFrame(scan);
        }
        return result;
      };
      animationRef.current = requestAnimationFrame(scan);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isScanning, scanLoop]);

  return {
    videoRef,
    canvasRef,
    isScanning,
    cameras,
    status,
    scanAttempts,
    startScanning,
    stopScanning,
    switchCamera
  };
};

// Analytics Hook
const useAnalytics = () => {
  const trackEvent = useCallback((eventName: string, properties: Record<string, any> = {}) => {
    const eventData: AnalyticsEvent = {
      event: eventName,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...properties
    };

    // Store in localStorage for now (could be IndexedDB)
    const events = JSON.parse(localStorage.getItem('qr_analytics') || '[]');
    events.push(eventData);
    localStorage.setItem('qr_analytics', JSON.stringify(events.slice(-100))); // Keep last 100 events

    console.log('Analytics Event:', eventData);
  }, []);

  return { trackEvent };
};

// Install Prompt Hook
const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      setTimeout(() => {
        if (!localStorage.getItem('installPromptDismissed')) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Install prompt outcome:', outcome);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  return { showInstallPrompt, installApp, dismissPrompt };
};

// Utility functions
const detectQRType = (data: string): QRResult['type'] => {
  if (data.startsWith('http://') || data.startsWith('https://')) return 'url';
  if (data.startsWith('mailto:')) return 'email';
  if (data.startsWith('tel:')) return 'phone';
  if (data.startsWith('WIFI:')) return 'wifi';
  if (data.includes('@') && data.includes('.')) return 'email';
  return 'text';
};

const playSuccessSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    // Silently fail
  }
};

// Components
const StatusMessage: React.FC<{ status: { type: string; message: string } | null }> = ({ status }) => {
  if (!status || !status.message) return null;

  const bgColor = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
  }[status.type] || 'bg-gray-500/10 border-gray-500/30 text-gray-400';

  return (
    <div className={`p-4 rounded-2xl text-center font-medium border backdrop-blur-xl ${bgColor}`}>
      {status.message}
    </div>
  );
};

const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-blue-500/90 text-white px-6 py-3 rounded-xl backdrop-blur-xl z-50 animate-in slide-in-from-bottom-2">
      {message}
    </div>
  );
};

const InstallPrompt: React.FC<{ onInstall: () => void; onDismiss: () => void }> = ({ onInstall, onDismiss }) => (
  <div className="fixed bottom-5 left-5 right-5 bg-white/5 border border-blue-500/30 rounded-2xl p-5 backdrop-blur-2xl z-50 animate-in slide-in-from-bottom-2">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
        <Download className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-medium text-white">Instalar QR Scanner</h3>
        <p className="text-sm text-white/60">Agrega esta app a tu pantalla de inicio</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onInstall}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:scale-105 transition-transform"
        >
          Instalar
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-2 bg-white/10 text-white/60 rounded-xl font-medium hover:bg-white/20 transition-colors"
        >
          Ahora no
        </button>
      </div>
    </div>
  </div>
);

const ResultScreen: React.FC<{
  result: QRResult;
  onClose: () => void;
  onScanAgain: () => void;
  onCopy: () => void;
  onOpen: () => void;
  onShare: () => void;
  onSearch: () => void;
}> = ({ result, onClose, onScanAgain, onCopy, onOpen, onShare, onSearch }) => (
  <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 p-5 overflow-y-auto animate-in fade-in-0">
    <button
      onClick={onClose}
      className="absolute top-8 right-8 w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
    >
      <X className="w-6 h-6" />
    </button>
    
    <div className="max-w-2xl mx-auto pt-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-light mb-3 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
          ✅ Código QR Detectado
        </h2>
        <p className="text-white/60">Elige qué hacer con el contenido</p>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-xl">
        <h3 className="text-xl font-medium text-blue-400 mb-3">Contenido:</h3>
        <div className="bg-black/30 p-4 rounded-xl border border-white/10 font-mono text-sm leading-relaxed break-all text-white">
          {result.data}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button
          onClick={onCopy}
          className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-colors flex flex-col items-center gap-2"
        >
          <Copy className="w-6 h-6" />
          <span className="text-sm">Copiar</span>
        </button>
        
        {result.type === 'url' && (
          <button
            onClick={onOpen}
            className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-colors flex flex-col items-center gap-2"
          >
            <ExternalLink className="w-6 h-6" />
            <span className="text-sm">Abrir</span>
          </button>
        )}
        
        <button
          onClick={onShare}
          className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-colors flex flex-col items-center gap-2"
        >
          <Share2 className="w-6 h-6" />
          <span className="text-sm">Compartir</span>
        </button>
        
        <button
          onClick={onSearch}
          className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-colors flex flex-col items-center gap-2"
        >
          <Search className="w-6 h-6" />
          <span className="text-sm">Buscar</span>
        </button>
      </div>
      
      <div className="text-center">
        <button
          onClick={onScanAgain}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium hover:scale-105 transition-transform"
        >
          Escanear Otro Código
        </button>
      </div>
    </div>
  </div>
);

// Main App Component
const App: React.FC = () => {
  const { trackEvent } = useAnalytics();
  const { showInstallPrompt, installApp, dismissPrompt } = useInstallPrompt();
  const {
    videoRef,
    canvasRef,
    isScanning,
    cameras,
    status,
    scanAttempts,
    startScanning,
    stopScanning,
    switchCamera
  } = useQRScanner();

  const [result, setResult] = useState<QRResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Handle QR detection result
  const handleQRResult = useCallback((data: string) => {
    const qrResult: QRResult = {
      data,
      type: detectQRType(data)
    };
    
    setResult(qrResult);
    stopScanning();
    playSuccessSound();
    trackEvent('qr_scanned', {
      type: qrResult.type,
      length: data.length,
      attempts: scanAttempts
    });
  }, [stopScanning, trackEvent, scanAttempts]);

  // Enhanced scanning with result detection
  const handleStartScanning = useCallback(async () => {
    try {
      await startScanning();
      trackEvent('scan_started');
      
      // Set up continuous scanning
      const scanInterval = setInterval(() => {
        if (!isScanning || !videoRef.current || !canvasRef.current) {
          clearInterval(scanInterval);
          return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // @ts-ignore - jsQR is loaded via script tag
        const code = window.jsQR?.(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });

        if (code) {
          clearInterval(scanInterval);
          handleQRResult(code.data);
        }
      }, 100); // Check every 100ms

    } catch (error) {
      trackEvent('scan_error', { error: (error as Error).message });
    }
  }, [startScanning, trackEvent, isScanning, handleQRResult]);

  const handleStopScanning = useCallback(() => {
    stopScanning();
    trackEvent('scan_stopped');
  }, [stopScanning, trackEvent]);

  const handleSwitchCamera = useCallback(() => {
    switchCamera();
    trackEvent('camera_switched');
  }, [switchCamera, trackEvent]);

  // Result actions
  const copyResult = useCallback(async () => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(result.data);
      setToast('¡Copiado al portapapeles!');
      trackEvent('result_copied');
    } catch (error) {
      setToast('No se pudo copiar');
    }
  }, [result, trackEvent]);

  const openResult = useCallback(() => {
    if (!result || result.type !== 'url') return;
    
    window.open(result.data, '_blank', 'noopener,noreferrer');
    trackEvent('result_opened');
  }, [result, trackEvent]);

  const shareResult = useCallback(async () => {
    if (!result) return;
    
    const shareData = {
      title: 'Contenido de QR',
      text: result.data
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        trackEvent('result_shared');
      } else {
        await copyResult();
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setToast('No se pudo compartir');
      }
    }
  }, [result, trackEvent, copyResult]);

  const searchResult = useCallback(() => {
    if (!result) return;
    
    const searchURL = `https://www.google.com/search?q=${encodeURIComponent(result.data)}`;
    window.open(searchURL, '_blank', 'noopener,noreferrer');
    trackEvent('result_searched');
  }, [result, trackEvent]);

  const scanAgain = useCallback(() => {
    setResult(null);
    handleStartScanning();
  }, [handleStartScanning]);

  // Track page view on mount
  useEffect(() => {
    trackEvent('page_view');
  }, [trackEvent]);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        {/* Grid */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto p-5">
        {/* Header */}
        <div className="text-center mb-10 animate-in fade-in-0 slide-in-from-top-4">
          <h1 className="text-4xl md:text-5xl font-light mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            QR Scanner
          </h1>
          <p className="text-white/60 text-sm tracking-wide">Powered by ideasmagna</p>
        </div>

        {/* Scanner Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl mb-6 animate-in fade-in-0 slide-in-from-bottom-4">
          {/* Scanner Icon or Video */}
          {!isScanning ? (
            <div className="text-center mb-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25 animate-pulse">
                <Camera className="w-16 h-16 text-white" />
              </div>
            </div>
          ) : (
            <div className="relative mb-8">
              <div className="relative w-full max-w-2xl mx-auto h-96 rounded-2xl overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Scanner Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-2 border-blue-400 rounded-2xl relative animate-pulse">
                    {/* Scanning Line */}
                    <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-bounce" 
                         style={{ top: '50%' }} />
                    
                    {/* Corner Markers */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
                  </div>
                </div>

                {/* Detection Status */}
                <div className="absolute top-4 left-4 bg-black/70 text-blue-400 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                  Buscando QR... ({scanAttempts})
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* Controls */}
          <div className="max-w-md mx-auto space-y-4">
            {!isScanning ? (
              <button
                onClick={handleStartScanning}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium hover:scale-105 transition-transform shadow-lg shadow-blue-500/25"
              >
                Escanear
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleStopScanning}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-medium hover:scale-105 transition-transform"
                >
                  <Square className="w-5 h-5 inline mr-2" />
                  Detener
                </button>
                
                {cameras.length > 1 && (
                  <button
                    onClick={handleSwitchCamera}
                    className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-2xl font-medium hover:bg-white/20 transition-colors"
                  >
                    <RotateCcw className="w-5 h-5 inline mr-2" />
                    Cambiar Cámara
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Status */}
          {status && (
            <div className="mt-6">
              <StatusMessage status={status} />
            </div>
          )}
        </div>
      </div>

      {/* Result Screen */}
      {result && (
        <ResultScreen
          result={result}
          onClose={() => setResult(null)}
          onScanAgain={scanAgain}
          onCopy={copyResult}
          onOpen={openResult}
          onShare={shareResult}
          onSearch={searchResult}
        />
      )}

      {/* Install Prompt */}
      {showInstallPrompt && (
        <InstallPrompt onInstall={installApp} onDismiss={dismissPrompt} />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;