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
    initVideoTracking();
    initLazyLoading();
    initCustomVideoPlayer();
    initReelsVideoPlayer();
    initPlyrPlayer();
    
    console.log('Dr. Márcio Valeriano - Landing Page Initialized');
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
            document.body.style.overflow = 'hidden'; // Prevent body scroll
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
        document.body.style.overflow = ''; // Restore body scroll
        
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
        message: formData.get('message')?.trim() || 'Gostaria de agendar uma consulta para otoplastia.'
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
            has_custom_message: data.message !== 'Gostaria de agendar uma consulta para otoplastia.'
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
    removeFieldError(field); // Remove existing error
    
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

// Custom Video Player (Instagram Reels Style)
function initCustomVideoPlayer() {
    const video = document.getElementById('main-video');
    const playOverlay = document.getElementById('play-overlay');
    const videoControls = document.getElementById('video-controls');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const muteBtn = document.getElementById('mute-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressSlider = document.getElementById('progress-slider');
    const timeDisplay = document.getElementById('time-display');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    if (!video) return;
    
    let isPlaying = false;
    let isMuted = false;
    
    // Format time display
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Play/Pause functionality
    function togglePlayPause() {
        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
    }
    
    // Update play button icon
    function updatePlayButton() {
        const icon = playPauseBtn ? playPauseBtn.querySelector('i') : null;
        if (icon) {
            if (isPlaying) {
                icon.setAttribute('data-lucide', 'pause');
                if (playOverlay) playOverlay.style.display = 'none';
            } else {
                icon.setAttribute('data-lucide', 'play');
                if (playOverlay) playOverlay.style.display = 'flex';
            }
            // Re-initialize icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }
    
    // Update mute button icon
    function updateMuteButton() {
        const icon = muteBtn ? muteBtn.querySelector('i') : null;
        if (icon) {
            if (isMuted || video.volume === 0) {
                icon.setAttribute('data-lucide', 'volume-x');
            } else {
                icon.setAttribute('data-lucide', 'volume-2');
            }
            // Re-initialize icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }
    
    // Show/hide controls
    let controlsTimeout;
    function showControls() {
        videoControls.style.opacity = '1';
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
            if (isPlaying) {
                videoControls.style.opacity = '0';
            }
        }, 3000);
    }
    
    // Event listeners
    playOverlay.addEventListener('click', togglePlayPause);
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        isMuted = video.muted;
        updateMuteButton();
    });
    
    fullscreenBtn.addEventListener('click', () => {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen();
        }
    });
    
    // Progress slider
    progressSlider.addEventListener('input', () => {
        const time = (progressSlider.value / 100) * video.duration;
        video.currentTime = time;
    });
    
    // Video events
    video.addEventListener('loadstart', () => {
        loadingSpinner.classList.remove('hidden');
    });
    
    video.addEventListener('canplay', () => {
        loadingSpinner.classList.add('hidden');
    });
    
    video.addEventListener('play', () => {
        isPlaying = true;
        updatePlayButton();
        showControls();
        trackEvent('video_started', {
            video_id: 'main-video',
            video_title: 'Procedure Video'
        });
    });
    
    video.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayButton();
        videoControls.style.opacity = '1';
    });
    
    video.addEventListener('timeupdate', () => {
        if (video.duration) {
            const progress = (video.currentTime / video.duration) * 100;
            progressBar.style.width = progress + '%';
            progressSlider.value = progress;
            timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        }
    });
    
    video.addEventListener('ended', () => {
        isPlaying = false;
        updatePlayButton();
        videoControls.style.opacity = '1';
        trackEvent('video_completed', {
            video_id: 'main-video',
            video_title: 'Procedure Video'
        });
    });
    
    // Mouse movement to show controls
    video.parentElement.addEventListener('mousemove', showControls);
    video.parentElement.addEventListener('mouseleave', () => {
        if (isPlaying) {
            videoControls.style.opacity = '0';
        }
    });
    
    // Touch events for mobile
    video.parentElement.addEventListener('touchstart', showControls);
    
    // Initialize
    updatePlayButton();
    updateMuteButton();
}

