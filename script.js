// Navigation Menu Handler
document.addEventListener('DOMContentLoaded', async function() {
    // Wait for translations to load
    await new Promise(resolve => setTimeout(resolve, 100));
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    // Handle navigation clicks
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Remove active class from all nav items and sections
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked nav item and corresponding section
            this.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
            
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
            
            // Scroll to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMenu.contains(event.target);
        const isClickOnToggle = menuToggle.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnToggle && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
    
    // Telegram Button Handler
    const telegramBtn = document.getElementById('telegramBtn');
    
    if (telegramBtn) {
        telegramBtn.addEventListener('click', handleTelegramClick);
    }
});

/**
 * Handle Telegram button click
 */
function handleTelegramClick(e) {
    e.preventDefault();
    
    // Add loading state
    document.body.classList.add('loading');
    
    // Small delay for visual feedback
    setTimeout(() => {
        redirectToTelegram();
    }, 200);
}

/**
 * Redirect to Telegram bot
 */
function redirectToTelegram() {
    const TELEGRAM_BOT_URL = 'https://t.me/goontech_aibot';
    
    // Try to open in Telegram app first, fallback to web
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Try Telegram app first
        window.location.href = 'tg://resolve?domain=goontech_aibot';
        
        // Fallback to web after 2 seconds if app doesn't open
        setTimeout(() => {
            window.location.href = TELEGRAM_BOT_URL;
        }, 2000);
    } else {
        // Desktop: open in new tab
        window.open(TELEGRAM_BOT_URL, '_blank');
    }
}

// Smooth scroll behavior for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation on scroll (optional enhancement)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards for animation
document.querySelectorAll('.step-card, .pricing-card, .payment-card, .tip-card, .feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});
