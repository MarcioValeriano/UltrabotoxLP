// Initialize Lucide Icons
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize all functionality
    initMobileMenu();
    initSmoothScrolling();
    initScrollAnimations();
    initFAQ();
    initContactForm();
    initBackToTop();
    initPhoneFormatting();
    
    console.log('Dr. Márcio Valeriano - UltraBotox Landing Page Initialized');
});

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
    let isMenuOpen = false;

    if (!mobileMenuButton || !mobileMenu) return;

    mobileMenuButton.addEventListener('click', toggleMobileMenu);
    
    // Close menu when clicking links
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (isMenuOpen && !mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
            closeMobileMenu();
        }
    });

    function toggleMobileMenu() {
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
            mobileMenu.classList.remove('hidden');
            mobileMenuButton.innerHTML = '<i data-lucide="x" class="w-6 h-6"></i>';
            mobileMenuButton.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        } else {
            closeMobileMenu();
        }
        
        // Re-initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function closeMobileMenu() {
        isMenuOpen = false;
        mobileMenu.classList.add('hidden');
        mobileMenuButton.innerHTML = '<i data-lucide="menu" class="w-6 h-6"></i>';
        mobileMenuButton.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        
        // Re-initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// Smooth Scrolling for Anchor Links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Track navigation event
                trackEvent('navigation_click', {
                    section: targetId.replace('#', ''),
                    source: 'menu'
                });
            }
        });
    });
}

// Scroll Animations with Intersection Observer
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Unobserve after animation to improve performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with animation classes
    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });

    // Initialize staggered hero animations
    setTimeout(() => {
        const heroElements = document.querySelectorAll('.animate-fade-in, .animate-slide-right, .animate-slide-left, .animate-scale-in');
        heroElements.forEach((element, index) => {
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'none';
            }, index * 200);
        });
    }, 100);
}

// FAQ Accordion
function initFAQ() {
    const faqButtons = document.querySelectorAll('.faq-button');
    
    faqButtons.forEach(button => {
        button.addEventListener('click', function() {
            const faqNumber = this.getAttribute('data-faq');
            const content = this.nextElementSibling;
            const icon = this.querySelector('.faq-icon');
            const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';
            
            // Close all other FAQs
            faqButtons.forEach(otherButton => {
                if (otherButton !== button) {
                    const otherContent = otherButton.nextElementSibling;
                    const otherIcon = otherButton.querySelector('.faq-icon');
                    otherContent.style.maxHeight = '0px';
                    otherIcon.style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current FAQ
            if (isOpen) {
                content.style.maxHeight = '0px';
                icon.style.transform = 'rotate(0deg)';
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
                
                // Track FAQ interaction
                trackEvent('faq_opened', {
                    question_number: faqNumber,
                    question_text: this.querySelector('h3').textContent
                });
            }
        });
    });
}

// Contact Form Handling
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation
    const inputs = form.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name')?.trim(),
        phone: formData.get('phone')?.trim(),
        city: formData.get('city'),
        message: formData.get('message')?.trim() || 'Gostaria de agendar uma consulta para UltraBotox.'
    };
    
    // Validate required fields
    const errors = validateFormData(data);
    if (errors.length > 0) {
        showFormErrors(errors);
        return;
    }
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalContent = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="spinner"></div><span>Enviando...</span>';
    submitButton.disabled = true;
    
    // Create WhatsApp message
    const message = `Olá Dr. Márcio! Meu nome é ${data.name}. ${data.message}. Cidade de interesse: ${data.city}. Meu contato: ${data.phone}`;
    const whatsappUrl = `https://wa.me/5531998711553?text=${encodeURIComponent(message)}`;
    
    // Simulate form processing delay
    setTimeout(() => {
        // Track form submission
        trackEvent('form_submitted', {
            form_type: 'contact_form',
            city: data.city,
            has_custom_message: data.message !== 'Gostaria de agendar uma consulta para UltraBotox.'
        });
        
        // Show success message
        showSuccessMessage('Redirecionando para WhatsApp para confirmar sua consulta!');
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Reset form
        e.target.reset();
        
        // Restore button
        submitButton.innerHTML = originalContent;
        submitButton.disabled = false;
        
    }, 1000);
}

function validateFormData(data) {
    const errors = [];
    
    if (!data.name || data.name.length < 2) {
        errors.push({ field: 'name', message: 'Nome é obrigatório (mínimo 2 caracteres)' });
    }
    
    if (!data.phone || data.phone.length < 10) {
        errors.push({ field: 'phone', message: 'Telefone válido é obrigatório' });
    }
    
    if (!data.city) {
        errors.push({ field: 'city', message: 'Cidade é obrigatória' });
    }
    
    return errors;
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;
    let message = '';
    
    switch (field.name) {
        case 'name':
            if (!value || value.length < 2) {
                isValid = false;
                message = 'Nome é obrigatório (mínimo 2 caracteres)';
            }
            break;
        case 'phone':
            if (!value || value.length < 10) {
                isValid = false;
                message = 'Telefone válido é obrigatório';
            }
            break;
        case 'city':
            if (!value) {
                isValid = false;
                message = 'Cidade é obrigatória';
            }
            break;
    }
    
    if (isValid) {
        field.classList.remove('form-error');
        field.classList.add('form-success');
        removeFieldError(field);
    } else {
        field.classList.remove('form-success');
        field.classList.add('form-error');
        showFieldError(field, message);
    }
    
    return isValid;
}

function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('form-error');
    removeFieldError(field);
}