// Simple video toggle function for gallery videos
function toggleVideo(videoId) {
    const video = document.getElementById(videoId);
    const overlay = document.getElementById('overlay-' + videoId.split('-')[1]);
    
    if (!video) return;
    
    if (video.paused) {
        // Pause all other videos first
        document.querySelectorAll('video').forEach(v => {
            if (v.id !== videoId && !v.paused) {
                v.pause();
                const otherId = v.id.split('-')[1];
                const otherOverlay = document.getElementById('overlay-' + otherId);
                if (otherOverlay) otherOverlay.style.display = 'flex';
            }
        });
        
        video.play();
        if (overlay) overlay.style.display = 'none';
        
        trackEvent('video_started', {
            video_id: videoId,
            video_title: 'Gallery Video'
        });
    } else {
        video.pause();
        if (overlay) overlay.style.display = 'flex';
    }
}

// Video Tracking
// Reels-style video player
function initReelsVideoPlayer() {
    const video = document.getElementById('reels-video');
    const overlay = document.getElementById('video-overlay');
    const playButton = document.getElementById('play-button');
    const soundToggle = document.getElementById('sound-toggle');
    const soundIcon = document.getElementById('sound-icon');
    const progressBar = document.getElementById('progress-bar');
    
    if (!video) return;
    
    let isPlaying = false;
    let isMuted = true;
    
    // Prevent video download and right-click
    video.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
    
    // Disable drag
    video.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
    });
    
    // Disable text selection
    video.style.userSelect = 'none';
    video.style.webkitUserSelect = 'none';
    
    // Toggle play/pause on video click
    video.addEventListener('click', togglePlayPause);
    if (overlay) {
        overlay.addEventListener('click', togglePlayPause);
    }
    
    // Sound toggle
    if (soundToggle) {
        soundToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            isMuted = !isMuted;
            video.muted = isMuted;
            
            if (soundIcon) {
                soundIcon.setAttribute('data-lucide', isMuted ? 'volume-x' : 'volume-2');
                lucide.createIcons();
            }
        });
    }
    
    // Progress bar update
    video.addEventListener('timeupdate', () => {
        if (video.duration) {
            const progress = (video.currentTime / video.duration) * 100;
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
        }
    });
    
    // Show/hide overlay on hover
    video.addEventListener('mouseenter', () => {
        if (!isPlaying && overlay) {
            overlay.style.opacity = '1';
        }
    });
    
    video.addEventListener('mouseleave', () => {
        if (overlay) {
            overlay.style.opacity = '0';
        }
    });
    
    function togglePlayPause() {
        if (isPlaying) {
            video.pause();
            isPlaying = false;
            if (overlay) overlay.style.opacity = '1';
            if (playButton) playButton.innerHTML = '<i data-lucide="play" class="text-black w-6 h-6 ml-1"></i>';
        } else {
            video.play();
            isPlaying = true;
            if (overlay) overlay.style.opacity = '0';
            if (playButton) playButton.innerHTML = '<i data-lucide="pause" class="text-black w-6 h-6"></i>';
        }
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    // Mobile-optimized auto-play when in viewport
    const isMobile = window.innerWidth <= 768;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > (isMobile ? 0.3 : 0.5)) {
                // Auto play when visible (lower threshold for mobile)
                setTimeout(() => {
                    if (!isPlaying) {
                        togglePlayPause();
                    }
                }, isMobile ? 200 : 500);
            } else {
                // Pause when not visible
                if (isPlaying) {
                    togglePlayPause();
                }
            }
        });
    }, { threshold: isMobile ? 0.3 : 0.5 });
    
    // Touch event handling for mobile
    if (isMobile) {
        let touchStartY = 0;
        let touchEndY = 0;
        
        video.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        });
        
        video.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            const touchDiff = touchStartY - touchEndY;
            
            // Only toggle if it's a tap, not a scroll
            if (Math.abs(touchDiff) < 10) {
                togglePlayPause();
            }
        });
    }
    
    observer.observe(video);
}

