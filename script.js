/**
 * קוונטום טק - JavaScript ראשי
 * ==========================
 * קובץ זה מכיל את כל הלוגיקה והאינטראקציות הבסיסיות של האתר
 */

// Main initialization on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM טעינה הושלמה - אתחול האתר מתחיל...');
    
    // אתחל את כל הפונקציונליות של האתר
    initializePreloader();
    initializeCustomCursor();
    initializeNavbar();
    initializeTypedText();
    initializeGradientBackground();
    initializeChat();
    initializeAOS();
    initializeCounterStats();
    initializeTestimonialSlider();
    initializePricingToggle();
    initializePortfolioFilter();
    initializeBackToTop();
    initializeModalHandlers();
    initializePasswordToggle();
    
    // אתחל פאראלקס אפקטים אם GSAP זמין
    if (typeof gsap !== 'undefined') {
        initializeParallaxEffects();
    }
    
    // אתחול משתמש דמה לפני אתחול הפאנלים
    initializeTestUser();
    
    // אתחול פאנל ניהול ופאנלים צדדיים
    initializeAdminAndSidePanels();
    
    // Mobile Responsiveness Enhancements
    enhanceMobileExperience();
    
    console.log('אתחול האתר הסתיים בהצלחה');
});

/**
 * מנהל את אנימציית הפרילודר בטעינה
 */
function initializePreloader() {
    const preloader = document.querySelector('.preloader');
    
    if (!preloader) return;
    
    // הצג את הפרילודר בזמן טעינת העמוד
    window.addEventListener('load', function() {
        setTimeout(function() {
            // הסתר את הפרילודר אחרי הטעינה
            preloader.classList.add('fade-out');
            document.body.classList.remove('loading');
            
            setTimeout(function() {
                preloader.style.display = 'none';
            }, 500);
        }, 1000);
    });
    
    // אם הטעינה כבר הושלמה, הסתר את הפרילודר
    if (document.readyState === 'complete') {
        setTimeout(function() {
            preloader.classList.add('fade-out');
            document.body.classList.remove('loading');
            
            setTimeout(function() {
                preloader.style.display = 'none';
            }, 500);
        }, 1000);
    }
}

/**
 * אתחול סמן העכבר המותאם אישית
 */
function initializeCustomCursor() {
    const cursor = document.querySelector('.cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (!cursor || !cursorDot || !cursorOutline || isMobileDevice()) {
        if (cursor) cursor.style.display = 'none';
        return;
    }
    
    // עקוב אחרי העכבר
    document.addEventListener('mousemove', function(e) {
        gsap.to(cursorDot, { duration: 0.1, x: e.clientX, y: e.clientY });
        gsap.to(cursorOutline, { duration: 0.5, x: e.clientX, y: e.clientY });
    });
    
    // הוסף אפקט ריחוף לאלמנטים אינטראקטיביים
    const interactiveElements = document.querySelectorAll('a, button, .service-card, .portfolio-item, .pricing-card, .social-link, .nav-link, input, select, textarea');
    
    interactiveElements.forEach(function(el) {
        el.addEventListener('mouseenter', function() {
            cursor.classList.add('active');
        });
        
        el.addEventListener('mouseleave', function() {
            cursor.classList.remove('active');
        });
    });
}

/**
 * בדוק אם המכשיר הנוכחי הוא מובייל
 */
function isMobileDevice() {
    return (
        typeof window.orientation !== 'undefined' || 
        navigator.userAgent.indexOf('IEMobile') !== -1 ||
        window.innerWidth <= 992
    );
}

/**
 * אתחול תפריט הניווט והאירועים הקשורים אליו
 */
