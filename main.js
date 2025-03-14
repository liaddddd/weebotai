document.addEventListener('DOMContentLoaded', function() {
    // Initialize the site
    initializeSite();
});

window.addEventListener('load', function() {
    // Remove the preloader after everything is loaded
    removePreloader();
    
    // Initialize all dynamic components
    initializeComponents();
});

function removePreloader() {
    // Remove the loading class from body and hide the preloader with animation
    setTimeout(function() {
        document.body.classList.remove('loading');
        const preloader = document.querySelector('.preloader');
        
        if (preloader) {
            preloader.style.opacity = '0';
            
            // Completely remove the preloader after transition
            setTimeout(function() {
                preloader.style.display = 'none';
            }, 500);
        }
    }, 800); // Short delay for smoother transition
}

function initializeSite() {
    // אין צורך באתחול Typed.js כאן, זה מטופל ב-script.js
    // ההערה מתחת תחליף את האתחול הקודם
    // Typed.js is now initialized in script.js to avoid duplicate instances
    
    /* הסרנו את הקוד הבא כדי למנוע כפילות:
    if (document.getElementById('typed-output') && document.getElementById('typed-strings')) {
        const typedStrings = document.getElementById('typed-strings').children;
        const strings = [];
        
        // Extract strings from the HTML elements
        for (let i = 0; i < typedStrings.length; i++) {
            strings.push(typedStrings[i].innerHTML);
        }
        
        // Initialize Typed.js
        new Typed('#typed-output', {
            strings: strings,
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            startDelay: 500,
            loop: true,
            showCursor: true,
        });
    }
    */
    
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: false,
            mirror: true
        });
    }
    
    // Initialize vanilla-tilt for tilt effect on elements with data-tilt attribute
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
            max: 5,
            speed: 400,
            glare: false
        });
    }
    
    // Initialize event listeners
    initEventListeners();
}

function initEventListeners() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            document.body.classList.toggle('mobile-menu-open');
        });
    }
    
    // Chat button functionality
    const chatButton = document.querySelector('.chat-button');
    const chatContainer = document.querySelector('.chat-container');
    const chatClose = document.querySelector('.chat-close');
    
    if (chatButton && chatContainer && chatClose) {
        chatButton.addEventListener('click', function() {
            chatContainer.classList.add('active');
        });
        
        chatClose.addEventListener('click', function() {
            chatContainer.classList.remove('active');
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId !== '#') {
                e.preventDefault();
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Back to top button
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('active');
            } else {
                backToTop.classList.remove('active');
            }
        });
        
        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

function initializeComponents() {
    // Initialize custom cursor if it exists
    initializeCustomCursor();
    
    // Initialize floating elements animation
    animateFloatingElements();
    
    // Initialize gradient canvas background if it exists
    initializeGradientCanvas();
}

function initializeCustomCursor() {
    const cursor = document.querySelector('.cursor');
    
    if (cursor) {
        const cursorDot = cursor.querySelector('.cursor-dot');
        const cursorOutline = cursor.querySelector('.cursor-outline');
        
        document.addEventListener('mousemove', function(e) {
            if (cursorDot && cursorOutline) {
                cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
                cursorOutline.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            }
        });
    }
}

function animateFloatingElements() {
    const floatingElements = document.querySelectorAll('.floating-elements .floating-element-1, .floating-elements .floating-element-2, .floating-elements .floating-element-3, .floating-elements .floating-element-4, .floating-elements .floating-element-5');
    
    if (floatingElements.length && typeof gsap !== 'undefined') {
        floatingElements.forEach(element => {
            const speed = element.getAttribute('data-speed') || 0.05;
            
            gsap.to(element, {
                y: "random(-20, 20)", 
                x: "random(-20, 20)",
                duration: 3 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
    }
}

function initializeGradientCanvas() {
    const canvas = document.getElementById('gradient-canvas');
    
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Resize handler
        window.addEventListener('resize', function() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        });
        
        // Simple gradient animation example (you can enhance this as needed)
        let hue = 0;
        
        function animate() {
            // Create gradient
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            
            // Shift hue slowly for animation
            hue = (hue + 0.1) % 360;
            
            // Add color stops with shifting hues
            gradient.addColorStop(0, `hsla(${hue}, 80%, 50%, 0.5)`);
            gradient.addColorStop(1, `hsla(${hue + 60}, 80%, 50%, 0.5)`);
            
            // Fill with gradient
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            
            // Continue animation
            requestAnimationFrame(animate);
        }
        
        // Start animation
        animate();
    }
} 