// Cookie Consent Management
// GDPR/CCPA Compliant Cookie Management System

const COOKIE_CONSENT_KEY = 'cookie_consent';
const COOKIE_PREFERENCES_KEY = 'cookie_preferences';
const DISCLAIMER_ACCEPTED_KEY = 'disclaimer_accepted';

// Cookie categories
const COOKIE_CATEGORIES = {
    essential: {
        id: 'essential',
        required: true,
        enabled: true
    },
    analytics: {
        id: 'analytics',
        required: false,
        enabled: false
    },
    preferences: {
        id: 'preferences',
        required: false,
        enabled: false
    }
};

// Initialize disclaimer and cookie consent on page load
document.addEventListener('DOMContentLoaded', function() {
    checkDisclaimer();
});

/**
 * Check if user has accepted the disclaimer
 */
function checkDisclaimer() {
    const disclaimerAccepted = localStorage.getItem(DISCLAIMER_ACCEPTED_KEY);
    
    if (!disclaimerAccepted || disclaimerAccepted !== 'true') {
        // Show disclaimer modal first - blocks access until accepted
        showDisclaimerModal();
    } else {
        // Disclaimer accepted, proceed with cookie consent
        checkCookieConsent();
        loadCookiePreferences();
    }
}

/**
 * Show disclaimer modal
 */
function showDisclaimerModal() {
    const modal = document.getElementById('disclaimerModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Enable accept button when checkbox is checked
        const checkbox = document.getElementById('disclaimerAccept');
        const acceptBtn = document.getElementById('disclaimerAcceptBtn');
        
        if (checkbox && acceptBtn) {
            checkbox.addEventListener('change', function() {
                acceptBtn.disabled = !this.checked;
            });
        }
    }
}

/**
 * Hide disclaimer modal
 */
function hideDisclaimerModal() {
    const modal = document.getElementById('disclaimerModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

/**
 * Accept disclaimer
 */
function acceptDisclaimer() {
    const checkbox = document.getElementById('disclaimerAccept');
    
    if (checkbox && checkbox.checked) {
        localStorage.setItem(DISCLAIMER_ACCEPTED_KEY, 'true');
        localStorage.setItem('disclaimer_timestamp', new Date().toISOString());
        
        hideDisclaimerModal();
        
        // Now proceed with cookie consent
        checkCookieConsent();
        loadCookiePreferences();
    }
}

/**
 * Reject disclaimer - redirect away or show message
 */
function rejectDisclaimer() {
    // Show alert and redirect to a safe page or close
    if (confirm('You must accept the disclaimer to use this service.')) {
        // Could redirect to external page or just close
        window.location.href = 'https://www.google.com';
    }
}

/**
 * Check if user has already given cookie consent
 */
function checkCookieConsent() {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    
    if (!consent) {
        // Show cookie banner if no consent given
        showCookieBanner();
    } else {
        // Hide banner if consent already given
        hideCookieBanner();
    }
}

/**
 * Check if user has already given cookie consent
 */
function checkCookieConsent() {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    
    if (!consent) {
        // Show cookie banner if no consent given
        showCookieBanner();
    } else {
        // Hide banner if consent already given
        hideCookieBanner();
    }
}

/**
 * Show cookie consent banner
 */
function showCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) {
        banner.style.display = 'block';
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
    }
}

/**
 * Hide cookie consent banner
 */
function hideCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) {
        banner.classList.remove('show');
        setTimeout(() => {
            banner.style.display = 'none';
        }, 300);
    }
}

/**
 * Accept all cookies
 */
function acceptAllCookies() {
    const preferences = {
        essential: true,
        analytics: true,
        preferences: true
    };
    
    saveCookieConsent('accepted', preferences);
    hideCookieBanner();
    closeCookieModal();
    
    // Initialize accepted cookies
    initializeCookies(preferences);
}

/**
 * Reject all non-essential cookies
 */
