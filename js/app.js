class QRScanner {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stream = null;
        this.animationId = null;
        this.cameras = [];
        this.currentCameraIndex = 0;
        this.isScanning = false;
        this.currentResult = '';
        this.deferredPrompt = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.startCodeAnimation();
        this.registerServiceWorker();
        this.trackPageView();
        this.setupInstallPrompt();
    }

    initializeElements() {
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.switchBtn = document.getElementById('switchBtn');
        this.status = document.getElementById('status');
        this.videoContainer = document.getElementById('videoContainer');
        this.scannerIconBlock = document.getElementById('scannerIconBlock');
        this.resultScreen = document.getElementById('resultScreen');
        this.resultText = document.getElementById('resultText');
        this.copyBtn = document.getElementById('copyBtn');
        this.openBtn = document.getElementById('openBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.searchBtn = document.getElementById('searchBtn');
        this.closeResult = document.getElementById('closeResult');
        this.scanAgainBtn = document.getElementById('scanAgainBtn');
        this.updateModal = document.getElementById('updateModal');
        this.updateBtn = document.getElementById('updateBtn');
        this.installPrompt = document.getElementById('installPrompt');
        this.installBtn = document.getElementById('installBtn');
        this.dismissBtn = document.getElementById('dismissBtn');
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startScanning());
        this.stopBtn.addEventListener('click', () => this.stopScanning());
        this.switchBtn.addEventListener('click', () => this.switchCamera());
        this.copyBtn.addEventListener('click', () => this.copyResult());
        this.openBtn.addEventListener('click', () => this.openResult());
        this.shareBtn.addEventListener('click', () => this.shareResult());
        this.searchBtn.addEventListener('click', () => this.searchResult());
        this.closeResult.addEventListener('click', () => this.closeResultScreen());
        this.scanAgainBtn.addEventListener('click', () => this.scanAgain());
        this.updateBtn.addEventListener('click', () => this.closeUpdateModal());
        this.installBtn.addEventListener('click', () => this.installApp());
        this.dismissBtn.addEventListener('click', () => this.dismissInstallPrompt());

        // Service Worker messages
        navigator.serviceWorker?.addEventListener('message', event => {
            if (event.data.type === 'SW_UPDATED') {
                this.showUpdateModal();
            }
        });
    }

    setupInstallPrompt() {
        // Handle PWA install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            
            // Show install prompt after 3 seconds if not already dismissed
            setTimeout(() => {
                if (!localStorage.getItem('installPromptDismissed')) {
                    this.showInstallPrompt();
                }
            }, 3000);
        });

        // Check if already installed
        window.addEventListener('appinstalled', () => {
            this.hideInstallPrompt();
            this.trackEvent('app_installed');
        });

        // Check if running as PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.hideInstallPrompt();
        }
    }

    showInstallPrompt() {
        if (this.installPrompt) {
            this.installPrompt.classList.add('show');
        }
    }

    hideInstallPrompt() {
        if (this.installPrompt) {
            this.installPrompt.classList.remove('show');
        }
    }

    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                this.trackEvent('install_accepted');
            } else {
                this.trackEvent('install_declined');
            }
            
            this.deferredPrompt = null;
            this.hideInstallPrompt();
        }
    }

    dismissInstallPrompt() {
        this.hideInstallPrompt();
        localStorage.setItem('installPromptDismissed', 'true');
        this.trackEvent('install_dismissed');
    }

    async registerServiceWorker() {
        // Check if Service Workers are supported and if we're not in StackBlitz
        if (!('serviceWorker' in navigator)) {
            console.log('Service Workers are not supported in this browser');
            return;
        }

        // Detect StackBlitz environment
        const isStackBlitz = window.location.hostname.includes('stackblitz') || 
                           window.location.hostname.includes('webcontainer') ||
                           window.location.port === '5173';

        if (isStackBlitz) {
            console.log('Service Workers are not supported in StackBlitz environment');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version available
                        this.showUpdateModal();
                    }
                });
            });
        } catch (error) {
            console.log('Service Worker registration skipped:', error.message);
            // Don't throw the error, just log it silently
        }
    }

    showUpdateModal() {
        this.updateModal.classList.add('show');
    }

    closeUpdateModal() {
        this.updateModal.classList.remove('show');
        // Reload to activate new service worker
        window.location.reload();
    }

    startCodeAnimation() {
        const codeFragments = [
            'const code = jsQR(imageData.data);',
            'video.srcObject = stream;',
            'navigator.mediaDevices.getUserMedia',
            'canvas.getContext("2d")',
            'requestAnimationFrame(scan);',
            'background: linear-gradient(135deg, #3b82f6, #8b5cf6);',
            'transform: translateY(-8px);',
            'backdrop-filter: blur(20px);',
            'animation: fadeInUp 0.8s ease-out;',
            'border-radius: 24px;',
            'font-family: "Inter", sans-serif;',
            'position: relative;',
            'overflow: hidden;',
            'z-index: 1;'
        ];

        const createFragment = () => {
            if (document.hidden) return;

            const fragment = document.createElement('div');
            fragment.className = 'code-fragment';
            fragment.textContent = codeFragments[Math.floor(Math.random() * codeFragments.length)];
            fragment.style.left = Math.random() * 85 + 5 + '%';
            fragment.style.top = Math.random() * 85 + 5 + '%';
            document.body.appendChild(fragment);

            setTimeout(() => {
                if (fragment.parentNode) {
                    fragment.remove();
                }
            }, 8000);
        };

        setInterval(createFragment, 3000);
    }

    async getCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.cameras = devices.filter(device => device.kind === 'videoinput');
            
            if (this.cameras.length > 1) {
                this.switchBtn.disabled = false;
                // Agregar clase activa al botón switch cuando hay múltiples cámaras
                this.switchBtn.classList.add('switch-active');
            }
        } catch (error) {
            console.error('Error al obtener las cámaras:', error);
        }
    }

    async startScanning() {
        try {
            this.updateStatus('info', 'Iniciando cámara...');
            
            await this.getCameras();
            
            // PRIORIZAR CÁMARA TRASERA (environment) por defecto
            const constraints = {
                video: {
                    facingMode: { ideal: 'environment' }, // Cámara trasera preferida
                    width: { ideal: 1920, min: 1280 }, // Resolución más alta para mejor detección
                    height: { ideal: 1080, min: 720 },
                    focusMode: { ideal: 'continuous' }, // Enfoque continuo
                    exposureMode: { ideal: 'continuous' } // Exposición continua
                }
            };

            // Si hay cámaras específicas disponibles, usar la trasera si existe
            if (this.cameras.length > 0) {
                // Buscar cámara trasera primero
                const backCamera = this.cameras.find(camera => 
                    camera.label.toLowerCase().includes('back') || 
                    camera.label.toLowerCase().includes('rear') ||
                    camera.label.toLowerCase().includes('environment')
                );
                
                if (backCamera) {
                    constraints.video.deviceId = { exact: backCamera.deviceId };
                    this.currentCameraIndex = this.cameras.indexOf(backCamera);
                } else {
                    // Si no hay cámara trasera identificable, usar la primera
                    constraints.video.deviceId = { exact: this.cameras[this.currentCameraIndex].deviceId };
                }
            }

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            
            this.video.onloadedmetadata = () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                
                // Hide icon block and show video
                this.scannerIconBlock.style.display = 'none';
                this.videoContainer.classList.add('active');
                
                // Actualizar estados de botones con colores
                this.startBtn.disabled = true;
                this.stopBtn.disabled = false;
                this.stopBtn.classList.add('stop-active'); // Rojo cuando activo
                
                if (this.cameras.length > 1) {
                    this.switchBtn.disabled = false;
                    this.switchBtn.classList.add('switch-active'); // Verde cuando activo
                }
                
                this.isScanning = true;
                this.updateStatus('success', '¡Cámara activa! Apunta hacia un código QR');
                this.scanQR();
                this.trackEvent('scan_started');
            };
        } catch (error) {
            console.error('Error al acceder a la cámara:', error);
            this.updateStatus('error', 'No se pudo acceder a la cámara. Verifica los permisos.');
            this.trackEvent('scan_error', { error: error.message });
        }
    }

    stopScanning() {
        this.isScanning = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        this.video.srcObject = null;
        
        // Show icon block and hide video
        this.videoContainer.classList.remove('active');
        this.scannerIconBlock.style.display = 'block';
        
        // Resetear estados de botones
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.stopBtn.classList.remove('stop-active'); // Quitar color rojo
        this.switchBtn.disabled = true;
        this.switchBtn.classList.remove('switch-active'); // Quitar color verde
        
        this.updateStatus('info', '');
        this.status.style.display = 'none';
        this.trackEvent('scan_stopped');
    }

    async switchCamera() {
        if (this.cameras.length <= 1) return;
        
        this.currentCameraIndex = (this.currentCameraIndex + 1) % this.cameras.length;
        
        if (this.isScanning) {
            this.stopScanning();
            setTimeout(() => this.startScanning(), 500);
        }
        this.trackEvent('camera_switched');
    }

    scanQR() {
        if (!this.isScanning) return;
        
        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            
            // Configuración más sensible para mejor detección
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert", // Mejor rendimiento
            });
            
            if (code) {
                this.handleQRResult(code.data);
                return;
            }
        }
        
        this.animationId = requestAnimationFrame(() => this.scanQR());
    }

    handleQRResult(data) {
        this.currentResult = data;
        this.stopScanning();
        this.showResultScreen();
        this.playSuccessSound();
        this.trackEvent('qr_scanned', { 
            type: this.detectQRType(data),
            length: data.length 
        });
    }

    detectQRType(data) {
        if (data.startsWith('http://') || data.startsWith('https://')) return 'url';
        if (data.startsWith('mailto:')) return 'email';
        if (data.startsWith('tel:')) return 'phone';
        if (data.startsWith('WIFI:')) return 'wifi';
        if (data.includes('@') && data.includes('.')) return 'email';
        return 'text';
    }

    showResultScreen() {
        this.resultText.textContent = this.currentResult;
        this.resultScreen.classList.add('active');
        
        // Show/hide open button based on content type
        const isURL = this.currentResult.startsWith('http://') || this.currentResult.startsWith('https://');
        this.openBtn.style.display = isURL ? 'flex' : 'none';
    }

    closeResultScreen() {
        this.resultScreen.classList.remove('active');
    }

    scanAgain() {
        this.closeResultScreen();
        this.startScanning();
    }

    async copyResult() {
        try {
            await navigator.clipboard.writeText(this.currentResult);
            this.showToast('¡Copiado al portapapeles!');
            this.trackEvent('result_copied');
        } catch (error) {
            console.error('Error al copiar:', error);
            this.showToast('No se pudo copiar');
        }
    }

    openResult() {
        if (this.currentResult.startsWith('http://') || this.currentResult.startsWith('https://')) {
            window.open(this.currentResult, '_blank', 'noopener,noreferrer');
            this.trackEvent('result_opened');
        }
    }

    async shareResult() {
        const shareData = {
            title: 'Contenido de QR',
            text: this.currentResult
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                this.trackEvent('result_shared');
            } else {
                // Fallback: copy to clipboard
                await this.copyResult();
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error al compartir:', error);
                this.showToast('No se pudo compartir');
            }
        }
    }

    searchResult() {
        const searchURL = `https://www.google.com/search?q=${encodeURIComponent(this.currentResult)}`;
        window.open(searchURL, '_blank', 'noopener,noreferrer');
        this.trackEvent('result_searched');
    }

    updateStatus(type, message) {
        this.status.className = `status ${type}`;
        this.status.textContent = message;
        this.status.style.display = message ? 'block' : 'none';
    }

    showToast(message) {
        // Create toast element if it doesn't exist
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(59, 130, 246, 0.9);
                color: white;
                padding: 12px 24px;
                border-radius: 12px;
                z-index: 10000;
                opacity: 0;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                font-weight: 400;
            `;
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.bottom = '40px';

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.bottom = '20px';
        }, 3000);
    }

    playSuccessSound() {
        // Create a subtle success sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
            // Silently fail if audio context is not available
        }
    }

    // Analytics methods
    trackPageView() {
        this.trackEvent('page_view');
    }

    trackEvent(eventName, properties = {}) {
        const eventData = {
            event: eventName,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...properties
        };

        // Store in IndexedDB for offline support
        this.storeAnalyticsEvent(eventData);

        // Send immediately if online
        if (navigator.onLine) {
            this.sendAnalyticsEvent(eventData);
        }
    }

    async storeAnalyticsEvent(eventData) {
        try {
            const db = await this.openAnalyticsDB();
            const transaction = db.transaction(['analytics'], 'readwrite');
            const store = transaction.objectStore('analytics');
            await store.add(eventData);
        } catch (error) {
            console.error('Error storing analytics event:', error);
        }
    }

    async openAnalyticsDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('QRScannerDB', 1);
            
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains('analytics')) {
                    const store = db.createObjectStore('analytics', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async sendAnalyticsEvent(eventData) {
        // This is where you would send to your chosen analytics service
        // For now, we'll just log it
        console.log('Analytics Event:', eventData);
        
        // Example for different analytics services:
        
        // Vercel Analytics (if you choose this option)
        // if (window.va) {
        //     window.va('track', eventData.event, eventData);
        // }
        
        // Google Analytics 4 (if you choose this option)
        // if (window.gtag) {
        //     window.gtag('event', eventData.event, eventData);
        // }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QRScanner();
});

// Auto-start scanner if URL contains action=scan
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('action') === 'scan') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            document.getElementById('startBtn').click();
        }, 1000);
    });
}
