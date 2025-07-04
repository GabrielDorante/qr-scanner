import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Square, RotateCcw, Copy, ExternalLink, Share2, Search, X, Download, QrCode, Shield, Lock, ScanLine } from 'lucide-react';
import jsQR from 'jsqr';

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

// Floating Code Fragments Component
const FloatingCodeFragments: React.FC = () => {
  const codeFragments = [
    'const scanner = useQRScanner();',
    'if (code) return code.data;',
    'video.readyState === HAVE_ENOUGH_DATA',
    'ctx.drawImage(video, 0, 0);',
    'navigator.mediaDevices.getUserMedia',
    'jsQR(imageData.data, width, height)',
    'setIsScanning(true);',
    'trackEvent("qr_scanned");'
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-5">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute text-gray-600/20 font-mono text-xs animate-pulse"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        >
          {codeFragments[Math.floor(Math.random() * codeFragments.length)]}
        </div>
      ))}
    </div>
  );
};

// Animated Particles Component
const AnimatedParticles: React.FC = () => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    opacity: number;
  }>>([]);

  useEffect(() => {
    const initialParticles = [...Array(25)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.1
    }));
    setParticles(initialParticles);

    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.vx + 100) % 100,
        y: (particle.y + particle.vy + 100) % 100,
        opacity: 0.1 + Math.sin(Date.now() * 0.001 + particle.id) * 0.2
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-5">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-blue-400 rounded-full transition-all duration-75"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity
          }}
        />
      ))}
    </div>
  );
};

// Corner Lights Component
const CornerLights: React.FC = () => {
  return (
    <>
      {/* Yellow light - top left */}
      <div className="fixed top-0 left-0 w-32 h-32 pointer-events-none z-5">
        <div className="w-full h-full bg-gradient-radial from-yellow-400/20 via-yellow-400/5 to-transparent rounded-full animate-pulse" 
             style={{ animationDuration: '3s' }} />
      </div>
      
      {/* Violet-blue light - bottom right */}
      <div className="fixed bottom-0 right-0 w-32 h-32 pointer-events-none z-5">
        <div className="w-full h-full bg-gradient-radial from-violet-500/20 via-violet-500/5 to-transparent rounded-full animate-pulse" 
             style={{ animationDuration: '4s', animationDelay: '1s' }} />
      </div>
    </>
  );
};

// QR Scanner Hook with Enhanced Security
const useQRScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [status, setStatus] = useState<{ type: 'info' | 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [qrDetected, setQrDetected] = useState<string | null>(null);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null);

  // Enhanced QR detection with security validation
  const detectQR = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });
      
      if (code && code.data) {
        // Basic security validation for QR content
        const data = code.data.trim();
        
        // Check for potentially malicious content
        if (data.length > 2048) {
          console.warn('QR code data too long, potentially malicious');
          return null;
        }
        
        // Log detection for security audit
        console.log('QR Code detected securely:', {
          length: data.length,
          type: detectQRType(data),
          timestamp: new Date().toISOString()
        });
        
        return data;
      }

      // Enhanced contrast detection (every 3rd attempt)
      if (scanAttempts % 3 === 0) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d')!;
        
        tempCtx.filter = 'contrast(150%) brightness(110%) saturate(0%)';
        tempCtx.drawImage(canvas, 0, 0);
        
        const enhancedImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const enhancedCode = jsQR(enhancedImageData.data, enhancedImageData.width, enhancedImageData.height, {
          inversionAttempts: "attemptBoth",
        });
        
        if (enhancedCode && enhancedCode.data) {
          const data = enhancedCode.data.trim();
          if (data.length <= 2048) {
            console.log('QR Code detected (enhanced):', {
              length: data.length,
              type: detectQRType(data),
              timestamp: new Date().toISOString()
            });
            return data;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error in QR detection:', error);
      return null;
    }
  }, [scanAttempts]);

  // Start scanning with proper permission handling
  const startScanning = useCallback(async () => {
    try {
      setStatus({ type: 'info', message: 'Solicitando acceso a la cámara...' });
      
      // Clear any previous state
      setCameraPermissionGranted(null);
      
      // Request camera permission with proper constraints
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Prefer back camera
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        }
      };

      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Permission granted successfully
      setCameraPermissionGranted(true);
      streamRef.current = stream;
      
      // Get available cameras after permission is granted
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
      
      console.log('Available cameras:', videoDevices.length);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not available'));
            return;
          }
          
          const video = videoRef.current;
          
          const onLoadedMetadata = () => {
            console.log('Video metadata loaded:', {
              width: video.videoWidth,
              height: video.videoHeight,
              readyState: video.readyState
            });
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            resolve();
          };
          
          const onError = (error: Event) => {
            console.error('Video error:', error);
            video.removeEventListener('error', onError);
            reject(new Error('Video loading failed'));
          };
          
          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);
          
          // Fallback timeout
          setTimeout(() => {
            if (video.readyState >= 2) { // HAVE_CURRENT_DATA
              video.removeEventListener('loadedmetadata', onLoadedMetadata);
              video.removeEventListener('error', onError);
              resolve();
            }
          }, 3000);
        });
        
        // Start playing
        await videoRef.current.play();
      }

      setIsScanning(true);
      setScanAttempts(0);
      setStatus({ type: 'success', message: '📷 Cámara activa. Apunta hacia un código QR' });

      // Start scanning loop
      scanIntervalRef.current = window.setInterval(() => {
        if (!videoRef.current || !canvasRef.current || !isScanning) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx || video.readyState < 2) return; // HAVE_CURRENT_DATA

        try {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);

          const result = detectQR(canvas, ctx);
          if (result && !qrDetected) {
            setQrDetected(result);
          }

          setScanAttempts(prev => prev + 1);
        } catch (error) {
          console.error('Error in scan loop:', error);
        }
      }, 100);

    } catch (error) {
      console.error('Error starting camera:', error);
      setCameraPermissionGranted(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        setStatus({ type: 'error', message: '🚫 Permisos de cámara denegados. Por favor, permite el acceso a la cámara en tu navegador.' });
      } else if (errorMessage.includes('NotFoundError') || errorMessage.includes('DevicesNotFoundError')) {
        setStatus({ type: 'error', message: '📷 No se encontró ninguna cámara disponible en tu dispositivo.' });
      } else if (errorMessage.includes('NotSupportedError')) {
        setStatus({ type: 'error', message: '🔒 Tu navegador no soporta acceso a la cámara. Intenta con Chrome o Firefox.' });
      } else {
        setStatus({ type: 'error', message: `❌ Error al acceder a la cámara: ${errorMessage}` });
      }
      
      setIsScanning(false);
    }
  }, [detectQR, isScanning, qrDetected]);

  // Stop scanning with secure cleanup
  const stopScanning = useCallback(() => {
    console.log('Stopping scanner...');
    
    setIsScanning(false);
    setQrDetected(null);
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped:', track.label);
      });
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return {
    videoRef,
    canvasRef,
    isScanning,
    cameras,
    status,
    scanAttempts,
    qrDetected,
    cameraPermissionGranted,
    startScanning,
    stopScanning,
    switchCamera
  };
};