function initVideoTracking() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        let hasStarted = false;
        let hasReached25 = false;
        let hasReached50 = false;
        let hasReached75 = false;
        
        video.addEventListener('play', function() {
            if (!hasStarted) {
                hasStarted = true;
                trackEvent('video_started', {
                    video_id: this.id || 'main-video',
                    video_title: this.getAttribute('data-title') || 'Procedure Video'
                });
            }
        });
        
        video.addEventListener('timeupdate', function() {
            const progress = (this.currentTime / this.duration) * 100;
            
            if (progress >= 25 && !hasReached25) {
                hasReached25 = true;
                trackEvent('video_progress', { progress: 25 });
            } else if (progress >= 50 && !hasReached50) {
                hasReached50 = true;
                trackEvent('video_progress', { progress: 50 });
            } else if (progress >= 75 && !hasReached75) {
                hasReached75 = true;
                trackEvent('video_progress', { progress: 75 });
            }
        });
        
        video.addEventListener('ended', function() {
            trackEvent('video_completed', {
                video_id: this.id || 'main-video',
                video_title: this.getAttribute('data-title') || 'Procedure Video'
            });
        });
    });
}

// Lazy Loading for Images
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.addEventListener('load', () => {
                        img.classList.add('loaded');
                    });
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        images.forEach(img => img.classList.add('loaded'));
    }
    
    // Aggressive video optimization and immediate preloading
    const criticalVideo = document.getElementById('quality-life-player');
    if (criticalVideo) {
        // Force immediate video loading
        criticalVideo.load();
        
        // Optimize video attributes for fastest loading
        criticalVideo.setAttribute('playsinline', '');
        criticalVideo.setAttribute('webkit-playsinline', '');
        criticalVideo.muted = true;
        criticalVideo.autoplay = true;
        criticalVideo.preload = 'auto';
        
        // Set buffer optimization
        criticalVideo.setAttribute('x-webkit-airplay', 'allow');
        criticalVideo.setAttribute('webkit-playsinline', 'true');
        
        // Force loading events
        criticalVideo.addEventListener('loadstart', () => {
            console.log('Video loading optimized - immediate start');
        });
        
        criticalVideo.addEventListener('loadeddata', () => {
            console.log('Video data loaded - ready to play');
        });
        
        // Start loading immediately on page load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                criticalVideo.load();
            });
        } else {
            criticalVideo.load();
        }
    }
    
    // Register Service Worker for video caching
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('Service Worker registered for video caching');
            })
            .catch((error) => {
                console.log('SW registration failed: ', error);
            });
    }
}

