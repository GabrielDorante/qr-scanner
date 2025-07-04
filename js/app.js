// QR Scanner App - JavaScript Vanilla
console.log('🔒 QR Scanner Seguro iniciado');

// Global variables
let video = null;
let canvas = null;
let ctx = null;
let stream = null;
let scanInterval = null;
let scanAttempts = 0;
let currentQRResult = null;

// DOM Elements
const elements = {
    loading: document.getElementById('loading'),
    app: document.getElementById('app'),
    scanBtn: document.getElementById('scan-btn'),
    stopBtn: document.getElementById('stop-btn'),
    video: document.getElementById('video'),
    canvas: document.getElementById('canvas'),
    videoContainer: document.getElementById('video-container'),
    scannerDisplay: document.getElementById('scanner-display'),
    statusMessage: document.getElementById('status-message'),
    scanAttemptsSpan: document.getElementById('scan-attempts'),
    permissionStatus: document.getElementById('permission-status'),
    
    // Privacy Modal
    privacyModal: document.getElementById('privacy-modal'),
    acceptPrivacy: document.getElementById('accept-privacy'),
    declinePrivacy: document.getElementById('decline-privacy'),
    
    // Result Modal
    resultModal: document.getElementById('result-modal'),
    closeResult: document.getElementById('close-result'),
    qrContent: document.getElementById('qr-content'),
    copyResult: document.getElementById('copy-result'),
    openResult: document.getElementById('open-result'),
    shareResult: document.getElementById('share-result'),
    searchResult: document.getElementById('search-result'),
    scanAgain: document.getElementById('scan-again'),
    
    // Toast
    toast: document.getElementById('toast')
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Hide loading screen after a short delay
    setTimeout(() => {
        elements.loading.style.opacity = '0';
        setTimeout(() => {
            elements.loading.classList.add('hidden');
            elements.app.classList.remove('hidden');
            elements.app.classList.add('fade-in');
        }, 300);
    }, 1000);
    
    // Check privacy notice
    checkPrivacyNotice();
    
    // Initialize event listeners
    initEventListeners();
    
    // Initialize canvas
    canvas = elements.canvas;
    ctx = canvas.getContext('2d');
    video = elements.video;
    
    console.log('App initialized successfully');
});

// Check if user has accepted privacy notice
function checkPrivacyNotice() {
    const hasAccepted = localStorage.getItem('privacyNoticeAccepted');
    if (!hasAccepted) {
        showPrivacyNotice();
    }
}

// Show privacy notice
function showPrivacyNotice() {
    elements.privacyModal.classList.remove('hidden');
    elements.privacyModal.classList.add('fade-in');
}

// Hide privacy notice
function hidePrivacyNotice() {
    elements.privacyModal.classList.add('fade-out');
    setTimeout(() => {
        elements.privacyModal.classList.add('hidden');
        elements.privacyModal.classList.remove('fade-out');
    }, 300);
}

// Initialize event listeners
function initEventListeners() {
    // Scan button
    elements.scanBtn.addEventListener('click', handleStartScanning);
    
    // Stop button
    elements.stopBtn.addEventListener('click', stopScanning);
    
    // Privacy modal
    elements.acceptPrivacy.addEventListener('click', () => {
        localStorage.setItem('privacyNoticeAccepted', 'true');
        hidePrivacyNotice();
        showToast('Privacidad aceptada. Ahora puedes usar el escáner.');
    });
    
    elements.declinePrivacy.addEventListener('click', () => {
        hidePrivacyNotice();
        showToast('Para usar el escáner QR, necesitas aceptar los términos de privacidad.');
    });
    
    // Result modal
    elements.closeResult.addEventListener('click', hideResultModal);
    elements.copyResult.addEventListener('click', copyToClipboard);
    elements.openResult.addEventListener('click', openURL);
    elements.shareResult.addEventListener('click', shareResult);
    elements.searchResult.addEventListener('click', searchResult);
    elements.scanAgain.addEventListener('click', () => {
        hideResultModal();
        handleStartScanning();
    });
    
    console.log('Event listeners initialized');
}

// Handle start scanning
async function handleStartScanning() {
    const hasAccepted = localStorage.getItem('privacyNoticeAccepted');
    if (!hasAccepted) {
        showPrivacyNotice();
        return;
    }
    
    await startScanning();
}