function showFieldError(field, message) {
    removeFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i data-lucide="alert-circle" class="w-4 h-4"></i> ${message}`;
    
    field.parentNode.appendChild(errorDiv);
    
    // Re-initialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function removeFieldError(field) {
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function showFormErrors(errors) {
    // Clear existing errors
    document.querySelectorAll('.error-message').forEach(error => error.remove());
    
    errors.forEach(error => {
        const field = document.querySelector(`[name="${error.field}"]`);
        if (field) {
            field.classList.add('form-error');
            showFieldError(field, error.message);
        }
    });
    
    // Focus first error field
    const firstErrorField = document.querySelector('.form-error');
    if (firstErrorField) {
        firstErrorField.focus();
    }
}

function showSuccessMessage(message) {
    // Create success banner
    const banner = document.createElement('div');
    banner.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-success-green text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
    banner.innerHTML = `
        <i data-lucide="check-circle" class="w-5 h-5"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(banner);
    
    // Re-initialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Remove after 5 seconds
    setTimeout(() => {
        banner.remove();
    }, 5000);
}

// Back to Top Button
function initBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    if (!backToTopButton) return;

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.remove('opacity-0', 'pointer-events-none');
        } else {
            backToTopButton.classList.add('opacity-0', 'pointer-events-none');
        }
    });

    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        trackEvent('back_to_top_clicked');
    });
}

// Phone Number Formatting
function initPhoneFormatting() {
    const phoneInput = document.querySelector('input[name="phone"]');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            if (value.length <= 2) {
                value = value.replace(/(\d{0,2})/, '($1');
            } else if (value.length <= 7) {
                value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
            } else {
                value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
            }
        }
        
        e.target.value = value;
    });

    // Prevent non-numeric input
    phoneInput.addEventListener('keypress', function(e) {
        const char = String.fromCharCode(e.which);
        if (!/[0-9]/.test(char) && e.which !== 8 && e.which !== 9) {
            e.preventDefault();
        }
    });
}

// Analytics and Event Tracking
function trackEvent(eventName, data = {}) {
    // Google Analytics 4 (if available)
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            ...data,
            page_title: document.title,
            page_location: window.location.href
        });
    }
    
    // Google Tag Manager (if available)
    if (typeof dataLayer !== 'undefined') {
        dataLayer.push({
            event: eventName,
            ...data,
            timestamp: new Date().toISOString()
        });
    }
    
    // Console log for debugging
    console.log('Event tracked:', eventName, data);
}

// Track WhatsApp clicks
document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href*="wa.me"]');
    if (link) {
        const source = getWhatsAppSource(link);
        trackEvent('whatsapp_click', {
            source: source,
            link_text: link.textContent.trim(),
            location: window.location.pathname
        });
    }
});

function getWhatsAppSource(link) {
    if (link.classList.contains('fixed') || link.closest('.fixed')) {
        return 'floating_button';
    } else if (link.closest('header')) {
        return 'header';
    } else if (link.closest('footer')) {
        return 'footer';
    } else if (link.closest('#contato')) {
        return 'contact_form';
    } else if (link.closest('#localizacoes')) {
        return 'locations';
    } else {
        return 'content_link';
    }
}

// Track scroll depth
let maxScrollDepth = 0;
window.addEventListener('scroll', debounce(function() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);
    
    if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
        
        // Track milestone scroll depths
        if ([25, 50, 75, 90].includes(scrollPercent)) {
            trackEvent('scroll_depth', {
                depth: scrollPercent,
                page: window.location.pathname
            });
        }
    }
}, 100));

// Track time on page
let startTime = Date.now();
window.addEventListener('beforeunload', function() {
    const timeOnPage = Math.round((Date.now() - startTime) / 1000);
    trackEvent('time_on_page', {
        seconds: timeOnPage,
        page: window.location.pathname
    });
});

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance monitoring
window.addEventListener('load', function() {
    // Track page load performance
    if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            trackEvent('page_performance', {
                load_time: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
                dom_content_loaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
                total_time: Math.round(navigation.loadEventEnd - navigation.fetchStart)
            });
        }
    }
});

// Error handling
window.addEventListener('error', function(e) {
    trackEvent('javascript_error', {
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        column: e.colno,
        page: window.location.pathname
    });
});

// Service Worker registration (for offline functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Keyboard navigation improvements
document.addEventListener('keydown', function(e) {
    // Escape key closes mobile menu
    if (e.key === 'Escape') {
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            const closeButton = document.getElementById('mobile-menu-button');
            if (closeButton) closeButton.click();
        }
    }
    
    // Enter and Space for custom buttons
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('faq-button')) {
        e.preventDefault();
        e.target.click();
    }
});

// Focus management for mobile menu
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
    );
    
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

// Initialize focus trapping for mobile menu
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        trapFocus(mobileMenu);
    }
});

// Handle reduced motion preferences
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Disable animations for users who prefer reduced motion
    const style = document.createElement('style');
    style.textContent = `
        *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
        }
    `;
    document.head.appendChild(style);
}