function initializeNavbar() {
    const navbar = document.querySelector('.navbar-container');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links-container');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!navbar) return;
    
    // הוסף class למעברי צבע בגלילה
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // טוגל לתפריט המובייל
    if (mobileMenuToggle && navLinksContainer) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenuToggle.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
        });
        
        // סגור את התפריט כשלוחצים על קישור
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                navLinksContainer.classList.remove('active');
            });
        });
    }
    
    // סמן את הקישור הפעיל בהתאם למיקום בעמוד
    window.addEventListener('scroll', function() {
        let current = '';
        
        const sections = document.querySelectorAll('section');
        const navHeight = navbar.offsetHeight;
        
        sections.forEach(function(section) {
            const sectionTop = section.offsetTop - navHeight - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(function(link) {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            
            if (href && href.substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
    
    // גלילה חלקה לקישורים פנימיים
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return; // Skip empty anchor links
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * אתחול אזור הטקסט המקליד אוטומטית
 */
function initializeTypedText() {
    console.log("אתחול טקסט מקליד אוטומטית...");
    
    // מאתר את האלמנטים הדרושים
    const typedOutput = document.getElementById('typed-output');
    const typedStrings = document.getElementById('typed-strings');
    
    if (typedOutput && typedStrings) {
        // בדיקה אם כבר מאותחל - תחילה ננקה
        if (window.typedInstance) {
            console.log("הורס מופע Typed קודם...");
            window.typedInstance.destroy();
        }
        
        // ניקוי מוחלט של האזור
        typedOutput.innerHTML = '';
        
        // יצירת מיכל עם גובה קבוע למניעת קפיצות
        let typedContainer = document.querySelector('.typed-container');
        if (!typedContainer) {
            console.log("יוצר קונטיינר חדש לטקסט המודפס");
            typedContainer = document.createElement('div');
            typedContainer.className = 'typed-container';
            typedOutput.parentNode.insertBefore(typedContainer, typedOutput);
            typedContainer.appendChild(typedOutput);
        }
        
        // אתחול הספרייה
        const strings = [];
        const childElements = typedStrings.children;
        
        // לולאה על כל האלמנטים בתג של המחרוזות
        for (let i = 0; i < childElements.length; i++) {
            strings.push(childElements[i].textContent);
        }
        
        // השהייה קצרה לוודא שהכל מוכן
        setTimeout(() => {
            // אתחול ספריית typed.js עם אפשרויות מותאמות
            window.typedInstance = new Typed('#typed-output', {
                strings: strings,
                typeSpeed: 50,
                backSpeed: 30,
                backDelay: 2500, // הארכנו את זמן ההשהיה בין משפטים
                startDelay: 500,
                loop: true,
                showCursor: true,
                cursorChar: '|',
                autoInsertCss: true,
                contentType: 'html',
                preStringTyped: function() {
                    // לא עושים דבר מיוחד לפני הדפסת מחרוזת
                }
            });
            console.log("טקסט מודפס אותחל בהצלחה");
        }, 100);
    } else {
        console.warn("לא נמצאו אלמנטים להדפסת טקסט");
    }
}

/**
 * אתחול רקע גרדיאנט דינמי
 */
function initializeGradientBackground() {
    const canvas = document.getElementById('gradient-canvas');
    
    if (!canvas) return;
    
    const gradient = new Gradient();
    gradient.initGradient('#gradient-canvas');
}

/**
 * מחלקה לניהול אנימציית הגרדיאנט
 */
class Gradient {
    constructor() {
        this.colors = [
            [62, 35, 255],
            [60, 255, 60],
            [255, 35, 98],
            [45, 175, 230],
            [255, 0, 255],
            [255, 128, 0]
        ];
        this.step = 0;
        this.colorIndices = [0, 1, 2, 3];
        this.gradientSpeed = 0.002;
    }
    
    initGradient(selector) {
        const canvas = document.querySelector(selector);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Set initial canvas dimensions
        this.setCanvasDimensions(canvas);
        
        // Use a debounced resize handler to prevent performance issues
        let resizeTimeout;
        window.addEventListener('resize', () => {
            // Cancel previous timeout
            if (resizeTimeout) clearTimeout(resizeTimeout);
            
            // Set a new timeout
            resizeTimeout = setTimeout(() => {
                this.setCanvasDimensions(canvas);
            }, 250); // Wait 250ms after resize ends
        });
        
        const updateGradient = () => {
            const c0_0 = this.colors[this.colorIndices[0]];
            const c0_1 = this.colors[this.colorIndices[1]];
            const c1_0 = this.colors[this.colorIndices[2]];
            const c1_1 = this.colors[this.colorIndices[3]];
            
            let istep = 1 - this.step;
            let r1 = Math.round(istep * c0_0[0] + this.step * c0_1[0]);
            let g1 = Math.round(istep * c0_0[1] + this.step * c0_1[1]);
            let b1 = Math.round(istep * c0_0[2] + this.step * c0_1[2]);
            let r2 = Math.round(istep * c1_0[0] + this.step * c1_1[0]);
            let g2 = Math.round(istep * c1_0[1] + this.step * c1_1[1]);
            let b2 = Math.round(istep * c1_0[2] + this.step * c1_1[2]);
            
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, 0.5)`);
            gradient.addColorStop(1, `rgba(${r2}, ${g2}, ${b2}, 0.5)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            this.step += this.gradientSpeed;
            if (this.step >= 1) {
                this.step %= 1;
                this.colorIndices[0] = this.colorIndices[1];
                this.colorIndices[2] = this.colorIndices[3];
                
                this.colorIndices[1] = (this.colorIndices[1] + Math.floor(1 + Math.random() * (this.colors.length - 1))) % this.colors.length;
                this.colorIndices[3] = (this.colorIndices[3] + Math.floor(1 + Math.random() * (this.colors.length - 1))) % this.colors.length;
            }
            
            requestAnimationFrame(updateGradient);
        }
        
        updateGradient();
    }
    
    // Add a new method to handle canvas dimensions
    setCanvasDimensions(canvas) {
        // התאמה דינמית לגודל המסך
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // התאמת הסגנון של הקנבס
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '100%';
        canvas.style.objectFit = 'cover';
    }
}

/**
 * אתחול ממשק הצ'אט
 */
function initializeChat() {
    const chatButton = document.querySelector('.chat-button');
    const chatContainer = document.querySelector('.chat-container');
    const chatClose = document.querySelector('.chat-close');
    const chatInput = document.querySelector('.chat-input');
    const chatSend = document.querySelector('.chat-send');
    const chatMessages = document.querySelector('.chat-messages');
    
    if (!chatButton || !chatContainer) return;
    
    // פתיחה וסגירה של הצ'אט
    chatButton.addEventListener('click', function() {
        chatContainer.classList.toggle('active');
    });
    
    if (chatClose) {
        chatClose.addEventListener('click', function() {
            chatContainer.classList.remove('active');
        });
    }
    
    // שליחת הודעה בצ'אט
    function sendMessage() {
        if (!chatInput || !chatMessages) return;
        
        const message = chatInput.value.trim();
        
        if (message !== '') {
            // הוספת הודעת המשתמש
            const userMessageHTML = `
                <div class="user-message animate__animated animate__fadeIn">
                    <div class="message-content">${message}</div>
                    <div class="message-time">עכשיו</div>
                </div>
            `;
            chatMessages.insertAdjacentHTML('beforeend', userMessageHTML);
            chatInput.value = '';
            
            // גלילה לתחתית הצ'אט
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // סימולציה של תגובת בוט אחרי השהיה
            setTimeout(function() {
                const botMessageHTML = `
                    <div class="bot-message animate__animated animate__fadeIn">
                        <div class="message-time">עכשיו</div>
                        <div class="message-content">תודה על פנייתך! אני אשמח לעזור לך בכל שאלה בנוגע לשירותים שלנו. נציג אנושי יחזור אליך בהקדם.</div>
                    </div>
                `;
                chatMessages.insertAdjacentHTML('beforeend', botMessageHTML);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
        }
    }
    
    if (chatSend && chatInput) {
        chatSend.addEventListener('click', sendMessage);
        
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

/**
 * אתחול אנימציות בגלילה עם AOS
 */
function initializeAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }
}

/**
 * אתחול סטטיסטיקות עם CountUp.js
 */
function initializeCounterStats() {
    const statElements = document.querySelectorAll('.stat-value[data-count]');
    
    if (statElements.length === 0 || typeof countUp === 'undefined') return;
    
    // פונקציה שמפעילה את האנימציה כאשר האלמנט נראה
    const startCounter = function(element) {
        const countValue = parseInt(element.getAttribute('data-count'));
        if (isNaN(countValue)) return;
        
        const options = {
            startVal: 0,
            duration: 2.5,
            useEasing: true,
            useGrouping: true
        };
        
        const counter = new countUp.CountUp(element, countValue, options);
        counter.start();
    };
    
    // אתחול ספירה עם IntersectionObserver
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                startCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    statElements.forEach(function(stat) {
        observer.observe(stat);
    });
}

/**
 * אתחול סליידר המלצות עם Swiper.js
 */
function initializeTestimonialSlider() {
    if (typeof Swiper === 'undefined' || !document.querySelector('.testimonial-slider')) return;
    
    const testimonialSlider = new Swiper('.testimonial-slider', {
        slidesPerView: 1,
        spaceBetween: 30,
        centeredSlides: true,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        speed: 800,
        effect: 'coverflow',
        coverflowEffect: {
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.testimonial-next',
            prevEl: '.testimonial-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 1.2,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 30,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
        },
        on: {
            init: function() {
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                }, 500);
            }
        }
    });
}

/**
 * אתחול מתג המחירים (חודשי/שנתי)
 */
function initializePricingToggle() {
    const pricingToggle = document.getElementById('pricing-toggle');
    const pricingCards = document.querySelectorAll('.pricing-card');
    
    if (!pricingToggle || pricingCards.length === 0) return;
    
    // Function to update pricing display
    function updatePricingDisplay() {
        const isAnnual = pricingToggle.checked;
        
        pricingCards.forEach(card => {
            if (isAnnual) {
                card.classList.add('annually');
                card.classList.remove('monthly');
            } else {
                card.classList.add('monthly');
                card.classList.remove('annually');
            }
        });
    }
    
    // Set monthly pricing as default
    pricingToggle.checked = true;
    updatePricingDisplay();
    
    // Toggle between monthly and annual pricing
    pricingToggle.addEventListener('change', updatePricingDisplay);
}

/**
 * אתחול פילטר לתיק העבודות
 */
function initializePortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    if (filterButtons.length === 0 || portfolioItems.length === 0) return;
    
    filterButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // הסר active מכל כפתורי הפילטר
            filterButtons.forEach(function(btn) {
                btn.classList.remove('active');
            });
            
            // הוסף active לכפתור שנלחץ
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            // סנן פריטים
            portfolioItems.forEach(function(item) {
                const category = item.getAttribute('data-category');
                
                if (filterValue === 'all' || filterValue === category) {
                    item.style.display = 'block';
                    setTimeout(function() {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';
                    setTimeout(function() {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

/**
 * אתחול כפתור "חזרה למעלה"
 */
function initializeBackToTop() {
    const backToTopButton = document.querySelector('.back-to-top');
    
    if (!backToTopButton) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('active');
        } else {
            backToTopButton.classList.remove('active');
        }
    });
    
    backToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * אתחול אפקטי פאראלקס עם GSAP
 */
function initializeParallaxEffects() {
    if (typeof gsap === 'undefined' || isMobileDevice()) return;
    
    // אפקט פאראלקס בתנועת העכבר
    document.addEventListener('mousemove', function(e) {
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;
        
        // אפקט על אלמנטים ויזואליים בעמוד הבית
        const heroVisual = document.querySelector('.hero-visual');
        if (heroVisual) {
            gsap.to(heroVisual, {
                duration: 1,
                x: mouseX * 20,
                y: mouseY * 20,
                ease: 'power1.out'
            });
        }
        
        // אפקט על אלמנטים מרחפים
        const floatingElements = document.querySelectorAll('[data-speed]');
        floatingElements.forEach(function(element) {
            const speed = element.getAttribute('data-speed');
            const xMovement = mouseX * parseFloat(speed) * 100;
            const yMovement = mouseY * parseFloat(speed) * 100;
            
            gsap.to(element, {
                duration: 1,
                x: xMovement,
                y: yMovement,
                ease: 'power1.out'
            });
        });
    });
    
    // אנימציה בגלילה
    if (typeof ScrollTrigger !== 'undefined') {
        // אפקטים בגלילה להכותרות
        gsap.utils.toArray('.section-title').forEach(function(title) {
            gsap.fromTo(
                title,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    scrollTrigger: {
                        trigger: title,
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });
        
        // אפקט גלילה לכרטיסי שירותים
        gsap.utils.toArray('.service-card').forEach(function(card, index) {
            gsap.fromTo(
                card,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: index * 0.1,
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });
    }
}

/**
 * אתחול מודלים כמו התחברות והרשמה
 * הערה: מטפל רק במודלים שאינם קשורים לאימות
 */
function initializeModalHandlers() {
    // מאזיני סגירה גנריים למודלים
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                console.log('מודל נסגר');
            }
        });
    });
    
    // מאזין לחיצה על הרקע של המודל
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                console.log('מודל נסגר (לחיצה על רקע)');
            }
        });
    });
    
    // מאזין לחיצה על Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
                console.log('מודל נסגר (לחיצה על Escape)');
            });
        }
    });
}