// Start camera and scanning
async function startScanning() {
    console.log('Starting camera...');
    
    try {
        showStatus('Solicitando acceso a la cámara...', 'info');
        
        // Request camera access
        const constraints = {
            video: {
                facingMode: 'environment', // Force back camera
                width: { ideal: 1920, max: 1920, min: 320 },
                height: { ideal: 1080, max: 1080, min: 240 }
            }
        };
        
        console.log('Requesting camera permission...');
        
        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (error) {
            // Fallback: try with any camera if back camera fails
            console.log('Back camera failed, trying any camera...');
            const fallbackConstraints = {
                video: {
                    width: { ideal: 1280, min: 320 },
                    height: { ideal: 720, min: 240 }
                }
            };
            stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        }
        
        console.log('Camera permission granted');
        showPermissionStatus(true);
        
        // Set video source
        video.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve, reject) => {
            const onLoadedMetadata = () => {
                console.log('Video metadata loaded:', {
                    width: video.videoWidth,
                    height: video.videoHeight
                });
                video.removeEventListener('loadedmetadata', onLoadedMetadata);
                video.removeEventListener('error', onError);
                resolve();
            };
            
            const onError = (error) => {
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
        console.log('Video playing successfully');
        
        // Show video container and hide scanner display
        elements.scannerDisplay.classList.add('hidden');
        elements.videoContainer.classList.remove('hidden');
        elements.videoContainer.classList.add('fade-in');
        
        // Update buttons
        elements.scanBtn.classList.add('hidden');
        elements.stopBtn.classList.remove('hidden');
        
        // Reset scan attempts
        scanAttempts = 0;
        updateScanAttempts();
        
        // Show success status
        showStatus('📷 Cámara activa. Apunta hacia un código QR', 'success');
        
        // Start scanning loop
        startScanningLoop();
        
    } catch (error) {
        console.error('Camera error:', error);
        showPermissionStatus(false);
        
        let errorMessage = '❌ Error al acceder a la cámara';
        
        if (error.name === 'NotAllowedError') {
            errorMessage = '🚫 Permisos de cámara denegados. Por favor, permite el acceso a la cámara.';
        } else if (error.name === 'NotFoundError') {
            errorMessage = '📷 No se encontró ninguna cámara disponible.';
        } else if (error.name === 'NotSupportedError') {
            errorMessage = '🔒 Tu navegador no soporta acceso a la cámara.';
        }
        
        showStatus(errorMessage, 'error');
    }
}

// Start scanning loop
function startScanningLoop() {
    console.log('Starting scan loop...');
    
    scanInterval = setInterval(() => {
        if (!video || video.readyState !== 4) return; // HAVE_ENOUGH_DATA
        
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
                handleQRDetected(code.data);
                return;
            }
            
            // Update scan attempts
            scanAttempts++;
            updateScanAttempts();
            
        } catch (error) {
            console.error('Error in scan loop:', error);
        }
    }, 100); // Scan every 100ms
}

// Handle QR code detection
function handleQRDetected(data) {
    console.log('QR detected:', data);
    
    // Stop scanning
    stopScanning();
    
    // Play success sound
    playSuccessSound();
    
    // Determine QR type
    const type = detectQRType(data);
    
    // Store result
    currentQRResult = { data, type };
    
    // Show result modal
    showResultModal(currentQRResult);
}