// Plyr Video Player with Autoplay on Scroll
function initPlyrPlayer() {
    const videoElement = document.getElementById('quality-life-player');
    if (!videoElement || typeof Plyr === 'undefined') return;
    
    // Initialize Plyr with performance optimizations
    const player = new Plyr(videoElement, {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
        settings: [],
        youtube: { noCookie: false, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 },
        displayDuration: true,
        invertTime: false,
        toggleInvert: false,
        ratio: '9:16', // Instagram Reels format
        clickToPlay: true,
        hideControls: true,
        resetOnEnd: false,
        disableContextMenu: true,
        loadSprite: false, // Disable sprite loading for faster initialization
        iconPrefix: 'plyr',
        iconUrl: '', // Remove icon URL to reduce network requests
        blankVideo: '',
        quality: { default: 480, options: [480, 720] }, // Start with lower quality
        loop: { active: false },
        speed: { selected: 1, options: [1] },
        keyboard: { focused: true, global: false },
        tooltips: { controls: false, seek: false }, // Disable tooltips for better performance
        captions: { active: false, language: 'auto', update: false },
        fullscreen: { enabled: true, fallback: true, iosNative: false, container: null },
        storage: { enabled: false, key: 'plyr' },
        ads: { enabled: false },
        previewThumbnails: { enabled: false },
        vimeo: { byline: false, portrait: false, title: false, speed: true, transparent: false },
        mediaMetadata: { title: 'Blefaroplastia - Qualidade de Vida', artist: 'Dr. Márcio Valeriano', album: '', artwork: [] },
        markers: { enabled: false },
        // Ultra-fast loading optimizations
        muted: true, // Allows autoplay
        autoplay: true, // Immediate autoplay
        preload: 'auto', // Load entire video immediately
        // Advanced streaming settings
        buffered: true,
        seekRewind: false,
        fastForward: false,
        // Network optimization
        resetOnEnd: false,
        // Reduce control overhead
        clickToPlay: false
    });

    let hasStartedPlaying = false;
    
    // Create optimized intersection observer with preloading
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Preload video when entering viewport
                if (videoElement.readyState === 0) {
                    videoElement.load();
                }
                
                // Video is in view - play it immediately
                if (!hasStartedPlaying) {
                    player.play().then(() => {
                        hasStartedPlaying = true;
                        trackEvent('plyr_autoplay_started', {
                            video_id: 'quality-life-player',
                            video_title: 'Blefaroplastia - Qualidade de Vida'
                        });
                    }).catch((error) => {
                        console.log('Autoplay failed:', error);
                    });
                } else {
                    player.play().catch((error) => {
                        console.log('Resume play failed:', error);
                    });
                }
            } else {
                // Video is out of view - pause it
                if (!player.paused) {
                    player.pause();
                }
            }
        });
    }, {
        threshold: 0.1, // Load as soon as 10% visible
        rootMargin: '200px 0px' // Start loading 200px before entering viewport
    });
    
    // Observe the video container
    const videoContainer = videoElement.closest('.video-container');
    if (videoContainer) {
        videoObserver.observe(videoContainer);
    }
    
    // Track video events
    player.on('play', () => {
        trackEvent('plyr_play', {
            video_id: 'quality-life-player',
            timestamp: Date.now()
        });
    });
    
    player.on('pause', () => {
        trackEvent('plyr_pause', {
            video_id: 'quality-life-player',
            timestamp: Date.now()
        });
    });
    
    player.on('ended', () => {
        trackEvent('plyr_ended', {
            video_id: 'quality-life-player',
            timestamp: Date.now()
        });
    });
    
    player.on('progress', () => {
        const progress = (player.currentTime / player.duration) * 100;
        if (progress >= 25 && progress < 50 && !player.progressTracked25) {
            player.progressTracked25 = true;
            trackEvent('plyr_progress', { progress: 25 });
        } else if (progress >= 50 && progress < 75 && !player.progressTracked50) {
            player.progressTracked50 = true;
            trackEvent('plyr_progress', { progress: 50 });
        } else if (progress >= 75 && !player.progressTracked75) {
            player.progressTracked75 = true;
            trackEvent('plyr_progress', { progress: 75 });
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

// Improved focus management
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

// Preload critical resources
function preloadCriticalResources() {
    const criticalImages = [
        './images/doctor-hero.jpg',
        './images/doctor-about.jpg',
        './images/logo.webp'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

// Initialize preloading
preloadCriticalResources();

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

// Theme detection and system preference handling
function handleThemePreference() {
    // This site uses a dark theme by default
    // Could be extended to support light/dark mode toggle
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (prefersDark) {
        document.documentElement.classList.add('dark-theme');
    }
}

handleThemePreference();

// Print optimization
window.addEventListener('beforeprint', function() {
    // Hide non-essential elements before printing
    document.querySelectorAll('.no-print, .fixed, button').forEach(el => {
        el.style.display = 'none';
    });
});

window.addEventListener('afterprint', function() {
    // Restore elements after printing
    document.querySelectorAll('.no-print, .fixed, button').forEach(el => {
        el.style.display = '';
    });
});
