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
      // Use the outcome variable to avoid TypeScript error
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
  onCopy: () => v
};
