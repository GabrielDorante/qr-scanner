return code.data;
                }
            } catch (error) {
                continue;
            }
        }
        
        return null;
    }

    // FILTROS AVANZADOS DE IMAGEN
    tryAdvancedFilters() {
        try {
            // Crear canvas temporal
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.canvas.width;
            tempCanvas.height = this.canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Aplicar filtros CSS avanzados
            tempCtx.filter = 'contrast(150%) brightness(110%) saturate(0%)';
            tempCtx.drawImage(this.video, 0, 0);
            
            const filteredImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            
            const code = jsQR(filteredImageData.data, filteredImageData.width, filteredImageData.height, {
                inversionAttempts: "attemptBoth",
                locateOptions: { tryHarder: true }
            });
            
            if (code) {
                console.log('✅ Detectado con filtros avanzados:', code.data);
                return code.data;
            }
        } catch (error) {
            // Continuar
        }
        
        return null;
    }

    enhanceImageContrast() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        // Aumentar contraste y convertir a escala de grises
        const contrast = 1.8;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        
        for (let i = 0; i < data.length; i += 4) {
            // Convertir a escala de grises primero
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            
            // Aplicar contraste
            const enhanced = Math.max(0, Math.min(255, factor * (gray - 128) + 128));
            
            data[i] = enhanced;     // Red
            data[i + 1] = enhanced; // Green
            data[i + 2] = enhanced; // Blue
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    handleQRResult(data) {
        this.currentResult = data;
        this.stopScanning();
        this.showResultScreen();
        this.playSuccessSound();
        this.trackEvent('qr_scanned', { 
            type: this.detectQRType(data),
            length: data.length,
            attempts: this.scanAttempts
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