// Detect QR type
function detectQRType(data) {
    if (/^https?:\/\//i.test(data)) return 'url';
    if (/^mailto:/i.test(data) || /\S+@\S+\.\S+/.test(data)) return 'email';
    if (/^tel:/i.test(data)) return 'phone';
    if (/^WIFI:/i.test(data)) return 'wifi';
    if (/^BEGIN:VCARD/i.test(data)) return 'contact';
    return 'text';
}

// Stop scanning
function stopScanning() {
    console.log('Stopping camera...');
    
    // Clear scan interval
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    
    // Stop camera stream
    if (stream) {
        stream.getTracks().forEach(track => {
            track.stop();
            console.log('Camera track stopped');
        });
        stream = null;
    }
    
    // Reset video
    if (video) {
        video.srcObject = null;
    }
    
    // Update UI
    elements.videoContainer.classList.add('hidden');
    elements.scannerDisplay.classList.remove('hidden');
    elements.stopBtn.classList.add('hidden');
    elements.scanBtn.classList.remove('hidden');
    
    // Hide status
    hideStatus();
    
    // Reset scan attempts
    scanAttempts = 0;
}

// Show permission status
function showPermissionStatus(granted) {
    const statusEl = elements.permissionStatus;
    statusEl.classList.remove('hidden');
    
    if (granted) {
        statusEl.innerHTML = `
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-green-500/20 border border-green-500/30 text-green-400">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <span>Permisos Concedidos</span>
            </div>
        `;
    } else {
        statusEl.innerHTML = `
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-red-500/20 border border-red-500/30 text-red-400">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <span>Permisos Denegados</span>
            </div>
        `;
    }
}

// Show status message
function showStatus(message, type = 'info') {
    const statusEl = elements.statusMessage;
    statusEl.classList.remove('hidden');
    
    const colors = {
        info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        success: 'bg-green-500/10 border-green-500/30 text-green-400',
        error: 'bg-red-500/10 border-red-500/30 text-red-400',
        warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
    };
    
    statusEl.className = `mb-6 p-4 rounded-2xl text-center font-medium border backdrop-blur-xl ${colors[type] || colors.info}`;
    statusEl.textContent = message;
}

// Hide status message
function hideStatus() {
    elements.statusMessage.classList.add('hidden');
}

// Update scan attempts counter
function updateScanAttempts() {
    if (elements.scanAttemptsSpan) {
        elements.scanAttemptsSpan.textContent = scanAttempts;
    }
}

// Show result modal
function showResultModal(result) {
    elements.qrContent.textContent = result.data;
    
    // Show/hide open button for URLs
    if (result.type === 'url') {
        elements.openResult.classList.remove('hidden');
    } else {
        elements.openResult.classList.add('hidden');
    }
    
    elements.resultModal.classList.remove('hidden');
    elements.resultModal.classList.add('fade-in');
}

// Hide result modal
function hideResultModal() {
    elements.resultModal.classList.add('fade-out');
    setTimeout(() => {
        elements.resultModal.classList.add('hidden');
        elements.resultModal.classList.remove('fade-out');
    }, 300);
}

// Copy to clipboard
async function copyToClipboard() {
    if (!currentQRResult) return;
    
    try {
        await navigator.clipboard.writeText(currentQRResult.data);
        showToast('¡Copiado al portapapeles!');
    } catch (error) {
        console.error('Copy error:', error);
        showToast('No se pudo copiar');
    }
}

// Open URL
function openURL() {
    if (!currentQRResult || currentQRResult.type !== 'url') return;
    
    try {
        const url = new URL(currentQRResult.data);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
            window.open(currentQRResult.data, '_blank', 'noopener,noreferrer');
        } else {
            showToast('URL no segura detectada');
        }
    } catch (error) {
        showToast('URL inválida');
    }
}

// Share result
async function shareResult() {
    if (!currentQRResult) return;
    
    const shareData = {
        title: 'Contenido de QR',
        text: currentQRResult.data
    };
    
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await copyToClipboard();
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            showToast('No se pudo compartir');
        }
    }
}

// Search result
function searchResult() {
    if (!currentQRResult) return;
    
    const searchURL = `https://www.google.com/search?q=${encodeURIComponent(currentQRResult.data)}`;
    window.open(searchURL, '_blank', 'noopener,noreferrer');
}

// Show toast notification
function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.remove('hidden');
    elements.toast.classList.add('fade-in');
    
    setTimeout(() => {
        elements.toast.classList.add('fade-out');
        setTimeout(() => {
            elements.toast.classList.add('hidden');
            elements.toast.classList.remove('fade-out', 'fade-in');
        }, 300);
    }, 3000);
}

// Play success sound
function playSuccessSound() {
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
        // Silently fail
        console.log('Audio not supported');
    }
}

// Security: Disable right-click in production
if (window.location.hostname !== 'localhost') {
    document.addEventListener('contextmenu', e => e.preventDefault());
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'C') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J') ||
            (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
        }
    });
}

// Log security status
console.log('🛡️ Conexión:', window.location.protocol === 'https:' ? 'Segura (HTTPS)' : 'Local');
console.log('📱 Procesamiento: Local (sin envío de datos)');
console.log('🔒 QR Scanner Seguro listo para usar');