/**
 * אתחול כפתורי הצגת/הסתרת סיסמה
 */
function initializePasswordToggle() {
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    if (togglePasswordButtons.length === 0) return;
    
    togglePasswordButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

/**
 * אתחול פאנל ניהול ופאנלים צדדיים
 */
function initializeAdminAndSidePanels() {
    // אתחול הפאנלים הצדדיים - תמיד פתוחים
    initializeSidePanels();
    
    // אם המשתמש מחובר כ-liad@gmail.com, אתחל את פאנל הניהול
    initializeAdminPanel();
}

/**
 * אתחול פאנלים צדדיים
 */
function initializeSidePanels() {
    console.log("אתחול פאנלים צדדיים חדש...");
    
    // נבדוק אם קיים כבר פאנל ימני של סושיאל ולא ניצור חדש אם הוא כבר קיים
    const existingSocialPanel = document.getElementById('socialLinksPanel');
    if (existingSocialPanel) {
        console.log("פאנל סושיאל קיים כבר, לא יוצר חדש");
        return; // לא נמשיך אם כבר יש פאנל ימני
    }
    
    // הסרת פאנלים קודמים אם קיימים
    document.querySelectorAll('.side-panel').forEach(panel => panel.remove());
    
    // יצירת הפאנל השמאלי - עדכונים ואירועים
    const leftPanel = document.createElement('div');
    leftPanel.className = 'side-panel side-panel-left always-open';
    
    // הוספת נקודות אור לפאנל
    leftPanel.innerHTML = `
        <span class="light-dot"></span>
        <span class="light-dot"></span>
        <span class="light-dot"></span>
        <span class="light-dot"></span>
        <div class="side-panel-header">
            <h3 class="side-panel-title">עדכונים ואירועים</h3>
        </div>
        <div class="side-panel-content">
            <div class="notifications-list">
                <!-- התראות ייטענו דינמית -->
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <p>אין התראות חדשות</p>
                </div>
            </div>
        </div>
    `;
    
    // יצירת הפאנל הימני - רשתות חברתיות ומידע
    const rightPanel = document.createElement('div');
    rightPanel.className = 'side-panel side-panel-right always-open';
    rightPanel.id = 'socialLinksPanel';
    
    // הוספת נקודות אור לפאנל
    rightPanel.innerHTML = `
        <span class="light-dot"></span>
        <span class="light-dot"></span>
        <span class="light-dot"></span>
        <span class="light-dot"></span>
        <div class="side-panel-header">
            <h3 class="side-panel-title"><i class="fas fa-share-alt"></i> עקבו אחרינו</h3>
        </div>
        <div class="side-panel-content">
            <div class="about-site-info">
                <div class="site-logo-container">
                    <i class="fas fa-atom logo-icon-small"></i>
                    <span class="site-name">קוונטום טק</span>
                </div>
                <p class="site-description">
                    אנו מספקים פתרונות טכנולוגיים מתקדמים לעסקים קטנים ובינוניים ברחבי ישראל. עקבו אחרינו ברשתות החברתיות לעדכונים ותוכן בלעדי.
                </p>
            </div>
            
            <div class="social-links-container">
                <a href="#" class="social-link youtube">
                    <i class="fab fa-youtube"></i>
                    <div class="social-link-content">
                        <span class="social-link-title">ערוץ YouTube</span>
                        <span class="social-link-desc">צפו בהדרכות וחדשות</span>
                        <span class="social-follower-count">42K עוקבים</span>
                    </div>
                </a>
                
                <a href="#" class="social-link facebook">
                    <i class="fab fa-facebook-f"></i>
                    <div class="social-link-content">
                        <span class="social-link-title">עמוד Facebook</span>
                        <span class="social-link-desc">הצטרפו לקהילה שלנו</span>
                        <span class="social-follower-count">18K עוקבים</span>
                    </div>
                </a>
                
                <a href="#" class="social-link instagram">
                    <i class="fab fa-instagram"></i>
                    <div class="social-link-content">
                        <span class="social-link-title">Instagram</span>
                        <span class="social-link-desc">חוויות ויזואליות</span>
                        <span class="social-follower-count">25K עוקבים</span>
                    </div>
                </a>
                
                <a href="#" class="social-link linkedin">
                    <i class="fab fa-linkedin-in"></i>
                    <div class="social-link-content">
                        <span class="social-link-title">LinkedIn</span>
                        <span class="social-link-desc">קשרים עסקיים</span>
                        <span class="social-follower-count">5.2K עוקבים</span>
                    </div>
                </a>
                
                <a href="#" class="social-link twitter">
                    <i class="fab fa-twitter"></i>
                    <div class="social-link-content">
                        <span class="social-link-title">Twitter / X</span>
                        <span class="social-link-desc">עדכונים בזמן אמת</span>
                        <span class="social-follower-count">8.4K עוקבים</span>
                    </div>
                </a>
            </div>
            
            <div class="contact-info-mini">
                <div class="contact-item-mini">
                    <i class="fas fa-envelope"></i>
                    <span>info@quantum-tech.co.il</span>
                </div>
                <div class="contact-item-mini">
                    <i class="fas fa-phone-alt"></i>
                    <span>03-1234567</span>
                </div>
            </div>
        </div>
    `;
    
    // הוספת הפאנלים לגוף המסמך
    document.body.appendChild(leftPanel);
    document.body.appendChild(rightPanel);
    
    // ודא שהפאנלים גלויים
    setTimeout(() => {
        document.querySelectorAll('.side-panel').forEach(panel => {
            panel.style.visibility = 'visible';
            panel.style.opacity = '1';
        });
    }, 100);
}

/**
 * אתחול פאנל ניהול
 */
function initializeAdminPanel() {
    // תחילה, נסיר כל פאנל ניהול קיים לחלוטין מהדף
    const existingPanel = document.querySelector('.admin-dashboard');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    // נסיר כל כפתור פאנל ניהול קיים
    const existingBubble = document.getElementById('adminBubble');
    if (existingBubble) {
        existingBubble.remove();
    }
    
    // בדיקה מחמירה ביותר - האם המשתמש הוא liad@gmail.com
    const currentUser = getCurrentUser();
    const isLiad = currentUser && 
                  typeof currentUser.email === 'string' && 
                  currentUser.email.toLowerCase() === 'liad@gmail.com';
    
    console.log('בדיקת משתמש ניהול:', isLiad ? 'liad מזוהה' : 'משתמש לא מורשה');
    
    // אם זה לא liad, לא יוצרים שום דבר
    if (!isLiad) {
        return;
    }
    
    // הוספת קלאס לבאדי להצגת האלמנטים בהתאם
    document.body.classList.add('admin-logged-in');
    
    // יצירת כפתור ניהול מינימליסטי רק אם המשתמש מזוהה כliad
    const adminBubble = document.createElement('div');
    adminBubble.id = 'adminBubble';
    adminBubble.className = 'admin-bubble';
    adminBubble.innerHTML = '<i class="fas fa-chart-pie"></i>';
    adminBubble.setAttribute('data-admin-only', 'true');
    adminBubble.style.zIndex = '1050'; // z-index גבוה יותר מהפאנלים הצדדיים אך נמוך יותר מהפאנל עצמו
    adminBubble.style.visibility = 'visible';
    adminBubble.style.opacity = '1';
    adminBubble.style.display = 'flex';
    document.body.appendChild(adminBubble);
    
    // מאזין אירועים לכפתור
    adminBubble.addEventListener('click', function() {
        const adminPanel = document.querySelector('.admin-dashboard');
        if (adminPanel) {
            // אם הפאנל כבר קיים - מציג/מסתיר אותו
            adminPanel.classList.toggle('active');
        } else {
            // יצירת פאנל חדש - רק עם סטטיסטיקות
            createSimpleAdminPanel();
            
            // מיד לאחר היצירה - הפעל אותו
            setTimeout(() => {
                const newPanel = document.querySelector('.admin-dashboard');
                if (newPanel) {
                    newPanel.classList.add('active');
                }
            }, 100);
        }
    });
}

/**
 * יצירת פאנל ניהול מינימליסטי עם סטטיסטיקות בלבד
 */
function createSimpleAdminPanel() {
    // בדיקה אם יש כבר פאנל
    const existingPanel = document.querySelector('.admin-dashboard');
    if (existingPanel) {
        existingPanel.classList.add('active');
        return;
    }
    
    // יצירת הפאנל
    const adminPanel = document.createElement('div');
    adminPanel.className = 'admin-dashboard';
    adminPanel.innerHTML = `
        <div class="dashboard-header">
            <div class="dashboard-title">
                <h2>ניהול מערכת</h2>
                <p>סטטיסטיקות וכלים</p>
            </div>
            <div class="dashboard-close">
                <i class="fas fa-times"></i>
            </div>
        </div>
        <div class="stats-cards-simplified">
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon users"><i class="fas fa-users"></i></div>
                    <div class="stat-trend up"><i class="fas fa-arrow-up"></i> 12%</div>
                </div>
                <div class="stat-info">
                    <div class="stat-value">2,451</div>
                    <div class="stat-label">משתמשים רשומים</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon visits"><i class="fas fa-chart-line"></i></div>
                    <div class="stat-trend up"><i class="fas fa-arrow-up"></i> 27%</div>
                </div>
                <div class="stat-info">
                    <div class="stat-value">18,249</div>
                    <div class="stat-label">כניסות החודש</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon revenue"><i class="fas fa-shekel-sign"></i></div>
                    <div class="stat-trend up"><i class="fas fa-arrow-up"></i> 8%</div>
                </div>
                <div class="stat-info">
                    <div class="stat-value">47,824</div>
                    <div class="stat-label">הכנסות (₪)</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon conversion"><i class="fas fa-exchange-alt"></i></div>
                    <div class="stat-trend down"><i class="fas fa-arrow-down"></i> 3%</div>
                </div>
                <div class="stat-info">
                    <div class="stat-value">5.6%</div>
                    <div class="stat-label">המרות</div>
                </div>
            </div>
        </div>
        <div class="admin-actions">
            <button class="admin-logout-btn" id="adminLogoutBtn">
                <i class="fas fa-sign-out-alt"></i> התנתק
            </button>
        </div>
    `;
    
    document.body.appendChild(adminPanel);
    
    // הוספת מאזיני אירועים
    const closeBtn = adminPanel.querySelector('.dashboard-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            adminPanel.classList.remove('active');
        });
    }
    
    // עדכון פונקציית logout בפאנל ניהול להשתמש בדיאלוג המותאם אישית
    const logoutBtn = adminPanel.querySelector('#adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // הצג דיאלוג אישור מותאם אישית
            const confirmed = await customConfirm({
                title: 'התנתקות מהמערכת',
                message: 'האם אתה בטוח שברצונך להתנתק מהמערכת?',
                confirmText: 'התנתק',
                cancelText: 'ביטול',
                icon: 'fas fa-sign-out-alt'
            });
            
            if (confirmed) {
                console.log('מתנתק מהמערכת...');
                // כאן אפשר להוסיף קוד התנתקות אמיתי
                localStorage.removeItem('adminUser');
                document.body.classList.remove('admin-logged-in');
                
                // הסתר את בועת הניהול והפאנל
                const adminBubble = document.getElementById('adminBubble');
                if (adminBubble) {
                    adminBubble.style.display = 'none';
                }
                
                adminPanel.classList.remove('active');
                
                // הודעה למשתמש
                alert('התנתקת בהצלחה מממשק הניהול');
            }
        });
    }
}

