import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Square, Copy, ExternalLink, Share2, Search, X, Download, QrCode, Shield, Lock, ScanLine } from 'lucide-react';
import jsQR from 'jsqr';

// Types
interface QRResult {
  data: string;
  type: 'url' | 'email' | 'phone' | 'wifi' | 'text' | 'contact';
}

// Privacy Notice Component
const PrivacyNotice: React.FC<{ onAccept: () => void; onDecline: () => void }> = ({ onAccept, onDecline }) => (
  <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 p-5 flex items-center justify-center">
    <div className="max-w-md bg-white/10 border border-white/20 rounded-3xl p-8 backdrop-blur-xl">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-medium text-white mb-2">Privacidad y Seguridad</h2>
        <p className="text-white/60 text-sm">Tu privacidad es importante para nosotros</p>
      </div>
      
      <div className="space-y-4 mb-8 text-sm text-white/80">
        <div className="flex items-start gap-3">
          <Lock className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-white">Procesamiento Local</p>
            <p className="text-white/60">Todo el escaneo se realiza en tu dispositivo. No enviamos imágenes a servidores externos.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Camera className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-white">Acceso a Cámara</p>
            <p className="text-white/60">Solo accedemos a tu cámara para escanear códigos QR. No grabamos ni almacenamos video.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <QrCode className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-white">Datos del QR</p>
            <p className="text-white/60">Los datos escaneados se procesan localmente y solo se almacenan temporalmente para mostrarte el resultado.</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={onAccept}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium hover:scale-105 transition-transform"
        >
          Entiendo y Acepto
        </button>
        <button
          onClick={onDecline}
          className="w-full py-3 bg-white/10 border border-white/20 text-white/80 rounded-2xl font-medium hover:bg-white/20 transition-colors"
        >
          No Permitir
        </button>
      </div>
      
      <p className="text-xs text-white/40 text-center mt-4">
        Puedes revocar estos permisos en cualquier momento desde la configuración de tu navegador.
      </p>
    </div>
  </div>
);

// Utility functions
const detectQRType = (data: string): QRResult['type'] => {
  if (/^https?:\/\//i.test(data)) return 'url';
  if (/^mailto:/i.test(data) || /\S+@\S+\.\S+/.test(data)) return 'email';
  if (/^tel:/i.test(data)) return 'phone';
  if (/^WIFI:/i.test(data)) return 'wifi';
  if (/^BEGIN:VCARD/i.test(data)) return 'contact';
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

// Toast Component
const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-blue-500/90 text-white px-6 py-3 rounded-xl backdrop-blur-xl z-50">
      {message}
    </div>
  );
};

