/**
 * Website Visitor Tracking
 * Tracks visitor information and sends it to the tracking endpoint
 */

// Tracking endpoint - change this to your server URL
const TRACKING_ENDPOINT = 'http://localhost:8080/track';

/**
 * Collect visitor information
 */
function collectVisitorData() {
    const data = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer || 'direct',
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookieEnabled: navigator.cookieEnabled,
        online: navigator.onLine,
        platform: navigator.platform,
        // Try to get IP via a service (optional)
        sessionId: getOrCreateSessionId()
    };
    
    return data;
}

/**
 * Get or create a session ID
 */
function getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem('visitor_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('visitor_session_id', sessionId);
    }
    return sessionId;
}

/**
 * Send tracking data to server
 */
async function sendTrackingData() {
    try {
        const data = collectVisitorData();
        
        // Send to tracking endpoint
        const response = await fetch(TRACKING_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            // Don't wait for response to avoid blocking
            keepalive: true
        });
        
        if (response.ok) {
            console.log('Tracking data sent successfully');
        }
    } catch (error) {
        // Silently fail - don't interrupt user experience
        console.debug('Tracking error (non-critical):', error);
    }
}

/**
 * Track page view on load
 */
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure page is fully loaded
    setTimeout(() => {
        sendTrackingData();
    }, 1000);
});

/**
 * Track when user leaves the page
 */
window.addEventListener('beforeunload', function() {
    // Send final tracking data
    const data = collectVisitorData();
    data.event = 'page_unload';
    
    // Use sendBeacon for reliable delivery on page unload
    if (navigator.sendBeacon) {
        navigator.sendBeacon(
            TRACKING_ENDPOINT,
            JSON.stringify(data)
        );
    }
});

