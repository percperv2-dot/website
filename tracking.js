/**
 * Website Visitor Tracking
 * Tracks visitor information and sends it to the tracking endpoint
 */

// Tracking endpoint - automatically detects the correct URL
function getTrackingEndpoint() {
    // If running on localhost, use localhost:8080
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8080/track';
    }
    // Otherwise, use the same domain with port 8080
    // Change this if your tracking server is on a different domain/port
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8080/track`;
}

const TRACKING_ENDPOINT = getTrackingEndpoint();

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
        const endpoint = getTrackingEndpoint();
        
        console.log('Sending tracking data to:', endpoint);
        console.log('Data:', data);
        
        // Send to tracking endpoint
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            // Don't wait for response to avoid blocking
            keepalive: true
        });
        
        if (response.ok) {
            console.log('✓ Tracking data sent successfully');
        } else {
            console.warn('✗ Tracking failed:', response.status, response.statusText);
        }
    } catch (error) {
        // Log error for debugging
        console.error('✗ Tracking error:', error.message);
        console.error('Endpoint was:', getTrackingEndpoint());
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
        const endpoint = getTrackingEndpoint();
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        navigator.sendBeacon(endpoint, blob);
    }
});