// Analytics Hook with Privacy Protection
const useAnalytics = () => {
  const trackEvent = useCallback((eventName: string, properties: Record<string, any> = {}) => {
    // Only track essential events, no personal data
    const eventData: AnalyticsEvent = {
      event: eventName,
      timestamp: new Date().toISOString(),
      userAgent: 'anonymized', // Anonymize user agent
      url: 'anonymized', // Anonymize URL
      ...properties
    };

    // Store locally only, no external tracking
    const events = JSON.parse(localStorage.getItem('qr_analytics') || '[]');
    events.push(eventData);
    localStorage.setItem('qr_analytics', JSON.stringify(events.slice(-50))); // Keep only last 50 events

    console.log('Privacy-Safe Analytics Event:', eventData);
  }, []);

  const clearAnalytics = useCallback(() => {
    localStorage.removeItem('qr_analytics');
    console.log('Analytics data cleared');
  }, []);

  return { trackEvent, clearAnalytics };
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
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
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

// Animated Text Component
const AnimatedText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, Math.random() * 100 + 50);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text]);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <span className={className}>
      {displayText}
      {currentIndex < text.length && (
        <span className="animate-pulse text-blue-400">|</span>
      )}
    </span>
  );
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
      <AnimatedText text={status.message} />
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
          <AnimatedText text={result.data} />
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
  const { trackEvent, clearAnalytics } = useAnalytics();
  const { showInstallPrompt, installApp, dismissPrompt } = useInstallPrompt();
  const {
    videoRef,
    canvasRef,
    isScanning,
    cameras,
    status,
    scanAttempts,
    qrDetected,
    cameraPermissionGranted,
    startScanning,
    stopScanning,
    switchCamera
  } = useQRScanner();

  const [result, setResult] = useState<QRResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  // Check if user has seen privacy notice
  useEffect(() => {
    const hasSeenPrivacyNotice = localStorage.getItem('privacyNoticeAccepted');
    if (!hasSeenPrivacyNotice) {
      setShowPrivacyNotice(true);
    }
  }, []);

  // Handle privacy notice
  const handlePrivacyAccept = useCallback(() => {
    localStorage.setItem('privacyNoticeAccepted', 'true');
    setShowPrivacyNotice(false);
    trackEvent('privacy_notice_accepted');
  }, [trackEvent]);

  const handlePrivacyDecline = useCallback(() => {
    setShowPrivacyNotice(false);
    setToast('Para usar el escáner QR, necesitas aceptar los términos de privacidad.');
  }, []);

  // Handle QR detection
  useEffect(() => {
    if (qrDetected && !result) {
      const qrResult: QRResult = {
        data: qrDetected,
        type: detectQRType(qrDetected)
      };
      
      setResult(qrResult);
      stopScanning();
      playSuccessSound();
      trackEvent('qr_scanned', {
        type: qrResult.type,
        length: qrDetected.length,
        attempts: scanAttempts
      });
    }
  }, [qrDetected, result, stopScanning, trackEvent, scanAttempts]);

  const handleStartScanning = useCallback(async () => {
    const hasAcceptedPrivacy = localStorage.getItem('privacyNoticeAccepted');
    if (!hasAcceptedPrivacy) {
      setShowPrivacyNotice(true);
      return;
    }

    try {
      await startScanning();
      trackEvent('scan_started');
    } catch (error) {
      trackEvent('scan_error', { 
        error: (error as Error).message
      });
    }
  }, [startScanning, trackEvent]);

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
    
    // Security check for URLs
    try {
      const url = new URL(result.data);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        window.open(result.data, '_blank', 'noopener,noreferrer');
        trackEvent('result_opened', { secure: url.protocol === 'https:' });
      } else {
        setToast('URL no segura detectada');
      }
    } catch (error) {
      setToast('URL inválida');
    }
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
    console.log('QR Scanner loaded');
  }, [trackEvent]);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        {/* Enhanced Grid */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '15px 15px'
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20" />
      </div>

      {/* Animated Particles */}
      <AnimatedParticles />
      
      {/* Floating Code Fragments */}
      <FloatingCodeFragments />
      
      {/* Corner Lights */}
      <CornerLights />

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto p-5">
        {/* Header */}
        <div className="text-center mb-10 animate-in fade-in-0 slide-in-from-top-4">
          <h1 className="text-4xl md:text-5xl font-light mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            <AnimatedText text="QR Scanner" />
          </h1>
          <p className="text-white/60 text-sm tracking-wide">
            <AnimatedText text="Powered by ideasmagna" />
          </p>
        </div>

        {/* Scanner Area */}
        <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl mb-6 animate-in fade-in-0 slide-in-from-bottom-4 overflow-hidden">
          {/* Scanner Display */}
          <div className="p-8">
            {!isScanning ? (
              <div className="text-center mb-8">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-600/20 to-gray-800/20 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/10">
                  <QrCode className="w-16 h-16 text-white/60" />
                </div>
                
                {/* Permission Status */}
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
                <div className="relative w-full max-w-2xl mx-auto h-96 rounded-2xl overflow-hidden bg-black border border-white/20">
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
                    📷 Escaneando... ({scanAttempts})
                  </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {/* Status */}
            {status && (
              <div className="mb-6">
                <StatusMessage status={status} />
              </div>
            )}
          </div>

          {/* Controls Section with Diagonal Pattern */}
          <div 
            className="relative bg-gray-800/20 border-t border-white/10"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 4px,
                rgba(255, 255, 255, 0.02) 4px,
                rgba(255, 255, 255, 0.02) 6px
              )`
            }}
          >
            <div className="p-8">
              <div className="max-w-md mx-auto space-y-4">
                {/* Main Scan Button */}
                {!isScanning ? (
                  <button
                    onClick={handleStartScanning}
                    className="w-full py-4 bg-gradient-to-r from-gray-600/30 to-gray-700/30 backdrop-blur-xl border border-white/20 text-white rounded-2xl font-medium hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                  >
                    <ScanLine className="w-5 h-5 inline mr-2" />
                    Escanear
                  </button>
                ) : (
                  <button
                    onClick={handleStopScanning}
                    className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-medium hover:scale-105 transition-transform shadow-lg"
                  >
                    <Square className="w-5 h-5 inline mr-2" />
                    Detener
                  </button>
                )}
                
                {/* Separator */}
                <div className="flex items-center py-2">
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>
                
                {/* Secondary Controls */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleStopScanning}
                    disabled={!isScanning}
                    className={`py-3 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      isScanning 
                        ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30' 
                        : 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    <Square className="w-4 h-4" />
                    <span className="text-sm">Stop</span>
                  </button>
                  
                  <button
                    onClick={handleSwitchCamera}
                    disabled={!isScanning || cameras.length <= 1}
                    className={`py-3 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      isScanning && cameras.length > 1
                        ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30' 
                        : 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Privacy Controls */}
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={clearAnalytics}
                    className="w-full py-2 text-xs text-white/60 hover:text-white/80 transition-colors"
                  >
                    🗑️ Limpiar datos analíticos
                  </button>
                </div>
              </div>
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