function rejectAllCookies() {
    const preferences = {
        essential: true,  // Essential cookies cannot be rejected
        analytics: false,
        preferences: false
    };
    
    saveCookieConsent('rejected', preferences);
    hideCookieBanner();
    
    // Initialize only essential cookies
    initializeCookies(preferences);
}

/**
 * Show cookie settings modal
 */
function showCookieSettings() {
    const modal = document.getElementById('cookieModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Load current preferences
        const savedPreferences = getCookiePreferences();
        if (savedPreferences) {
            document.getElementById('cookieAnalytics').checked = savedPreferences.analytics || false;
            document.getElementById('cookiePreferences').checked = savedPreferences.preferences || false;
        }
    }
}

/**
 * Close cookie settings modal
 */
function closeCookieModal() {
    const modal = document.getElementById('cookieModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Save cookie preferences
 */
function saveCookiePreferences() {
    const preferences = {
        essential: true,  // Always enabled
        analytics: document.getElementById('cookieAnalytics').checked,
        preferences: document.getElementById('cookiePreferences').checked
    };
    
    saveCookieConsent('customized', preferences);
    hideCookieBanner();
    closeCookieModal();
    
    // Initialize cookies based on preferences
    initializeCookies(preferences);
}

/**
 * Save cookie consent to localStorage
 */
function saveCookieConsent(status, preferences) {
    const consentData = {
        status: status,
        preferences: preferences,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
}

/**
 * Get saved cookie preferences
 */
function getCookiePreferences() {
    try {
        const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        return null;
    }
}

/**
 * Load cookie preferences into UI
 */
function loadCookiePreferences() {
    const preferences = getCookiePreferences();
    if (preferences) {
        if (document.getElementById('cookieAnalytics')) {
            document.getElementById('cookieAnalytics').checked = preferences.analytics || false;
        }
        if (document.getElementById('cookiePreferences')) {
            document.getElementById('cookiePreferences').checked = preferences.preferences || false;
        }
    }
}

/**
 * Initialize cookies based on preferences
 */
function initializeCookies(preferences) {
    // Essential cookies are always enabled
    if (preferences.essential) {
        // Initialize essential functionality
        console.log('Essential cookies enabled');
    }
    
    // Analytics cookies
    if (preferences.analytics) {
        // Initialize analytics (if you add analytics later)
        console.log('Analytics cookies enabled');
    } else {
        // Disable analytics
        console.log('Analytics cookies disabled');
    }
    
    // Preference cookies
    if (preferences.preferences) {
        // Initialize preference storage
        console.log('Preference cookies enabled');
    } else {
        // Clear preference data (except essential)
        console.log('Preference cookies disabled');
    }
}

/**
 * Show Privacy Policy modal
 */
function showPrivacyPolicy() {
    const modal = document.getElementById('privacyModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Show Terms of Service modal
 */
function showTermsOfService() {
    const modal = document.getElementById('termsModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Show Cookie Policy modal
 */
function showCookiePolicy() {
    const modal = document.getElementById('cookiePolicyModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Close legal modal
 */
function closeLegalModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const modals = ['privacyModal', 'termsModal', 'cookiePolicyModal', 'cookieModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal && event.target === modal) {
            closeLegalModal(modalId);
            if (modalId === 'cookieModal') {
                closeCookieModal();
            }
        }
    });
});

// Close modals with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeLegalModal('privacyModal');
        closeLegalModal('termsModal');
        closeLegalModal('cookiePolicyModal');
        closeCookieModal();
    }
});

// Allow users to change cookie preferences anytime
function openCookieSettings() {
    showCookieSettings();
}

// Make functions globally available
window.acceptAllCookies = acceptAllCookies;
window.rejectAllCookies = rejectAllCookies;
window.showCookieSettings = showCookieSettings;
window.saveCookiePreferences = saveCookiePreferences;
window.showPrivacyPolicy = showPrivacyPolicy;
window.showTermsOfService = showTermsOfService;
window.showCookiePolicy = showCookiePolicy;
window.closeLegalModal = closeLegalModal;
window.acceptDisclaimer = acceptDisclaimer;
window.rejectDisclaimer = rejectDisclaimer;