/**
 * פונקציה לקבלת המשתמש הנוכחי
 */
function getCurrentUser() {
    // בדיקה מיוחדת אם קיים משתמש בסשן
    if (window.sessionStorage && sessionStorage.getItem('isLoggedIn') === 'false') {
        return null;
    }
    
    // בדיקה אם יש אובייקט supabase גלובלי
    if (typeof supabase !== 'undefined') {
        try {
            const { data: { user } } = supabase.auth.getUser();
            return user;
        } catch (error) {
            console.error('שגיאה בקבלת המשתמש הנוכחי:', error);
            return null;
        }
    }
    
    // בדיקה בlocal storage
    try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            return JSON.parse(storedUser);
        }
    } catch (e) {
        console.error('שגיאה בפענוח נתוני משתמש מאחסון:', e);
    }
    
    // אם לא נמצא משתמש בשום מקום
    return null;
}

/**
 * פונקציה להכנסת משתמש דמה
 */
function initializeTestUser() {
    // בדיקה אם כבר יש משתמש מחובר
    const currentUser = getCurrentUser();
    
    // אם אין משתמש, יוצר משתמש דמה
    if (!currentUser) {
        const testUser = {
            id: 'user_' + Math.random().toString(36).substring(2, 10),
            email: 'liad@gmail.com',
            name: 'ליעד',
            role: 'admin',
            avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
            lastLogin: new Date().toString()
        };
        
        // שמירה ב-localStorage
        localStorage.setItem('currentUser', JSON.stringify(testUser));
        console.log('משתמש דמה נוצר:', testUser);
    }
}

