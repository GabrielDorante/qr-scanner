// Analytics configuration and utilities
class Analytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
        this.setupOnlineListener();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getUserId() {
        let userId = localStorage.getItem('qr_scanner_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('qr_scanner_user_id', userId);
        }
        return userId;
    }

    setupOnlineListener() {
        window.addEventListener('online', () => {
            this.syncPendingEvents();
        });
    }

    async syncPendingEvents() {
        try {
            const db = await this.openDB();
            const transaction = db.transaction(['analytics'], 'readonly');
            const store = transaction.objectStore('analytics');
            const events = await this.getAllEvents(store);

            for (const event of events) {
                await this.sendEvent(event);
            }

            // Clear sent events
            await this.clearEvents();
        } catch (error) {
            console.error('Error syncing analytics:', error);
        }
    }

    async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('QRScannerDB', 1);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllEvents(store) {
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async clearEvents() {
        const db = await this.openDB();
        const transaction = db.transaction(['analytics'], 'readwrite');
        const store = transaction.objectStore('analytics');
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async sendEvent(eventData) {
        const payload = {
            ...eventData,
            sessionId: this.sessionId,
            userId: this.userId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            screen: {
                width: screen.width,
                height: screen.height
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        // Here you would send to your chosen analytics service
        console.log('Sending analytics:', payload);

        // Example implementations for different services:

        // 1. Simple webhook to your own server
        // try {
        //     await fetch('https://your-analytics-endpoint.com/events', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify(payload)
        //     });
        // } catch (error) {
        //     console.error('Analytics send failed:', error);
        // }

        // 2. Google Analytics 4
        // if (window.gtag) {
        //     window.gtag('event', payload.event, {
        //         custom_parameter_1: payload.customData,
        //         session_id: payload.sessionId,
        //         user_id: payload.userId
        //     });
        // }

        // 3. Vercel Analytics
        // if (window.va) {
        //     window.va('track', payload.event, payload);
        // }
    }

    // Device and usage statistics
    getDeviceInfo() {
        return {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null
        };
    }

    // Track app installation
    trackInstallation() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.sendEvent({
                event: 'app_installed',
                deviceInfo: this.getDeviceInfo()
            });
        }
    }

    // Track performance metrics
    trackPerformance() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                this.sendEvent({
                    event: 'performance_metrics',
                    metrics: {
                        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
                        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
                    }
                });
            }
        }
    }
}

// Initialize analytics
const analytics = new Analytics();

// Track page load performance
window.addEventListener('load', () => {
    setTimeout(() => {
        analytics.trackPerformance();
        analytics.trackInstallation();
    }, 1000);
});

// Track visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        analytics.sendEvent({
            event: 'page_visible'
        });
    } else {
        analytics.sendEvent({
            event: 'page_hidden'
        });
    }
});

// Track errors
window.addEventListener('error', (event) => {
    analytics.sendEvent({
        event: 'javascript_error',
        error: {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        }
    });
});

// Export for use in other modules
window.Analytics = Analytics;