// Install Prompt Component
const InstallPrompt: React.FC<{ onInstall: () => void; onDismiss: () => void }> = ({ onInstall, onDismiss }) => (
  <div className="fixed bottom-5 left-5 right-5 bg-white/5 border border-blue-500/30 rounded-2xl p-5 backdrop-blur-2xl z-50">
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

// Result Screen Component
const ResultScreen: React.FC<{
  result: QRResult;
  onClose: () => void;
  onScanAgain: () => void;
  onCopy: () => void;
  onOpen: () => void;
  onShare: () => void;
  onSearch: () => void;
}> = ({ result, onClose, onScanAgain, onCopy, onOpen, onShare, onSearch }) => (
  <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 p-5 overflow-y-auto">
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
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // State
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<QRResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Check privacy notice on mount
  useEffect(() => {
    const hasSeenPrivacyNotice = localStorage.getItem('privacyNoticeAccepted');
    if (!hasSeenPrivacyNotice) {
      setShowPrivacyNotice(true);
    }
  }, []);

  // Install prompt handling
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

  // QR Detection function - SIMPLIFIED
  const detectQR = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== 4) return; // HAVE_ENOUGH_DATA

    try {
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Try to detect QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });

      if (code && code.data) {
        console.log('QR Code detected:', code.data);
        
        const qrResult: QRResult = {
          data: code.data,
          type: detectQRType(code.data)
        };
        
        setResult(qrResult);
        stopScanning();
        playSuccessSound();
      }
    } catch (error) {
      console.error('Error detecting QR:', error);
    }
  }, []);

  // Start scanning - SIMPLIFIED APPROACH
  const startScanning = useCallback(async () => {
    console.log('Starting camera...');
    
    try {
      setStatus('Solicitando acceso a la cámara...');
      setCameraPermissionGranted(null);

      // Simple constraints - prefer back camera
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      console.log('Requesting camera permission...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('Camera permission granted');
      setCameraPermissionGranted(true);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        const video = videoRef.current;
        
        await new Promise<void>((resolve, reject) => {
          const onLoadedMetadata = () => {
            console.log('Video metadata loaded');
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            resolve();
          };
          
          const onError = (error: Event) => {
            console.error('Video error:', error);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(new Error('Video loading failed'));
          };
          
          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);
        });

        // Start playing
        await video.play();
        console.log('Video playing');
        
        setIsScanning(true);
        setStatus('📷 Cámara activa. Apunta hacia un código QR');

        // Start scanning loop
        scanIntervalRef.current = window.setInterval(detectQR, 100);
      }

    } catch (error) {
      console.error('Camera error:', error);
      setCameraPermissionGranted(false);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setStatus('🚫 Permisos de cámara denegados');
        } else if (error.name === 'NotFoundError') {
          setStatus('📷 No se encontró cámara');
        } else {
          setStatus(`❌ Error: ${error.message}`);
        }
      }
      
      setIsScanning(false);
    }
  }, [detectQR]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    console.log('Stopping camera...');
    
    setIsScanning(false);
    setStatus('');
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle privacy notice
  const handlePrivacyAccept = useCallback(() => {
    localStorage.setItem('privacyNoticeAccepted', 'true');
    setShowPrivacyNotice(false);
  }, []);

  const handlePrivacyDecline = useCallback(() => {
    setShowPrivacyNotice(false);
    setToast('Para usar el escáner QR, necesitas aceptar los términos de privacidad.');
  }, []);

  // Handle start scanning
  const handleStartScanning = useCallback(async () => {
    const hasAcceptedPrivacy = localStorage.getItem('privacyNoticeAccepted');
    if (!hasAcceptedPrivacy) {
      setShowPrivacyNotice(true);
      return;
    }

    await startScanning();
  }, [startScanning]);

  // Result actions
  const copyResult = useCallback(async () => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(result.data);
      setToast('¡Copiado al portapapeles!');
    } catch (error) {
      setToast('No se pudo copiar');
    }
  }, [result]);

  const openResult = useCallback(() => {
    if (!result || result.type !== 'url') return;
    
    try {
      const url = new URL(result.data);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        window.open(result.data, '_blank', 'noopener,noreferrer');
      } else {
        setToast('URL no segura detectada');
      }
    } catch (error) {
      setToast('URL inválida');
    }
  }, [result]);

  const shareResult = useCallback(async () => {
    if (!result) return;
    
    const shareData = {
      title: 'Contenido de QR',
      text: result.data
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await copyResult();
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setToast('No se pudo compartir');
      }
    }
  }, [result, copyResult]);

  const searchResult = useCallback(() => {
    if (!result) return;
    
    const searchURL = `https://www.google.com/search?q=${encodeURIComponent(result.data)}`;
    window.open(searchURL, '_blank', 'noopener,noreferrer');
  }, [result]);

  const scanAgain = useCallback(() => {
    setResult(null);
    handleStartScanning();
  }, [handleStartScanning]);

  // Install app
  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Install prompt result:', outcome);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-5">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-light mb-2 text-blue-400">
            QR Scanner
          </h1>
          <p className="text-white/60 text-sm tracking-wide">
            Powered by ideasmagna
          </p>
        </div>

        {/* Scanner Area */}
        <div className="bg-gray-800 border border-gray-700 rounded-3xl mb-6 overflow-hidden">
          <div className="p-8">
            {!isScanning ? (
              <div className="text-center mb-8">
                <div className="w-32 h-32 mx-auto mb-6 bg-gray-700 rounded-3xl flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-white/60" />
                </div>
                
                {cameraPermissionGranted !== null && (
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                    cameraPermissionGranted 
                      ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                      : 'bg-red-500/20 border border-red-500/30 text-red-400'
                  }`}>
                    <Shield className="w-3 h-3" />
                    <span>{cameraPermissionGranted ? 'Permisos Concedidos' : 'Permisos Denegados'}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative mb-8">
                <div className="relative w-full max-w-2xl mx-auto h-96 rounded-2xl overflow-hidden bg-black border border-gray-600">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Scanner Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-2 border-blue-400 rounded-2xl relative">
                      {/* Animated Scanning Line */}
                      <div 
                        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                        style={{
                          animation: 'scanLine 2s ease-in-out infinite',
                          top: '0%'
                        }}
                      />
                      
                      {/* Corner Markers */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
                    </div>
                  </div>

                  {/* Detection Status */}
                  <div className="absolute top-4 left-4 bg-black/70 text-blue-400 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    📷 Escaneando...
                  </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {/* Status */}
            {status && (
              <div className="mb-6 p-4 rounded-2xl text-center font-medium border backdrop-blur-xl bg-blue-500/10 border-blue-500/30 text-blue-400">
                {status}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-gray-700 border-t border-gray-600 p-8">
            <div className="max-w-md mx-auto">
              {!isScanning ? (
                <button
                  onClick={handleStartScanning}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <ScanLine className="w-5 h-5" />
                  Escanear
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Square className="w-5 h-5" />
                  Detener
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      {showPrivacyNotice && (
        <PrivacyNotice 
          onAccept={handlePrivacyAccept} 
          onDecline={handlePrivacyDecline} 
        />
      )}

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