/**
 * Custom confirm dialog
 * @param {Object} options - Dialog options
 * @param {string} options.title - Dialog title
 * @param {string} options.message - Dialog message
 * @param {string} options.confirmText - Text for confirm button
 * @param {string} options.cancelText - Text for cancel button
 * @param {string} options.icon - Icon class
 * @returns {Promise} - Resolves to true if confirmed, false if canceled
 */
function customConfirm(options = {}) {
    return new Promise((resolve) => {
        const defaults = {
            title: 'אישור',
            message: 'האם אתה בטוח?',
            confirmText: 'אישור',
            cancelText: 'ביטול',
            icon: 'fas fa-question-circle'
        };
        
        const settings = {...defaults, ...options};
        
        // בדיקה אם יש כבר דיאלוג פתוח
        const existingDialog = document.querySelector('.custom-confirm-overlay');
        if (existingDialog) {
            existingDialog.remove();
        }
        
        // יצירת הדיאלוג
        const overlay = document.createElement('div');
        overlay.className = 'custom-confirm-overlay';
        
        overlay.innerHTML = `
            <div class="custom-confirm-dialog">
                <div class="custom-confirm-header">
                    <div class="custom-confirm-icon">
                        <i class="${settings.icon}"></i>
                    </div>
                    <div class="custom-confirm-title">${settings.title}</div>
                </div>
                <div class="custom-confirm-message">${settings.message}</div>
                <div class="custom-confirm-buttons">
                    <button class="custom-confirm-btn cancel">${settings.cancelText}</button>
                    <button class="custom-confirm-btn confirm">${settings.confirmText}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // הצגת הדיאלוג עם אנימציה
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
        
        // מאזיני אירועים לכפתורים
        const cancelBtn = overlay.querySelector('.cancel');
        const confirmBtn = overlay.querySelector('.confirm');
        
        cancelBtn.addEventListener('click', () => {
            closeDialog(false);
        });
        
        confirmBtn.addEventListener('click', () => {
            closeDialog(true);
        });
        
        // סגירת הדיאלוג
        function closeDialog(result) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
                resolve(result);
            }, 300);
        }
    });
}

// Mobile Responsiveness Enhancements
function enhanceMobileExperience() {
    const isMobile = window.innerWidth <= 768;
    
    // Fix for hover states on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
        document.body.classList.add('touch-device');
        
        // Convert certain hover effects to click/touch events on mobile
        const hoverElements = document.querySelectorAll('.service-card, .portfolio-item, .testimonial-card');
        
        hoverElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                const activeElement = document.querySelector('.touch-active');
                
                if (activeElement && activeElement !== this) {
                    activeElement.classList.remove('touch-active');
                }
                
                this.classList.toggle('touch-active');
            }, { passive: true });
        });
    }
    
    // Adjust side panels behavior on mobile
    if (isMobile) {
        const sidePanels = document.querySelectorAll('.side-panel');
        const panelCloseBtns = document.querySelectorAll('.side-panel-close');
        
        // Close panels when clicking outside
        document.addEventListener('click', function(event) {
            sidePanels.forEach(panel => {
                if (panel.classList.contains('active') && 
                    !panel.contains(event.target) && 
                    !event.target.closest('.admin-bubble') && 
                    !event.target.closest('[data-panel]')) {
                    panel.classList.remove('active');
                }
            });
        });
        
        // Add tap to close for panel buttons
        panelCloseBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const panel = this.closest('.side-panel');
                if (panel) {
                    panel.classList.remove('active');
                }
            });
        });
    }
    
    // Fix for 100vh issue on mobile browsers
    const setVhProperty = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVhProperty();
    window.addEventListener('resize', setVhProperty);
    
    // Fix for fixed elements when keyboard appears on mobile
    const inputs = document.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            if (isMobile) {
                document.body.classList.add('keyboard-open');
            }
        });
        
        input.addEventListener('blur', () => {
            document.body.classList.remove('keyboard-open');
        });
    });
}

// Initialize mobile enhancements
document.addEventListener('DOMContentLoaded', function() {
    enhanceMobileExperience();
    
    // Reinitialize on resize to handle orientation changes
    window.addEventListener('resize', function() {
        if (this.resizeTimer) clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(function() {
            enhanceMobileExperience();
        }, 500);
    });
});

// העמדת פונקציות גלובליות לשימוש קבצים אחרים
window.isMobileDevice = isMobileDevice;